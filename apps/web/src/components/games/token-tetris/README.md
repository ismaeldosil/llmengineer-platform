# Token Tetris

A Tetris-style game with programming tokens for the LLM Engineer Platform.

## Features

### Game Mechanics (GAMES-004)
- ✅ Falling token blocks (tetrominos) with different shapes
- ✅ Token-based pieces (def, var, for, if, str, int, len)
- ✅ Block physics with gravity
- ✅ Piece rotation with wall kick
- ✅ Collision detection
- ✅ Line clearing
- ✅ Scoring system (line clear bonuses)
- ✅ Progressive difficulty levels
- ✅ Speed increases every 10 lines
- ✅ Game over detection
- ✅ Game loop with automatic piece dropping

### UI Components (GAMES-005)
- ✅ Game board (10x20 grid)
- ✅ Next piece preview
- ✅ Score, level, and lines display
- ✅ Touch controls (buttons for mobile)
- ✅ Keyboard controls (arrow keys for web)
- ✅ Pause/Resume functionality
- ✅ Game Over screen with final score
- ✅ Responsive design

## File Structure

```
token-tetris/
├── useTokenTetris.ts       # Game logic hook
├── TetrisBoard.tsx          # Game board component
├── TetrisPiece.tsx          # Individual piece component
├── TokenTetrisGame.tsx      # Main game component
├── index.ts                 # Exports
└── README.md                # Documentation
```

## Game Controls

### Keyboard (Web)
- **Arrow Left**: Move piece left
- **Arrow Right**: Move piece right
- **Arrow Down**: Soft drop (move down faster)
- **Arrow Up / Space**: Rotate piece
- **Enter**: Hard drop (instant drop)
- **P**: Pause/Resume

### Touch (Mobile)
- On-screen buttons for all controls
- Left/Right buttons to move
- Rotate button to rotate piece
- Drop button for soft drop
- Hard Drop button for instant drop

## Game Constants

```typescript
BOARD_WIDTH = 10
BOARD_HEIGHT = 20
INITIAL_SPEED = 1000ms
SPEED_INCREASE = 0.9 (multiply per level)
LINES_PER_LEVEL = 10
```

## Tetromino Types

Each piece represents a programming token:

- **I-piece** (cyan): "def" - 4 blocks in a line
- **O-piece** (yellow): "var" - 2x2 square
- **T-piece** (purple): "for" - T shape
- **S-piece** (green): "if" - S shape
- **Z-piece** (red): "str" - Z shape
- **L-piece** (orange): "int" - L shape
- **J-piece** (blue): "len" - J shape

## Scoring

- 1 line cleared: 100 points × level
- 2 lines cleared: 300 points × level
- 3 lines cleared: 500 points × level
- 4 lines cleared: 800 points × level
- Hard drop: +2 points per cell dropped

## Usage

```tsx
import { TokenTetrisGame } from '@/components/games/token-tetris';

function GameScreen() {
  const handleGameOver = (score: number) => {
    console.log('Final score:', score);
  };

  return <TokenTetrisGame onGameOver={handleGameOver} />;
}
```

## Future Enhancements

- Word detection (bonus points for valid token combinations)
- Multiplayer mode
- Leaderboard integration
- Power-ups
- Custom themes
- Sound effects and music
