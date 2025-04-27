//piaces name and their image name
const pieces_name_to_img_name = {
    "r": "b_r",
    "n": "b_n",
    "b": "b_b",
    "q": "b_q",
    "k": "b_k",
    "p": "b_p",
    "P": "w_p",
    "R": "w_r",
    "N": "w_n",
    "B": "w_b",
    "Q": "w_q",
    "K": "w_k"
}

function fen_to_board(board) {
    count = 0;
    for (let i = 0; i < STARTING_FEN.length; i++) {
        char = STARTING_FEN[i];

        if (isNumeric(char)) {
            count += parseInt(char,10);
        }else if(char == "/"){
            continue;
        }else if(char == " "){
            break;
        }else{
            board[count] = char;
            count++;
        }
    }
}

function addListenerToSquares() {
    const DOM_squares = Array.from(document.getElementsByClassName("square"));

    DOM_squares.forEach(sq => {
        sq.addEventListener("click", squareClicked);
    });
} 

function load_img_in_array(pieces_name_to_img_name) {
    //load images in the hashmap
    for (let img_name of Object.values(pieces_name_to_img_name)) {
        let img = new Image();
        img.src = "resources/pieces/" + img_name + ".png";
        pieces_img.set(img_name , img);
    }

    let img = new Image();
    img.src = "resources/question-mark.png";
    pieces_img.set("question-mark" , img);
}

function isNumeric(value) {
    return /^-?\d+(\.\d+)?$/.test(value);
}

function isUpperCase(char) {

    if(char == ""){
        return false;
    }
    return char === char.toUpperCase() && char.length === 1; // Check if the character is the same when converted to uppercase and is a single character
}

function isFriendlyPiece(piece, your_color) {

    //there is no piece
    if(piece == ""){
        return false;
    }

    if (isUpperCase(piece)) {
        if (your_color == "w") {
            return true;
        }

        return false;
    }

    if (your_color == "b") {
        return true;
    }

    return false;

}

function isEnemyPiece(piece, your_color) {

    //there is no piece
    if(piece == ""){
        return false;
    }

    return !isFriendlyPiece(piece, your_color);
}

function getPieceColor(piece) {
    if (piece=="") {
        return "";
    }
    return (isUpperCase(piece)) ? WHITE : BLACK;
}

function findKingPosition(color, game_board) {
    let piece = (color == WHITE)? "K" : "k";

    return game_board.board.indexOf(piece);
}

function isEndgame(game_board) {

    if (game_board.countTotalPieces() <= 10) {
        return true;
    }
    return false;
}

function isGameFinished(game_board) {
    let board = deepCopy(game_board.board);

    function checkEndCondition(player) {
        let totalValidMoves = countTotalValidMovesFor(player, game_board);
        let isInCheck = isKingInCheck(player, board);

        if (isInCheck && totalValidMoves === 0) {
            game_board.current_game_state = player === WHITE ? GAME_STATES.BLACK_WON : GAME_STATES.WHITE_WON;
            return true;
        }

        if (!isInCheck && totalValidMoves === 0) {
            game_board.current_game_state = GAME_STATES.DRAW_BY_STALEMATE;
            return true;
        }

        return false;
    }

    return checkEndCondition(game_board.turn_of);
}

function findPiecePosition(piece, board){
    return board.indexOf(piece);
}

function row_col_to_position(row, col){
    return col + row * RANK;
}

function isValidPosition(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8; // Check if the position is within the board limits
}

function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepCopy);
    }

    const copy = Object.create(Object.getPrototypeOf(obj));

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deepCopy(obj[key]);
        }
    }

    return copy;
}

function update_game_board_piece_count(move) {
    
    if (move.captured_piece != "") {
        
        gb.increase_captured_piece_count_of(move.captured_piece);
        gb.decrease_piece_count_of(move.captured_piece);
    }

    if(move.pawn_promoted_to != null){
        gb.decrease_piece_count_of(move.moving_piece);
        gb.increase_piece_count_of(move.pawn_promoted_to);
    }

    update_piece_capture_html();
}

function countTotalValidMovesFor(color, game_board){

    let board = game_board.board;

    let totalMoves = 0;

    for (let i = 0; i < board.length; i++) {
        
        if (color == WHITE) {
            if (board[i] != "" && isUpperCase(board[i])) {

                let moves = generate_moves(board[i], i,game_board);
                
                totalMoves += moves.length;
            }
        }else{
            if (board[i] != "" && !isUpperCase(board[i])) {
                let moves = generate_moves(board[i], i,game_board);
                
                totalMoves += moves.length;
            }
        }
    }

    return totalMoves;
}

function check_and_update_castling_rights(piece_to_move, from, game_board){

    let board = deepCopy(game_board.board);

    if(piece_to_move == "K" && game_board.castling_rights.white_king_side && game_board.castling_rights.white_queen_side){//white king moved

        game_board.castling_rights.white_king_side = false;
        game_board.castling_rights.white_queen_side = false;

    }else if(piece_to_move == "k" && game_board.castling_rights.black_king_side && game_board.castling_rights.black_queen_side ){//black king moved

        game_board.castling_rights.black_king_side = false;
        game_board.castling_rights.black_queen_side = false;
        
    }
    
    if (game_board.castling_rights.white_queen_side && board[56] != "R") {//white queen side rook moved

        game_board.castling_rights.white_queen_side = false;

    }else if(game_board.castling_rights.white_king_side && board[63] != "R"){//white king side rook moved

        game_board.castling_rights.white_king_side = false;
    }
    
    if (game_board.castling_rights.black_queen_side && board[0] != "r") {//black queen side rook moved

        game_board.castling_rights.black_queen_side = false;

    }else if(game_board.castling_rights.black_king_side && board[7] != "r"){//black king side rook moved

        game_board.castling_rights.black_king_side = false;
    }
}

function perft(depth, turn_color, board) {

    if (depth == 0) {
        return 1;
    }

    let moves = Array();

    let nodes = 0;

    for (let i = 0; i < board.length; i++) {
        if (board[i] != "" && getPieceColor(board[i]) == turn_color) {
            let temp = generate_moves(board[i], i,gb);

            moves = [...moves, ...temp];
        }
    }

    if (turn_color==WHITE) {
        turn_color=BLACK;
    }else{
        turn_color=WHITE;
    }

    for (let i = 0; i < moves.length; i++) {
        let temp = [...board];

        movePiece(moves[i], gb);

        nodes += perft(depth-1, turn_color, board);

        board = [...temp];
    }

    return nodes;
}

function isInDevelopment() {
    return window.config.currentEnvironment === window.config.environment.DEVELOPMENT;
}