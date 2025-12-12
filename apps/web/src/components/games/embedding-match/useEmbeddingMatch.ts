import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from './GameBoard';
import { DifficultyLevel } from './GameHeader';

interface GameState {
  cards: Card[];
  selectedCards: string[];
  matchedPairs: number;
  score: number;
  attempts: number;
  timeRemaining: number;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  level: DifficultyLevel;
}

interface UseEmbeddingMatchReturn {
  gameState: GameState;
  actions: {
    startGame: (level: DifficultyLevel) => void;
    handleCardPress: (cardId: string) => void;
    togglePause: () => void;
    resetGame: () => void;
  };
}

// Card pairs for different difficulty levels
const CARD_PAIRS = {
  easy: [
    { text: 'Neural Network', pair: 'Deep Learning Architecture' },
    { text: 'Transformer', pair: 'Attention Mechanism' },
    { text: 'GPT', pair: 'Generative Pre-trained' },
    { text: 'Embedding', pair: 'Vector Representation' },
    { text: 'Fine-tuning', pair: 'Model Adaptation' },
    { text: 'Tokenizer', pair: 'Text Segmentation' },
    { text: 'Prompt', pair: 'Input Template' },
    { text: 'Context Window', pair: 'Token Limit' },
  ],
  medium: [
    { text: 'BERT', pair: 'Bidirectional Encoder' },
    { text: 'RAG', pair: 'Retrieval Augmented' },
    { text: 'Few-shot Learning', pair: 'In-context Examples' },
    { text: 'Temperature', pair: 'Sampling Randomness' },
    { text: 'Top-p Sampling', pair: 'Nucleus Sampling' },
    { text: 'Perplexity', pair: 'Model Uncertainty' },
    { text: 'Latent Space', pair: 'Hidden Dimensions' },
    { text: 'Gradient Descent', pair: 'Optimization Algorithm' },
  ],
  hard: [
    { text: 'RLHF', pair: 'Reinforcement Learning Human Feedback' },
    { text: 'KL Divergence', pair: 'Distribution Distance' },
    { text: 'LoRA', pair: 'Low-Rank Adaptation' },
    { text: 'Quantization', pair: 'Precision Reduction' },
    { text: 'Chain-of-Thought', pair: 'Reasoning Steps' },
    { text: 'Self-Attention', pair: 'Query-Key-Value' },
    { text: 'Cross-Entropy Loss', pair: 'Classification Metric' },
    { text: 'Beam Search', pair: 'Decoding Strategy' },
  ],
};

const DIFFICULTY_SETTINGS = {
  easy: { timeLimit: 180, scoreMultiplier: 1 },
  medium: { timeLimit: 150, scoreMultiplier: 1.5 },
  hard: { timeLimit: 120, scoreMultiplier: 2 },
};

const TOTAL_PAIRS = 8;

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i]!;
    newArray[i] = newArray[j]!;
    newArray[j] = temp;
  }
  return newArray;
};

const generateCards = (level: DifficultyLevel): Card[] => {
  const pairs = CARD_PAIRS[level];
  const cards: Card[] = [];

  pairs.forEach((pair, index) => {
    const pairId = `pair-${index}`;
    cards.push({
      id: `${pairId}-1`,
      text: pair.text,
      pairId,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: `${pairId}-2`,
      text: pair.pair,
      pairId,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleArray(cards);
};

export const useEmbeddingMatch = (): UseEmbeddingMatchReturn => {
  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    selectedCards: [],
    matchedPairs: 0,
    score: 0,
    attempts: 0,
    timeRemaining: 0,
    isPaused: false,
    isGameOver: false,
    isVictory: false,
    level: 'easy',
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const flipBackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (
      gameState.cards.length === 0 ||
      gameState.isPaused ||
      gameState.isGameOver ||
      gameState.timeRemaining <= 0
    ) {
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          return {
            ...prev,
            timeRemaining: 0,
            isGameOver: true,
            isVictory: false,
          };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.cards.length, gameState.isPaused, gameState.isGameOver, gameState.timeRemaining]);

  const startGame = useCallback((level: DifficultyLevel) => {
    const cards = generateCards(level);
    const settings = DIFFICULTY_SETTINGS[level];

    setGameState({
      cards,
      selectedCards: [],
      matchedPairs: 0,
      score: 0,
      attempts: 0,
      timeRemaining: settings.timeLimit,
      isPaused: false,
      isGameOver: false,
      isVictory: false,
      level,
    });
  }, []);

  const checkMatch = useCallback((card1Id: string, card2Id: string) => {
    setGameState((prev) => {
      const card1 = prev.cards.find((c) => c.id === card1Id);
      const card2 = prev.cards.find((c) => c.id === card2Id);

      if (!card1 || !card2) return prev;

      const isMatch = card1.pairId === card2.pairId;
      const settings = DIFFICULTY_SETTINGS[prev.level];

      if (isMatch) {
        // Calculate score with time bonus
        const timeBonus = Math.floor(prev.timeRemaining / 10);
        const baseScore = 100 * settings.scoreMultiplier;
        const scoreGain = Math.floor(baseScore + timeBonus);

        const newMatchedPairs = prev.matchedPairs + 1;
        const isVictory = newMatchedPairs === TOTAL_PAIRS;

        return {
          ...prev,
          cards: prev.cards.map((c) =>
            c.id === card1Id || c.id === card2Id ? { ...c, isMatched: true, isFlipped: true } : c
          ),
          selectedCards: [],
          matchedPairs: newMatchedPairs,
          score: prev.score + scoreGain,
          attempts: prev.attempts + 1,
          isGameOver: isVictory,
          isVictory,
        };
      } else {
        // Wrong match - flip back after delay
        flipBackTimeoutRef.current = setTimeout(() => {
          setGameState((current) => ({
            ...current,
            cards: current.cards.map((c) =>
              c.id === card1Id || c.id === card2Id ? { ...c, isFlipped: false } : c
            ),
            selectedCards: [],
          }));
        }, 1000);

        return {
          ...prev,
          attempts: prev.attempts + 1,
        };
      }
    });
  }, []);

  const handleCardPress = useCallback(
    (cardId: string) => {
      if (gameState.isPaused || gameState.isGameOver) return;

      setGameState((prev) => {
        const card = prev.cards.find((c) => c.id === cardId);
        if (!card || card.isFlipped || card.isMatched) return prev;

        // If already two cards selected, ignore
        if (prev.selectedCards.length >= 2) return prev;

        const newSelectedCards = [...prev.selectedCards, cardId];
        const newCards = prev.cards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c));

        // If this is the second card, check for match
        if (newSelectedCards.length === 2) {
          const card1 = newSelectedCards[0];
          const card2 = newSelectedCards[1];
          if (card1 && card2) {
            setTimeout(() => {
              checkMatch(card1, card2);
            }, 300);
          }
        }

        return {
          ...prev,
          cards: newCards,
          selectedCards: newSelectedCards,
        };
      });
    },
    [gameState.isPaused, gameState.isGameOver, checkMatch]
  );

  const togglePause = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (flipBackTimeoutRef.current) {
      clearTimeout(flipBackTimeoutRef.current);
    }

    setGameState({
      cards: [],
      selectedCards: [],
      matchedPairs: 0,
      score: 0,
      attempts: 0,
      timeRemaining: 0,
      isPaused: false,
      isGameOver: false,
      isVictory: false,
      level: 'easy',
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (flipBackTimeoutRef.current) {
        clearTimeout(flipBackTimeoutRef.current);
      }
    };
  }, []);

  return {
    gameState,
    actions: {
      startGame,
      handleCardPress,
      togglePause,
      resetGame,
    },
  };
};
