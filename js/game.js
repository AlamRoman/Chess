const FILE = 8;
const RANK = 8;
const WHITE = "w";
const BLACK = "b";
const PIECES_IMG_FOLDER_PATH = "resources/pieces/";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

//king check test
//const STARTING_FEN = "7K/2r5/q7/8/8/8/k7/8";

//enpassant test
//const STARTING_FEN = "8/3p4/k6K/8/4P3/8/8/8";

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

if (isInDevelopment()) {
    console.log(GAME_TYPE);   
}

//default colors
let player_color;
let computer_color;

//set colors
if (document.getElementById("player_color").value == "WHITE") {

    player_color = WHITE;
    computer_color = BLACK;

}else if (document.getElementById("player_color").value == "BLACK") {

    player_color = BLACK;
    computer_color = WHITE;

}else{//random color

    if (Math.random() < 0.5) {
        player_color = WHITE;
        computer_color = BLACK; 
    }else{
        player_color = BLACK;
        computer_color = WHITE;
    }
}

//hashmap with pieces name and their images
let pieces_img = new Map();

//array of valid moves
let validMoves = [];

let valid_squares_shown = [];

let previous_move = null;

let moves_history = [];

let pawn_promotion_square = null;

let nodesVisited = 0;
let extendedSearchDepthCount = 0;

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

    print_board(){
        let result = "--> Board : \n";

        let temp = "";
        for (let i = 0; i < RANK; i++) {
            for (let j = 0; j < FILE; j++) {
                if (this.board[i*RANK+j] != "") {
                    temp += " " + this.board[i*RANK+j] + " ";
                }else{
                    temp += " . ";
                }
            }
            temp += "\n";
        }

        result += temp;

        return result;
    }
}

let gb = new GameBoard(null);

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

if(isInDevelopment()){
    
    console.log(gb.print_board());

    //perft
    //console.log(perft(3, turn_of, gb.board));

    console.log(evaluateBoard(gb));
}