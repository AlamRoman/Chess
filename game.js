
const FILE = 8;
const RANK = 8;
const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

//create the empty board
const board = Array(FILE * RANK).fill("");

//hashmap with pieces name and their images
let pieces_img = new Map();

let Previous_selected_square = {
    dom : null,
    index: null
}

let Move = {
    from : null,
    to : null
}

let player_color = "w";
let enemy_color = "b";

let valid_squares_shown = [];

function addListenerToSquares() {
    const DOM_squares = Array.from(document.getElementsByClassName("square"));

    DOM_squares.forEach(sq => {
        sq.addEventListener("click", squareClicked);
    });
}

addListenerToSquares();

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

    if (event.target.classList.contains("piece-img") || event.target.classList.contains("circle")) {
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
        }

        hide_shown_valid_moves_in_html();

        //select clicked square
        dom_sq.classList.add("selected");

        let moves = genarate_moves(board[square_index],square_index);

        console.log(moves);

        show_valid_moves_in_html(moves);

        Previous_selected_square.dom = dom_sq;
        Previous_selected_square.index = square_index;
    }else{
        if (!isFriendlyPiece(board[square_index], player_color) && board[square_index] != "" && Previous_selected_square.index == null) {
            return;
        }

        makeMove(Previous_selected_square.index, square_index);

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

function genarate_moves(piece, position) {

    let moves = new Array();

    if (piece == "P") {//white pawn

        //pawn move 1 square forward
        moves.push({from: position, to: position-8});

        //pawn move 2 square forward if never moved
        if (position >= 48 && position <= 55) {
            moves.push({from: position, to: position-16});
        }

    }else if(piece == "p"){//black pawn

        //pawn move 1 square forward
        moves.push({from: position, to: position+8});

        //pawn move 2 square forward if never moved
        if (position >= 8 && position <= 15) {
            moves.push({from: position, to: position+16});
        }

    }else if(piece == "R"){
        const y = Math.floor(position / 8); // Row
        const x = position % 8;              // Column

        // Rook movement logic (up, down, left, right)
        // Move down
        for (let nx = x + 1; nx < 8; nx++) {
            const newIndex = y * 8 + nx;
            if (board[newIndex] == "") {
                moves.push({from: position, to: newIndex}); // Empty square
            }else if(!isFriendlyPiece(board[newIndex], "w")){
                moves.push({from: position, to: newIndex});
                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move up
        for (let nx = x - 1; nx >= 0; nx--) {
            const newIndex = y * 8 + nx;
            if (board[newIndex] == "") {
                moves.push({from: position, to: newIndex});  // Empty square
            }else if(!isFriendlyPiece(board[newIndex], "w")){
                moves.push({from: position, to: newIndex});
                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move right
        for (let ny = y + 1; ny < 8; ny++) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                moves.push({from: position, to: newIndex});  // Empty square
            }else if(!isFriendlyPiece(board[newIndex], "w")){
                moves.push({from: position, to: newIndex});
                break;
            }else {
                break; // Blocked by same color piece
            }
        }

        // Move left
        for (let ny = y - 1; ny >= 0; ny--) {
            const newIndex = ny * 8 + x;
            if (board[newIndex] == "") {
                moves.push({from: position, to: newIndex});  // Empty square
            }else if(!isFriendlyPiece(board[newIndex], "w")){
                moves.push({from: position, to: newIndex});
                break;
            } else {
                break; // Blocked by same color piece
            }
        }
    }

    return moves;
}

function show_valid_moves_in_html(moves) {
    moves.forEach(move=>{
        sqID = move.to;

        var square = document.getElementById("sq"+sqID);

        square.innerHTML += "<div class=\"circle\"></div>";
        square.classList.add("possibleMove");

        valid_squares_shown.push("sq"+sqID);
    });
}

function hide_shown_valid_moves_in_html() {

    for (let i = 0; i < valid_squares_shown.length; i++) {
        let sq = valid_squares_shown[i];
        
        square = document.getElementById(sq).classList.remove("possibleMove");
    }

    valid_squares_shown = [];
}

load_img_in_array(pieces_name_to_img_name) 

fen_to_board(board);

console.log(board);

update_board_view(board);
