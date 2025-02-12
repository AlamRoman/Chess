
const FILE = 8;
const RANK = 8;
const WHITE = "w";
const BLACK = "b";
const PIECES_IMG_FOLDER_PATH = "resources/pieces/";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

//king check test
//const STARTING_FEN = "7K/2r5/q7/8/8/8/k7/8";

//enpassant test
//const STARTING_FEN = "8/3p4/8/8/4P3/8/8/8";

//castling test
//const STARTING_FEN = "r3k2r/8/1N6/pppppppp/PPPPPPPP/8/8/R3K2R";

//pawn promotion test
//const STARTING_FEN = "1n1b4/7P/8/8/R7/8/3p4/2N1B3";

//perft test
//const STARTING_FEN = "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R";

//endgame test
//const STARTING_FEN = "8/7r/1k6/3p4/3P1B2/42K1/8/8";

//const STARTING_FEN = "r6/8/8/7k/8/4K3/8";

let GAME_TYPE = document.getElementById("game_type").value;

let player_color = BLACK;
let computer_color = WHITE;

//hashmap with pieces name and their images
let pieces_img = new Map();

//array of valid moves
let validMoves = [];

let valid_squares_shown = [];

const pieceValues = {
    P: 100, 
    N: 300,  
    B: 300, 
    R: 500, 
    Q: 900,  
    K: 0 
};

const pieceValuesMiddleGame = {
    P: 82, 
    N: 337,  
    B: 365, 
    R: 477, 
    Q: 1025,  
    K: 0 
};

const pieceValuesEndGame = {
    P: 94, 
    N: 281,  
    B: 297, 
    R: 512, 
    Q: 936,  
    K: 0 
};

const pieceSquareTablesMiddleGame = {
    // Pawn Position Table
    P: [
        0,   0,   0,   0,   0,   0,  0,   0,
        98, 134,  61,  95,  68, 126, 34, -11,
        -6,   7,  26,  31,  65,  56, 25, -20,
        -14,  13,   6,  21,  23,  12, 17, -23,
        -27,  -2,  -5,  12,  17,   6, 10, -25,
        -26,  -4,  -4, -10,   3,   3, 33, -12,
        -35,  -1, -20, -23, -15,  24, 38, -22,
        0,   0,   0,   0,   0,   0,  0,   0
    ],

    // Knight Position Table
    N: [
        -167, -89, -34, -49,  61, -97, -15, -107,
        -73, -41,  72,  36,  23,  62,   7,  -17,
        -47,  60,  37,  65,  84, 129,  73,   44,
        -9,  17,  19,  53,  37,  69,  18,   22,
        -13,   4,  16,  13,  28,  19,  21,   -8,
        -23,  -9,  12,  10,  19,  17,  25,  -16,
        -29, -53, -12,  -3,  -1,  18, -14,  -19,
        -105, -21, -58, -33, -17, -28, -19,  -23
    ],

    // Bishop Position Table
    B: [
        -29,   4, -82, -37, -25, -42,   7,  -8,
        -26,  16, -18, -13,  30,  59,  18, -47,
        -16,  37,  43,  40,  35,  50,  37,  -2,
        -4,   5,  19,  50,  37,  37,   7,  -2,
        -6,  13,  13,  26,  34,  12,  10,   4,
        0,  15,  15,  15,  14,  27,  18,  10,
        4,  15,  16,   0,   7,  21,  33,   1,
        -33,  -3, -14, -21, -13, -12, -39, -21
    ],

    // Rook Position Table
    R: [
        32,  42,  32,  51, 63,  9,  31,  43,
        27,  32,  58,  62, 80, 67,  26,  44,
        -5,  19,  26,  36, 17, 45,  61,  16,
        -24, -11,   7,  26, 24, 35,  -8, -20,
        -36, -26, -12,  -1,  9, -7,   6, -23,
        -45, -25, -16, -17,  3,  0,  -5, -33,
        -44, -16, -20,  -9, -1, 11,  -6, -71,
        -19, -13,   1,  17, 16,  7, -37, -26
    ],

    // Queen Position Table
    Q: [
        -28,   0,  29,  12,  59,  44,  43,  45,
        -24, -39,  -5,   1, -16,  57,  28,  54,
        -13, -17,   7,   8,  29,  56,  47,  57,
        -27, -27, -16, -16,  -1,  17,  -2,   1,
        -9, -26,  -9, -10,  -2,  -4,   3,  -3,
        -14,   2, -11,  -2,  -5,   2,  14,   5,
        -35,  -8,  11,   2,   8,  15,  -3,   1,
        -1, -18,  -9,  10, -15, -25, -31, -50
    ],

    // King Position Table
    K: [
        -65,  23,  16, -15, -56, -34,   2,  13,
        29,  -1, -20,  -7,  -8,  -4, -38, -29,
        -9,  24,   2, -16, -20,   6,  22, -22,
        -17, -20, -12, -27, -30, -25, -14, -36,
        -49,  -1, -27, -39, -46, -44, -33, -51,
        -14, -14, -22, -46, -44, -30, -15, -27,
        1,   7,  -8, -64, -43, -16,   9,   8,
        -15,  36,  12, -54,   8, -28,  24,  14
    ]
};

const pieceSquareTablesEndGame = {
    // Pawn Position Table
    P: [
        0,   0,   0,   0,   0,   0,   0,   0,
        178, 173, 158, 134, 147, 132, 165, 187,
        94, 100,  85,  67,  56,  53,  82,  84,
        32,  24,  13,   5,  -2,   4,  17,  17,
        13,   9,  -3,  -7,  -7,  -8,   3,  -1,
        4,   7,  -6,   1,   0,  -5,  -1,  -8,
        13,   8,   8,  10,  13,   0,   2,  -7,
        0,   0,   0,   0,   0,   0,   0,   0
    ],

    // Knight Position Table
    N: [
        -58, -38, -13, -28, -31, -27, -63, -99,
        -25,  -8, -25,  -2,  -9, -25, -24, -52,
        -24, -20,  10,   9,  -1,  -9, -19, -41,
        -17,   3,  22,  22,  22,  11,   8, -18,
        -18,  -6,  16,  25,  16,  17,   4, -18,
        -23,  -3,  -1,  15,  10,  -3, -20, -22,
        -42, -20, -10,  -5,  -2, -20, -23, -44,
        -29, -51, -23, -15, -22, -18, -50, -64
    ],

    // Bishop Position Table
    B: [
        -14, -21, -11,  -8, -7,  -9, -17, -24,
        -8,  -4,   7, -12, -3, -13,  -4, -14,
        2,  -8,   0,  -1, -2,   6,   0,   4,
        -3,   9,  12,   9, 14,  10,   3,   2,
        -6,   3,  13,  19,  7,  10,  -3,  -9,
        -12,  -3,   8,  10, 13,   3,  -7, -15,
        -14, -18,  -7,  -1,  4,  -9, -15, -27,
        -23,  -9, -23,  -5, -9, -16,  -5, -17
    ],

    // Rook Position Table
    R: [
        13, 10, 18, 15, 12,  12,   8,   5,
        11, 13, 13, 11, -3,   3,   8,   3,
        7,  7,  7,  5,  4,  -3,  -5,  -3,
        4,  3, 13,  1,  2,   1,  -1,   2,
        3,  5,  8,  4, -5,  -6,  -8, -11,
        -4,  0, -5, -1, -7, -12,  -8, -16,
        -6, -6,  0,  2, -9,  -9, -11,  -3,
        -9,  2,  3, -1, -5, -13,   4, -20
    ],

    // Queen Position Table
    Q: [
        -9,  22,  22,  27,  27,  19,  10,  20,
        -17,  20,  32,  41,  58,  25,  30,   0,
        -20,   6,   9,  49,  47,  35,  19,   9,
          3,  22,  24,  45,  57,  40,  57,  36,
        -18,  28,  19,  47,  31,  34,  39,  23,
        -16, -27,  15,   6,   9,  17,  10,   5,
        -22, -23, -30, -16, -16, -23, -36, -32,
        -33, -28, -22, -43,  -5, -32, -20, -41
    ],

    // King Position Table
    K: [
        -74, -35, -18, -18, -11,  15,   4, -17,
        -12,  17,  14,  17,  17,  38,  23,  11,
        10,  17,  23,  15,  20,  45,  44,  13,
        -8,  22,  24,  27,  26,  33,  26,   3,
        -18,  -4,  21,  24,  27,  23,   9, -11,
        -19,  -3,  11,  21,  23,  16,   7,  -9,
        -27, -11,   4,  13,  14,   4,  -5, -17,
        -53, -34, -21, -11, -28, -14, -24, -43
    ]
};

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

let previous_move = null;

let pawn_promotion_square=null;

let nodesVisited = 0;

const historyHeuristic = { 
    [WHITE]: {}, 
    [BLACK]: {} 
};

const killerMoves = {};

let Previous_selected_square = {
    dom : null,
    index: null
}

class Move {
    constructor(from, to, enPassant_piece_position=null, castlingRookToMove=null, pawn_promoted_to=null, captured_piece=null, moving_piece){
        this.from = from;
        this.to = to;

        this.enPassant_piece_position = enPassant_piece_position;
        this.castlingRookToMove = castlingRookToMove;
        this.pawn_promoted_to = pawn_promoted_to;
        this.captured_piece = captured_piece;

        this.moving_piece = moving_piece;

        this.castling_rights_before = deepCopy(gb.castling_rights);
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

class GameBoard{

    constructor(board){

        this.board = board;

        this.castling_rights = {
            white_queen_side: true,
            white_king_side: true,
            black_queen_side: true,
            black_king_side: true,
        }

        this.current_game_state = GAME_STATES.PLAYING;

        this.piece_count = {
            P: 8,
            N: 2,
            B: 2,
            R: 2,
            Q: 1,
            K: 1,
            p: 8,
            n: 2,
            b: 2,
            r: 2,
            q: 1,
            k: 1
        }

        this.captured_piece_count = {
            P: 0,
            N: 0,
            B: 0,
            R: 0,
            Q: 0,
            p: 0,
            n: 0,
            b: 0,
            r: 0,
            q: 0
        }

        this.piece_type = Object.freeze({
            WHITE_PAWN: "P",
            WHITE_KNIGHT: "N",
            WHITE_BISHOP: "B",
            WHITE_ROOK: "R",
            WHITE_QUEEN: "Q",
            WHITE_KING: "K",
            BLACK_PAWN: "p",
            BLACK_KNIGHT: "n",
            BLACK_BISHOP: "b",
            BLACK_ROOK: "r",
            BLACK_QUEEN: "q",
            BLACK_KING: "k"
        });

        this.turn_of = WHITE;


        this.init_board();
    }

    init_board(){
        this.board = Array(FILE * RANK).fill("");
    }

    countTotalPieces() {
        let total = 0;

        for (const pieces in this.piece_count) {
            total += this.piece_count[pieces];
        }

        return total;
    }

    decrease_piece_count_of(piece){
        if (piece != this.piece_type.WHITE_KING && piece != this.piece_type.BLACK_KING) {
            
            if (this.piece_count[piece] >= 1) {
                this.piece_count[piece]--;
            }
        }
    }

    increase_piece_count_of(piece){
        if (piece != this.piece_type.WHITE_KING && piece != this.piece_type.BLACK_KING) {
            this.piece_count[piece]++;
        }
    }

    increase_captured_piece_count_of(piece){
        if (piece != this.piece_type.WHITE_KING && piece != this.piece_type.BLACK_KING) {
            this.captured_piece_count[piece]++;
        }
    }
    
    updatePieceCounts() {
        // Reset piece counts
        const initial_counts = {
            P: 0, N: 0, B: 0, R: 0, Q: 0, K: 1,
            p: 0, n: 0, b: 0, r: 0, q: 0, k: 1
        };
        
        const expected_counts = {
            P: 8, N: 2, B: 2, R: 2, Q: 1, K: 1,
            p: 8, n: 2, b: 2, r: 2, q: 1, k: 1
        };
    
        for (const piece of this.board) {
            if (piece in initial_counts) {
                initial_counts[piece]++;
            }
        }

        for (const piece in this.piece_count) {
            this.piece_count[piece] = initial_counts[piece];
            this.captured_piece_count[piece] = Math.max(0, expected_counts[piece] - initial_counts[piece]);
        }
    }
}

gb = new GameBoard(null);

addListenerToSquares();

load_img_in_array(pieces_name_to_img_name);

fen_to_board(gb.board);

gb.updatePieceCounts();

update_piece_capture_html();

update_board_view(gb.board);


//first computer move if the game is vs computer and computer is WHITE
if (GAME_TYPE == 0 && computer_color == WHITE) {
    
    document.getElementById("board").classList.add("flip-table");

    let cMove = computerMove();

    remove_highlight_previous_move();

    movePiece(cMove, gb);

    update_game_board_piece_count(cMove);

    highlight_previous_move();

    isGameFinished(gb);

    update_board_view(gb.board);

    if (gb.current_game_state != GAME_STATES.PLAYING) {
        setTimeout(function(){
            showEndGameScreen();
        }, 500);
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

//update the DOM board from board array
function update_board_view(board) {

    //for debug
    let show_square_index = false;

    for (let i = 0; i < 64; i++) {

        let square = document.getElementById("sq"+ i);

        if (show_square_index) {
            square.innerHTML = i;
        }else{
            square.innerHTML = "";
        }
        

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

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 0);
    });
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

function findKingPosition(color, game_board) {
    let piece = (color == WHITE)? "K" : "k";

    return game_board.board.indexOf(piece);
}

function squareClicked(event) {

    //game ended
    if (gb.current_game_state != GAME_STATES.PLAYING) {
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

        //flip board for 2 players game
        if (GAME_TYPE == 1) {
            swap_player_and_flip_table();
        }

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
        validMoves = generate_moves(gb.board[square_index],square_index, gb);

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

        if (typeof move == "undefined") {//check if the move is valid move

            return;

        }else if(move.pawn_promoted_to != null){//pawn promotion menu

            let piece_color = (isUpperCase(gb.board[Previous_selected_square.index])) ? WHITE : BLACK;

            show_pawn_promotion_menu_at(square_index, piece_color);

            pawn_promotion_square = square_index;

            return;
        }

        makeMove(move);

        //flip board for 2 playes game
        if (GAME_TYPE == 1) {
            swap_player_and_flip_table();
        }

        Previous_selected_square.dom.classList.remove("selected");
        Previous_selected_square.dom = null;
        Previous_selected_square.index = null;
    }

}

function swap_player_and_flip_table() {

    if (player_color == WHITE) {
        document.getElementById("board").classList.add("flip-table");
        player_color = BLACK;
        computer_color = WHITE;
    }else{
        document.getElementById("board").classList.remove("flip-table");
        player_color = WHITE;
        computer_color = BLACK;
    }
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
    let cMove = computerMove();

    remove_highlight_previous_move();

    movePiece(cMove, gb);

    update_game_board_piece_count(cMove);

    highlight_previous_move();

    isGameFinished(gb);

    //computer move

    await update_board_view(gb.board);

    if (gb.current_game_state != GAME_STATES.PLAYING) {
        setTimeout(function(){
            showEndGameScreen();
        }, 500);
    }

    //console.log(gb.board);
    console.log("evaluarion : ",evaluateBoard(gb));

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
        move.SetEnPassant_piece_position(null);
    }

    //moves castling rook
    if (move.castlingRookToMove != null) {
        board[move.castlingRookToMove.to] = board[move.castlingRookToMove.from];
        board[move.castlingRookToMove.from] = "";
    }

    previous_move = new Move(from, to);

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

    //restore previous castling rights
    gb.castling_rights = move.getCastlingRightsBefore();

    //previous turn of
    if (game_board.turn_of == WHITE) {
        game_board.turn_of = BLACK;
    }else{
        game_board.turn_of = WHITE;
    }
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

function update_piece_capture_html() {
    let black_capture_div = document.getElementById("black_captured_pieces");
    let white_capture_div = document.getElementById("white_captured_pieces");

    black_capture_div.innerHTML = "";
    white_capture_div.innerHTML = "";

    for (const piece in gb.captured_piece_count) {

        for (let i = 0; i < gb.captured_piece_count[piece]; i++) {
            var img;
            try {
                img = pieces_img.get(pieces_name_to_img_name[piece]).cloneNode();
            } catch (error) {
                img = pieces_img.get("question-mark").cloneNode();
            }

            if (isUpperCase(piece)) {
                white_capture_div.appendChild(img);
            }else{
                black_capture_div.appendChild(img);
            }
        }
    }

    
}

function showEndGameScreen(){

    if (gb.current_game_state == GAME_STATES.WHITE_WON) {
        alert("White won by checkmate");
    }else if(gb.current_game_state == GAME_STATES.BLACK_WON){
        alert("Black won by checkmate");
    }else if(gb.current_game_state == GAME_STATES.DRAW_BY_STALEMATE){
        alert("Draw by stalemate");
    }
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

    nodesVisited = 0;

    let isMax = (computer_color == WHITE) ? true : false;

    const { move, value } = minimax(deepCopy(gb), isMax, 3, -Infinity, Infinity);

    console.log("computer : ",move, " nodes : ", nodesVisited, " value: ", value);

    return move;
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
                                moves.push(new Move(position, newIndex, previous_move.to, "p"));//add to legal moves
                            }
                        }else{
                            moves.push(new Move(position, newIndex, previous_move.to, "p"));//add to legal moves
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
                                moves.push(new Move(position, newIndex, previous_move.to, "p"));//add to legal moves
                            }
                        }else{
                            moves.push(new Move(position, newIndex, previous_move.to, "p"));//add to legal moves
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
                                moves.push(new Move(position, newIndex, previous_move.to, "P"));//add to legal moves
                            }
                        }else{
                            moves.push(new Move(position, newIndex, previous_move.to, "P"));//add to legal moves
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
                                moves.push(new Move(position, newIndex, previous_move.to, "P"));//add to legal moves
                            }
                        }else{
                            moves.push(new Move(position, newIndex, previous_move.to, "P"));//add to legal moves
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

        let your_back_rank = (pieceColor == WHITE) ? 7 : 0;
        let your_king_side_castiling_right = (pieceColor == WHITE) ? game_board.castling_rights.white_king_side : game_board.castling_rights.black_king_side;
        let your_queen_side_castling_right = (pieceColor == WHITE) ? game_board.castling_rights.white_queen_side : game_board.castling_rights.black_queen_side;

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

function highlight_previous_move(){
    if (previous_move != null) {
        let from = previous_move.from;
        let to = previous_move.to;

        var from_sq = document.getElementById("sq"+from);
        var to_sq = document.getElementById("sq"+to);

        from_sq.classList.add("previous_move_highlight");
        to_sq.classList.add("previous_move_highlight");
    }
}

function remove_highlight_previous_move(){
    let squares = document.getElementsByClassName("previous_move_highlight");

    let squaresArray = Array.from(squares);

    for (let square of squaresArray) {
        square.classList.remove("previous_move_highlight");
    }
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

function isEndgame(game_board) {

    if (game_board.countTotalPieces() <= 10) {
        return true;
    }
    return false;
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

        // Killer moves (now checks player turn)
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

        let final_value = extendSearchForCaputures(deepCopy(game_board), !isMaximizingPlayer, alfa, beta, 3) + (isMaximizingPlayer ? depth : -depth) * 10;

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

function extendSearchForCaputures(game_board, isMaximizingPlayer, alfa, beta, depth) {

    nodesVisited++;

    let board = game_board.board;

    if (depth <= 0) {
        return evaluateBoard(game_board);
    }
    
    let eval = evaluateBoard(game_board);

    if (eval >= beta) {
        return beta;
    }

    alfa = Math.max(alfa, eval);

    let all_moves = [];
    for (let i = 0; i < board.length; i++) {
        if (getPieceColor(board[i]) === (isMaximizingPlayer ?  WHITE : BLACK)) {
            const piece_moves = generate_moves(board[i], i, game_board, true);
            if (piece_moves.length > 0) {
                all_moves = [...all_moves, ...piece_moves];
            }
        }
    }

    all_moves = orderMoves(all_moves, depth+3, isMaximizingPlayer);

    //console.log("cap : ", all_moves.length, all_moves);

    for (const move of all_moves) {
        movePiece(move, game_board);
        eval = extendSearchForCaputures(deepCopy(game_board), !isMaximizingPlayer, alfa, beta, depth - 1);
        undoMove(move, game_board);

        if (eval >= beta) {
            return beta;
        }

        alfa = Math.max(alfa, eval);
    }

    return alfa;
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
                console.log("pro ",board);
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

console.log(gb.board);

//perft
//console.log(perft(3, turn_of, gb.board));

console.log(evaluateBoard(gb));