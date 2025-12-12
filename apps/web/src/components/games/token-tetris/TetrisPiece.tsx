import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TetrisPieceProps {
  shape: number[][];
  color: string;
  token: string;
  cellSize: number;
  showToken?: boolean;
}

export const TetrisPiece: React.FC<TetrisPieceProps> = memo(
  ({ shape, color, token, cellSize, showToken = true }) => {
    return (
      <View style={styles.container}>
        {shape.map((row, y) => (
          <View key={y} style={styles.row}>
            {row.map((cell, x) => (
              <View
                key={`${y}-${x}`}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: cell ? color : 'transparent',
                    borderColor: cell ? '#000' : 'transparent',
                  },
                ]}
              >
                {cell && showToken ? (
                  <Text
                    style={[
                      styles.token,
                      {
                        fontSize: Math.max(8, cellSize * 0.4),
                      },
                    ]}
                  >
                    {token}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  token: {
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});
