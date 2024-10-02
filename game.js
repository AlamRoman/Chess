
const FILE = 8;
const RANK = 8;
const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

let previous_selected_square = {
    dom : null,
    index: null
}

let player_color = "w";
let enemy_color = "b";

function addListenerToSquares() {
    const DOM_squares = Array.from(document.getElementsByClassName("square"));

    DOM_squares.forEach(sq => {
        sq.addEventListener("click", squareClicked);
    });
}

addListenerToSquares();

//create the empty board
const board = Array(FILE * RANK).fill("");

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

//hashmap with pieces name and their images
let pieces_img = new Map();

//load images in the hashmap
for (let img_name of Object.values(pieces_name_to_img_name)) {
    let img = new Image();
    img.src = "resources/pieces/" + img_name + ".png";
    pieces_img.set(img_name , img);
}

//update the DOM board from board array
function update_board_view(board) {

    for (let i = 0; i < 64; i++) {

        let square = document.getElementById("sq"+ i);

        square.innerHTML = "";

        if(board[i] !== ""){

            img = pieces_img.get(pieces_name_to_img_name[board[i]]).cloneNode();

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

    if (event.target.classList.contains("piece-img")) {
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

    //unselect if clicked previous selected square
    if(previous_selected_square.dom == dom_sq){
        previous_selected_square.dom.classList.remove("selected");
        previous_selected_square.dom = null;
        previous_selected_square.index = null;
        
    }else if (isFriendlyPiece(board[square_index], player_color)) {

        //unselect previous selected square
        if (previous_selected_square.dom != null) {
            previous_selected_square.dom.classList.remove("selected");
            previous_selected_square.index = null;
        }

        dom_sq.classList.add("selected");

        previous_selected_square.dom = dom_sq;
        previous_selected_square.index = square_index;
    }else{
        if (!isFriendlyPiece(board[square_index], player_color) && board[square_index] != "" && previous_selected_square.index == null) {
            return;
        }

        makeMove(previous_selected_square.index, square_index);

        previous_selected_square.dom.classList.remove("selected");
        previous_selected_square.dom = null;
        previous_selected_square.index = null;
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

function makeMove(from, to) {
    //TODO: control if the move is valid

    movePiece(from, to);

    computerMove();

    update_board_view(board);
}

function computerMove() {
    //TODO: make intelligent computer move, first try implementi random move with legal moves
    
    let piece_to_move = board[11];
    board[11] = "";
    board[27] = piece_to_move;
    
}

function movePiece(from, to) {
    let piece_to_move = board[from];
    board[from] = "";
    board[to] = piece_to_move;
}

fen_to_board(board);

console.log(board);

update_board_view(board);
