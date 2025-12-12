# Embedding Match Game

A memory-style matching game that tests knowledge of LLM concepts and their semantic relationships.

## Overview

Embedding Match is an educational game where players flip cards to find semantically similar pairs of LLM concepts. The game features three difficulty levels, time-based scoring, and smooth animations.

## Components

### MatchCard.tsx
Individual flippable card component with:
- Smooth flip animation using React Native Animated API
- Three states: face down, flipped, matched
- Visual feedback with color coding (blue for flipped, green for matched)
- Disabled state when already flipped or matched
- Press animation for better UX

**Props:**
```typescript
interface MatchCardProps {
  id: string;
  text: string;
  isFlipped: boolean;
  isMatched: boolean;
  onPress: () => void;
  disabled?: boolean;
}
```

### GameBoard.tsx
4x4 grid layout for displaying cards:
- Responsive grid that adapts to screen size
- Manages card arrangement and spacing
- Passes card press events to parent component
- Supports disabled state to prevent interaction

**Props:**
```typescript
interface GameBoardProps {
  cards: Card[];
  onCardPress: (cardId: string) => void;
  disabled?: boolean;
}
```

### GameHeader.tsx
Header component displaying game stats:
- Timer with color-coded urgency (green → yellow → red)
- Current score
- Matched pairs counter
- Difficulty level badge
- Pause/Resume button with toggle state

**Props:**
```typescript
interface GameHeaderProps {
  score: number;
  timeRemaining: number;
  level: DifficultyLevel;
  matchedPairs: number;
  totalPairs: number;
  isPaused: boolean;
  onPauseToggle: () => void;
}
```

### GameResult.tsx
End game modal showing results:
- Victory/defeat message based on completion
- Star rating (1-3 stars) based on performance
- Detailed stats: score, time, accuracy, matched pairs
- Action buttons: Play Again, Change Level, Home
- Responsive modal design with overlay

**Props:**
```typescript
interface GameResultProps {
  score: number;
  timeElapsed: number;
  matchedPairs: number;
  totalPairs: number;
  level: DifficultyLevel;
  accuracy: number;
  isVictory: boolean;
  onPlayAgain: () => void;
  onChangeLevel: () => void;
  onGoHome: () => void;
}
```

### EmbeddingMatchGame.tsx
Main game component that orchestrates all others:
- Level selection screen with three difficulty options
- Game loop management
- State coordination between all components
- Timer and pause functionality
- Win/lose condition handling

### useEmbeddingMatch.ts
Custom hook managing game logic:
- Card generation and shuffling
- Match verification based on pair IDs
- Score calculation with time bonuses
- Timer countdown with auto game-over
- Pause/resume functionality
- Attempt tracking for accuracy

## Game Features

### Difficulty Levels

**Easy**
- Time: 3 minutes (180 seconds)
- Score multiplier: 1x
- Concepts: Basic LLM terminology
- Cards: 8 pairs (16 cards)

**Medium**
- Time: 2.5 minutes (150 seconds)
- Score multiplier: 1.5x
- Concepts: Intermediate LLM concepts
- Cards: 8 pairs (16 cards)

**Hard**
- Time: 2 minutes (120 seconds)
- Score multiplier: 2x
- Concepts: Advanced LLM techniques
- Cards: 8 pairs (16 cards)

### Scoring System

- Base score per match: 100 points × difficulty multiplier
- Time bonus: timeRemaining / 10 points
- Final score = (base score + time bonus) per match

### Card Pairs

Each difficulty level has curated pairs of semantically related LLM concepts:

**Easy Examples:**
- Neural Network ↔ Deep Learning Architecture
- Transformer ↔ Attention Mechanism
- GPT ↔ Generative Pre-trained

**Medium Examples:**
- BERT ↔ Bidirectional Encoder
- RAG ↔ Retrieval Augmented
- Few-shot Learning ↔ In-context Examples

**Hard Examples:**
- RLHF ↔ Reinforcement Learning Human Feedback
- LoRA ↔ Low-Rank Adaptation
- Chain-of-Thought ↔ Reasoning Steps

## Game Flow

1. **Level Selection**: Choose difficulty (Easy/Medium/Hard)
2. **Game Start**: Cards are shuffled and placed face down
3. **Gameplay**:
   - Tap cards to flip and reveal concepts
   - Match semantically related pairs
   - Two cards can be flipped at a time
   - Matched pairs stay revealed
   - Wrong matches flip back after 1 second
4. **Game End**:
   - Victory: All pairs matched before time runs out
   - Defeat: Time expires before all pairs matched
5. **Results**: View stats and choose next action

## Animations

- **Card Flip**: 300ms timing animation with rotation interpolation
- **Press Feedback**: Spring animation scaling to 0.95
- **Opacity Transitions**: Smooth front/back face visibility
- **Color Transitions**: State-based color changes (default → flipped → matched)

## Testing

Tests cover:
- Component rendering
- User interactions (card press, button clicks)
- State management (flipped, matched, disabled)
- Props validation
- Edge cases (disabled state, already matched)

Run tests:
```bash
npm test -- embedding-match
```

## Usage

Import and use in a screen:

```tsx
import { EmbeddingMatchGame } from '@/components/games/embedding-match';

export default function EmbeddingMatchScreen() {
  const handleGameOver = (score: number) => {
    console.log('Final score:', score);
  };

  return <EmbeddingMatchGame onGameOver={handleGameOver} />;
}
```

## File Structure

```
embedding-match/
├── MatchCard.tsx           # Individual card component
├── GameBoard.tsx           # 4x4 grid layout
├── GameHeader.tsx          # Stats and timer display
├── GameResult.tsx          # End game modal
├── EmbeddingMatchGame.tsx  # Main game component
├── useEmbeddingMatch.ts    # Game logic hook
├── index.ts                # Exports
├── README.md               # This file
└── __tests__/
    ├── MatchCard.test.tsx
    ├── GameBoard.test.tsx
    ├── GameHeader.test.tsx
    └── GameResult.test.tsx
```

## Future Enhancements

- [ ] Add sound effects for flips, matches, and game over
- [ ] Implement leaderboard integration
- [ ] Add more difficulty levels with different grid sizes (3x4, 5x4)
- [ ] Implement daily challenges with specific card sets
- [ ] Add hint system (reveal pair location for penalty)
- [ ] Track and display statistics (games played, win rate, avg score)
- [ ] Add achievements/badges for milestones
- [ ] Implement multiplayer mode
