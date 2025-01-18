<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chess [King-Fisher]</title>
    <link rel="icon" href="resources/logo.png" type="image/png" />
    <link rel="stylesheet" href="css/style.css"/>
</head>
<body>

    <div class="container">
        <div class="board_container">
            <?php include "include/generate_board.php"; ?>
        </div>

        <div id="captured_piece_container">
            <div id="black_captured_pieces">
            </div>
            <hr/>
            <div id="white_captured_pieces">
            </div>
        </div>
    </div>

    <script src="game.js"></script>
    
</body>
</html>