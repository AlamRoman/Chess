<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chess [King-Fisher]</title>
    <link rel="icon" href="resources/logo.png" type="image/png" />

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">

    <style>
        body {
            background: url('resources/bg_4.jpg') no-repeat center center fixed;
            background-size: cover;
        }
        .card {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 10px rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        }
        .card:hover {
            box-shadow: 0 6px 15px rgba(255, 255, 255, 0.3);
        }
        .btn-outline-light img {
            filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
            transition: transform 0.3s ease-in-out;
        }
        .btn-outline-light:hover img {
            transform: scale(1.1);
        }
        .btn-primary {
            transition: background-color 0.3s ease-in-out, transform 0.2s ease-in-out;
        }
        .btn-primary:hover {
            background-color: #0056b3;
            transform: scale(1.05);
        }
        @media (max-width: 576px) {
            .card {
                max-width: 90%;
            }
        }
    </style>

</head>
<body class="bg-dark text-white">

    <div class="container text-center mt-4">
        <div class="card text-light mx-auto p-4" style="max-width: 450px;">
            <div class="card-body">
                <img src="resources/logo.png" alt="King-Fisher Logo" class="mb-4" width="150">

                <h3 class="mb-4">King-Fisher Chess Engine</h3>
                
                <div class="mb-3">
                    <label class="form-label d-block">Select Game Mode:</label>
                    <div class="btn-group" role="group" aria-label="Game Mode">
                        <div class="mx-2">
                            <input type="radio" class="btn-check" name="game_mode" id="vs_ai" value="0" autocomplete="off" checked>
                            
                            <label class="btn btn-outline-light" for="vs_ai">
                                <img src="resources/player_vs_ai.png" alt="Player vs AI" width="50" style="border-radius: 5px;">
                            </label>
                        </div>

                        <div class="mx-2">
                            <input type="radio" class="btn-check" name="game_mode" id="vs_player" value="1" autocomplete="off">

                            <label class="btn btn-outline-light" for="vs_player">
                                <img src="resources/player_vs_player.png" alt="Player vs Player" width="50" style="border-radius: 5px;">
                            </label>
                        </div>
                    </div>
                </div>
    
                <div class="mb-3">
                    <label class="form-label d-block">Select Color:</label>
                    <div class="btn-group" role="group" aria-label="Player Color">
                        <input type="radio" class="btn-check" name="player_color" id="white" value="white" autocomplete="off" checked>
                        <label class="btn btn-outline-light" for="white">
                            <img src="resources/pieces/w_k.png" alt="White" width="50">
                        </label>
                        
                        <input type="radio" class="btn-check" name="player_color" id="black" value="black" autocomplete="off">
                        <label class="btn btn-outline-light" for="black">
                            <img src="resources/pieces/b_k.png" alt="Black" width="50">
                        </label>
                        
                        <input type="radio" class="btn-check" name="player_color" id="random" value="random" autocomplete="off">
                        <label class="btn btn-outline-light" for="random">
                            <img src="resources/dice.png" alt="Random" width="50">
                        </label>
                    </div>
                </div>
    
                <button id="play_button" class="btn btn-primary btn-lg mt-3 w-100">Play</button>
            </div>
        </div>
    </div>
    
    <script>
        document.getElementById("play_button").addEventListener("click", function() {
            const gameMode = document.querySelector('input[name="game_mode"]:checked').value;
            const playerColor = document.querySelector('input[name="player_color"]:checked').value;
            
            window.location.href = `game.php?mode=${gameMode}&color=${playerColor}`;
        });
    </script>
    
</body>
</html>