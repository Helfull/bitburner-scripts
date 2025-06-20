// servers/home/imported/mystocks.js
var SHORTS = false;
var S4DATA = false;
var QUIET = false;
var SNAPS = 16;
var BUY_THREASH = 60;
var SELL_THREASH = 52;
var SLEEPTM = 6e3;
var MSGTICKS = 3;
var MSGTICKTM = SLEEPTM * MSGTICKS;
var MIN_TRANSACTION = 1e7;
var TRANSACTION_COST = 1e5;
var RESERVE = 0;
var MIN_STOCKS = 100;
var HEIGHT = 970;
var WIDTH = 830;
var REPORT = 1e3 * 60 * 60;
var SHOWBUYS = false;
var SHOWSELLS = true;
var HYBRIDFCAST = false;
var HYBRID_VOL = 1;
var HYBRID_WEIGHT_4S = 4;
var HYBRID_WEIGHT_REG = 1;
var printmsgs = [];
var startworth = 0;
var workingmoney = 0;
var FUNDSELF = false;
function newMsg(ns2, msg) {
  let record = {
    "msg": msg,
    "time": Date.now() + MSGTICKTM
  };
  printmsgs.push(record);
}
function printLogs(ns2, stocks) {
  ns2.clearLog();
  while (printmsgs.length > 0 && printmsgs[0].time <= Date.now())
    printmsgs.shift();
  for (const msg of printmsgs) {
    ns2.printf("%s", msg.msg);
  }
  let totalpaid = 0;
  let totalvalue = 0;
  let totalshares = 0;
  let totalprofit = 0;
  ns2.printf("\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2510");
  ns2.printf("\u2502   SYM \u2502  TYPE \u2502  SHARES \u2502    PAID \u2502   VALUE \u2502   PROFIT \u2502       %s \u2502  FCAST \u2502 VOLI \u2502", "%");
  ns2.printf("\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2524");
  for (const stk of stocks) {
    let paid = 0;
    let value = 0;
    let shares = 0;
    let profit = 0;
    let percentchange = 0;
    let type = "-----";
    if (stk.posi[0] > 0) {
      paid = stk.posi[0] * stk.posi[1] + TRANSACTION_COST;
      value = ns2.stock.getSaleGain(stk.sym, stk.posi[0], "long");
      shares = stk.posi[0];
      profit = value - paid;
      percentchange = profit > 0 ? (100 - value / paid * 100) * -1 : (100 - value / paid * 100) * -1;
      type = "Long ";
    } else if (stk.posi[2] > 0) {
      paid = stk.posi[2] * stk.posi[3] + TRANSACTION_COST;
      value = ns2.stock.getSaleGain(stk.sym, stk.posi[2], "short");
      shares = stk.posi[2];
      profit = value - paid;
      percentchange = profit > 0 ? (100 - value / paid * 100) * -1 : (100 - value / paid * 100) * -1;
      type = "Short";
    }
    totalpaid += paid;
    totalvalue += value;
    totalshares += shares;
    totalprofit += profit;
    ns2.printf("\u2502 %5s \u2502 %4s \u2502 %7s \u2502 %7s \u2502 %7s \u2502 %8s \u2502 %7s \u2502 %6s \u2502 %4s \u2502", stk.sym, type, shares > 0 ? ns2.formatNumber(shares, 2) : "-------", paid > 0 ? ns2.formatNumber(paid, 2) : "-------", value > 0 ? ns2.formatNumber(value, 2) : "-------", profit != 0 ? ns2.formatNumber(profit, 2) : "--------", percentchange != 0 ? ns2.formatNumber(percentchange, 2) : "-------", ns2.formatNumber(stk.forcast, 2), ns2.formatNumber(stk.volitile, 2));
  }
  let totalpercentchange = totalpaid > 0 ? (100 - totalvalue / totalpaid * 100) * -1 : 0;
  let worth = getWorth(ns2, stocks);
  ns2.printf("\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2524");
  ns2.printf("\u2502Start: %8s\u2502 %7s \u2502 %7s \u2502 %7s \u2502 %8s \u2502 %7s \u2502Gain: %7s%s \u2502", "$" + ns2.formatNumber(startworth, 2), ns2.formatNumber(totalshares, 2), ns2.formatNumber(totalpaid, 2), ns2.formatNumber(totalvalue, 2), ns2.formatNumber(totalprofit, 2), ns2.formatNumber(totalpercentchange, 2), ns2.formatNumber((worth / startworth - 1) * 100, 2), "%");
  ns2.printf("\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518");
}
function buyItems(ns2, stocks) {
  let stk = ns2.stock;
  let topl = stocks.length - 1;
  let botl = 0;
  let top = stocks[topl];
  let bot = stocks[botl];
  let running = true;
  while (running) {
    let cash = 0;
    if (FUNDSELF)
      cash = workingmoney;
    else
      cash = ns2.getServerMoneyAvailable("home");
    let budget = 0;
    if (FUNDSELF)
      budget = cash - TRANSACTION_COST;
    else
      budget = cash - TRANSACTION_COST - RESERVE;
    top = stocks[topl];
    bot = stocks[botl];
    let topposi = stk.getPosition(top.sym);
    let botposi = stk.getPosition(bot.sym);
    while (topposi[0] == stk.getMaxShares(top.sym) || topposi[2] == stk.getMaxShares(top.sym)) {
      topl--;
      top = stocks[topl];
      topposi = stk.getPosition(top.sym);
    }
    while (botposi[0] == stk.getMaxShares(bot.sym) || botposi[2] == stk.getMaxShares(bot.sym)) {
      botl++;
      bot = stocks[botl];
      botposi = stk.getPosition(bot.sym);
    }
    top = stocks[topl];
    bot = stocks[botl];
    let max = false;
    if (SHORTS) {
      if (bot.adjfcast >= top.forcast && bot.adjfcast >= BUY_THREASH) {
        let price = stk.getBidPrice(bot.sym);
        let buying = Math.floor(budget / price);
        if (buying + botposi[0] + botposi[2] > stk.getMaxShares(bot.sym)) {
          buying = stk.getMaxShares(bot.sym) - botposi[0] - botposi[2];
          max = true;
        }
        if (buying >= MIN_STOCKS && price * buying >= MIN_TRANSACTION || max) {
          let bought = stk.buyShort(bot.sym, buying);
          if (bought > 0) {
            if (FUNDSELF)
              workingmoney -= bought * buying + TRANSACTION_COST;
            if (SHOWBUYS)
              ns2.tprintf("Buying %s short of %s for $%s", buying, bot.sym, ns2.formatNumber(bought * buying, 2));
            let msg = ns2.sprintf("Buying %s short of %s for $%s", buying, bot.sym, ns2.formatNumber(bought * buying, 2));
            newMsg(ns2, msg);
            botl++;
          } else {
            if (SHOWBUYS)
              ns2.tprintf("Failed to buy %s Short of %s", buying, bot.sym);
            let msg = ns2.sprintf("Failed to buy %s Short of %s", buying, bot.sym);
            newMsg(ns2, msg);
          }
        }
      } else if (top.forcast >= BUY_THREASH) {
        let price = stk.getAskPrice(top.sym);
        let buying = Math.floor(budget / price);
        if (buying + topposi[0] + topposi[2] > stk.getMaxShares(top.sym)) {
          buying = stk.getMaxShares(top.sym) - topposi[0] - topposi[2];
          max = true;
        }
        if (buying >= MIN_STOCKS && price * buying >= MIN_TRANSACTION || max) {
          let bought = stk.buyStock(top.sym, buying);
          if (bought > 0) {
            if (FUNDSELF)
              workingmoney -= bought * buying + TRANSACTION_COST;
            if (SHOWBUYS)
              ns2.tprintf("Buying %s long of %s for $%s", buying, top.sym, ns2.formatNumber(bought * buying, 2));
            let msg = ns2.sprintf("Buying %s long of %s for $%s", buying, top.sym, ns2.formatNumber(bought * buying, 2));
            newMsg(ns2, msg);
            topl--;
          } else {
            if (SHOWBUYS)
              ns2.tprintf("Failed to buy %s long of %s", buying, top.sym);
            let msg = ns2.sprintf("Failed to buy %s long of %s", buying, top.sym);
            newMsg(ns2, msg);
          }
        }
      }
    } else if (top.forcast >= BUY_THREASH) {
      let price = stk.getAskPrice(top.sym);
      let buying = Math.floor(budget / price);
      if (buying + topposi[0] + topposi[2] > stk.getMaxShares(top.sym)) {
        buying = stk.getMaxShares(top.sym) - topposi[0] - topposi[2];
        max = true;
      }
      if (buying >= MIN_STOCKS && price * buying >= MIN_TRANSACTION || max) {
        let bought = stk.buyStock(top.sym, buying);
        if (bought > 0) {
          if (FUNDSELF)
            workingmoney -= bought * buying + TRANSACTION_COST;
          if (SHOWBUYS)
            ns2.tprintf("Buying %s long of %s for $%s", buying, top.sym, ns2.formatNumber(bought * buying, 2));
          let msg = ns2.sprintf("Buying %s long of %s for $%s", buying, top.sym, ns2.formatNumber(bought * buying, 2));
          newMsg(ns2, msg);
          topl--;
        } else {
          if (SHOWBUYS)
            ns2.tprintf("Failed to buy %s long of %s", buying, top.sym);
          let msg = ns2.sprintf("Failed to buy %s long of %s", buying, top.sym);
          newMsg(ns2, msg);
        }
      }
    }
    if (!max) {
      running = false;
    }
  }
  if (FUNDSELF)
    workingmoney = 0;
}
function updateForcast(ns2, stocks) {
  for (let stk of stocks) {
    if (S4DATA) {
      stk.s4forcast = ns2.stock.getForecast(stk.sym) * 100;
      stk.s4adjfcast = stk.s4forcast >= 50 ? stk.s4forcast : 100 - stk.s4forcast;
      stk.s4volitile = ns2.stock.getVolatility(stk.sym) * 100;
    }
    let price = 0;
    let totalprice = 0;
    let ask = 0;
    let totalask = 0;
    let bid = 0;
    let totalbid = 0;
    let vol = 0;
    let bestvol = 0;
    for (let i = 0; i < stk.snaps.length - 1; i++) {
      price += stk.snaps[i + 1].price - stk.snaps[i].price;
      totalprice += Math.abs(stk.snaps[i + 1].price - stk.snaps[i].price);
      ask += stk.snaps[i + 1].askprice - stk.snaps[i].askprice;
      totalask += Math.abs(stk.snaps[i + 1].askprice - stk.snaps[i].askprice);
      bid += stk.snaps[i + 1].bidprice - stk.snaps[i].bidprice;
      totalbid += Math.abs(stk.snaps[i + 1].bidprice - stk.snaps[i].bidprice);
      vol = stk.snaps[i + 1].price > stk.snaps[i].price ? stk.snaps[i + 1].price / stk.snaps[i].price - 1 : stk.snaps[i].price / stk.snaps[i + 1].price - 1;
      vol *= 100;
      if (vol > bestvol)
        bestvol = vol;
    }
    if (totalprice == 0) {
      stk.regforcast = 50;
      stk.regadjfcast = 50;
      stk.regvolitile = 0;
    } else {
      let pfcast = price / totalprice * 50 + 50;
      let afcast = ask / totalask * 50 + 50;
      let bfcast = bid / totalbid * 50 + 50;
      stk.regforcast = (pfcast + afcast + bfcast) / 3;
      stk.regadjfcast = stk.regforcast >= 50 ? stk.regforcast : 100 - stk.regforcast;
      stk.regvolitile = bestvol;
    }
    if (S4DATA) {
      stk.hybridforcast = (stk.regforcast * HYBRID_WEIGHT_REG + stk.s4forcast * HYBRID_WEIGHT_4S) / (HYBRID_WEIGHT_4S + HYBRID_WEIGHT_REG);
      stk.hybridadjfcast = stk.hybridforcast >= 50 ? stk.hybridforcast : 100 - stk.hybridforcast;
    }
  }
  if (HYBRIDFCAST && S4DATA) {
    for (const stk of stocks) {
      stk.forcast = stk.s4forcast > 50 ? stk.hybridforcast + stk.s4volitile - HYBRID_VOL : stk.hybridforcast - stk.s4volitile + HYBRID_VOL;
      stk.adjfcast = stk.hybridadjfcast;
      stk.volitile = stk.s4volitile;
    }
  } else if (S4DATA) {
    for (const stk of stocks) {
      stk.forcast = stk.s4forcast;
      stk.adjfcast = stk.s4adjfcast;
      stk.volitile = stk.s4volitile;
    }
  } else {
    for (const stk of stocks) {
      stk.forcast = stk.regforcast;
      stk.adjfcast = stk.regadjfcast;
      stk.volitile = stk.regvolitile;
    }
  }
  stocks.sort((a, b) => {
    return a.forcast - b.forcast;
  });
}
function sellItems(ns2, stocks, arg) {
  for (let obj of stocks) {
    let posi = ns2.stock.getPosition(obj.sym);
    if (posi[0] > 0 && obj.forcast <= SELL_THREASH || posi[0] > 0 && arg && arg == "sell") {
      let sellprice = ns2.stock.sellStock(obj.sym, posi[0]);
      if (FUNDSELF)
        workingmoney += sellprice * posi[0] - TRANSACTION_COST;
      if (sellprice >= posi[1]) {
        let profit = sellprice * posi[0] - posi[0] * posi[1];
        if (SHOWSELLS)
          ns2.tprintf("WARN: Selling %s long for $%s ($%s profit)", obj.sym, ns2.formatNumber(sellprice * posi[0], 2), ns2.formatNumber(profit, 2));
        let msg = ns2.sprintf("WARN: Selling %s long for $%s ($%s profit)", obj.sym, ns2.formatNumber(sellprice * posi[0], 2), ns2.formatNumber(profit, 2));
        newMsg(ns2, msg);
      } else {
        let loss = sellprice * posi[0] - posi[0] * posi[1];
        if (SHOWSELLS)
          ns2.tprintf("WARN: Selling %s long for $%s ($%s loss)", obj.sym, ns2.formatNumber(sellprice * posi[0], 2), ns2.formatNumber(loss, 2));
        let msg = ns2.sprintf("WARN: Selling %s long for $%s ($%s loss)", obj.sym, ns2.formatNumber(sellprice * posi[0], 2), ns2.formatNumber(loss, 2));
        newMsg(ns2, msg);
      }
    }
    if (posi[2] > 0 && obj.forcast >= 100 - SELL_THREASH || posi[2] > 0 && arg && arg == "sell") {
      let shortsales = ns2.stock.getSaleGain(obj.sym, posi[2], "short");
      if (FUNDSELF)
        workingmoney += shortsales - TRANSACTION_COST;
      let paidshort = posi[2] * posi[3];
      let sellprice = ns2.stock.sellShort(obj.sym, posi[2]);
      if (shortsales >= paidshort) {
        let profit = shortsales - paidshort;
        if (SHOWSELLS)
          ns2.tprintf("WARN: Selling %s short for $%s ($%s profit)", obj.sym, ns2.formatNumber(shortsales, 2), ns2.formatNumber(profit, 2));
        let msg = ns2.sprintf("WARN: Selling %s short for $%s ($%s profit)", obj.sym, ns2.formatNumber(shortsales, 2), ns2.formatNumber(profit, 2));
        newMsg(ns2, msg);
      } else {
        let loss = shortsales - paidshort;
        if (SHOWSELLS)
          ns2.tprintf("WARN: Selling %s short for $%s ($%s loss)", obj.sym, ns2.formatNumber(shortsales, 2), ns2.formatNumber(loss, 2));
        let msg = ns2.sprintf("WARN: Selling %s short for $%s ($%s loss)", obj.sym, ns2.formatNumber(shortsales, 2), ns2.formatNumber(loss, 2));
        newMsg(ns2, msg);
      }
    }
  }
}
function getWorth(ns2, stocks) {
  let worth = ns2.getServerMoneyAvailable("home");
  for (let obj of stocks) {
    if (obj.posi[0] > 0) {
      worth += ns2.stock.getSaleGain(obj.sym, obj.posi[0], "long");
    }
    if (obj.posi[2] > 0) {
      worth += ns2.stock.getSaleGain(obj.sym, obj.posi[2], "short");
    }
  }
  return worth;
}
async function main(ns2) {
  ns2.disableLog("ALL");
  let stks = ns2.stock;
  if (!stks.hasWSEAccount() || !stks.hasTIXAPIAccess()) {
    ns2.tprintf("WSE and TIX API access are required to run this.");
    return;
  }
  if (ns2.args.includes("help")) {
    ns2.tprintf("Help activated.");
    ns2.tprintf("Options to run with are (In any order):");
    ns2.tprintf("no4s     Disabled 4s data use");
    ns2.tprintf("noshort  Disables Shorts");
    ns2.tprintf("hybrid   Uses a hybrid forcast system");
    ns2.tprintf("sell     Sells all stocks");
    ns2.tprintf("stop     Stops all %s instances", ns2.getScriptName());
    ns2.tprintf("monitor  Does not buy or sell, just watches");
    ns2.tprintf("fundself Only purchase stocks with money from the sale of stocks");
    ns2.tprintf("quiet    Suppresses sales notifications");
    ns2.tprintf("showbuy  Display purchase notifications");
    ns2.tprintf("help     Activates the help menu (You are in it...)");
    return;
  }
  ns2.args.includes("hybrid") ? HYBRIDFCAST = true : HYBRIDFCAST = false;
  let stocks = [];
  printmsgs = [];
  const syms = stks.getSymbols();
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
    };
    stocks.push(record);
  }
  newMsg(ns2, "Just Initialized");
  printLogs(ns2, stocks);
  if (ns2.args.includes("stop")) {
    ns2.tprintf("%s is being stopped.  Don't forget to sell.", ns2.getScriptName());
    if (ns2.args.includes("sell")) {
      sellItems(ns2, stocks, "sell");
    }
    UpdateHud(ns2);
    ns2.scriptKill(ns2.getScriptName(), ns2.getHostname());
    return;
  }
  if (ns2.args.includes("sell")) {
    sellItems(ns2, stocks, "sell");
    UpdateHud(ns2);
    return;
  }
  if (!ns2.args.includes("noshorts")) {
    try {
      stks.buyShort("ECP", 0);
      SHORTS = true;
      ns2.tprintf("Shorts Active!");
    } catch {
      ns2.tprintf("Shorts disabled");
      SHORTS = false;
    }
  } else {
    ns2.tprintf("Shorts disabled");
    SHORTS = false;
  }
  if (stks.has4SDataTIXAPI() && !ns2.args.includes("no4s")) {
    S4DATA = true;
    ns2.tprintf("4S data enabled!");
    if (HYBRIDFCAST) {
      ns2.tprintf("Hybrid Forcast enabled!");
    }
  } else {
    ns2.tprintf("4S Data disabled");
    S4DATA = false;
  }
  if (ns2.args.includes("monitor")) {
    ns2.tprintf("Monitor Mode enabled!");
  }
  if (ns2.args.includes("fundself") || ns2.args.includes("selffund")) {
    ns2.tprintf("Self Funding has been enabled!");
    FUNDSELF = true;
    workingmoney = 0;
  } else
    FUNDSELF = false;
  if (ns2.args.includes("quiet")) {
    ns2.tprintf("Quiet mode enabled.  Will not show sales.  Shhhh!!!");
    SHOWSELLS = false;
  } else
    SHOWSELLS = true;
  if (ns2.args.includes("showbuy")) {
    ns2.tprintf("Showing all purchases!");
    SHOWBUYS = true;
  } else
    SHOWBUYS = false;
  let working = true;
  let count = 0;
  ns2.tail();
  let starttime = Date.now();
  startworth = getWorth(ns2, stocks);
  if (S4DATA && !HYBRIDFCAST)
    count = SNAPS;
  while (working) {
    ns2.ui.resizeTail(WIDTH, HEIGHT);
    if (count == SNAPS) {
      printmsgs = [];
      newMsg(ns2, "Ready!");
    }
    if (Date.now() >= starttime + REPORT) {
      starttime = Date.now();
      let endworth = getWorth(ns2, stocks);
      if (endworth > startworth) {
        ns2.tprintf("INFO: Success!  After 1 hour %s turned into %s (%s%s)", ns2.formatNumber(startworth, 2), ns2.formatNumber(endworth, 2), ns2.formatNumber(endworth / startworth * 100, 2), "%");
        let msg = ns2.sprintf("INFO: Success!  After 1 hour %s turned into %s (%s%s)", ns2.formatNumber(startworth, 2), ns2.formatNumber(endworth, 2), ns2.formatNumber(endworth / startworth * 100, 2), "%");
        newMsg(ns2, msg);
      } else {
        ns2.tprintf("INFO: Fail!  After 1 hour %s turned into %s (%s%s)", ns2.formatNumber(startworth, 2), ns2.formatNumber(endworth, 2), ns2.formatNumber(endworth / startworth * 100, 2), "%");
        let msg = ns2.sprintf("INFO: Fail!  After 1 hour %s turned into %s (%s%s)", ns2.formatNumber(startworth, 2), ns2.formatNumber(endworth, 2), ns2.formatNumber(endworth / startworth * 100, 2), "%");
        newMsg(ns2, msg);
      }
      startworth = endworth;
    }
    if (stks.has4SDataTIXAPI() && !ns2.args.includes("no4s") && !S4DATA) {
      S4DATA = true;
      ns2.tprintf("4S data enabled!");
      if (HYBRIDFCAST) {
        ns2.tprintf("Hybrid Forcast enabled!");
      }
    }
    for (const obj of stocks) {
      let record = {
        "bidprice": stks.getBidPrice(obj.sym),
        "askprice": stks.getAskPrice(obj.sym),
        "price": stks.getPrice(obj.sym),
        "spread": stks.getAskPrice(obj.sym) - stks.getBidPrice(obj.sym),
        "time": Date.now()
      };
      obj.snaps.push(record);
      obj.snaps.length > SNAPS ? obj.snaps.shift() : null;
      obj.posi = stks.getPosition(obj.sym);
    }
    updateForcast(ns2, stocks);
    if (count > SNAPS || S4DATA && !HYBRIDFCAST) {
      if (!ns2.args.includes("monitor"))
        sellItems(ns2, stocks, "none");
    }
    if (count > SNAPS || S4DATA && !HYBRIDFCAST) {
      if (!ns2.args.includes("monitor"))
        buyItems(ns2, stocks);
    }
    for (let obj of stocks) {
      obj.posi = stks.getPosition(obj.sym);
    }
    if (count < SNAPS) {
      let msg = ns2.sprintf("Pre-total snaps %s/%s", count, SNAPS);
      newMsg(ns2, msg);
      printLogs(ns2, stocks);
    } else {
      printLogs(ns2, stocks);
    }
    let totalworth = getWorth(ns2, stocks);
    let printworth = ns2.formatNumber(totalworth, 2);
    UpdateHud(ns2, printworth);
    count++;
    await ns2.sleep(SLEEPTM);
  }
}
function UpdateHud(ns, totalWorth) {
  const doc = eval("document");
  const hook0 = doc.getElementById("overview-extra-hook-0");
  const hook1 = doc.getElementById("overview-extra-hook-1");
  try {
    const headers = [];
    const values = [];
    if (totalWorth == void 0) {
      hook0.innerText = "";
      hook1.innerText = "";
      return;
    }
    headers.push("Total Worth: ");
    values.push(totalWorth);
    hook0.innerText = headers.join(" \n");
    hook1.innerText = values.join("\n");
    hook0.onclick = function() {
      getTail = true;
    };
  } catch (err) {
    ns.print("ERROR: Update Skipped: " + String(err));
  }
}
export {
  main
};
