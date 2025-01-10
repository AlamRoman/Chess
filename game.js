
const FILE = 8;
const RANK = 8;
const WHITE = "w";
const BLACK = "b";
const PIECES_IMG_FOLDER_PATH = "resources/pieces/";

class GameBoard{

    constructor(board){
        this.board = board;

        this.castling_rights = {
            white_queen_side: true,
            white_king_side: true,
            black_queen_side: true,
            black_king_side: true,
        }
    }

    init_board(){
        this.board = Array(FILE * RANK).fill("");
    }
}

gb = new GameBoard(null);

gb.init_board();

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

//king check test
//const STARTING_FEN = "7k/2R5/Q7/8/8/8/8/8";

//enpassant test
//const STARTING_FEN = "8/2p5/8/8/3P4/8/8/8";

//castling test
//const STARTING_FEN = "r3k2r/8/1N6/pppppppp/PPPPPPPP/8/8/R3K2R";

//pawn promotion test
//const STARTING_FEN = "1n1b4/2P5/8/8/8/8/3p4/2N1B3";

//perft test
//const STARTING_FEN = "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R";

let player_color = WHITE;
let computer_color = BLACK;

let turn_of = WHITE;

//hashmap with pieces name and their images
let pieces_img = new Map();

//array of valid moves
let validMoves = [];

let valid_squares_shown = [];

let Previous_selected_square = {
    dom : null,
    index: null
}

let previous_move = null;

let pawn_promotion_square=null;

class Move {
    constructor(from, to, enPassant_piece_position=null, castlingRookToMove=null, pawn_promoted_to=null, captured_piece=null){
        this.from = from;
        this.to = to;

        this.enPassant_piece_position = enPassant_piece_position;
        this.castlingRookToMove = castlingRookToMove;
        this.pawn_promoted_to = pawn_promoted_to;
        this.captured_piece = captured_piece;
        this.promoted_pawn = null;

        this.castling_rights_before = { ...gb.castling_rights };
    }

    getEnPassant_piece_position(){
        return this.enPassant_piece_position;
    }

    SetEnPassant_piece_position(position){
        this.enPassant_piece_position = position;
    }

    getPawnPromotedTo(){
        return this.pawn_promoted_to;
    }

    setPawnPromotedTo(piece){
        this.pawn_promoted_to = piece;
    }

    getCastlingRightsBefore(){
        return this.castling_rights_before;
    }
}

const GAME_STATES = Object.freeze({
    PLAYING: 0,
    WHITE_WON: 1,
    BLACK_WON: 2,
    DRAW_BY_STALEMATE: 3
});

let current_game_state = GAME_STATES.PLAYING;

function addListenerToSquares() {
    const DOM_squares = Array.from(document.getElementsByClassName("square"));

    DOM_squares.forEach(sq => {
        sq.addEventListener("click", squareClicked);
    });
}

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

//update the DOM board from board array
function update_board_view(board) {

    for (let i = 0; i < 64; i++) {

        let square = document.getElementById("sq"+ i);

        square.innerHTML = "";

        if(board[i] !== ""){

            var img;

            try {
                img = pieces_img.get(pieces_name_to_img_name[board[i]]).cloneNode();
            } catch (error) {
                img = pieces_img.get("question-mark").cloneNode();
            }

            square.appendChild(img);
            img.classList.add("piece-img");
        }
    }
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

function isNumeric(value) {
    return /^-?\d+(\.\d+)?$/.test(value);
}

function isUpperCase(char) {

    if(char == ""){
        return false;
    }
    return char === char.toUpperCase() && char.length === 1; // Check if the character is the same when converted to uppercase and is a single character
}

function getPieceColor(piece) {
    if (piece=="") {
        return "";
    }
    return (isUpperCase(piece)) ? WHITE : BLACK;
}

function squareClicked(event) {

    //game ended
    if (current_game_state != GAME_STATES.PLAYING) {
        return;
    }

    //pawn promotion menu
    if(event.target.parentNode.classList.contains("promotion_menu_square") || event.target.classList.contains("promotion_menu_square")){

        let td_element; 

        if(event.target.parentNode.classList.contains("promotion_menu_square")){
            td_element = event.target.parentNode;
        }else{
            td_element = event.target;
        }

        let promotion_piece = td_element.id;

        let move = validMoves.find(move => move.from == Previous_selected_square.index && move.to == pawn_promotion_square);

        move.setPawnPromotedTo(promotion_piece);

        makeMove(move);

        pawn_promotion_square = null;

        //remove the promotion menu table
        let element = document.querySelector(".promotion_menu");

        if (element) {
            element.remove();
        }

        //simulate 2 player game
        swap_player_and_flip_table();

        Previous_selected_square.dom.classList.remove("selected");
        Previous_selected_square.dom = null;
        Previous_selected_square.index = null;

        return;
    }

    if (event.target.classList.contains("piece-img") || event.target.classList.contains("high-light")) {
        dom_sq = event.target.parentNode;
    }else{
        dom_sq = event.target;
    }

    id = dom_sq.id;
    square_index = id.substring(2);

    if (!isNumeric(square_index)) {
        console.log("Error : td not selected, square_index not available");
        return;
    }


    //unselect if clicked the same square
    if(Previous_selected_square.dom == dom_sq){
        Previous_selected_square.dom.classList.remove("selected");
        Previous_selected_square.dom = null;
        Previous_selected_square.index = null;

        hide_shown_valid_moves_in_html();
        
    }else if (isFriendlyPiece(gb.board[square_index], player_color)) {

        //unselect previous selected square
        if (Previous_selected_square.dom != null) {

            Previous_selected_square.dom.classList.remove("selected");
            Previous_selected_square.index = null;

            //hide previous piece valid moves
            hide_shown_valid_moves_in_html();
        }

        //select clicked square
        dom_sq.classList.add("selected");

        //generate valid moves for selected piece
        validMoves = generate_moves(gb.board[square_index],square_index, gb.board);

        console.log(validMoves);

        //show the valid moves in the gb.board
        show_valid_moves_in_html(validMoves);

        Previous_selected_square.dom = dom_sq;
        Previous_selected_square.index = square_index;

    }else{//move piece

        if (isEnemyPiece(gb.board[square_index], player_color) && Previous_selected_square.index != null) {
            //capture
        }else if(Previous_selected_square.index == null){
            return;
        }

        //find the move from valid moves
        let move = validMoves.find(move => move.from == Previous_selected_square.index && move.to == square_index);

        if (typeof move == "undefined") {//check of the move is valid move

            return;

        }else if(move.pawn_promoted_to != null){//pawn promotion menu

            let piece_color = (isUpperCase(gb.board[Previous_selected_square.index])) ? WHITE : BLACK;

            show_pawn_promotion_menu_at(square_index, piece_color);

            pawn_promotion_square = square_index;

            return;
        }

        makeMove(move);

        //simulate 2 player game
        swap_player_and_flip_table();

        Previous_selected_square.dom.classList.remove("selected");
        Previous_selected_square.dom = null;
        Previous_selected_square.index = null;
    }

}

function swap_player_and_flip_table() {

    /*
    if (player_color == WHITE) {
        document.getElementById("board").classList.add("flip-table");
        player_color = BLACK;
        computer_color = WHITE;
    }else{
        document.getElementById("board").classList.remove("flip-table");
        player_color = WHITE;
        computer_color = BLACK;
    }
        */
}

function show_pawn_promotion_menu_at(square_index, piece_color){

    let queen = (piece_color == WHITE) ? "Q" : "q";
    let rook = (piece_color == WHITE) ? "R" : "r";
    let bishop = (piece_color == WHITE) ? "B" : "b";
    let knight = (piece_color == WHITE) ? "N" : "n";

    let queen_img_path = (piece_color == WHITE) ? PIECES_IMG_FOLDER_PATH + "w_q.png" : PIECES_IMG_FOLDER_PATH + "b_q.png";
    let rook_img_path = (piece_color == WHITE) ?  PIECES_IMG_FOLDER_PATH + "w_r.png" : PIECES_IMG_FOLDER_PATH + "b_r.png";
    let bishop_img_path = (piece_color == WHITE) ?  PIECES_IMG_FOLDER_PATH + "w_b.png" : PIECES_IMG_FOLDER_PATH + "b_b.png";
    let knight_img_path = (piece_color == WHITE) ?  PIECES_IMG_FOLDER_PATH + "w_n.png" : PIECES_IMG_FOLDER_PATH + "b_n.png";

    let menu = "<table class=\"promotion_menu\">";

    menu += "<tr><td class=\"promotion_menu_square piece-img\" id=\"" + queen + "\" ><img src=\"" + queen_img_path + "\"></td>";
    menu += "<td class=\"promotion_menu_square piece-img\" id=\"" + rook + "\" ><img src=\"" + rook_img_path + "\"></td>";
    menu += "<td class=\"promotion_menu_square piece-img\" id=\"" + bishop + "\" ><img src=\"" + bishop_img_path + "\"></td>";
    menu += "<td class=\"promotion_menu_square piece-img\" id=\"" + knight + "\" ><img src=\"" + knight_img_path + "\"></td></tr>";

    menu += "</table>";

    document.getElementById("sq"+square_index).innerHTML += menu;

    //add event listener
    const DOM_squares = Array.from(document.getElementsByClassName("promotion_menu_square"));

    DOM_squares.forEach(sq => function(event){
        event.stopPropagation();
        sq.addEventListener("click", squareClicked);
    });

    //remove other valid moves
    validMoves = validMoves.filter(move => move.to == square_index);
    hide_shown_valid_moves_in_html();
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

function makeMove(move) {

    movePiece(move, gb.board);

    //console.log(evaluateBoard(gb.board));

    //alternate turn
    if (turn_of == WHITE) {
        turn_of = BLACK;
    }else{
        turn_of = WHITE;
    }

    isEndGame(gb.board);

    update_board_view(gb.board);

    if (current_game_state != GAME_STATES.PLAYING) {

        setTimeout(function(){
            showEndGameScreen();
        }, 500);

        return;
    }

    //computer move
    let cMove = computerMove();

    movePiece(cMove, gb.board);

    //console.log(evaluateBoard(gb.board));

    //alternate turn
    if (turn_of == WHITE) {
        turn_of = BLACK;
    }else{
        turn_of = WHITE;
    }

    isEndGame(gb.board);

    //computer move

    update_board_view(gb.board);

    if (current_game_state != GAME_STATES.PLAYING) {
        setTimeout(function(){
            showEndGameScreen();
        }, 500);
    }

    console.log(gb.board);

}

function movePiece(move, board) {
    
    let from = move.from;
    let to = move.to;

    let piece_to_move = board[from];

    //if pawn promoted then update it
    if(move.pawn_promoted_to != null){
        piece_to_move = move.pawn_promoted_to;
        move.promoted_pawn = move.from;
    }

    if (board[to] != "") {
        move.captured_piece = board[to];
    }
    
    board[from] = "";
    board[to] = piece_to_move;

    //check and update castling right
    check_and_update_castling_rights(piece_to_move, from, board);

    //remove enpassant pawn
    if (move.enPassant_piece_position != null) {

        board[move.enPassant_piece_position] = "";
        move.SetEnPassant_piece_position(null);
    }

    //moves castling rook
    if (move.castlingRookToMove != null) {
        board[move.castlingRookToMove.to] = board[move.castlingRookToMove.from];
        board[move.castlingRookToMove.from] = "";
    }

    previous_move = new Move(from, to);
        
}

function undoMove(move, board){
    let from = move.from;
    let to = move.to;

    let movedPiece = board[to];

    //unpromote pawn
    if(move.promoted_pawn != null){
        movedPiece = move.promoted_pawn;
    }

    board[to] = "";
    board[from] = movedPiece;

    //uncapture piece
    if (move.captured_piece !== null) {
        board[to] = move.captured_piece;
    }

    //restore previous castling rights
    gb.castling_rights = move.getCastlingRightsBefore();
}

function showEndGameScreen(){

    if (current_game_state == GAME_STATES.WHITE_WON) {
        alert("White won by checkmate");
    }else if(current_game_state == GAME_STATES.BLACK_WON){
        alert("Black won by checkmate");
    }else if(current_game_state == GAME_STATES.DRAW_BY_STALEMATE){
        alert("Draw by stalemate");
    }
}

function isEndGame(board) {

    //TODO: other endgames

    let white_total_valid_moves = countTotalValidMovesFor(WHITE, board);
    let black_total_valid_moves = countTotalValidMovesFor(BLACK, board);

    if (isKingInCheck(WHITE, board)) {
        if (white_total_valid_moves == 0) {

            current_game_state = GAME_STATES.BLACK_WON;
            return true;
        }
    }else{
        if (turn_of==WHITE && white_total_valid_moves == 0) {

            current_game_state = GAME_STATES.DRAW_BY_STALEMATE;
            return true;
        }
    }
    
    if (isKingInCheck(BLACK, board)) {
        if (black_total_valid_moves == 0) {
            
            current_game_state = GAME_STATES.WHITE_WON;
            return true;
        }
    }else{
        if (turn_of==BLACK && black_total_valid_moves == 0) {

            current_game_state = GAME_STATES.DRAW_BY_STALEMATE;
            return true;
        }
    }
}

function countTotalValidMovesFor(color, board){
    let totalMoves = 0;

    for (let i = 0; i < board.length; i++) {
        
        if (color == WHITE) {
            if (board[i] != "" && isUpperCase(board[i])) {

                let moves = generate_moves(board[i], i,board);
                
                totalMoves += moves.length;
            }
        }else{
            if (board[i] != "" && !isUpperCase(board[i])) {
                let moves = generate_moves(board[i], i,board);
                
                totalMoves += moves.length;
            }
        }
    }

    return totalMoves;
}

function computerMove() {

    /*
    var req = new XMLHttpRequest;

    req.onload = function () {
        if(req.status == 200){
            console.log(req.responseText);
        }else{
            alert("Error in computer move: " + req.status);
        }
    
    }

    req.open("GET", "computer-move.php?board="+JSON.stringify(board));
    req.send();
    */

    //TODO: make intelligent computer move

    /*
    let moves = Array();

    for (let i = 0; i < gb.board.length; i++) {
        if (isFriendlyPiece(gb.board[i],computer_color)) {
            let temp = generate_moves(gb.board[i], i, gb.board);

            moves = [...moves, ...temp];
        }
    }

    return moves[Math.floor(Math.random() * moves.length)];
    */

    const { move, value } = minimax([...gb.board], false, 2);

    console.log("computer : ",move);

    return move;
}

function check_and_update_castling_rights(piece_to_move, from, board){

    if(piece_to_move == "K" && gb.castling_rights.white_king_side && gb.castling_rights.white_queen_side){//white king moved

        gb.castling_rights.white_king_side = false;
        gb.castling_rights.white_queen_side = false;

    }else if(piece_to_move == "k" && gb.castling_rights.black_king_side && gb.castling_rights.black_queen_side ){//black king moved

        gb.castling_rights.black_king_side = false;
        gb.castling_rights.black_queen_side = false;
        
    }
    
    if (gb.castling_rights.white_queen_side && board[56] != "R") {//white queen side rook moved

        gb.castling_rights.white_queen_side = false;

    }else if(gb.castling_rights.white_king_side && board[63] != "R"){//white king side rook moved

        gb.castling_rights.white_king_side = false;
    }
    
    if (gb.castling_rights.black_queen_side && board[0] != "r") {//black queen side rook moved

        gb.castling_rights.black_queen_side = false;

    }else if(gb.castling_rights.black_king_side && board[7] != "r"){//black king side rook moved

        gb.castling_rights.black_king_side = false;
    }
}

function generate_moves(piece, position, board) {

    const y = Math.floor(position / 8); // Row
    const x = position % 8;              // Column
    const pieceColor = isUpperCase(piece) ? "w" : "b";

    let board_copy = Array.from(board);

    let moves = new Array();

    position = parseInt(position);

    if (piece == "P") {//white pawn

        //pawn move 1 square forward
        if (board[row_col_to_position(y-1, x)] == "") {
            let newIndex = row_col_to_position(y-1, x);

            if (y==1) {
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "Q",board);
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "R",board);
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "B",board);
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "N",board);
            }else{
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);
            }

            //pawn move 2 square forward if never moved
            if (y == 6 && board[row_col_to_position(y-2, x)] == "") {
                
                let newIndex = row_col_to_position(y-2, x);

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);
            }
        }

        if (isValidPosition(x-1, y-1)) {//capture left

            const newIndex = (y-1) * 8 + (x-1);

            if (isEnemyPiece(board[newIndex], "w")) {
                if (y==1) {
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "Q",board);
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "R",board);
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "B",board);
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "N",board);
                }else{
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);
                }
            }
        }

        if (isValidPosition(x+1, y-1)) {//capture right
            
            const newIndex = (y-1) * 8 + (x+1);

            if (isEnemyPiece(board[newIndex], "w")) {
                if (y==1) {
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "Q",board);
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "R",board);
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "B",board);
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "N",board);
                }else{
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);
                }
            }
        }

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
                        moves.push(new Move(position, newIndex, previous_move.to));//add to legal moves
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
                        moves.push(new Move(position, newIndex, previous_move.to));//add to legal moves
                    }
                }
            }
        }


    }else if(piece == "p"){//black pawn

        //pawn move 1 square forward
        if (board[row_col_to_position(y+1, x)] == "") {
            
            let newIndex = row_col_to_position(y+1, x);

            if (y==6) {
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "q",board);
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "r",board);
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "b",board);
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "n",board);
            }else{
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);
            }

            //pawn move 2 square forward if never moved
            if (y==1 && board[row_col_to_position(y+2, x)] == "") {
                
                let newIndex = row_col_to_position(y+2, x);

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);
            }
        }

        if (isValidPosition(x-1, y+1)) {//capture left

            const newIndex = (y+1) * 8 + (x-1);

            if (isEnemyPiece(board[newIndex], "b")) {
                if (y==6) {
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "q",board);
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "r",board);
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "b",board);
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "n",board);
                }else{
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);
                }
            }
        }

        if (isValidPosition(x+1, y+1)) {//capture right
            
            const newIndex = (y+1) * 8 + (x+1);

            if (isEnemyPiece(board[newIndex], "b")) {
                if (y==6) {
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "q",board);
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "r",board);
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "b",board);
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves, "n",board);
                }else{
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);
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
                        moves.push(new Move(position, newIndex, previous_move.to));//add to legal moves
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
                        moves.push(new Move(position, newIndex, previous_move.to));//add to legal moves
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

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move left
        for (let nx = x - 1; nx >= 0; nx--) {
            const newIndex = y * 8 + nx;
            if (board[newIndex] == "") {

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move down
        for (let ny = y + 1; ny < 8; ny++) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up
        for (let ny = y - 1; ny >= 0; ny--) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

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

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up-right
        for (let ny = y - 1, nx = x+1; ny>= 0 && nx < 8; ny--,nx++) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move bottom-left
        for (let ny = y + 1, nx = x-1; ny < 8 && nx >= 0; ny++,nx--) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move bottom-right
        for (let ny = y + 1, nx = x+1; ny < 8 && nx < 8; ny++,nx++) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

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
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move left
        for (let nx = x - 1; nx >= 0; nx--) {
            const newIndex = y * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move down
        for (let ny = y + 1; ny < 8; ny++) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up
        for (let ny = y - 1; ny >= 0; ny--) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                break;
            } else {
                break; // Blocked by same color piece
            }
        }

        // Move up-left
        for (let ny = y - 1, nx = x-1; ny>= 0 && nx >= 0; ny--,nx--) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up-right
        for (let ny = y - 1, nx = x+1; ny>= 0 && nx < 8; ny--,nx++) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move bottom-left
        for (let ny = y + 1, nx = x-1; ny < 8 && nx >= 0; ny++,nx--) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move bottom-right
        for (let ny = y + 1, nx = x+1; ny < 8 && nx < 8; ny++,nx++) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);

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
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board);
            }
        }
        
        //down
        if (y + 1 < 8) {
            const newIndex = (y + 1) * 8 + x;

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board);
            }
        }
        
        //left
        if (x - 1 >= 0) {
            const newIndex = y * 8 + (x - 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board);
            }
        }
        
        //right
        if (x + 1 < 8) {
            const newIndex = y * 8 + (x + 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board);
            }
        }

        //up-left
        if (x - 1 >= 0 && y - 1 >= 0) {
            
            const newIndex = (y - 1) * 8 + (x - 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board);
            }
        }

        //up-right
        if (x + 1 < 8 && y - 1 >= 0) {
            
            const newIndex = (y - 1) * 8 + (x + 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board);
            }
        }

        //bottom-left
        if (x - 1 >= 0 && y + 1 < 8) {
            
            const newIndex = (y + 1) * 8 + (x - 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board);
            }
        }

        //bottom-right
        if (x + 1 < 8 && y + 1 < 8) {
            
            const newIndex = (y + 1) * 8 + (x + 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves,board);
            }
        }

        //castling

        let your_back_rank = (pieceColor == WHITE) ? 7 : 0;
        let your_king_side_castiling_right = (pieceColor == WHITE) ? gb.castling_rights.white_king_side : gb.castling_rights.black_king_side;
        let your_queen_side_castling_right = (pieceColor == WHITE) ? gb.castling_rights.white_queen_side : gb.castling_rights.black_queen_side;

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
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board);
                }
            }
        }
    }

    return moves;
}

function makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves,board, pawn_promoted_to = null){
    
    let board_copy = Array.from(board);

    //make the move
    let captured_piece = board_copy[newIndex];
    board_copy[newIndex] = piece;
    board_copy[position] = "";

    if (!isKingInCheck(pieceColor, board_copy)) {
        moves.push(new Move(position, newIndex, null, null, pawn_promoted_to, captured_piece));//add to legal moves

        return true;
    }

    return false;
}

function isKingInCheck(kingColor, b){

    const kingPosition = (kingColor == "w") ? findPiecePosition("K", b) : findPiecePosition("k", b);

    if (kingPosition == -1) {//if there is no king return
        return;
    }

    const king_x = kingPosition % 8; //col
    const king_y = Math.floor(kingPosition / 8); //row

    const opponentPawn = (kingColor == 'w') ? 'p' : 'P';
    const opponentKnight = (kingColor == 'w') ? 'n' : 'N';
    const opponentRook = (kingColor == 'w') ? 'r' : 'R';
    const opponentBishop = (kingColor == 'w') ? 'b' : 'B';
    const opponentQueen = (kingColor == 'w') ? 'q' : 'Q';
    const opponentKing = (kingColor == 'w') ? 'k' : 'K';

    // Check for pawn attacks
    let pawnDirection = (kingColor == 'w') ? -1 : 1; // For white king opponent pawn will be up (-1), and for black king down (1)
    //if there is an enemy pawn in left
    if (isValidPosition(king_x - 1, king_y + pawnDirection) && b[row_col_to_position(king_y + pawnDirection, king_x - 1)] == opponentPawn) return true;
    //if there is an enemy pawn in right
    if (isValidPosition(king_x + 1, king_y + pawnDirection) && b[row_col_to_position(king_y + pawnDirection, king_x + 1)] == opponentPawn) return true;


    //check for knights attack
    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2],[1, -2], [1, 2], [2, -1], [2, 1]];
    
    for (const [rowOffset, colOffset] of knightMoves) {
        const row = king_y + rowOffset;
        const col = king_x + colOffset;
        if (isValidPosition(col, row) && b[row_col_to_position(row, col)] == opponentKnight) return true;
    }

    // Check for rook/queen attacks (horizontal/vertical)
    const rookDirections = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    for (const [rowDir, colDir] of rookDirections) {

        for (let i = 1; i < 8; i++) {
            const row = king_y + i * rowDir;
            const col = king_x + i * colDir;

            //check if the position is valid
            if (!isValidPosition(col, row)){
                break;
            }else if (b[row_col_to_position(row, col)] == opponentRook || b[row_col_to_position(row, col)] == opponentQueen){
                return true;
            }else if (b[row_col_to_position(row, col)] != "") {//check if blocked by any other piece
                break;
            }
        }
    }

    // Check for bishop/queen attacks (diagonal)
    const bishopDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (const [rowDir, colDir] of bishopDirections) {
        for (let i = 1; i < 8; i++) {
            const row = king_y + i * rowDir;
            const col = king_x + i * colDir;

            //check if the position is valid
            if (!isValidPosition(col, row)){
                break;
            }else if (b[row_col_to_position(row, col)] == opponentBishop || b[row_col_to_position(row, col)] == opponentQueen){
                return true;
            }else if (b[row_col_to_position(row, col)] != "") {//check if blocked by any other piece
                break;
            }
        }
    }

    // Check for opponent king
    const enemyKingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1],[0, 1], [1, -1], [1, 0], [1, 1]];

    for (const [rowOffset, colOffset] of enemyKingMoves) {
        const row = king_y + rowOffset;
        const col = king_x + colOffset;

        if (isValidPosition(col, row) && b[row_col_to_position(row, col)] == opponentKing) return true;
    }

    return false;
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

function show_valid_moves_in_html(moves) {
    moves.forEach(move=>{
        sqID = move.to;

        var square = document.getElementById("sq"+sqID);

        if (square.querySelector("div.high-light") === null) {//only add the div once

            square.innerHTML += "<div class=\"high-light\"></div>";
            square.classList.add("possibleMove");

            valid_squares_shown.push("sq"+sqID);
        }
        
    });
}

function hide_shown_valid_moves_in_html() {

    for (let i = 0; i < valid_squares_shown.length; i++) {
        let sq = valid_squares_shown[i];
        
        square = document.getElementById(sq);

        square.classList.remove("possibleMove");

        let divs = square.getElementsByClassName("high-light");

        //remove high-lighted border
        for (let i = 0; i < divs.length; i++) {
            divs[i].remove();
        }
        
    }

    valid_squares_shown = [];
}

function perft(depth, turn_color, board) {

    if (depth == 0) {
        return 1;
    }

    let moves = Array();

    let nodes = 0;

    for (let i = 0; i < board.length; i++) {
        if (board[i] != "" && getPieceColor(board[i]) == turn_color) {
            let temp = generate_moves(board[i], i,board);

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

        movePiece(moves[i], board);

        nodes += perft(depth-1, turn_color, board);

        board = [...temp];
    }

    return nodes;
}

function minimax(b, isMaximizingPlayer, depth) {

    if (depth <= 0 || isEndGame(b)) {
        return { move: null, value: evaluateBoard(b) };
    }

    let bestMove = null;
    let bestValue = isMaximizingPlayer ? -Infinity : Infinity;


    let all_moves = [];
    for (let i = 0; i < b.length; i++) {
        if (getPieceColor(b[i]) === (isMaximizingPlayer ?  player_color : computer_color)) {
            const piece_moves = generate_moves(b[i], i, b);
            if (piece_moves.length > 0) {
                all_moves = [...all_moves, ...piece_moves];
            }
        }
    }

    for (const move of all_moves) {
        movePiece(move, b);
        const { value } = minimax(b, !isMaximizingPlayer, depth - 1);
        undoMove(move, b);

        if (isMaximizingPlayer) {
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
        } else {
            if (value < bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }
    }

    return { move: bestMove, value: bestValue };
}


function evaluateBoard(board) {

    const pieceValues = {
        P: 100, 
        N: 300,  
        B: 350, 
        R: 500, 
        Q: 900,  
        K: 20000   
    };

    const pieceSquareTables = {
        // Pawn Position Table
        P: [
            0, 5, 5, 0, 0, 5, 5, 0,
            0, 10, 10, 5, 5, 10, 10, 0,
            0, 10, 20, 20, 20, 20, 10, 0,
            5, 20, 30, 35, 35, 30, 20, 5,
            5, 20, 30, 35, 35, 30, 20, 5,
            0, 10, 20, 20, 20, 20, 10, 0,
            0, 5, 10, 10, 10, 10, 5, 0,
            0, 0, 0, 0, 0, 0, 0, 0
        ],
    
        // Knight Position Table
        N: [
            -10, -5, 0, 0, 0, 0, -5, -10,
            -5, 0, 5, 10, 10, 5, 0, -5,
            0, 5, 10, 15, 15, 10, 5, 0,
            0, 10, 15, 20, 20, 15, 10, 0,
            0, 10, 15, 20, 20, 15, 10, 0,
            0, 5, 10, 15, 15, 10, 5, 0,
            -5, 0, 5, 10, 10, 5, 0, -5,
            -10, -5, 0, 0, 0, 0, -5, -10
        ],
    
        // Bishop Position Table
        B: [
            -10, -5, -5, -5, -5, -5, -5, -10,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 5, 10, 10, 5, 0, -5,
            -5, 5, 10, 10, 10, 10, 5, -5,
            -5, 5, 10, 10, 10, 10, 5, -5,
            -5, 0, 5, 10, 10, 5, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -10, -5, -5, -5, -5, -5, -5, -10
        ],
    
        // Rook Position Table
        R: [
            0, 0, 5, 10, 10, 5, 0, 0,
            0, 5, 10, 10, 10, 10, 5, 0,
            0, 0, 5, 10, 10, 5, 0, 0,
            0, 0, 5, 10, 10, 5, 0, 0,
            0, 0, 5, 10, 10, 5, 0, 0,
            0, 0, 5, 10, 10, 5, 0, 0,
            0, 0, 5, 10, 10, 5, 0, 0,
            0, 0, 5, 10, 10, 5, 0, 0
        ],
    
        // Queen Position Table
        Q: [
            -20, -10, -10, -5, -5, -10, -10, -20,
            -10, 0, 0, 0, 0, 0, 0, -10,
            -10, 0, 5, 5, 5, 5, 0, -10,
            -5, 0, 5, 5, 5, 5, 0, -5,
            -5, 0, 5, 5, 5, 5, 0, -5,
            -10, 0, 5, 5, 5, 5, 0, -10,
            -10, 0, 0, 0, 0, 0, 0, -10,
            -20, -10, -10, -5, -5, -10, -10, -20
        ],
    
        // King Position Table
        K: [
            -30, -40, -40, -50, -50, -40, -40, -30,
            -30, -40, -40, -50, -50, -40, -40, -30,
            -30, -40, -40, -50, -50, -40, -40, -30,
            -30, -40, -40, -50, -50, -40, -40, -30,
            -20, -30, -30, -40, -40, -30, -30, -20,
            -10, -20, -20, -20, -20, -20, -20, -10,
            20, 20, 0, 0, 0, 0, 20, 20,
            20, 30, 10, 0, 0, 10, 30, 20
        ],
    
        // King Position Table (Endgame)
        KE: [
            -50, -40, -30, -20, -20, -30, -40, -50,
            -30, -20, -10, 0, 0, -10, -20, -30,
            -20, -10, 10, 20, 20, 10, -10, -20,
            -10, 0, 20, 30, 30, 20, 0, -10,
            -10, 0, 20, 30, 30, 20, 0, -10,
            -20, -10, 10, 20, 20, 10, -10, -20,
            -30, -20, -10, 0, 0, -10, -20, -30,
            -50, -40, -30, -20, -20, -30, -40, -50
        ]
    };
    
    // Mirror piece table for black perspective
    const mirrorTable = (table) => {
        const mirrored = [];
        for (let row = 0; row < 8; row++) {
            mirrored.push(...table.slice(row * 8, (row + 1) * 8).reverse());
        }
        return mirrored.reverse();
    };
    
    const blackPieceSquareTables = {};

    for (const [key, table] of Object.entries(pieceSquareTables)) {
        blackPieceSquareTables[key] = mirrorTable(table);
    }
    

    let value = 0;

    for (let i = 0; i < board.length; i++) {
        const piece = board[i];
        if (piece !== "") {

            let pieceColor = getPieceColor(piece);;
            const pieceType = piece.toUpperCase();

            const pieceValue = pieceValues[pieceType];

            let positionValue = 0;

            if (pieceColor == WHITE) {
                positionValue = pieceSquareTables[pieceType][i];
            }else{
                positionValue = blackPieceSquareTables[pieceType][i];
            }

            value += (positionValue +  pieceValue) * (pieceColor == WHITE ? 1 : -1);
            
        }
    }

    return value;
}


addListenerToSquares();

load_img_in_array(pieces_name_to_img_name) 

fen_to_board(gb.board);

console.log(gb.board);

//perft
//console.log(perft(3, turn_of, gb.board));

update_board_view(gb.board);

console.log(evaluateBoard(gb.board));
