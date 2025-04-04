<?php

    $WHITE = "w";
    $BLACK = "b";

    $previous_move = null;

    $board = [];

    if(isset($_GET["board"])){

        $board = json_decode($_GET["board"]);

        print_r($board);

        $previous_move = new Move(2, 2);

        //get prev.move, castling_rights
    }

    class Move {
        private $from;
        private $to;
        private $enPassant_piece_position;
        private $castlingRookToMove;
        private $pawn_promoted_to;

        public function __construct($from, $to, $enPassant_piece_position = null, $castlingRookToMove = null, $pawn_promoted_to = null) {
            $this->from = $from;
            $this->to = $to;
            $this->enPassant_piece_position = $enPassant_piece_position;
            $this->castlingRookToMove = $castlingRookToMove;
            $this->pawn_promoted_to = $pawn_promoted_to;
        }

        public function getEnPassant_piece_position() {
            return $this->enPassant_piece_position;
        }

        public function setEnPassant_piece_position($position) {
            $this->enPassant_piece_position = $position;
        }

        public function getPawnPromotedTo() {
            return $this->pawn_promoted_to;
        }

        public function setPawnPromotedTo($piece) {
            $this->pawn_promoted_to = $piece;
        }
    }



    function generate_moves($piece, $position, $board) {

        global $board, $previous_move, $castling_rights, $WHITE;

        $y = floor($position / 8); // Row
        $x = $position % 8;              // Column
        $pieceColor = isUpperCase($piece) ? "w" : "b";

        $board_copy = $board;

        $moves = [];
    
        $position = (int)$position;
    
        if ($piece == "P") {//white pawn
    
            //pawn move 1 square forward
            if ($board[row_col_to_position($y-1, $x)] == "") {
                 $newIndex = row_col_to_position($y-1, $x);
    
                if ($y==1) {
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "Q");
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "R");
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "B");
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "N");
                }else{
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
                }
    
                //pawn move 2 square forward if never moved
                if ($y == 6 && $board[row_col_to_position($y-2, $x)] == "") {
                    
                     $newIndex = row_col_to_position($y-2, $x);
    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
                }
            }
    
            if (isValidPosition($x-1, $y-1)) {//capture left
    
                 $newIndex = ($y-1) * 8 + ($x-1);
    
                if (isEnemyPiece($board[$newIndex], "w")) {
                    if ($y==1) {
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "Q");
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "R");
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "B");
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "N");
                    }else{
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
                    }
                }
            }
    
            if (isValidPosition($x+1, $y-1)) {//capture right
                
                 $newIndex = ($y-1) * 8 + ($x+1);
    
                if (isEnemyPiece($board[$newIndex], "w")) {
                    if ($y==1) {
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "Q");
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "R");
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "B");
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "N");
                    }else{
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
                    }
                }
            }
    
            //enPassant
            if ($y == 3 && $previous_move != null && $board[$previous_move->to] == "p") {
                
                 $enemy_pawn_x = $previous_move->to % 8;
                 $enemy_pawn_from_y =  floor($previous_move->from / 8);
                 $enemy_pawn_to_y =  floor($previous_move->to / 8);
    
                if($enemy_pawn_from_y == 1 && $enemy_pawn_to_y == 3){
                    if ($enemy_pawn_x == $x-1) {
    
                         $newIndex =  ($y-1) * 8 + ($x-1);
    
                        /*
                         moveAdded = makeTemporaryMoveAndCheck(piece, pieceColor, position, newIndex, moves);
    
                        if (moveAdded) {
                            moves[moves.length - 1].SetEnPassant_piece_position(previous_move.to);
                        }
                            
                        */
    
                        //make move and check
                         $board_copy = $board;
    
                        //make the move
                        $board_copy[$newIndex] = $piece;
                        $board_copy[$position] = "";
                        $board_copy[$previous_move->to] = "";
    
                        if (!isKingInCheck($pieceColor, $board_copy)) {
                            $moves['push'](new Move($position, $newIndex, $previous_move->to));//add to legal moves
                        }
    
                    }else if($enemy_pawn_x == $x+1){
                         $newIndex =  ($y-1) * 8 + ($x+1);
    
                        //make move and check
                         $board_copy = $board;
    
                        //make the move
                        $board_copy[$newIndex] = $piece;
                        $board_copy[$position] = "";
                        $board_copy[$previous_move->to] = "";
    
                        if (!isKingInCheck($pieceColor, $board_copy)) {
                            $moves['push'](new Move($position, $newIndex, $previous_move->to));//add to legal moves
                        }
                    }
                }
            }
    
    
        }else if($piece == "p"){//black pawn
    
            //pawn move 1 square forward
            if ($board[row_col_to_position($y+1, $x)] == "") {
                
                 $newIndex = row_col_to_position($y+1, $x);
    
                if ($y==6) {
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "q");
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "r");
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "b");
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "n");
                }else{
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
                }
    
                //pawn move 2 square forward if never moved
                if ($y==1 && $board[row_col_to_position($y+2, $x)] == "") {
                    
                     $newIndex = row_col_to_position($y+2, $x);
    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
                }
            }
    
            if (isValidPosition($x-1, $y+1)) {//capture left
    
                 $newIndex = ($y+1) * 8 + ($x-1);
    
                if (isEnemyPiece($board[$newIndex], "b")) {
                    if ($y==6) {
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "q");
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "r");
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "b");
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "n");
                    }else{
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
                    }
                }
            }
    
            if (isValidPosition($x+1, $y+1)) {//capture right
                
                 $newIndex = ($y+1) * 8 + ($x+1);
    
                if (isEnemyPiece($board[$newIndex], "b")) {
                    if ($y==6) {
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "q");
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "r");
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "b");
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, "n");
                    }else{
                        makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
                    }
                }
            }
    
            //enPassant
            if($y == 4 && $previous_move != null && $board[$previous_move->to] == "P"){
    
                 $enemy_pawn_x = $previous_move->to % 8;
                 $enemy_pawn_from_y =  floor($previous_move->from / 8);
                 $enemy_pawn_to_y =  floor($previous_move->to / 8);
    
                if ($enemy_pawn_from_y == 6 && $enemy_pawn_to_y == 4) {
                    if ($enemy_pawn_x == $x-1) {
    
                         $newIndex =  ($y+1) * 8 + ($x-1);
    
                        //make move and check
                         $board_copy = $board;
    
                        //make the move
                        $board_copy[$newIndex] = $piece;
                        $board_copy[$position] = "";
                        $board_copy[$previous_move['to']] = "";
    
                        if (!isKingInCheck($pieceColor, $board_copy)) {
                            $moves['push'](new Move($position, $newIndex, $previous_move['to']));//add to legal moves
                        }
    
                    }else if($enemy_pawn_x == $x+1){
                         $newIndex =  ($y+1) * 8 + ($x+1);
                        
                        //make move and check
                         $board_copy = $board;
    
                        //make the move
                        $board_copy[$newIndex] = $piece;
                        $board_copy[$position] = "";
                        $board_copy[$previous_move['to']] = "";
    
                        if (!isKingInCheck($pieceColor, $board_copy)) {
                            $moves['push'](new Move($position, $newIndex, $previous_move['to']));//add to legal moves
                        }
                    }
                }
            }
    
        }else if($piece == "R" || $piece == "r"){//the rooooooooooooook
    
            // Rook movement logic (up, down, left, right)
            // Move right
            for ( $nx = $x + 1; $nx < 8; $nx++) {
                 $newIndex = $y * 8 + $nx;
                if ($board[$newIndex] == "") {
    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move left
            for ( $nx = $x - 1; $nx >= 0; $nx--) {
                 $newIndex = $y * 8 + $nx;
                if ($board[$newIndex] == "") {
    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move down
            for ( $ny = $y + 1; $ny < 8; $ny++) {
                 $newIndex = $ny * 8 + $x;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move up
            for ( $ny = $y - 1; $ny >= 0; $ny--) {
                 $newIndex = $ny * 8 + $x;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                } else {
                    break; // Blocked by same color piece
                }
            }
        }else if($piece == "B" || $piece == "b"){//bishop
    
            // Bishop movement logic (up-left, up-right, bottom-left, bottom-right)
            // Move up-left
            for ( $ny = $y - 1, $nx = $x-1; $ny>= 0 && $nx >= 0; $ny--,$nx--) {
                 $newIndex = $ny * 8 + $nx;
                if ($board[$newIndex] == "") {
    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move up-right
            for ( $ny = $y - 1, $nx = $x+1; $ny>= 0 && $nx < 8; $ny--,$nx++) {
                 $newIndex = $ny * 8 + $nx;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move bottom-left
            for ( $ny = $y + 1, $nx = $x-1; $ny < 8 && $nx >= 0; $ny++,$nx--) {
                 $newIndex = $ny * 8 + $nx;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move bottom-right
            for ( $ny = $y + 1, $nx = $x+1; $ny < 8 && $nx < 8; $ny++,$nx++) {
                 $newIndex = $ny * 8 + $nx;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
            
        }else if($piece == "Q" || $piece == "q"){//queen
    
            // Rook movement logic (up, down, left, right)
            // Move right
            for ( $nx = $x + 1; $nx < 8; $nx++) {
                 $newIndex = $y * 8 + $nx;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece,$pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece,$pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move left
            for ( $nx = $x - 1; $nx >= 0; $nx--) {
                 $newIndex = $y * 8 + $nx;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move down
            for ( $ny = $y + 1; $ny < 8; $ny++) {
                 $newIndex = $ny * 8 + $x;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move up
            for ( $ny = $y - 1; $ny >= 0; $ny--) {
                 $newIndex = $ny * 8 + $x;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                } else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move up-left
            for ( $ny = $y - 1, $nx = $x-1; $ny>= 0 && $nx >= 0; $ny--,$nx--) {
                 $newIndex = $ny * 8 + $nx;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move up-right
            for ( $ny = $y - 1, $nx = $x+1; $ny>= 0 && $nx < 8; $ny--,$nx++) {
                 $newIndex = $ny * 8 + $nx;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move bottom-left
            for ( $ny = $y + 1, $nx = $x-1; $ny < 8 && $nx >= 0; $ny++,$nx--) {
                 $newIndex = $ny * 8 + $nx;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece,$pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
    
            // Move bottom-right
            for ( $ny = $y + 1, $nx = $x+1; $ny < 8 && $nx < 8; $ny++,$nx++) {
                 $newIndex = $ny * 8 + $nx;
                if ($board[$newIndex] == "") {
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                }else if(!isFriendlyPiece($board[$newIndex], $pieceColor)){
                    
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
    
                    break;
                }else {
                    break; // Blocked by same color piece
                }
            }
        }else if($piece == "K" || $piece == "k"){//king
    
            //up
            if ($y - 1 >= 0) {
                 $newIndex = ($y-1) * 8 + $x;
    
                if (!isFriendlyPiece($board[$newIndex], $pieceColor)) {
                    
                    makeTemporaryMoveAndCheck($piece,$pieceColor, $position, $newIndex, $moves);
                }
            }
            
            //down
            if ($y + 1 < 8) {
                 $newIndex = ($y + 1) * 8 + $x;
    
                if (!isFriendlyPiece($board[$newIndex], $pieceColor)) {
                    
                    makeTemporaryMoveAndCheck($piece,$pieceColor, $position, $newIndex, $moves);
                }
            }
            
            //left
            if ($x - 1 >= 0) {
                 $newIndex = $y * 8 + ($x - 1);
    
                if (!isFriendlyPiece($board[$newIndex], $pieceColor)) {
                    
                    makeTemporaryMoveAndCheck($piece,$pieceColor, $position, $newIndex, $moves);
                }
            }
            
            //right
            if ($x + 1 < 8) {
                 $newIndex = $y * 8 + ($x + 1);
    
                if (!isFriendlyPiece($board[$newIndex], $pieceColor)) {
                    
                    makeTemporaryMoveAndCheck($piece,$pieceColor, $position, $newIndex, $moves);
                }
            }
    
            //up-left
            if ($x - 1 >= 0 && $y - 1 >= 0) {
                
                 $newIndex = ($y - 1) * 8 + ($x - 1);
    
                if (!isFriendlyPiece($board[$newIndex], $pieceColor)) {
                    
                    makeTemporaryMoveAndCheck($piece,$pieceColor, $position, $newIndex, $moves);
                }
            }
    
            //up-right
            if ($x + 1 < 8 && $y - 1 >= 0) {
                
                 $newIndex = ($y - 1) * 8 + ($x + 1);
    
                if (!isFriendlyPiece($board[$newIndex], $pieceColor)) {
                    
                    makeTemporaryMoveAndCheck($piece,$pieceColor, $position, $newIndex, $moves);
                }
            }
    
            //bottom-left
            if ($x - 1 >= 0 && $y + 1 < 8) {
                
                 $newIndex = ($y + 1) * 8 + ($x - 1);
    
                if (!isFriendlyPiece($board[$newIndex], $pieceColor)) {
                    
                    makeTemporaryMoveAndCheck($piece,$pieceColor, $position, $newIndex, $moves);
                }
            }
    
            //bottom-right
            if ($x + 1 < 8 && $y + 1 < 8) {
                
                 $newIndex = ($y + 1) * 8 + ($x + 1);
    
                if (!isFriendlyPiece($board[$newIndex], $pieceColor)) {
                    
                    makeTemporaryMoveAndCheck($piece,$pieceColor, $position, $newIndex, $moves);
                }
            }
    
            //castling
    
             $your_back_rank = ($pieceColor == $WHITE) ? 7 : 0;
             $your_king_side_castiling_right = ($pieceColor == $WHITE) ? $castling_rights['white_king_side'] : $castling_rights['black_king_side'];
             $your_queen_side_castling_right = ($pieceColor == $WHITE) ? $castling_rights['white_queen_side'] : $castling_rights['black_queen_side'];
    
            if ($y == $your_back_rank && ($your_king_side_castiling_right || $your_queen_side_castling_right) && !isKingInCheck($pieceColor, $board)) {
    
                //king side
                //check if king side knight and bishop positions are empty
                if ($your_king_side_castiling_right && $board[row_col_to_position($y, $x+1)] == "" && $board[row_col_to_position($y, $x+2)] == "") {
    
                    //to check if the bishop position is attacked
                     $board_copy_check_bishop_square = $board;
                    $board_copy_check_bishop_square[row_col_to_position($y, $x)] = "";
                    $board_copy_check_bishop_square[row_col_to_position($y, $x+1)] = $piece;
    
                    if (!isKingInCheck($pieceColor, $board_copy_check_bishop_square)) {
                        
                        //to check if kings final position is safe
                         $board_copy_check_final_position = $board;
                        $board_copy_check_final_position[row_col_to_position($y, $x+1)] = ($pieceColor == $WHITE) ? "R" : "r";
                        $board_copy_check_final_position[row_col_to_position($y, $x+2)] = $piece;
                        $board_copy_check_final_position[row_col_to_position($y, $x+3)] = "";
                        $board_copy_check_final_position[row_col_to_position($y, $x)] = "";
    
                        if (!isKingInCheck($pieceColor, $board_copy_check_final_position)) {
                            
                            $moves['push'](new Move($position, row_col_to_position($y, $x+2),null,new Move(row_col_to_position($y, $x+3), row_col_to_position($y, $x+1))));
                        }
                    }
                }
    
                //queen side
                //check if queen side knight and bishop positions are empty
                if ($your_queen_side_castling_right && $board[row_col_to_position($y, $x-1)] == "" && $board[row_col_to_position($y, $x-2)] == "" && $board[row_col_to_position($y, $x-3)] == "") {
                    
                    //to check if the bishop position is attacked
                     $board_copy_check_queen_square = $board;
                    $board_copy_check_queen_square[row_col_to_position($y, $x)] = "";
                    $board_copy_check_queen_square[row_col_to_position($y, $x-1)] = $piece;
    
                    if (!isKingInCheck($pieceColor, $board_copy_check_queen_square)) {
                        
                        //to check if kings final position is safe
                         $board_copy_check_final_position = $board;
                        $board_copy_check_final_position[row_col_to_position($y, $x-1)] = ($pieceColor == $WHITE) ? "R" : "r";
                        $board_copy_check_final_position[row_col_to_position($y, $x-2)] = $piece;
                        $board_copy_check_final_position[row_col_to_position($y, $x-4)] = "";
                        $board_copy_check_final_position[row_col_to_position($y, $x)] = "";
    
                        if (!isKingInCheck($pieceColor, $board_copy_check_final_position)) {
                            
                            $moves['push'](new Move($position, row_col_to_position($y, $x-2),null,new Move(row_col_to_position($y, $x-4), row_col_to_position($y, $x-1))));
                        }
                    }
                }
    
            }
    
        }else if($piece == "N" || $piece == "n"){//knight

        // All possible knight moves
        $knightMoves = [
            [2, 1], [2, -1], [-2, 1], [-2, -1],
            [1, 2], [1, -2], [-1, 2], [-1, -2]
        ];

        foreach ($knightMoves as [$dx, $dy]) {
            $nx = $x + $dx;
            $ny = $y + $dy;

            if (isValidPosition($nx, $ny)) {
                $newIndex = $ny * 8 + $nx;

                if (!isFriendlyPiece($board[$newIndex], $pieceColor)) {
                    makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves);
                }
            }
        }

        }
    
        return $moves;
    }

    
    function makeTemporaryMoveAndCheck($piece, $pieceColor, $position, $newIndex, $moves, $pawn_promoted_to = null){
        global $board;
        
        $board_copy = $board;

        //make the move
        $board_copy[$newIndex] = $piece;
        $board_copy[$position] = "";

        if (!isKingInCheck($pieceColor, $board_copy)) {
            $moves['push'](new Move($position, $newIndex, null, null, $pawn_promoted_to));//add to legal moves

            return true;
        }

        return false;
    }

    function isValidPosition($x, $y) {
        return $x >= 0 && $x < 8 && $y >= 0 && $y < 8; // Check if the position is within the board limits
    }

    function isUpperCase($char) {
        if ($char === "") {
            return false;
        }
        return $char === strtoupper($char) && strlen($char) === 1; // Check if the character is the same when converted to uppercase and is a single character
    }

    function isKingInCheck($kingColor, $b) {
        $kingPosition = ($kingColor == "w") ? findPiecePosition("K", $b) : findPiecePosition("k", $b);

        if ($kingPosition == -1) { // if there is no king return
            return;
        }

        $king_x = $kingPosition % 8; // col
        $king_y = floor($kingPosition / 8); // row

        $opponentPawn = ($kingColor == 'w') ? 'p' : 'P';
        $opponentKnight = ($kingColor == 'w') ? 'n' : 'N';
        $opponentRook = ($kingColor == 'w') ? 'r' : 'R';
        $opponentBishop = ($kingColor == 'w') ? 'b' : 'B';
        $opponentQueen = ($kingColor == 'w') ? 'q' : 'Q';
        $opponentKing = ($kingColor == 'w') ? 'k' : 'K';

        // Check for pawn attacks
        $pawnDirection = ($kingColor == 'w') ? -1 : 1; // For white king opponent pawn will be up (-1), and for black king down (1)
        // if there is an enemy pawn in left
        if (isValidPosition($king_x - 1, $king_y + $pawnDirection) && $b[row_col_to_position($king_y + $pawnDirection, $king_x - 1)] == $opponentPawn) return true;
        // if there is an enemy pawn in right
        if (isValidPosition($king_x + 1, $king_y + $pawnDirection) && $b[row_col_to_position($king_y + $pawnDirection, $king_x + 1)] == $opponentPawn) return true;

        // check for knights attack
        $knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        
        foreach ($knightMoves as [$rowOffset, $colOffset]) {
            $row = $king_y + $rowOffset;
            $col = $king_x + $colOffset;
            if (isValidPosition($col, $row) && $b[row_col_to_position($row, $col)] == $opponentKnight) return true;
        }

        // Check for rook/queen attacks (horizontal/vertical)
        $rookDirections = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        foreach ($rookDirections as [$rowDir, $colDir]) {
            for ($i = 1; $i < 8; $i++) {
                $row = $king_y + $i * $rowDir;
                $col = $king_x + $i * $colDir;

                // check if the position is valid
                if (!isValidPosition($col, $row)) {
                    break;
                } elseif ($b[row_col_to_position($row, $col)] == $opponentRook || $b[row_col_to_position($row, $col)] == $opponentQueen) {
                    return true;
                } elseif ($b[row_col_to_position($row, $col)] != "") { // check if blocked by any other piece
                    break;
                }
            }
        }

        // Check for bishop/queen attacks (diagonal)
        $bishopDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        foreach ($bishopDirections as [$rowDir, $colDir]) {
            for ($i = 1; $i < 8; $i++) {
                $row = $king_y + $i * $rowDir;
                $col = $king_x + $i * $colDir;

                // check if the position is valid
                if (!isValidPosition($col, $row)) {
                    break;
                } elseif ($b[row_col_to_position($row, $col)] == $opponentBishop || $b[row_col_to_position($row, $col)] == $opponentQueen) {
                    return true;
                } elseif ($b[row_col_to_position($row, $col)] != "") { // check if blocked by any other piece
                    break;
                }
            }
        }

        // Check for opponent king
        $enemyKingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

        foreach ($enemyKingMoves as [$rowOffset, $colOffset]) {
            $row = $king_y + $rowOffset;
            $col = $king_x + $colOffset;

            if (isValidPosition($col, $row) && $b[row_col_to_position($row, $col)] == $opponentKing) return true;
        }

        return false;
    }

    function row_col_to_position($row, $col){
        return $col + $row * 8;
    }

    function isEnemyPiece($piece, $your_color) {

        //there is no piece
        if($piece == ""){
            return false;
        }
    
        return !isFriendlyPiece($piece, $your_color);
    }

    function isFriendlyPiece($piece, $your_color) {

        //there is no piece
        if($piece == ""){
            return false;
        }
    
        if (isUpperCase($piece)) {
            if ($your_color == "w") {
                return true;
            }
    
            return false;
        }
    
        if ($your_color == "b") {
            return true;
        }
    
        return false;
    
    }

    function findPiecePosition($piece, $board) {
        return array_search($piece, $board);
    }



?>