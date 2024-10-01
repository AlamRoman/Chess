
const FILE = 8;
const RANK = 8;
const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

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

        if(board[i] !== ""){
            temp = pieces_img.get(pieces_name_to_img_name[board[i]]).cloneNode();
            document.getElementById("sq"+ i).appendChild(temp);
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

function isNumeric(char) {
    return /^[0-9]$/.test(char);  // Checks if the character is between 0 and 9
}

fen_to_board(board);

console.log(board);

update_board_view(board);