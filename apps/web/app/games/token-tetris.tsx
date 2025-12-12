import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { TokenTetrisGame } from '@/components/games/token-tetris/TokenTetrisGame';

export default function TokenTetrisScreen() {
  const handleGameOver = (score: number) => {
    // TODO: Submit score to leaderboard API when implemented
    void score;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Token Tetris',
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        <TokenTetrisGame onGameOver={handleGameOver} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
});
