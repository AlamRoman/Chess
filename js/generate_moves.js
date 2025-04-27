function isSquareUnderAttack(pieceColor, board, square) {

    let x = square % 8;
    let y = Math.floor(square/8);

    const opponentPawn = (pieceColor == WHITE) ? 'p' : 'P';
    const opponentKnight = (pieceColor == WHITE) ? 'n' : 'N';
    const opponentRook = (pieceColor == WHITE) ? 'r' : 'R';
    const opponentBishop = (pieceColor == WHITE) ? 'b' : 'B';
    const opponentQueen = (pieceColor == WHITE) ? 'q' : 'Q';
    const opponentKing = (pieceColor == WHITE) ? 'k' : 'K';

    // Check for pawn attacks
    let pawnDirection = (pieceColor == WHITE) ? -1 : 1; // For white piece opponent pawn will be up (-1), and for black piece down (1)
    //if there is an enemy pawn in left
    if (isValidPosition(x - 1, y + pawnDirection) && board[row_col_to_position(y + pawnDirection, x - 1)] == opponentPawn) return true;
    //if there is an enemy pawn in right
    if (isValidPosition(x + 1, y + pawnDirection) && board[row_col_to_position(y + pawnDirection, x + 1)] == opponentPawn) return true;


    //check for knights attack
    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2],[1, -2], [1, 2], [2, -1], [2, 1]];
    
    for (const [rowOffset, colOffset] of knightMoves) {
        const row = y + rowOffset;
        const col = x + colOffset;
        if (isValidPosition(col, row) && board[row_col_to_position(row, col)] == opponentKnight) return true;
    }

    // Check for rook/queen attacks (horizontal/vertical)
    const rookDirections = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    for (const [rowDir, colDir] of rookDirections) {

        for (let i = 1; i < 8; i++) {
            const row = y + i * rowDir;
            const col = x + i * colDir;

            //check if the position is valid
            if (!isValidPosition(col, row)){
                break;
            }else if (board[row_col_to_position(row, col)] == opponentRook || board[row_col_to_position(row, col)] == opponentQueen){
                return true;
            }else if (board[row_col_to_position(row, col)] != "") {//check if blocked by any other piece
                break;
            }
        }
    }

    // Check for bishop/queen attacks (diagonal)
    const bishopDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (const [rowDir, colDir] of bishopDirections) {
        for (let i = 1; i < 8; i++) {
            const row = y + i * rowDir;
            const col = x + i * colDir;

            //check if the position is valid
            if (!isValidPosition(col, row)){
                break;
            }else if (board[row_col_to_position(row, col)] == opponentBishop || board[row_col_to_position(row, col)] == opponentQueen){
                return true;
            }else if (board[row_col_to_position(row, col)] != "") {//check if blocked by any other piece
                break;
            }
        }
    }

    // Check for opponent king
    const enemyKingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1],[0, 1], [1, -1], [1, 0], [1, 1]];

    for (const [rowOffset, colOffset] of enemyKingMoves) {
        const row = y + rowOffset;
        const col = x + colOffset;

        if (isValidPosition(col, row) && board[row_col_to_position(row, col)] == opponentKing) return true;
    }

    return false;

}

function generate_moves(piece, position, game_board, onlyCaptureMoves=false) {

    let board = game_board.board;

    const y = Math.floor(position / 8); // Row
    const x = position % 8;              // Column
    const pieceColor = isUpperCase(piece) ? "w" : "b";

    let moves = new Array();

    position = parseInt(position);

    if (piece == "P") {//white pawn

        //pawn move 1 square forward
        if (board[row_col_to_position(y-1, x)] == "") {
            let newIndex = row_col_to_position(y-1, x);

            if (y==1) {
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "Q");
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "R");
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "B");
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "N");
            }else{
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
            }

            //pawn move 2 square forward if never moved
            if (y == 6 && board[row_col_to_position(y-2, x)] == "") {
                
                let newIndex = row_col_to_position(y-2, x);

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
            }
        }

        if (isValidPosition(x-1, y-1)) {//capture left

            const newIndex = (y-1) * 8 + (x-1);

            if (isEnemyPiece(board[newIndex], "w")) {
                if (y==1) {
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves, "Q");
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves, "R");
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves, "B");
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves, "N");
                }else{
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
                }
            }
        }

        if (isValidPosition(x+1, y-1)) {//capture right
            
            const newIndex = (y-1) * 8 + (x+1);

            if (isEnemyPiece(board[newIndex], "w")) {
                if (y==1) {
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "Q");
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "R");
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "B");
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "N");
                }else{
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
                }
            }
        }

        //console.log("prv: ", previous_move);

        //enPassant
        if (y == 3 && previous_move != null && board[previous_move.to] == "p") {
            
            let enemy_pawn_x = previous_move.to % 8;
            let enemy_pawn_from_y =  Math.floor(previous_move.from / 8);
            let enemy_pawn_to_y =  Math.floor(previous_move.to / 8);

            if(enemy_pawn_from_y == 1 && enemy_pawn_to_y == 3){
                if (enemy_pawn_x == x-1) {

                    let newIndex =  (y-1) * 8 + (x-1);

                    /*
                    let moveAdded = makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                    if (moveAdded) {
                        moves[moves.length - 1].SetEnPassant_piece_position(previous_move.to);
                    }
                        
                    */

                    //make move and check
                    let board_copy = Array.from(board);

                    //make the move
                    board_copy[newIndex] = piece;
                    board_copy[position] = "";
                    board_copy[previous_move.to] = "";

                    if (!isKingInCheck(pieceColor, board_copy)) {
                        if(onlyCaptureMoves){
                            if (isEnemyPiece(board[newIndex])) {
                                moves.push(new Move(position, newIndex, previous_move.to, null, null, "p", "P"));//add to legal moves
                            }
                        }else{
                            moves.push(new Move(position, newIndex, previous_move.to, null, null, "p", "P"));//add to legal moves
                        }
                    }

                }else if(enemy_pawn_x == x+1){
                    let newIndex =  (y-1) * 8 + (x+1);

                    //make move and check
                    let board_copy = Array.from(board);

                    //make the move
                    board_copy[newIndex] = piece;
                    board_copy[position] = "";
                    board_copy[previous_move.to] = "";

                    if (!isKingInCheck(pieceColor, board_copy)) {
                        if(onlyCaptureMoves){
                            if (isEnemyPiece(board[newIndex])) {
                                moves.push(new Move(position, newIndex, previous_move.to, null, null, "p", "P"));//add to legal moves
                            }
                        }else{
                            moves.push(new Move(position, newIndex, previous_move.to, null, null, "p", "P"));//add to legal moves
                        }
                    }
                }
            }
        }


    }else if(piece == "p"){//black pawn

        //pawn move 1 square forward
        if (board[row_col_to_position(y+1, x)] == "") {
            
            let newIndex = row_col_to_position(y+1, x);

            if (y==6) {
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "q");
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "r");
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "b");
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "n");
            }else{
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
            }

            //pawn move 2 square forward if never moved
            if (y==1 && board[row_col_to_position(y+2, x)] == "") {
                
                let newIndex = row_col_to_position(y+2, x);

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
            }
        }

        if (isValidPosition(x-1, y+1)) {//capture left

            const newIndex = (y+1) * 8 + (x-1);

            if (isEnemyPiece(board[newIndex], "b")) {
                if (y==6) {
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "q");
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "r");
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "b");
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "n");
                }else{
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
                }
            }
        }

        if (isValidPosition(x+1, y+1)) {//capture right
            
            const newIndex = (y+1) * 8 + (x+1);

            if (isEnemyPiece(board[newIndex], "b")) {
                if (y==6) {
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "q");
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "r");
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "b");
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, board, onlyCaptureMoves, "n");
                }else{
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
                }
            }
        }

        //enPassant
        if(y == 4 && previous_move != null && board[previous_move.to] == "P"){

            let enemy_pawn_x = previous_move.to % 8;
            let enemy_pawn_from_y =  Math.floor(previous_move.from / 8);
            let enemy_pawn_to_y =  Math.floor(previous_move.to / 8);

            if (enemy_pawn_from_y == 6 && enemy_pawn_to_y == 4) {
                if (enemy_pawn_x == x-1) {

                    let newIndex =  (y+1) * 8 + (x-1);

                    //make move and check
                    let board_copy = Array.from(board);

                    //make the move
                    board_copy[newIndex] = piece;
                    board_copy[position] = "";
                    board_copy[previous_move.to] = "";

                    if (!isKingInCheck(pieceColor, board_copy)) {
                        if(onlyCaptureMoves){
                            if (isEnemyPiece(board[newIndex])) {
                                moves.push(new Move(position, newIndex, previous_move.to, null, null, "P", "p"));//add to legal moves
                            }
                        }else{
                            moves.push(new Move(position, newIndex, previous_move.to, null, null, "P", "p"));//add to legal moves
                        }
                    }

                }else if(enemy_pawn_x == x+1){
                    let newIndex =  (y+1) * 8 + (x+1);
                    
                    //make move and check
                    let board_copy = Array.from(board);

                    //make the move
                    board_copy[newIndex] = piece;
                    board_copy[position] = "";
                    board_copy[previous_move.to] = "";

                    if (!isKingInCheck(pieceColor, board_copy)) {
                        if(onlyCaptureMoves){
                            if (isEnemyPiece(board[newIndex])) {
                                moves.push(new Move(position, newIndex, previous_move.to, null, null, "P", "p"));//add to legal moves
                            }
                        }else{
                            moves.push(new Move(position, newIndex, previous_move.to, null, null, "P", "p"));//add to legal moves
                        }
                    }
                }
            }
        }

    }else if(piece == "R" || piece == "r"){//the rooooooooooooook

        // Rook movement logic (up, down, left, right)
        // Move right
        for (let nx = x + 1; nx < 8; nx++) {
            const newIndex = y * 8 + nx;
            if (board[newIndex] == "") {

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move left
        for (let nx = x - 1; nx >= 0; nx--) {
            const newIndex = y * 8 + nx;
            if (board[newIndex] == "") {

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move down
        for (let ny = y + 1; ny < 8; ny++) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up
        for (let ny = y - 1; ny >= 0; ny--) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            } else {
                break; // Blocked by same color piece
            }
        }
    }else if(piece == "B" || piece == "b"){//bishop

        // Bishop movement logic (up-left, up-right, bottom-left, bottom-right)
        // Move up-left
        for (let ny = y - 1, nx = x-1; ny>= 0 && nx >= 0; ny--,nx--) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up-right
        for (let ny = y - 1, nx = x+1; ny>= 0 && nx < 8; ny--,nx++) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move bottom-left
        for (let ny = y + 1, nx = x-1; ny < 8 && nx >= 0; ny++,nx--) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move bottom-right
        for (let ny = y + 1, nx = x+1; ny < 8 && nx < 8; ny++,nx++) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }
        
    }else if(piece == "Q" || piece == "q"){//queen

        // Rook movement logic (up, down, left, right)
        // Move right
        for (let nx = x + 1; nx < 8; nx++) {
            const newIndex = y * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move left
        for (let nx = x - 1; nx >= 0; nx--) {
            const newIndex = y * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move down
        for (let ny = y + 1; ny < 8; ny++) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up
        for (let ny = y - 1; ny >= 0; ny--) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            } else {
                break; // Blocked by same color piece
            }
        }

        // Move up-left
        for (let ny = y - 1, nx = x-1; ny>= 0 && nx >= 0; ny--,nx--) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up-right
        for (let ny = y - 1, nx = x+1; ny>= 0 && nx < 8; ny--,nx++) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move bottom-left
        for (let ny = y + 1, nx = x-1; ny < 8 && nx >= 0; ny++,nx--) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move bottom-right
        for (let ny = y + 1, nx = x+1; ny < 8 && nx < 8; ny++,nx++) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }
    }else if(piece == "K" || piece == "k"){//king

        //up
        if (y - 1 >= 0) {
            const newIndex = (y-1) * 8 + x;

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
            }
        }
        
        //down
        if (y + 1 < 8) {
            const newIndex = (y + 1) * 8 + x;

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
            }
        }
        
        //left
        if (x - 1 >= 0) {
            const newIndex = y * 8 + (x - 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
            }
        }
        
        //right
        if (x + 1 < 8) {
            const newIndex = y * 8 + (x + 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
            }
        }

        //up-left
        if (x - 1 >= 0 && y - 1 >= 0) {
            
            const newIndex = (y - 1) * 8 + (x - 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
            }
        }

        //up-right
        if (x + 1 < 8 && y - 1 >= 0) {
            
            const newIndex = (y - 1) * 8 + (x + 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
            }
        }

        //bottom-left
        if (x - 1 >= 0 && y + 1 < 8) {
            
            const newIndex = (y + 1) * 8 + (x - 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
            }
        }

        //bottom-right
        if (x + 1 < 8 && y + 1 < 8) {
            
            const newIndex = (y + 1) * 8 + (x + 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
            }
        }

        //castling
        
        let your_back_rank = (pieceColor == "w") ? 7 : 0;
        let your_king_side_castling_right = (pieceColor == "w") ? game_board.castling_rights.white_king_side : game_board.castling_rights.black_king_side;
        let your_queen_side_castling_right = (pieceColor == "w") ? game_board.castling_rights.white_queen_side : game_board.castling_rights.black_queen_side;
        
        /*
        if (y == your_back_rank && (your_king_side_castiling_right || your_queen_side_castling_right) && !isKingInCheck(pieceColor, board)) {

            //king side
            //check if king side knight and bishop positions are empty
            if (your_king_side_castiling_right && board[row_col_to_position(y, x+1)] == "" && board[row_col_to_position(y, x+2)] == "") {

                //to check if the bishop position is attacked
                let board_copy_check_bishop_square = Array.from(board);
                board_copy_check_bishop_square[row_col_to_position(y, x)] = "";
                board_copy_check_bishop_square[row_col_to_position(y, x+1)] = piece;

                if (!isKingInCheck(pieceColor, board_copy_check_bishop_square)) {
                    
                    //to check if kings final position is safe
                    let board_copy_check_final_position = Array.from(board);
                    board_copy_check_final_position[row_col_to_position(y, x+1)] = (pieceColor == WHITE) ? "R" : "r";
                    board_copy_check_final_position[row_col_to_position(y, x+2)] = piece;
                    board_copy_check_final_position[row_col_to_position(y, x+3)] = "";
                    board_copy_check_final_position[row_col_to_position(y, x)] = "";

                    if (!isKingInCheck(pieceColor, board_copy_check_final_position)) {
                        
                        moves.push(new Move(position, row_col_to_position(y, x+2),null,new Move(row_col_to_position(y, x+3), row_col_to_position(y, x+1))));
                    }
                }
            }

            //queen side
            //check if queen side knight and bishop positions are empty
            if (your_queen_side_castling_right && board[row_col_to_position(y, x-1)] == "" && board[row_col_to_position(y, x-2)] == "" && board[row_col_to_position(y, x-3)] == "") {
                
                //to check if the bishop position is attacked
                let board_copy_check_queen_square = Array.from(board);
                board_copy_check_queen_square[row_col_to_position(y, x)] = "";
                board_copy_check_queen_square[row_col_to_position(y, x-1)] = piece;

                if (!isKingInCheck(pieceColor, board_copy_check_queen_square)) {
                    
                    //to check if kings final position is safe
                    let board_copy_check_final_position = Array.from(board);
                    board_copy_check_final_position[row_col_to_position(y, x-1)] = (pieceColor == WHITE) ? "R" : "r";
                    board_copy_check_final_position[row_col_to_position(y, x-2)] = piece;
                    board_copy_check_final_position[row_col_to_position(y, x-4)] = "";
                    board_copy_check_final_position[row_col_to_position(y, x)] = "";

                    if (!isKingInCheck(pieceColor, board_copy_check_final_position)) {
                        
                        moves.push(new Move(position, row_col_to_position(y, x-2),null,new Move(row_col_to_position(y, x-4), row_col_to_position(y, x-1))));
                    }
                }
            }

        }
        */


        if (y === your_back_rank && !isKingInCheck(pieceColor, board)) {
            // King-side castling
            if (your_king_side_castling_right &&
                board[row_col_to_position(y, x + 1)] === "" &&
                board[row_col_to_position(y, x + 2)] === "" &&
                board[row_col_to_position(y, 7)] === ((pieceColor === "w") ? "R" : "r")) {

                // Check if the squares the king moves over are safe
                if (!isSquareUnderAttack(pieceColor, board, row_col_to_position(y, x + 1)) &&
                    !isSquareUnderAttack(pieceColor, board, row_col_to_position(y, x + 2))) {

                    moves.push(new Move(
                        position,
                        row_col_to_position(y, x + 2),
                        null,
                        new Move(row_col_to_position(y, 7), row_col_to_position(y, x + 1))
                    ));
                }
            }

            // Queen-side castling
            if (your_queen_side_castling_right &&
                board[row_col_to_position(y, x - 1)] === "" &&
                board[row_col_to_position(y, x - 2)] === "" &&
                board[row_col_to_position(y, x - 3)] === "" &&
                board[row_col_to_position(y, 0)] === ((pieceColor === "w") ? "R" : "r")) {

                // Check if the squares the king moves over are safe
                if (!isSquareUnderAttack(pieceColor, board, row_col_to_position(y, x - 1)) &&
                    !isSquareUnderAttack(pieceColor, board, row_col_to_position(y, x - 2))) {

                    moves.push(new Move(
                        position,
                        row_col_to_position(y, x - 2),
                        null,
                        new Move(row_col_to_position(y, 0), row_col_to_position(y, x - 1))
                    ));
                }
            }
        }

    }else if(piece == "N" || piece == "n"){//knight

        //all possible knight moves
        const knightMoves = [
            [2, 1], [2, -1], [-2, 1], [-2, -1],
            [1, 2], [1, -2], [-1, 2], [-1, -2] 
        ];

        for (const [dx, dy] of knightMoves) {
            
            const nx = x + dx; 
            const ny = y + dy; 

            if (isValidPosition(nx, ny)) {
                const newIndex = ny * 8 + nx;

                if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, onlyCaptureMoves);
                }
            }
        }
    }

    return moves;
}

function makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board,onlyCaptureMoves, pawn_promoted_to = null){
    
    let board_copy = Array.from(board);

    //make the move
    let captured_piece = board_copy[newIndex];
    let moving_piece = board_copy[position];
    board_copy[newIndex] = piece;
    board_copy[position] = "";

    if (!isKingInCheck(pieceColor, board_copy)) {
        if (onlyCaptureMoves) {

            if(captured_piece != ""){
                moves.push(new Move(position, newIndex, null, null, pawn_promoted_to, captured_piece, moving_piece));//add to legal moves
            }
        }else{

            moves.push(new Move(position, newIndex, null, null, pawn_promoted_to, null, moving_piece));//add to legal moves
        }
    
        return true;
    }

    return false;
}

function isKingInCheck(kingColor, board){

    const kingPosition = (kingColor == "w") ? findPiecePosition("K", board) : findPiecePosition("k", board);

    if (kingPosition == -1) {//if there is no king return
        return;
    }

    return isSquareUnderAttack(kingColor,board,kingPosition);
}