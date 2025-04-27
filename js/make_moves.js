async function makeMove(move) {

    remove_highlight_previous_move();

    movePiece(move, gb);

    update_game_board_piece_count(move);

    highlight_previous_move();

    isGameFinished(gb);

    await update_board_view(gb.board);

    if (gb.current_game_state != GAME_STATES.PLAYING) {

        setTimeout(function(){
            showEndGameScreen();
        }, 500);

        return;
    }

    //computer move
    if (GAME_TYPE == 0) {
        let cMove = computerMove();

        remove_highlight_previous_move();

        movePiece(cMove, gb);

        update_game_board_piece_count(cMove);

        highlight_previous_move();

        isGameFinished(gb);

        await update_board_view(gb.board);

        if (gb.current_game_state != GAME_STATES.PLAYING) {
            setTimeout(function(){
                showEndGameScreen();
            }, 500);
        }
    }

    if (isInDevelopment()) {
        //console.log(gb.board);
        console.log("evaluarion : ",evaluateBoard(gb));
    }

}

function movePiece(move, game_board) {

    let board = game_board.board;
    
    let from = move.from;
    let to = move.to;

    let piece_to_move = board[from];

    //if pawn promoted then update it
    if(move.pawn_promoted_to != null){
        piece_to_move = move.pawn_promoted_to;
        //move.promoted_pawn = board[from];
    }

    //capture
    if (board[to] != "") {
        move.captured_piece = board[to];
    }
    
    board[from] = "";
    board[to] = piece_to_move;

    //check and update castling right
    check_and_update_castling_rights(piece_to_move, from, game_board);

    //remove enpassant pawn
    if (move.enPassant_piece_position != null) {
        move.captured_piece = board[move.enPassant_piece_position];
        board[move.enPassant_piece_position] = "";
        //move.SetEnPassant_piece_position(null);
    }

    //moves castling rook
    if (move.castlingRookToMove != null) {
        board[move.castlingRookToMove.to] = board[move.castlingRookToMove.from];
        board[move.castlingRookToMove.from] = "";
    }

    previous_move = new Move(from, to, move.enPassant_piece_position, move.castlingRookToMove, move.pawn_promoted_to, move.captured_piece, move.moving_piece);
    moves_history.push(previous_move);

    if (game_board.turn_of == WHITE) {
        game_board.turn_of = BLACK;
    }else{
        game_board.turn_of = WHITE;
    }

    /*
    if (board[2]==undefined) {
        console.log(move);
        return;
    }
        */
        
}

function undoMove(move, game_board){

    let board = game_board.board;

    let from = move.from;
    let to = move.to;

    let movedPiece = board[to];

    //unmove castling rook
    if (move.castlingRookToMove != null) {
        board[move.castlingRookToMove.from] = board[move.castlingRookToMove.to];
        board[move.castlingRookToMove.to] = "";
    }

    //unpromote pawn
    if(move.pawn_promoted_to != null){
        movedPiece = move.moving_piece;
    }

    board[to] = "";
    board[from] = movedPiece;

    //uncapture piece
    if (move.captured_piece !== null) {

        if(move.enPassant_piece_position != null){//enpassant capture

            board[move.enPassant_piece_position] = move.capturedPiece;

        }else{//normal capture

            board[to] = move.captured_piece;
        }
    }

    //restore enpassant pawn
    if (move.enPassant_piece_position != null) {
        board[move.enPassant_piece_position] = move.captured_piece;
    }

    //restore previous castling rights
    game_board.castling_rights = move.getCastlingRightsBefore();

    moves_history.pop();

    previous_move = moves_history[moves_history.length - 1];

    //previous turn of
    if (game_board.turn_of == WHITE) {
        game_board.turn_of = BLACK;
    }else{
        game_board.turn_of = WHITE;
    }
}