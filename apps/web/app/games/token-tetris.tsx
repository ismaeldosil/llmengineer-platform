import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { TokenTetrisGame } from '@/components/games/token-tetris/TokenTetrisGame';

export default function TokenTetrisScreen() {
  const handleGameOver = (score: number) => {
    console.log('Game Over! Final Score:', score);
    // TODO: Submit score to leaderboard API when implemented
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
