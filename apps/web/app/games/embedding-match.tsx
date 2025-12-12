import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { EmbeddingMatchGame } from '@/components/games/embedding-match';

export default function EmbeddingMatchScreen() {
  const handleGameOver = (score: number) => {
    // TODO: Submit score to leaderboard API when implemented
    void score;
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
