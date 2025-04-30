
# ♟️ King-Fisher Chess Engine

<div align="center"> <img src="resources/logo.png" width="400" alt="Chess Interface Preview"> </div>


A JavaScript chess implementation featuring an AI opponent powered by Minimax with Alpha-Beta pruning. Utilizes advanced move ordering (history heuristic, killer moves) and position evaluation (material balance, piece-square tables). Includes a responsive web interface with legal move validation, pawn promotion, and game state tracking.

---

## 🌐 Play Online  

Try King-Fisher Chess engine:  [**Play Now →**](https://alamroman.altervista.org/projects/chess/home.php)  

---

### **Gameplay**

- **Multiple Modes**:
    
    - Human vs Human
        
    - Human vs AI

- **Special Moves**:
    
    - Castling, En Passant, Pawn Promotion
        
- **Game State Detection**:
    
    - Check/Checkmate

    - Stalemate

---

## Features

### **Core Engine**

- **Minimax Algorithm** with Alpha-Beta pruning
    
- **Quiescence Search** for stable evaluations
    
- **Adaptive Evaluation**:
    
    - Material balance with piece values
        
    - Piece-Square Tables (middlegame/endgame)
        
- **Move Ordering**:
    
    - History heuristic (player specific)
        
    - Killer moves (depth + player specific)
        
    - MVV-LVA capture prioritization
        
---

## License

MIT License - See [LICENSE](https://chat.deepseek.com/a/chat/s/LICENSE) for details.
