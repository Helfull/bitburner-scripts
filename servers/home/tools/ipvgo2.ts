import { proxyNs } from '@lib/ram-dodge';

/** @param {NS} ns */
export async function main(ns) {
  const go = ns.go;
  const maxGameTime = 5*60;
  const getTimeSeconds = () => Math.round(performance.now()/1000);
  const argsSchema = [
    ['s',0],
    ['o',0],
    ['p',false],
    ['h',false],
    ['r',true]
  ];
  const boardSize = [5, 7, 9, 13];
  //const opponentsNames = ["Daedalus", "Illuminati", "w0r1d_d43m0n", "Netburners"];
  //const opponentsNames = ["Illuminati", "Illuminati", "Illuminati", "Illuminati", "Illuminati", "Illuminati", "Illuminati", "Illuminati", "Illuminati", "Illuminati", "Daedalus", "Daedalus", "Daedalus", "Daedalus", "Daedalus", "Daedalus", "Daedalus", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners"];
  //const opponentsNames = ["Daedalus", "Daedalus", "Daedalus", "Daedalus", "Daedalus", "Daedalus", "Daedalus", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners"];
  //const opponentsNames = ["The Black Hand", "The Black Hand", "The Black Hand", "The Black Hand", "The Black Hand", "The Black Hand", "The Black Hand", "The Black Hand", "The Black Hand", "The Black Hand", "Daedalus", "Daedalus", "Daedalus", "Daedalus", "Daedalus", "Daedalus", "Daedalus", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners", "Netburners"];
  const opponentsNames = ["Daedalus"];
  //const opponentsNames = ["Netburners"];

  if (!go) {
    ns.print("Go API not available");
    return;
  }

  const options = ns.flags(argsSchema);
  const engine = new TacticalEngine(ns);
  let numGames = 0;
  let moveCount = 0;
  let opponent = options.o;
  let gametime = getTimeSeconds();

  while (true) {
      await ns.sleep(100);
    try {
      const result = await playTacticalMove(ns, engine, moveCount);
      if (result) moveCount++;
      await ns.sleep(100);

      const timeElapsed = getTimeSeconds() - gametime;

      // Check if time limit exceeded
      if (timeElapsed >= maxGameTime || !result) {
        ns.print(`Game ${numGames + 1} ended - Time limit reached`);

        if (options.r) {
          opponent = (opponent + 1) % opponentsNames.length;
        }

        ns.print(`Resetting against: ${opponentsNames[opponent]}`);
        ns.go.resetBoardState(opponentsNames[opponent], boardSize[options.s]);

        ++numGames;
        moveCount = 0;
        gametime = getTimeSeconds();

        ns.print(`Starting game ${numGames} against ${opponentsNames[opponent]}`);
      } else {
        // Let the game continue - only reset on time limit or if playTacticalMove indicates game over
        ns.print(`Move ${moveCount} completed, continuing...`);
      }

    } catch (error) {
      ns.print(`ERROR: ${error?.message || "undefined error"}`);
      break;
    }
  }
}

class TacticalEngine {
    constructor(ns) {
        this.ns = ns;
        this.searchDepth = 6; // Much deeper for 5x5
        this.positionCache = new Map();
        this.moveOrdering = true; // Search best moves first
    }

    isEmpty(char) {
        return char === '.' || char === ' ' || char === '';
    }

    getBoardSize(board) {
        return {height: board.length, width: board[0]?.length || 0};
    }

    getCell(board, x, y) {
        if (x < 0 || x >= board.length) return undefined;
        if (y < 0 || y >= board[x].length) return undefined;
        return board[x][y];
    }

    hashBoard(board) {
        return board.join('|');
    }

    copyBoard(board) {
        return [...board];
    }

    // Get legal moves with tactical ordering
    getLegalMoves(board, player, orderMoves = true) {
        const moves = [];
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                if (this.isEmpty(board[x][y])) {
                    moves.push({x, y});
                }
            }
        }

        if (orderMoves) {
            return this.orderMoves(board, moves, player);
        }

        return moves;
    }

    // Order moves by tactical importance (search best moves first)
    orderMoves(board, moves, player) {
        const scoredMoves = moves.map(move => {
            let priority = 0;

            // 1. Highest priority: moves that capture
            const testResult = this.applyMove(board, move.x, move.y, player);
            if (testResult && testResult.captures > 0) {
                priority += testResult.captures * 1000;
            }

            // 2. High priority: moves that save our groups in atari
            if (this.savesGroupInAtari(board, move.x, move.y, player)) {
                priority += 800;
            }

            // 3. Medium priority: moves that threaten opponent groups
            if (this.threatensOpponentGroup(board, move.x, move.y, player)) {
                priority += 400;
            }

            // 4. Connect to existing stones
            const connections = this.countAdjacentFriendly(board, move.x, move.y, player);
            priority += connections * 100;

            // 5. Center control
            const center = Math.floor(board.length / 2);
            const distFromCenter = Math.abs(move.x - center) + Math.abs(move.y - center);
            priority += Math.max(0, 50 - distFromCenter * 10);

            return {...move, priority};
        });

        // Sort by priority (highest first)
        scoredMoves.sort((a, b) => b.priority - a.priority);
        return scoredMoves;
    }

    // Check if move saves a group in atari (1 liberty)
    savesGroupInAtari(board, x, y, player) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (this.getCell(board, nx, ny) === player) {
                const group = this.getConnectedGroup(board, nx, ny, player);
                const liberties = this.countLiberties(board, group);

                if (liberties === 1) {
                    // Check if our move gives this group a second liberty
                    const testBoard = this.copyBoard(board);
                    const row = testBoard[x].split('');
                    row[y] = player;
                    testBoard[x] = row.join('');

                    const newLiberties = this.countLiberties(testBoard, group);
                    if (newLiberties > 1) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // Check if move threatens opponent group
    threatensOpponentGroup(board, x, y, player) {
        const opponent = player === 'O' ? 'X' : 'O';
        const testResult = this.applyMove(board, x, y, player);
        if (!testResult) return false;

        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (this.getCell(testResult.board, nx, ny) === opponent) {
                const group = this.getConnectedGroup(testResult.board, nx, ny, opponent);
                const liberties = this.countLiberties(testResult.board, group);

                if (liberties <= 1) {
                    return true;
                }
            }
        }

        return false;
    }

    // Count adjacent friendly stones
    countAdjacentFriendly(board, x, y, player) {
        let count = 0;
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (this.getCell(board, nx, ny) === player) {
                count++;
            }
        }

        return count;
    }

    applyMove(board, x, y, player) {
        try {
            const newBoard = this.copyBoard(board);

            const row = newBoard[x].split('');
            row[y] = player;
            newBoard[x] = row.join('');

            const captures = this.findAndApplyCaptures(newBoard, x, y, player);

            // Anti-suicide check
            if (captures === 0) {
                const ourGroup = this.getConnectedGroup(newBoard, x, y, player);
                const liberties = this.countLiberties(newBoard, ourGroup);
                if (liberties === 0) {
                    return null;
                }
            }

            return {board: newBoard, captures};
        } catch (error) {
            return null;
        }
    }

    findAndApplyCaptures(board, x, y, player) {
        const opponent = player === 'O' ? 'X' : 'O';
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        let totalCaptures = 0;

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (this.getCell(board, nx, ny) === opponent) {
                const group = this.getConnectedGroup(board, nx, ny, opponent);
                const liberties = this.countLiberties(board, group);

                if (liberties === 0) {
                    for (const {x: gx, y: gy} of group) {
                        const row = board[gx].split('');
                        row[gy] = '.';
                        board[gx] = row.join('');
                        totalCaptures++;
                    }
                }
            }
        }

        return totalCaptures;
    }

    getConnectedGroup(board, startX, startY, color, visited = new Set()) {
        const key = `${startX},${startY}`;
        if (visited.has(key)) return [];
        visited.add(key);

        if (this.getCell(board, startX, startY) !== color) return [];

        const group = [{x: startX, y: startY}];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dx, dy] of directions) {
            const nx = startX + dx;
            const ny = startY + dy;

            if (this.getCell(board, nx, ny) === color) {
                group.push(...this.getConnectedGroup(board, nx, ny, color, visited));
            }
        }

        return group;
    }

    countLiberties(board, group) {
        const liberties = new Set();
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const {x, y} of group) {
            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                const cell = this.getCell(board, nx, ny);

                if (cell && this.isEmpty(cell)) {
                    liberties.add(`${nx},${ny}`);
                }
            }
        }

        return liberties.size;
    }

    // Much improved evaluation function
    evaluatePosition(board, player) {
        let score = 0;
        const opponent = player === 'O' ? 'X' : 'O';

        // 1. CRITICAL: Network safety analysis
        const networkAnalysis = this.analyzeNetworks(board, player);
        const opponentNetworkAnalysis = this.analyzeNetworks(board, opponent);

        // Heavily penalize having groups in atari
        score -= networkAnalysis.groupsInAtari * 500;
        score -= networkAnalysis.stonesInAtari * 200;

        // Reward opponent groups in atari
        score += opponentNetworkAnalysis.groupsInAtari * 400;
        score += opponentNetworkAnalysis.stonesInAtari * 150;

        // Reward safe, connected networks
        score += networkAnalysis.safeStones * 100;
        score -= opponentNetworkAnalysis.safeStones * 100;

        // 2. Territory control (IPvGO win condition)
        const territoryScore = this.evaluateTerritory(board, player);
        score += territoryScore.stronglyControlled * 150;
        score += territoryScore.weaklyControlled * 50;

        // 3. Captures
        const ourStones = this.countStones(board, player);
        const theirStones = this.countStones(board, opponent);
        score += (ourStones - theirStones) * 80;

        // 4. Connectivity bonus
        score += networkAnalysis.connectivityBonus * 30;
        score -= opponentNetworkAnalysis.connectivityBonus * 30;

        // 5. Strategic positions
        score += this.evaluateStrategicPositions(board, player) * 20;

        return score;
    }

    // Detailed network analysis
    analyzeNetworks(board, player) {
        let groupsInAtari = 0;
        let stonesInAtari = 0;
        let safeStones = 0;
        let connectivityBonus = 0;

        const visited = new Set();
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                if (board[x][y] === player && !visited.has(`${x},${y}`)) {
                    const group = this.getConnectedGroup(board, x, y, player, visited);
                    const liberties = this.countLiberties(board, group);

                    if (liberties <= 1) {
                        groupsInAtari++;
                        stonesInAtari += group.length;
                    } else if (liberties >= 3) {
                        safeStones += group.length;
                    }

                    // Connectivity: larger groups are better
                    if (group.length >= 3) {
                        connectivityBonus += group.length * group.length;
                    }
                }
            }
        }

        return {groupsInAtari, stonesInAtari, safeStones, connectivityBonus};
    }

    evaluateTerritory(board, player) {
        let stronglyControlled = 0;
        let weaklyControlled = 0;
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                if (this.isEmpty(board[x][y])) {
                    const influence = this.calculateInfluence(board, x, y, player);

                    if (influence > 0.8) {
                        stronglyControlled++;
                    } else if (influence > 0.6) {
                        weaklyControlled++;
                    }
                }
            }
        }

        return {stronglyControlled, weaklyControlled};
    }

    calculateInfluence(board, x, y, player) {
        const opponent = player === 'O' ? 'X' : 'O';
        let ourInfluence = 0;
        let theirInfluence = 0;
        const radius = 3;
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const nx = x + dx;
                const ny = y + dy;
                const cell = this.getCell(board, nx, ny);

                if (cell === player) {
                    const distance = Math.max(Math.abs(dx), Math.abs(dy));
                    ourInfluence += Math.max(0, radius - distance + 1);
                } else if (cell === opponent) {
                    const distance = Math.max(Math.abs(dx), Math.abs(dy));
                    theirInfluence += Math.max(0, radius - distance + 1);
                }
            }
        }

        const total = ourInfluence + theirInfluence;
        return total === 0 ? 0.5 : ourInfluence / total;
    }

    countStones(board, player) {
        let count = 0;
        for (const row of board) {
            for (const cell of row) {
                if (cell === player) count++;
            }
        }
        return count;
    }

    evaluateStrategicPositions(board, player) {
        let score = 0;
        const {height, width} = this.getBoardSize(board);
        const centerX = Math.floor(height / 2);
        const centerY = Math.floor(width / 2);
        for (let x = 0; x < height; x++) {
            for (let y = 0; y < width; y++) {
                if (board[x][y] === player) {
                    const distFromCenter = Math.abs(x - centerX) + Math.abs(y - centerY);
                    score += Math.max(0, 10 - distFromCenter * 2);
                }
            }
        }

        return score;
    }

    // Enhanced minimax with better pruning
    minimax(ns, board, depth, alpha, beta, maximizingPlayer, player) {
        const boardHash = this.hashBoard(board);
        const cacheKey = `${boardHash}-${depth}-${maximizingPlayer}`;
        if (this.positionCache.has(cacheKey)) {
            return this.positionCache.get(cacheKey);
        }

        if (depth === 0) {
            const score = this.evaluatePosition(board, player);
            const result = {score, move: null};
            this.positionCache.set(cacheKey, result);
            return result;
        }

        const currentPlayer = maximizingPlayer ? player : (player === 'O' ? 'X' : 'O');
        const moves = this.getLegalMoves(board, currentPlayer, true); // Use move ordering

        if (moves.length === 0) {
            const score = this.evaluatePosition(board, player);
            const result = {score, move: null};
            this.positionCache.set(cacheKey, result);
            return result;
        }

        let bestMove = null;

        if (maximizingPlayer) {
            let maxEval = -Infinity;

            for (const move of moves) {
                const result = this.applyMove(board, move.x, move.y, currentPlayer);
                if (result) {
                    const evaluation = this.minimax(ns, result.board, depth - 1, alpha, beta, false, player);

                    if (evaluation.score > maxEval) {
                        maxEval = evaluation.score;
                        bestMove = move;
                    }

                    alpha = Math.max(alpha, evaluation.score);
                    if (beta <= alpha) break; // Alpha-beta pruning
                }
            }

            const result = {score: maxEval, move: bestMove};
            this.positionCache.set(cacheKey, result);
            return result;
        } else {
            let minEval = Infinity;

            for (const move of moves) {
                const result = this.applyMove(board, move.x, move.y, currentPlayer);
                if (result) {
                    const evaluation = this.minimax(ns, result.board, depth - 1, alpha, beta, true, player);

                    if (evaluation.score < minEval) {
                        minEval = evaluation.score;
                        bestMove = move;
                    }

                    beta = Math.min(beta, evaluation.score);
                    if (beta <= alpha) break;
                }
            }

            const result = {score: minEval, move: bestMove};
            this.positionCache.set(cacheKey, result);
            return result;
        }
    }
}

async function playTacticalMove(ns, engine, moveCount) {
    const go = ns.go;

    try {
        const currentPlayer = await proxyNs(ns, 'go.getCurrentPlayer');
        const gameState = await proxyNs(ns, 'go.getGameState');
        const board = await proxyNs(ns, 'go.getBoardState');

        ns.print(`\n=== TACTICAL MOVE ${moveCount + 1} ===`);

        if (gameState === "finished" || currentPlayer === "None") {
            return false;
        }

        if (currentPlayer !== "White" && currentPlayer !== "Black") {
            return false;
        }

        const playerSymbol = currentPlayer === "White" ? "O" : "X";

        // Clear cache every 10 moves
        if (moveCount % 10 === 0) {
            engine.positionCache.clear();
        }

        ns.print("Deep tactical analysis...");
        const startTime = Date.now();

        const result = await engine.minimax(ns, board, engine.searchDepth, -Infinity, Infinity, true, playerSymbol);

        const analysisTime = Date.now() - startTime;
        ns.print(`Analysis: ${analysisTime}ms, Evaluation: ${result.score?.toFixed(1)}`);

        if (result.move) {
            ns.print(`Tactical move: (${result.move.x}, ${result.move.y})`);
            const moveResult = await proxyNs(ns, 'go.makeMove', result.move.x, result.move.y);
            ns.print(`Result type: ${moveResult.type || 'unknown'}`);
            ns.print(`Result: ${JSON.stringify(moveResult)}`);
            return moveResult && moveResult !== "Invalid move";
        } else {
            ns.print("Passing turn");
            await go.passTurn();
            return true;
        }

    } catch (error) {
        ns.print(`ERROR: ${error.message}`);
        return false;
    }
}