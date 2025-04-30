<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chess [King-Fisher]</title>
    <link rel="icon" href="resources/logo.png" type="image/png" />
    <link rel="stylesheet" href="css/style.css"/>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
</head>
<body>

    <a href="home.php" class="btn btn-light rounded-circle border-0 back-btn" style="position: absolute; top: 10px; left: 10px; z-index: 1000; background-color: #ffce9e;">
        <i class="fas fa-arrow-left"></i>
    </a>


    <!--
        0: vs computer
        1: 2 players
    -->
    <input type="hidden" id="game_type" value="<?php echo (isset($_GET["game_mode"])) ? $_GET["game_mode"] : "0"; ?>">

    <!--
        WHITE
        BLACK
        RANDOM
    -->
    <input type="hidden" id="player_color" value="<?php echo (isset($_GET["player_color"])) ? $_GET["player_color"] : "RANDOM"; ?>">

    <div class="container mt-3">
        <div class="board_container">
            <?php include "include/generate_board.php"; ?>
        </div>

        <div id="captured_piece_container">
            <div id="black_captured_pieces">
            </div>
            <hr class="bg-light" style="height: 2px; width: 100%; margin: 0;"/>
            <div id="white_captured_pieces">
            </div>
        </div>
    </div>

    <script src="js/config.js"></script>
    <script src="js/computer_move.js"></script>
    <script src="js/functions.js"></script>
    <script src="js/generate_moves.js"></script>
    <script src="js/make_moves.js"></script>
    <script src="js/piece_square_tables.js"></script>
    <script src="js/update_view.js"></script>
    <script src="js/game.js"></script>
    
</body>
</html>