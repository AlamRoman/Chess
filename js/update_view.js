
function update_board_view(board) {

    //for debug
    let show_square_index = window.config.debug;

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

        if (isInDevelopment()) {
            console.log(validMoves);
        }

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