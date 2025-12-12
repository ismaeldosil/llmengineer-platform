import React, { useMemo, memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BOARD_WIDTH, BOARD_HEIGHT } from './useTokenTetris';
import type { Board } from './useTokenTetris';

interface Position {
  x: number;
  y: number;
}

interface Piece {
  shape: number[][];
  position: Position;
  color: string;
  token: string;
}

interface TetrisBoardProps {
  board: Board;
  currentPiece: Piece | null;
  cellSize?: number;
}

// Memoized cell component
const Cell = memo(
  ({
    color,
    token,
    size,
    isCurrentPiece,
  }: {
    color: string | null;
    token: string;
    size: number;
    isCurrentPiece: boolean;
  }) => (
    <View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: color || '#1F2937',
          borderColor: color ? '#000' : '#374151',
          opacity: isCurrentPiece ? 1 : color ? 0.9 : 1,
        },
      ]}
    >
      {token ? (
        <Text
          style={[
            styles.token,
            {
              fontSize: Math.max(8, size * 0.35),
            },
          ]}
        >
          {token}
        </Text>
      ) : null}
    </View>
  )
);

export const TetrisBoard: React.FC<TetrisBoardProps> = memo(({ board, currentPiece, cellSize }) => {
  // Calculate cell size based on screen width if not provided
  const screenWidth = Dimensions.get('window').width;
  const calculatedCellSize = cellSize || Math.floor((screenWidth - 40) / BOARD_WIDTH);
  const actualCellSize = Math.min(calculatedCellSize, 30); // Max 30px per cell

  // Memoize display board calculation
  const displayBoard = useMemo(() => {
    const result = board.map((row) => [...row]);

    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        const row = currentPiece.shape[y];
        if (!row) continue;
        for (let x = 0; x < row.length; x++) {
          if (row[x]) {
            const boardY = currentPiece.position.y + y;
            const boardX = currentPiece.position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              result[boardY]![boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return result;
  }, [board, currentPiece]);

  // Memoize cell info for current piece
  const currentPieceCells = useMemo(() => {
    const cells = new Set<string>();
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        const row = currentPiece.shape[y];
        if (!row) continue;
        for (let x = 0; x < row.length; x++) {
          if (row[x]) {
            const boardY = currentPiece.position.y + y;
            const boardX = currentPiece.position.x + x;
            cells.add(`${boardY}-${boardX}`);
          }
        }
      }
    }
    return cells;
  }, [currentPiece]);

  // Get token for current piece position
  const getTokenForCell = (rowIndex: number, colIndex: number): string => {
    if (!currentPiece) return '';

    const relY = rowIndex - currentPiece.position.y;
    const relX = colIndex - currentPiece.position.x;

    const row = currentPiece.shape[relY];
    if (
      relY >= 0 &&
      relY < currentPiece.shape.length &&
      relX >= 0 &&
      row &&
      relX < row.length &&
      row[relX]
    ) {
      return currentPiece.token;
    }

    return '';
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.board,
          {
            width: BOARD_WIDTH * actualCellSize,
            height: BOARD_HEIGHT * actualCellSize,
          },
        ]}
      >
        {displayBoard.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => {
              const token = getTokenForCell(rowIndex, colIndex);
              const isCurrentPiece = currentPieceCells.has(`${rowIndex}-${colIndex}`);
              return (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  color={cell}
                  token={token}
                  size={actualCellSize}
                  isCurrentPiece={isCurrentPiece}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    borderWidth: 2,
    borderColor: '#374151',
    backgroundColor: '#111827',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  token: {
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});
