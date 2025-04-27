function computerMove() {

    nodesVisited = 0;
    extendedSearchDepthCount = 0;

    let isMax = (computer_color == WHITE) ? true : false;

    const { move, value } = minimax(deepCopy(gb), isMax, 3, -Infinity, Infinity);

    if (isInDevelopment()) {
        console.log("computer : ", move.moving_piece , " , " , move, " nodes : ", nodesVisited, " , main : " + (nodesVisited - extendedSearchDepthCount) + " , ext : " + extendedSearchDepthCount + " , value: ", value);
    }

    return move;
}

function orderMoves(moves, depth, isMaximizingPlayer) {
    
    function guessMoveScore(move) {
        let score = 0;

        // Promotion
        if (move.pawn_promoted_to != null) {
            score += 1000;
        }

        // MVV-LVA (prioritize highest-value victim, lowest-value attacker)
        if (move.captured_piece != null) {
            score += pieceValues[move.captured_piece.toUpperCase()] * 10 
                    - pieceValues[move.moving_piece.toUpperCase()];
        }

        // History Heuristic
        const player = isMaximizingPlayer ? WHITE : BLACK;
        const historyScore = (historyHeuristic[player][move.from]?.[move.to] || 0) / 100;
        score += historyScore;

        // Killer moves
        if (isKillerMove(move, depth, isMaximizingPlayer)) { 
            score += 500;
        }

        // Castling bonus
        if (move.castlingRookToMove != null) {
            score += 30;
        }

        return score;
    }

    return moves.sort((a, b) => guessMoveScore(b) - guessMoveScore(a));
}

function addKillerMove(move, depth, isMaximizingPlayer) {
    const key = `${depth}-${isMaximizingPlayer}`;
    
    if (!killerMoves[key]) {
        killerMoves[key] = [];
    }

    if (!killerMoves[key].some(killer => isSameMove(killer, move))) {
        if (killerMoves[key].length >= 2) {
            killerMoves[key].shift();
        }
        killerMoves[key].push(move);
    }
}

function isKillerMove(move, depth, isMaximizingPlayer) {
    const key = `${depth}-${isMaximizingPlayer}`;
    return killerMoves[key]?.some(killer => isSameMove(killer, move)) || false;
}

function isSameMove(move1, move2) {
    return move1.from === move2.from && move1.to === move2.to;
}

function squareToEdgeMinDistance(square) {

    let x = square % RANK;
    let y = Math.floor(square / FILE);

    let min = Infinity;
    let temp = 0;
    
    for (let nx = x + 1; nx < 8; nx++){
        temp++;
    }

    if (temp < min) {
        min = temp;
    }

    temp = 0;

    for (let nx = x - 1; nx >= 0; nx--){
        temp++;
    }

    if (temp < min) {
        min = temp;
    }

    temp = 0;

    for (let ny = y + 1; ny < 8; ny++){
        temp++;
    }

    if (temp < min) {
        min = temp;
    }

    temp = 0;

    for (let ny = y - 1; ny >= 0; ny--){
        temp++;
    }

    if (temp < min) {
        min = temp;
    }

    return min;
}

function distanceBetweenKings(whiteKingSquare, blackKingSquare) {
    let white_x = whiteKingSquare % RANK;
    let white_y = Math.floor(whiteKingSquare / FILE);
    let black_x = blackKingSquare % RANK;
    let black_y = Math.floor(blackKingSquare / FILE);

    return Math.floor(Math.sqrt(Math.pow(white_x - black_x, 2) + Math.pow(white_y - black_y, 2)));
}

function minimax(game_board, isMaximizingPlayer, depth, alfa, beta) {

    nodesVisited++;

    let b = deepCopy(game_board.board);

    if (isGameFinished(game_board) || depth <= 0) {

        if (game_board.current_game_state == GAME_STATES.WHITE_WON) {
            return { move: null, value: 1000000 + (depth * 10)};
        }else if(game_board.current_game_state == GAME_STATES.BLACK_WON){
            return { move: null, value: -1000000 - (depth * 10)};
        }else if(game_board.current_game_state == GAME_STATES.DRAW_BY_STALEMATE){
            return { move: null, value: 0 };
        }

        //return { move: null, value: evaluateBoard(game_board) };

        let final_value = extendSearchForCaptures(deepCopy(game_board), isMaximizingPlayer, alfa, beta, 4) + (isMaximizingPlayer ? depth : -depth) * 10;

        return { move: null, value: final_value};
    }

    let bestMove = null;
    let bestValue = isMaximizingPlayer ? -Infinity : Infinity;

    let all_moves = [];
    for (let i = 0; i < b.length; i++) {
        if (getPieceColor(b[i]) === (isMaximizingPlayer ?  WHITE : BLACK)) {
            const piece_moves = generate_moves(b[i], i, game_board);
            if (piece_moves.length > 0) {
                all_moves = [...all_moves, ...piece_moves];
            }
        }
    }

    all_moves = orderMoves(all_moves, depth, isMaximizingPlayer);

    //console.log("all ", all_moves);

    for (const move of all_moves) {
        movePiece(move, game_board);
        let { value } = minimax(deepCopy(game_board), !isMaximizingPlayer, depth - 1, alfa, beta);
        undoMove(move, game_board);

        //better value for low depth
        //value = value + (isMaximizingPlayer ? depth : -depth) * 10;

        /*
        if (depth == 3) {
            console.log(value, move);
        }
            */

        if (isMaximizingPlayer) {
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }

            alfa = Math.max(alfa, value);

        } else {
            if (value < bestValue) {
                bestValue = value;
                bestMove = move;
            }

            beta = Math.min(beta, value);
        }

        if (beta <= alfa) {
            addKillerMove(move, depth, isMaximizingPlayer);
            
            // Update history heuristic (add bonus for moves causing cutoffs)
            const player = isMaximizingPlayer ? WHITE : BLACK;
            if (!historyHeuristic[player][move.from]) historyHeuristic[player][move.from] = {};
            historyHeuristic[player][move.from][move.to] = (historyHeuristic[player][move.from][move.to] || 0) + depth * depth;

            break;
        }
    }

    if (all_moves.length <= 0) {

        if (isGameFinished(game_board)) {

            if (game_board.current_game_state == GAME_STATES.WHITE_WON) {
                return { move: null, value: 1000000 };
            }else if(game_board.current_game_state == GAME_STATES.BLACK_WON){
                return { move: null, value: -1000000 };
            }else if(game_board.current_game_state == GAME_STATES.DRAW_BY_STALEMATE){
                return { move: null, value: 0 };
            }
    
            return { move: null, value: evaluateBoard(game_board) };
        }
    }

    return { move: bestMove, value: bestValue };
}

function extendSearchForCaptures(game_board, isMaximizingPlayer, alpha, beta, depth) {
    nodesVisited++;
    extendedSearchDepthCount++;

    let board = game_board.board;

    // Base case: depth limit reached
    if (depth <= 0) {
        return evaluateBoard(game_board);
    }

    // Evaluate the current position
    let eval = evaluateBoard(game_board);

    // Alpha-beta pruning
    if (isMaximizingPlayer) {
        if (eval >= beta) {
            return beta; // Beta cutoff
        }
        alpha = Math.max(alpha, eval);
    } else {
        if (eval <= alpha) {
            return alpha; // Alpha cutoff
        }
        beta = Math.min(beta, eval);
    }

    // Generate all capture moves
    let all_moves = [];
    for (let i = 0; i < board.length; i++) {
        if (getPieceColor(board[i]) === (isMaximizingPlayer ? WHITE : BLACK)) {
            const piece_moves = generate_moves(board[i], i, game_board, true); // Only capture moves
            if (piece_moves.length > 0) {
                all_moves = [...all_moves, ...piece_moves];
            }
        }
    }

    all_moves = orderMoves(all_moves, depth, isMaximizingPlayer);

    // Search capture moves
    for (const move of all_moves) {
        movePiece(move, game_board);
        eval = extendSearchForCaptures(deepCopy(game_board), !isMaximizingPlayer, alpha, beta, depth - 1);
        undoMove(move, game_board);

        if (isMaximizingPlayer) {
            if (eval >= beta) {
                return beta; // Beta cutoff
            }
            alpha = Math.max(alpha, eval);
        } else {
            if (eval <= alpha) {
                return alpha; // Alpha cutoff
            }
            beta = Math.min(beta, eval);
        }
    }

    return isMaximizingPlayer ? alpha : beta;
}

function evaluateBoard(game_board) {

    board = game_board.board;

    let pieceValues;
    let whitePST;

    if (isEndgame(game_board)) {
        pieceValues = pieceValuesEndGame;
        whitePST = pieceSquareTablesEndGame;
    }else{
        pieceValues = pieceValuesMiddleGame;
        whitePST = pieceSquareTablesMiddleGame;
    }
    
    // Mirror piece table for black perspective
    const mirrorTable = (table) => {
        const mirrored = [];
        for (let row = 0; row < 8; row++) {
            mirrored.push(...table.slice(row * 8, (row + 1) * 8).reverse());
        }
        return mirrored.reverse();
    };
    
    const blackPST = {};

    for (const [key, table] of Object.entries(whitePST)) {
        blackPST[key] = mirrorTable(table);
    }

    let value = 0;

    for (let i = 0; i < board.length; i++) {
        const piece = board[i];
        if (piece !== "") {

            let pieceColor;

            try {
                pieceColor = getPieceColor(piece)
            } catch (error) {
                console.log("error: n depth " + extendedSearchDepthCount);
                game_board.print_board();
            }
            const pieceType = piece.toUpperCase();

            let pieceValue = pieceValues[pieceType];

            let positionValue = 0;

            if (pieceColor == WHITE) {
                positionValue = whitePST[pieceType][i];
            }else{
                pieceValue *= -1;
                positionValue = -blackPST[pieceType][i];
            }

            value += positionValue +  pieceValue;
            
        }
    }

    if (isEndgame(game_board)) {
        
        //white winning endgame
        if (value > 0) {

            let opponentKingToEdgeDistance = squareToEdgeMinDistance(findKingPosition(BLACK, game_board));
            
            value -= opponentKingToEdgeDistance * 10;

            value -= distanceBetweenKings(findKingPosition(WHITE, game_board), findKingPosition(BLACK, game_board)) * 10;

        }else{//black winning endgame

            let opponentKingToEdgeDistance = squareToEdgeMinDistance(findKingPosition(WHITE, game_board));
            
            value += opponentKingToEdgeDistance * 10;

            value += distanceBetweenKings(findKingPosition(WHITE, game_board), findKingPosition(BLACK, game_board)) * 10;

        }
    }

    return value;
}