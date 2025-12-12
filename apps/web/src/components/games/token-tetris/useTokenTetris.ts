import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Game constants
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const INITIAL_SPEED = 1000;
export const SPEED_INCREASE = 0.9;
export const LINES_PER_LEVEL = 10;

// Tetromino shapes
export const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: '#00F0F0', token: 'def' },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#F0F000',
    token: 'var',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#A000F0',
    token: 'for',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#00F000',
    token: 'if',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#F00000',
    token: 'str',
  },
  L: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#F0A000',
    token: 'int',
  },
  J: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#0000F0',
    token: 'len',
  },
};

export type TetrominoType = keyof typeof TETROMINOS;
export type Board = (string | null)[][];

interface Position {
  x: number;
  y: number;
}

interface Piece {
  shape: number[][];
  position: Position;
  type: TetrominoType;
  color: string;
  token: string;
}

export interface GameState {
  board: Board;
  currentPiece: Piece | null;
  nextPiece: Piece | null;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  isPaused: boolean;
}

const createEmptyBoard = (): Board => {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null));
};

const getRandomTetromino = (): TetrominoType => {
  const types = Object.keys(TETROMINOS) as TetrominoType[];
  return types[Math.floor(Math.random() * types.length)]!;
};

const createPiece = (type: TetrominoType): Piece => {
  const tetromino = TETROMINOS[type];
  return {
    shape: tetromino.shape,
    position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0]!.length / 2), y: 0 },
    type,
    color: tetromino.color,
    token: tetromino.token,
  };
};

const checkCollision = (piece: Piece, board: Board, offset: Position = { x: 0, y: 0 }): boolean => {
  for (let y = 0; y < piece.shape.length; y++) {
    const row = piece.shape[y];
    if (!row) continue;
    for (let x = 0; x < row.length; x++) {
      if (row[x]) {
        const newX = piece.position.x + x + offset.x;
        const newY = piece.position.y + y + offset.y;

        if (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board[newY]?.[newX] !== null)
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

const rotatePiece = (piece: Piece): Piece => {
  const rotated = piece.shape[0]!.map((_, index) =>
    piece.shape.map((row) => row[index]!).reverse()
  );
  return { ...piece, shape: rotated };
};

const mergePieceToBoard = (piece: Piece, board: Board): Board => {
  const newBoard = board.map((row) => [...row]);

  for (let y = 0; y < piece.shape.length; y++) {
    const row = piece.shape[y];
    if (!row) continue;
    for (let x = 0; x < row.length; x++) {
      if (row[x]) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY]![boardX] = piece.color;
        }
      }
    }
  }

  return newBoard;
};

const clearLines = (board: Board): { newBoard: Board; linesCleared: number } => {
  const newBoard = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = BOARD_HEIGHT - newBoard.length;

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }

  return { newBoard, linesCleared };
};

const calculateScore = (linesCleared: number, level: number): number => {
  const baseScores = [0, 100, 300, 500, 800];
  return (baseScores[linesCleared] ?? 0) * level;
};

export const useTokenTetris = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
  });

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const dropSpeedRef = useRef(INITIAL_SPEED);

  const startGame = useCallback(() => {
    const firstPiece = createPiece(getRandomTetromino());
    const nextPiece = createPiece(getRandomTetromino());

    setGameState({
      board: createEmptyBoard(),
      currentPiece: firstPiece,
      nextPiece,
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      isPaused: false,
    });

    dropSpeedRef.current = INITIAL_SPEED;
  }, []);

  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const moveLeft = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const offset = { x: -1, y: 0 };
      if (!checkCollision(prev.currentPiece, prev.board, offset)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: {
              x: prev.currentPiece.position.x + offset.x,
              y: prev.currentPiece.position.y,
            },
          },
        };
      }
      return prev;
    });
  }, []);

  const moveRight = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const offset = { x: 1, y: 0 };
      if (!checkCollision(prev.currentPiece, prev.board, offset)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: {
              x: prev.currentPiece.position.x + offset.x,
              y: prev.currentPiece.position.y,
            },
          },
        };
      }
      return prev;
    });
  }, []);

  const moveDown = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const offset = { x: 0, y: 1 };
      if (!checkCollision(prev.currentPiece, prev.board, offset)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: {
              x: prev.currentPiece.position.x,
              y: prev.currentPiece.position.y + offset.y,
            },
          },
        };
      }

      // Piece landed - merge to board
      const newBoard = mergePieceToBoard(prev.currentPiece, prev.board);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
      const newScore = prev.score + calculateScore(linesCleared, prev.level);

      // Update drop speed
      if (newLevel > prev.level) {
        dropSpeedRef.current = Math.max(
          100,
          INITIAL_SPEED * Math.pow(SPEED_INCREASE, newLevel - 1)
        );
      }

      // Create new piece
      const newCurrentPiece = prev.nextPiece || createPiece(getRandomTetromino());
      const newNextPiece = createPiece(getRandomTetromino());

      // Check game over
      const isGameOver = checkCollision(newCurrentPiece, clearedBoard);

      return {
        ...prev,
        board: clearedBoard,
        currentPiece: isGameOver ? null : newCurrentPiece,
        nextPiece: newNextPiece,
        score: newScore,
        level: newLevel,
        lines: newLines,
        gameOver: isGameOver,
      };
    });
  }, []);

  const rotate = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const rotatedPiece = rotatePiece(prev.currentPiece);

      // Wall kick: try original position, then left, then right
      const offsets = [
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -2, y: 0 },
        { x: 2, y: 0 },
      ];

      for (const offset of offsets) {
        const testPiece = {
          ...rotatedPiece,
          position: {
            x: prev.currentPiece.position.x + offset.x,
            y: prev.currentPiece.position.y + offset.y,
          },
        };

        if (!checkCollision(testPiece, prev.board)) {
          return { ...prev, currentPiece: testPiece };
        }
      }

      return prev;
    });
  }, []);

  const hardDrop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      let dropDistance = 0;
      while (!checkCollision(prev.currentPiece, prev.board, { x: 0, y: dropDistance + 1 })) {
        dropDistance++;
      }

      const droppedPiece = {
        ...prev.currentPiece,
        position: {
          x: prev.currentPiece.position.x,
          y: prev.currentPiece.position.y + dropDistance,
        },
      };

      const newBoard = mergePieceToBoard(droppedPiece, prev.board);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
      const newScore = prev.score + calculateScore(linesCleared, prev.level) + dropDistance * 2;

      if (newLevel > prev.level) {
        dropSpeedRef.current = Math.max(
          100,
          INITIAL_SPEED * Math.pow(SPEED_INCREASE, newLevel - 1)
        );
      }

      const newCurrentPiece = prev.nextPiece || createPiece(getRandomTetromino());
      const newNextPiece = createPiece(getRandomTetromino());
      const isGameOver = checkCollision(newCurrentPiece, clearedBoard);

      return {
        ...prev,
        board: clearedBoard,
        currentPiece: isGameOver ? null : newCurrentPiece,
        nextPiece: newNextPiece,
        score: newScore,
        level: newLevel,
        lines: newLines,
        gameOver: isGameOver,
      };
    });
  }, []);

  // Use ref for moveDown to avoid interval recreation
  const moveDownRef = useRef(moveDown);
  moveDownRef.current = moveDown;

  // Track game active state
  const isGameActive =
    gameState.currentPiece !== null && !gameState.gameOver && !gameState.isPaused;

  // Game loop using requestAnimationFrame for smoother updates on web
  useEffect(() => {
    if (!isGameActive) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    let lastDrop = Date.now();
    let animationFrameId: number | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const tick = () => {
      const now = Date.now();
      if (now - lastDrop >= dropSpeedRef.current) {
        lastDrop = now;
        moveDownRef.current();
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    // Use requestAnimationFrame for web, setInterval for native
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      animationFrameId = requestAnimationFrame(tick);
    } else {
      intervalId = setInterval(() => {
        moveDownRef.current();
      }, dropSpeedRef.current);
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [isGameActive]);

  // Memoize actions to prevent unnecessary re-renders
  const actions = useMemo(
    () => ({
      startGame,
      togglePause,
      moveLeft,
      moveRight,
      moveDown,
      rotate,
      hardDrop,
    }),
    [startGame, togglePause, moveLeft, moveRight, moveDown, rotate, hardDrop]
  );

  return {
    gameState,
    actions,
  };
};
