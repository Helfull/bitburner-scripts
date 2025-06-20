let SHORTS = false
let S4DATA = false
let QUIET = false
const SNAPS = 16
const BUY_THREASH = 60
const SELL_THREASH = 52
const SLEEPTM = 6000 // do not set it faster (lower).  Will be too fast, updates will be duplicated, everything will fall apart
const MSGTICKS = 3 // how many tics will messages stay in the logs for?
const MSGTICKTM = SLEEPTM * MSGTICKS
const MIN_TRANSACTION = 10000000 // 10m
const TRANSACTION_COST = 100000 // Cost per transaction is 100k
const RESERVE = 0
const MIN_STOCKS = 100
const HEIGHT = 970
const WIDTH = 830
const REPORT = 1000 * 60 * 60 // Every hour
let SHOWBUYS = false
let SHOWSELLS = true
let HYBRIDFCAST = false
const HYBRID_VOL = 1.0
// Weight is a multiplier on the forcast, where it is then added and averaged
// 4s=4 and reg=1 means if the 4s forcast is 62 and the reg forcast is 75, then
// the forcast is ((62 * 4) + (75 * 1)) / (4 + 1) = 64.6
const HYBRID_WEIGHT_4S = 4
const HYBRID_WEIGHT_REG = 1
let printmsgs = []
let startworth = 0
let workingmoney = 0
let FUNDSELF = false

function newMsg(ns, msg) {
  let record = {
    "msg": msg,
    "time": Date.now() + MSGTICKTM
  }
  printmsgs.push(record)
}

function printLogs(ns, stocks) {
  ns.clearLog()
  //Clear the printmsgs queue so we just have fresh messages
  while (printmsgs.length > 0 && printmsgs[0].time <= Date.now()) printmsgs.shift()

  for (const msg of printmsgs) {
    ns.printf("%s", msg.msg)
  }
  let totalpaid = 0
  let totalvalue = 0
  let totalshares = 0
  let totalprofit = 0
  //ns.printf("-----------------------------------------------------------------------")
  ns.printf("┌───────┬───────┬─────────┬─────────┬─────────┬──────────┬─────────┬────────┬──────┐")
  ns.printf("│   SYM │  TYPE │  SHARES │    PAID │   VALUE │   PROFIT │       %s │  FCAST │ VOLI │", "%")
  ns.printf("├───────┼───────┼─────────┼─────────┼─────────┼──────────┼─────────┼────────┼──────┤")

  for (const stk of stocks) {
    let paid = 0
    let value = 0
    let shares = 0
    let profit = 0
    let percentchange = 0
    let type = "-----"
    if (stk.posi[0] > 0) { // Long position
      paid = stk.posi[0] * stk.posi[1] + TRANSACTION_COST
      value = ns.stock.getSaleGain(stk.sym, stk.posi[0], "long")
      shares = stk.posi[0]
      profit = value - paid
      percentchange = (profit > 0) ? (100 - value / paid * 100) * -1 : (100 - (value / paid * 100)) * -1
      type = "Long "
    }
    else if (stk.posi[2] > 0) { // Short position
      paid = stk.posi[2] * stk.posi[3] + TRANSACTION_COST
      value = ns.stock.getSaleGain(stk.sym, stk.posi[2], "short")
      shares = stk.posi[2]
      profit = value - paid
      percentchange = (profit > 0) ? (100 - value / paid * 100) * -1 : (100 - (value / paid * 100)) * -1
      type = "Short"
    }
    totalpaid += paid
    totalvalue += value
    totalshares += shares
    totalprofit += profit

    ns.printf("│ %5s │ %4s │ %7s │ %7s │ %7s │ %8s │ %7s │ %6s │ %4s │", stk.sym, type, (shares > 0) ? ns.formatNumber(shares, 2) : "-------", (paid > 0) ? ns.formatNumber(paid, 2) : "-------", (value > 0) ? ns.formatNumber(value, 2) : "-------", (profit != 0) ? ns.formatNumber(profit, 2) : "--------", (percentchange != 0) ? ns.formatNumber(percentchange, 2) : "-------", ns.formatNumber(stk.forcast, 2), ns.formatNumber(stk.volitile, 2))
  }
  let totalpercentchange = (totalpaid > 0) ? (100 - totalvalue / totalpaid * 100) * -1 : 0
  let worth = getWorth(ns, stocks)
  // ns.printf("-----------------------------------------------------------------------")
  ns.printf("├───────┴───────┼─────────┼─────────┼─────────┼──────────┼─────────┼────────┴──────┤")
  ns.printf("│Start: %8s│ %7s │ %7s │ %7s │ %8s │ %7s │Gain: %7s%s │", "$" + ns.formatNumber(startworth, 2), ns.formatNumber(totalshares, 2), ns.formatNumber(totalpaid, 2), ns.formatNumber(totalvalue, 2), ns.formatNumber(totalprofit, 2), ns.formatNumber(totalpercentchange, 2), ns.formatNumber(((worth / startworth) - 1) * 100, 2), "%")
  ns.printf("└───────────────┴─────────┴─────────┴─────────┴──────────┴─────────┴───────────────┘")

}

function buyItems(ns, stocks) {
  //start off our buying spree
  let stk = ns.stock
  let topl = stocks.length - 1
  let botl = 0
  let top = stocks[topl]
  let bot = stocks[botl]

  let running = true
  while (running) { // Purchase loop
    let cash = 0
    if (FUNDSELF) cash = workingmoney
    else cash = ns.getServerMoneyAvailable("home")
    let budget = 0
    if (FUNDSELF) budget = cash - TRANSACTION_COST
    else budget = cash - TRANSACTION_COST - RESERVE

    top = stocks[topl]
    bot = stocks[botl]

    //Get the max shares of the stock and our position on the stock.  Do we have all the shares?  If so, skip it
    let topposi = stk.getPosition(top.sym)
    let botposi = stk.getPosition(bot.sym)

    while (topposi[0] == stk.getMaxShares(top.sym) || topposi[2] == stk.getMaxShares(top.sym)) {
      topl--
      top = stocks[topl]
      topposi = stk.getPosition(top.sym)
    }
    while (botposi[0] == stk.getMaxShares(bot.sym) || botposi[2] == stk.getMaxShares(bot.sym)) {
      botl++
      bot = stocks[botl]
      botposi = stk.getPosition(bot.sym)
    }
    top = stocks[topl]
    bot = stocks[botl]
    let max = false
    if (SHORTS) {
      if (bot.adjfcast >= top.forcast && bot.adjfcast >= BUY_THREASH) { //Bottom is the way to go right now
        //buy shorts of bottom, get the next bottom
        let price = stk.getBidPrice(bot.sym)
        let buying = Math.floor(budget / price)
        if (buying + botposi[0] + botposi[2] > stk.getMaxShares(bot.sym)) {
          buying = stk.getMaxShares(bot.sym) - botposi[0] - botposi[2]
          max = true
        }
        //ns.tprintf("Shorting: Price %s  Buying %s  Total %s", price, buying, price * buying)
        if ((buying >= MIN_STOCKS && price * buying >= MIN_TRANSACTION) || max) {
          let bought = stk.buyShort(bot.sym, buying)
          if (bought > 0) {
            if (FUNDSELF) workingmoney -= (bought * buying) + TRANSACTION_COST
            if (SHOWBUYS) ns.tprintf("Buying %s short of %s for $%s", buying, bot.sym, ns.formatNumber(bought * buying, 2))
            let msg = ns.sprintf("Buying %s short of %s for $%s", buying, bot.sym, ns.formatNumber(bought * buying, 2))
            newMsg(ns, msg)
            botl++
          }
          else {
            if (SHOWBUYS) ns.tprintf("Failed to buy %s Short of %s", buying, bot.sym)
            let msg = ns.sprintf("Failed to buy %s Short of %s", buying, bot.sym)
            newMsg(ns, msg)
          }
        }
      }
      else if (top.forcast >= BUY_THREASH) { // Top is the way to go
        // Buy long of top, get the next top
        let price = stk.getAskPrice(top.sym)
        let buying = Math.floor(budget / price)
        if (buying + topposi[0] + topposi[2] > stk.getMaxShares(top.sym)) {
          buying = stk.getMaxShares(top.sym) - topposi[0] - topposi[2]
          max = true
        }
        //ns.tprintf("Long within short: Price %s  Buying %s  Total %s", price, buying, price * buying)
        if ((buying >= MIN_STOCKS && price * buying >= MIN_TRANSACTION) || max) {
          let bought = stk.buyStock(top.sym, buying)
          if (bought > 0) {
            if (FUNDSELF) workingmoney -= (bought * buying) + TRANSACTION_COST
            if (SHOWBUYS) ns.tprintf("Buying %s long of %s for $%s", buying, top.sym, ns.formatNumber(bought * buying, 2))
            let msg = ns.sprintf("Buying %s long of %s for $%s", buying, top.sym, ns.formatNumber(bought * buying, 2))
            newMsg(ns, msg)
            topl--
          }
          else {
            if (SHOWBUYS) ns.tprintf("Failed to buy %s long of %s", buying, top.sym)
            let msg = ns.sprintf("Failed to buy %s long of %s", buying, top.sym)
            newMsg(ns, msg)
          }
        }
      }
    }
    else if (top.forcast >= BUY_THREASH) { //check for long buy
      let price = stk.getAskPrice(top.sym)
      let buying = Math.floor(budget / price)
      if (buying + topposi[0] + topposi[2] > stk.getMaxShares(top.sym)) {
        buying = stk.getMaxShares(top.sym) - topposi[0] - topposi[2]
        max = true
      }
      //ns.tprintf("Long: Price %s  Buying %s  Total %s", price, buying, price * buying)
      if ((buying >= MIN_STOCKS && price * buying >= MIN_TRANSACTION) || max) {
        let bought = stk.buyStock(top.sym, buying)
        if (bought > 0) {
          if (FUNDSELF) workingmoney -= (bought * buying) + TRANSACTION_COST
          if (SHOWBUYS) ns.tprintf("Buying %s long of %s for $%s", buying, top.sym, ns.formatNumber(bought * buying, 2))
          let msg = ns.sprintf("Buying %s long of %s for $%s", buying, top.sym, ns.formatNumber(bought * buying, 2))
          newMsg(ns, msg)
          topl--
        }
        else {
          if (SHOWBUYS) ns.tprintf("Failed to buy %s long of %s", buying, top.sym)
          let msg = ns.sprintf("Failed to buy %s long of %s", buying, top.sym)
          newMsg(ns, msg)
        }
      }
    }
    if (!max) {
      running = false
    }
  }
  if (FUNDSELF) workingmoney = 0 //We shave off the remainder so we don't have to worry about it not being there later
}

function updateForcast(ns, stocks) {
  // Cycle through our stocks and update the forcast
  for (let stk of stocks) {
    //Update 4S forcast
    if (S4DATA) {
      stk.s4forcast = ns.stock.getForecast(stk.sym) * 100
      stk.s4adjfcast = (stk.s4forcast >= 50) ? stk.s4forcast : 100 - stk.s4forcast
      stk.s4volitile = ns.stock.getVolatility(stk.sym) * 100
    }
    //Process the snapshot
    //We are going to track 3 values and average them out.  Price, AskPrice, BidPrice
    let price = 0
    let totalprice = 0
    //-----------------
    let ask = 0
    let totalask = 0
    //-----------------
    let bid = 0
    let totalbid = 0
    //-----------------
    let vol = 0
    let bestvol = 0
    //-----------------
    for (let i = 0; i < stk.snaps.length - 1; i++) {
      price += stk.snaps[i + 1].price - stk.snaps[i].price
      totalprice += Math.abs(stk.snaps[i + 1].price - stk.snaps[i].price)
      ask += stk.snaps[i + 1].askprice - stk.snaps[i].askprice
      totalask += Math.abs(stk.snaps[i + 1].askprice - stk.snaps[i].askprice)
      bid += stk.snaps[i + 1].bidprice - stk.snaps[i].bidprice
      totalbid += Math.abs(stk.snaps[i + 1].bidprice - stk.snaps[i].bidprice)
      vol = (stk.snaps[i + 1].price > stk.snaps[i].price) ? (stk.snaps[i + 1].price / stk.snaps[i].price) - 1 : (stk.snaps[i].price / stk.snaps[i + 1].price) - 1
      vol *= 100
      if (vol > bestvol) bestvol = vol
    }
    if (totalprice == 0) {
      stk.regforcast = 50
      stk.regadjfcast = 50
      stk.regvolitile = 0
    }
    else {
      let pfcast = (price / totalprice * 50) + 50
      let afcast = (ask / totalask * 50) + 50
      let bfcast = (bid / totalbid * 50) + 50

      stk.regforcast = (pfcast + afcast + bfcast) / 3
      stk.regadjfcast = (stk.regforcast >= 50) ? stk.regforcast : 100 - stk.regforcast
      stk.regvolitile = bestvol
    }

    // Get the Hybrid forcast now
    if (S4DATA) {
      stk.hybridforcast = ((stk.regforcast * HYBRID_WEIGHT_REG) + (stk.s4forcast * HYBRID_WEIGHT_4S)) / (HYBRID_WEIGHT_4S + HYBRID_WEIGHT_REG)
      stk.hybridadjfcast = (stk.hybridforcast >= 50) ? stk.hybridforcast : 100 - stk.hybridforcast
    }
  }

  // Assign the actual forcast
  if (HYBRIDFCAST && S4DATA) {
    for (const stk of stocks) {
      stk.forcast = (stk.s4forcast > 50) ? stk.hybridforcast + stk.s4volitile - HYBRID_VOL : stk.hybridforcast - stk.s4volitile + HYBRID_VOL
      stk.adjfcast = stk.hybridadjfcast
      stk.volitile = stk.s4volitile
    }
  }
  else if (S4DATA) {
    for (const stk of stocks) {
      stk.forcast = stk.s4forcast
      stk.adjfcast = stk.s4adjfcast
      stk.volitile = stk.s4volitile
    }
  }
  else {
    for (const stk of stocks) {
      stk.forcast = stk.regforcast
      stk.adjfcast = stk.regadjfcast
      stk.volitile = stk.regvolitile
    }
  }
  stocks.sort((a, b) => { return a.forcast - b.forcast })
}

function sellItems(ns, stocks, arg) {
  for (let obj of stocks) {
    //if (obj.adjfcast > SELL_THREASH) continue // keep it

    let posi = ns.stock.getPosition(obj.sym)

    if (posi[0] > 0 && obj.forcast <= SELL_THREASH || (posi[0] > 0 && arg && arg == "sell")) { // We have Longs to sell
      let sellprice = ns.stock.sellStock(obj.sym, posi[0])
      if (FUNDSELF) workingmoney += (sellprice * posi[0]) - TRANSACTION_COST
      if (sellprice >= posi[1]) { // Profit
        let profit = (sellprice * posi[0]) - (posi[0] * posi[1])
        if (SHOWSELLS) ns.tprintf("WARN: Selling %s long for $%s ($%s profit)", obj.sym, ns.formatNumber(sellprice * posi[0], 2), ns.formatNumber(profit, 2))
        let msg = ns.sprintf("WARN: Selling %s long for $%s ($%s profit)", obj.sym, ns.formatNumber(sellprice * posi[0], 2), ns.formatNumber(profit, 2))
        newMsg(ns, msg)
      }
      else {// Loss
        let loss = (sellprice * posi[0]) - (posi[0] * posi[1])
        if (SHOWSELLS) ns.tprintf("WARN: Selling %s long for $%s ($%s loss)", obj.sym, ns.formatNumber(sellprice * posi[0], 2), ns.formatNumber(loss, 2))
        let msg = ns.sprintf("WARN: Selling %s long for $%s ($%s loss)", obj.sym, ns.formatNumber(sellprice * posi[0], 2), ns.formatNumber(loss, 2))
        newMsg(ns, msg)
      }
    }
    if (posi[2] > 0 && obj.forcast >= 100 - SELL_THREASH || (posi[2] > 0 && arg && arg == "sell")) { // We have shorts to sell
      let shortsales = ns.stock.getSaleGain(obj.sym, posi[2], "short")
      if (FUNDSELF) workingmoney += shortsales - TRANSACTION_COST
      let paidshort = posi[2] * posi[3]
      let sellprice = ns.stock.sellShort(obj.sym, posi[2])
      if (shortsales >= paidshort) { // Profit
        let profit = shortsales - paidshort// - (sellprice * posi[2])
        if (SHOWSELLS) ns.tprintf("WARN: Selling %s short for $%s ($%s profit)", obj.sym, ns.formatNumber(shortsales, 2), ns.formatNumber(profit, 2))
        let msg = ns.sprintf("WARN: Selling %s short for $%s ($%s profit)", obj.sym, ns.formatNumber(shortsales, 2), ns.formatNumber(profit, 2))
        newMsg(ns, msg)
      }
      else {// Loss
        let loss = shortsales - paidshort// - (sellprice * posi[2])
        if (SHOWSELLS) ns.tprintf("WARN: Selling %s short for $%s ($%s loss)", obj.sym, ns.formatNumber(shortsales, 2), ns.formatNumber(loss, 2))
        let msg = ns.sprintf("WARN: Selling %s short for $%s ($%s loss)", obj.sym, ns.formatNumber(shortsales, 2), ns.formatNumber(loss, 2))
        newMsg(ns, msg)
      }
    }
  }
}

function getWorth(ns, stocks) {
  let worth = ns.getServerMoneyAvailable("home")
  for (let obj of stocks) {
    if (obj.posi[0] > 0) {
      worth += ns.stock.getSaleGain(obj.sym, obj.posi[0], "long") //obj.posi[0] * stk.getPrice(obj.sym)//obj.posi[1]
    }
    if (obj.posi[2] > 0) {
      worth += ns.stock.getSaleGain(obj.sym, obj.posi[2], "short")//obj.posi[2] * stk.getPrice(obj.sym)//obj.posi[3]
    }
  }
  return worth
}

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL")

  let stks = ns.stock

  if (!stks.hasWSEAccount() || !stks.hasTIXAPIAccess()) {
    ns.tprintf("WSE and TIX API access are required to run this.")
    return
  }
  if (ns.args.includes("help")) {
    ns.tprintf("Help activated.")
    ns.tprintf("Options to run with are (In any order):")
    ns.tprintf("no4s     Disabled 4s data use")
    ns.tprintf("noshort  Disables Shorts")
    ns.tprintf("hybrid   Uses a hybrid forcast system")
    ns.tprintf("sell     Sells all stocks")
    ns.tprintf("stop     Stops all %s instances", ns.getScriptName())
    ns.tprintf("monitor  Does not buy or sell, just watches")
    ns.tprintf("fundself Only purchase stocks with money from the sale of stocks")
    ns.tprintf("quiet    Suppresses sales notifications")
    ns.tprintf("showbuy  Display purchase notifications")
    ns.tprintf("help     Activates the help menu (You are in it...)")
    return
  }

  ns.args.includes("hybrid") ? HYBRIDFCAST = true : HYBRIDFCAST = false

  // Initialize early so we can potentially sell without all the extra displays
  let stocks = []
  printmsgs = []
  const syms = stks.getSymbols()

  //Initialize our stock list
  for (const sym of syms) {
    let record = {
      "sym": sym,
      "snaps": [],
      "s4forcast": 50,
      "s4adjfcast": 50,
      "hybridforcast": 50,
      "hybridadjfcast": 50,
      "forcast": 50,
      "adjfcast": 50,
      "regforcast": 50,
      "regadjfcast": 50,
      "posi": stks.getPosition(sym),
      "s4volitile": 0,
      "regvolitile": 0,
      "volitile": 0,
      "time": Date.now()
    }
    stocks.push(record)
  }
  newMsg(ns, "Just Initialized")
  printLogs(ns, stocks)

  if (ns.args.includes("stop")) {
    ns.tprintf("%s is being stopped.  Don't forget to sell.", ns.getScriptName())
    if (ns.args.includes("sell")) {
      sellItems(ns, stocks, "sell")
    }
    UpdateHud(ns)
    ns.scriptKill(ns.getScriptName(), ns.getHostname())
    return
  }

  if (ns.args.includes("sell")) {
    sellItems(ns, stocks, "sell")
    UpdateHud(ns)
    return
  }


  if (!ns.args.includes("noshorts")) {
    try {
      stks.buyShort("ECP", 0)
      SHORTS = true
      ns.tprintf("Shorts Active!")
    }
    catch {
      ns.tprintf("Shorts disabled")
      SHORTS = false
    }
  }
  else {
    ns.tprintf("Shorts disabled")
    SHORTS = false
  }

  if (stks.has4SDataTIXAPI() && !ns.args.includes("no4s")) {
    S4DATA = true
    ns.tprintf("4S data enabled!")
    if (HYBRIDFCAST) {
      ns.tprintf("Hybrid Forcast enabled!")
    }
  }
  else {
    ns.tprintf("4S Data disabled")
    S4DATA = false
  }
  if (ns.args.includes("monitor")) {
    ns.tprintf("Monitor Mode enabled!")
  }
  if (ns.args.includes("fundself") || ns.args.includes("selffund")) {
    ns.tprintf("Self Funding has been enabled!")
    FUNDSELF = true
    workingmoney = 0
  }
  else FUNDSELF = false

  if (ns.args.includes("quiet")) {
    ns.tprintf("Quiet mode enabled.  Will not show sales.  Shhhh!!!")
    SHOWSELLS = false
  }
  else SHOWSELLS = true

  if (ns.args.includes("showbuy")) {
    ns.tprintf("Showing all purchases!")
    SHOWBUYS = true
  }
  else SHOWBUYS = false


  let working = true
  let count = 0
  ns.tail()

  let starttime = Date.now()
  startworth = getWorth(ns, stocks)

  // Are we relying only on the 4s Data and not a hybrid?  Speed it up then!
  if (S4DATA && !HYBRIDFCAST) count = SNAPS

  while (working) {

    ns.ui.resizeTail(WIDTH, HEIGHT);
    if (count == SNAPS) {
      printmsgs = []
      newMsg(ns, "Ready!")
    }
    //Report if needed
    if (Date.now() >= starttime + REPORT) {
      starttime = Date.now()
      let endworth = getWorth(ns, stocks)

      if (endworth > startworth) {
        ns.tprintf("INFO: Success!  After 1 hour %s turned into %s (%s%s)", ns.formatNumber(startworth, 2), ns.formatNumber(endworth, 2), ns.formatNumber(endworth / startworth * 100, 2), "%")
        //let msg = ns.sprintf(`INFO: Success!  After 1 hour ${ns.formatNumber(startworth, 2)} turned into ${ns.formatNumber(endworth, 2)} (${ns.formatNumber(endworth / startworth * 100, 2)}\%)`)
        let msg = ns.sprintf("INFO: Success!  After 1 hour %s turned into %s (%s%s)", ns.formatNumber(startworth, 2), ns.formatNumber(endworth, 2), ns.formatNumber(endworth / startworth * 100, 2), "%")
        newMsg(ns, msg)
      }
      else {
        ns.tprintf("INFO: Fail!  After 1 hour %s turned into %s (%s%s)", ns.formatNumber(startworth, 2), ns.formatNumber(endworth, 2), ns.formatNumber(endworth / startworth * 100, 2), "%")
        //let msg = ns.sprintf(`WARN: FAIL!  After 1 hour ${ns.formatNumber(startworth, 2)} turned into ${ns.formatNumber(endworth, 2)} (${ns.formatNumber(endworth / startworth * 100, 2)}\%)`)
        let msg = ns.sprintf("INFO: Fail!  After 1 hour %s turned into %s (%s%s)", ns.formatNumber(startworth, 2), ns.formatNumber(endworth, 2), ns.formatNumber(endworth / startworth * 100, 2), "%")
        newMsg(ns, msg)
      }
      startworth = endworth
    }

    //Switch to 4S if we can
    if (stks.has4SDataTIXAPI() && !ns.args.includes("no4s") && !S4DATA) {
      S4DATA = true
      ns.tprintf("4S data enabled!")
      if (HYBRIDFCAST) {
        ns.tprintf("Hybrid Forcast enabled!")
      }
    }

    //Snapshot
    for (const obj of stocks) {
      let record = {
        "bidprice": stks.getBidPrice(obj.sym),
        "askprice": stks.getAskPrice(obj.sym),
        "price": stks.getPrice(obj.sym),
        "spread": stks.getAskPrice(obj.sym) - stks.getBidPrice(obj.sym),
        "time": Date.now()
      }
      obj.snaps.push(record)
      obj.snaps.length > SNAPS ? obj.snaps.shift() : null
      obj.posi = stks.getPosition(obj.sym)
    }

    //Update the forcast
    updateForcast(ns, stocks)

    //Sell stocks here
    if (count > SNAPS || (S4DATA && !HYBRIDFCAST)) {
      if (!ns.args.includes("monitor")) sellItems(ns, stocks, "none")
    }
    //Buy Stocks here
    if (count > SNAPS || (S4DATA && !HYBRIDFCAST)) {
      if (!ns.args.includes("monitor")) buyItems(ns, stocks)
    }
    // Update your position on everything
    for (let obj of stocks) {
      obj.posi = stks.getPosition(obj.sym)
    }


    if (count < SNAPS) {
      let msg = ns.sprintf("Pre-total snaps %s/%s", count, SNAPS)
      newMsg(ns, msg)
      printLogs(ns, stocks)
    }
    else {
      printLogs(ns, stocks)
    }

    let totalworth = getWorth(ns, stocks)
    let printworth = ns.formatNumber(totalworth, 2)
    UpdateHud(ns, printworth)
    count++
    await ns.sleep(SLEEPTM)
  }
}
function UpdateHud(ns, totalWorth) {
  const doc = eval('document');
  const hook0 = doc.getElementById('overview-extra-hook-0');
  const hook1 = doc.getElementById('overview-extra-hook-1');

  try {
    const headers = []
    const values = [];

    if (totalWorth == undefined) {
      hook0.innerText = '';
      hook1.innerText = '';
      return;
    }

    headers.push('Total Worth: ');
    values.push(totalWorth);

    hook0.innerText = headers.join(" \n");
    hook1.innerText = values.join("\n");
    hook0.onclick = function () { getTail = true }

  } catch (err) {
    ns.print("ERROR: Update Skipped: " + String(err));
  }
}