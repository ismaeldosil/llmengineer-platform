import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { EmbeddingMatchGame } from '@/components/games/embedding-match';

export default function EmbeddingMatchScreen() {
  const handleGameOver = (score: number) => {
    console.log('Game Over! Final Score:', score);
    // TODO: Submit score to leaderboard API when implemented
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Embedding Match',
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        <EmbeddingMatchGame onGameOver={handleGameOver} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
