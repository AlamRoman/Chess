
const FILE = 8;
const RANK = 8;
const WHITE = "w";
const BLACK = "b";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

//king check test
//const STARTING_FEN = "7k/2R5/Q7/8/8/8/8/8";

//enpassant test
//const STARTING_FEN = "8/2p5/8/8/3P4/8/8/8";

let player_color = "w";
let enemy_color = "b";

//create the empty board
const board = Array(FILE * RANK).fill("");

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

class Move {
    constructor(from, to, enPassant_piece_position=null){
        this.from = from;
        this.to = to;

        this.enPassant_piece_position = enPassant_piece_position;
    }

    getEnPassant_piece_position(){
        return this.enPassant_piece_position;
    }

    SetEnPassant_piece_position(position){
        this.enPassant_piece_position = position;
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

function squareClicked(event) {

    if (current_game_state != GAME_STATES.PLAYING) {
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
        
    }else if (isFriendlyPiece(board[square_index], player_color)) {

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
        validMoves = generate_moves(board[square_index],square_index);

        console.log(validMoves);

        //show the valid moves in the board
        show_valid_moves_in_html(validMoves);

        Previous_selected_square.dom = dom_sq;
        Previous_selected_square.index = square_index;
    }else{
        if (isEnemyPiece(board[square_index], player_color) && Previous_selected_square.index != null) {
            //capture
        }else if(Previous_selected_square.index == null){
            return;
        }

        makeMove(Previous_selected_square.index, square_index);

        //simulate 2 player game
        if (player_color == "w") {
            document.getElementById("board").classList.add("flip-table");
            player_color = "b";
            enemy_color = "W";
        }else{
            document.getElementById("board").classList.remove("flip-table");
            player_color = "w";
            enemy_color = "b";
        }

        Previous_selected_square.dom.classList.remove("selected");
        Previous_selected_square.dom = null;
        Previous_selected_square.index = null;
    }

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

function makeMove(from, to) {

    let move = validMoves.find(move => move.from == from && move.to == to);
    
    //check if the move is a valid move, if not return
    /*
    if(!validMoves.some(move => move.to == to)){
        return;
    }
    */

    if (typeof move == "undefined") {
        return;
    }

    movePiece(move);

    previous_move = new Move(from, to);

    isEndGame();

    /*
    computerMove();

    isEndGame();

    //previous move
    */

    update_board_view(board);

    if (current_game_state != GAME_STATES.PLAYING) {
        setTimeout(function(){
            showEndGameScreen();
        }, 500);
    }
}

function showEndGameScreen(){

    if (current_game_state == GAME_STATES.WHITE_WON) {
        alert("White won");
    }else if(current_game_state == GAME_STATES.BLACK_WON){
        alert("Black won");
    }else if(current_game_state == GAME_STATES.DRAW_BY_STALEMATE){
        alert("Draw by stalemate");
    }
}

function isEndGame() {

    //TODO: other endgames

    let white_total_valid_moves = countTotalValidMovesFor(WHITE);
    let black_total_valid_moves = countTotalValidMovesFor(BLACK);

    if (isKingInCheck(WHITE, board)) {
        if (white_total_valid_moves == 0) {

            current_game_state = GAME_STATES.BLACK_WON;
            return;
        }
    }else{
        if (white_total_valid_moves == 0) {

            current_game_state = GAME_STATES.DRAW_BY_STALEMATE;
            return;
        }
    }
    
    if (isKingInCheck(BLACK, board)) {
        if (black_total_valid_moves == 0) {
            
            current_game_state = GAME_STATES.WHITE_WON;
            return;
        }
    }else{
        if (black_total_valid_moves == 0) {

            current_game_state = GAME_STATES.DRAW_BY_STALEMATE;
            return;
        }
    }
}

function countTotalValidMovesFor(color){
    let totalMoves = 0;

    for (let i = 0; i < board.length; i++) {
        
        if (color == WHITE) {
            if (board[i] != "" && isUpperCase(board[i])) {

                let moves = generate_moves(board[i], i);
                
                totalMoves += moves.length;
            }
        }else{
            if (board[i] != "" && !isUpperCase(board[i])) {
                let moves = generate_moves(board[i], i);
                
                totalMoves += moves.length;
            }
        }
    }

    return totalMoves;
}

function computerMove() {
    //TODO: make intelligent computer move, first try implementi random move with legal moves
    
}

function movePiece(move) {
    let from = move.from;
    let to = move.to;

    let piece_to_move = board[from];
    board[from] = "";
    board[to] = piece_to_move;

    if (move.getEnPassant_piece_position() != null) {

        board[move.getEnPassant_piece_position()] = "";
        move.SetEnPassant_piece_position(null);
    }
}

function generate_moves(piece, position) {

    const y = Math.floor(position / 8); // Row
    const x = position % 8;              // Column
    const pieceColor = isUpperCase(piece) ? "w" : "b";

    let board_copy = Array.from(board);

    let moves = new Array();

    position = parseInt(position);

    if (piece == "P") {//white pawn

        //pawn move 1 square forward
        if (board[position - 8] == "") {
            let newIndex = position - 8;

            makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            //pawn move 2 square forward if never moved
            if (position >= 48 && position <= 55 && board[position - 16] == "") {
                
                let newIndex = position - 16;

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);
            }
        }

        if (isValidPosition(x-1, y-1)) {//capture left

            const newIndex = (y-1) * 8 + (x-1);

            if (isEnemyPiece(board[newIndex], "w")) {
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);
            }
        }

        if (isValidPosition(x+1, y-1)) {//capture right
            
            const newIndex = (y-1) * 8 + (x+1);

            if (isEnemyPiece(board[newIndex], "w")) {
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);
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
                    let moveAdded = makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                    if (moveAdded) {
                        moves[moves.length - 1].SetEnPassant_piece_position(previous_move.to);
                    }

                }else if(enemy_pawn_x == x+1){
                    let newIndex =  (y-1) * 8 + (x+1);
                    let moveAdded = makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                    if (moveAdded) {
                        moves[moves.length - 1].SetEnPassant_piece_position(previous_move.to);
                    }
                }
            }
        }

    }else if(piece == "p"){//black pawn

        //pawn move 1 square forward
        if (board[position + 8] == "") {
            
            let newIndex = position + 8;

            makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            //pawn move 2 square forward if never moved
            if (position >= 8 && position <= 15 && board[position + 16] == "") {
                
                let newIndex = position + 16;

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);
            }
        }

        if (isValidPosition(x-1, y+1)) {//capture left

            const newIndex = (y+1) * 8 + (x-1);

            if (isEnemyPiece(board[newIndex], "b")) {
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);
            }
        }

        if (isValidPosition(x+1, y+1)) {//capture right
            
            const newIndex = (y+1) * 8 + (x+1);

            if (isEnemyPiece(board[newIndex], "b")) {
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);
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
                    let moveAdded = makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                    if (moveAdded) {
                        moves[moves.length - 1].SetEnPassant_piece_position(previous_move.to);
                    }

                }else if(enemy_pawn_x == x+1){
                    let newIndex =  (y+1) * 8 + (x+1);
                    let moveAdded = makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                    if (moveAdded) {
                        moves[moves.length - 1].SetEnPassant_piece_position(previous_move.to);
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

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move left
        for (let nx = x - 1; nx >= 0; nx--) {
            const newIndex = y * 8 + nx;
            if (board[newIndex] == "") {

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move down
        for (let ny = y + 1; ny < 8; ny++) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up
        for (let ny = y - 1; ny >= 0; ny--) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

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

                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up-right
        for (let ny = y - 1, nx = x+1; ny>= 0 && nx < 8; ny--,nx++) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move bottom-left
        for (let ny = y + 1, nx = x-1; ny < 8 && nx >= 0; ny++,nx--) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move bottom-right
        for (let ny = y + 1, nx = x+1; ny < 8 && nx < 8; ny++,nx++) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

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
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move left
        for (let nx = x - 1; nx >= 0; nx--) {
            const newIndex = y * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move down
        for (let ny = y + 1; ny < 8; ny++) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up
        for (let ny = y - 1; ny >= 0; ny--) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                break;
            } else {
                break; // Blocked by same color piece
            }
        }

        // Move up-left
        for (let ny = y - 1, nx = x-1; ny>= 0 && nx >= 0; ny--,nx--) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up-right
        for (let ny = y - 1, nx = x+1; ny>= 0 && nx < 8; ny--,nx++) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move bottom-left
        for (let ny = y + 1, nx = x-1; ny < 8 && nx >= 0; ny++,nx--) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move bottom-right
        for (let ny = y + 1, nx = x+1; ny < 8 && nx < 8; ny++,nx++) {
            const newIndex = ny * 8 + nx;
            if (board[newIndex] == "") {
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

            }else if(!isFriendlyPiece(board[newIndex], pieceColor)){
                
                makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);

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
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves);
            }
        }
        
        //down
        if (y + 1 < 8) {
            const newIndex = (y + 1) * 8 + x;

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves);
            }
        }
        
        //left
        if (x - 1 >= 0) {
            const newIndex = y * 8 + (x - 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves);
            }
        }
        
        //right
        if (x + 1 < 8) {
            const newIndex = y * 8 + (x + 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves);
            }
        }

        //up-left
        if (x - 1 >= 0 && y - 1 >= 0) {
            
            const newIndex = (y - 1) * 8 + (x - 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves);
            }
        }

        //up-right
        if (x + 1 < 8 && y - 1 >= 0) {
            
            const newIndex = (y - 1) * 8 + (x + 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves);
            }
        }

        //bottom-left
        if (x - 1 >= 0 && y + 1 < 8) {
            
            const newIndex = (y + 1) * 8 + (x - 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves);
            }
        }

        //bottom-right
        if (x + 1 < 8 && y + 1 < 8) {
            
            const newIndex = (y + 1) * 8 + (x + 1);

            if (!isFriendlyPiece(board[newIndex], pieceColor)) {
                
                makeTemporaryMoveAndCheck(piece,pieceColor, position, newIndex, moves);
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
                    makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);
                }
            }
        }
    }

    return moves;
}

function makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves){
    let board_copy = Array.from(board);

    //make the move
    board_copy[newIndex] = piece;
    board_copy[position] = "";

    if (!isKingInCheck(pieceColor, board_copy)) {
        moves.push(new Move(position, newIndex));//add to legal moves

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

        square.innerHTML += "<div class=\"high-light\"></div>";
        square.classList.add("possibleMove");

        valid_squares_shown.push("sq"+sqID);
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

addListenerToSquares();

load_img_in_array(pieces_name_to_img_name) 

fen_to_board(board);

console.log(board);

update_board_view(board);
