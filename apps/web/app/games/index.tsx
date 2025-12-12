import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Gamepad2 } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { GameCard } from '@/components/games/GameCard';

interface Game {
  id: string;
  slug: 'token-tetris' | 'prompt-golf' | 'embedding-match';
  name: string;
  description: string;
  icon: string;
  highScore?: number;
  isLocked: boolean;
  unlockRequirement?: string;
}

const GAMES: Game[] = [
  {
    id: 'token-tetris',
    slug: 'token-tetris',
    name: 'Token Tetris',
    description: 'Optimiza tokens mientras juegas Tetris',
    icon: '🧱',
    isLocked: false,
  },
  {
    id: 'prompt-golf',
    slug: 'prompt-golf',
    name: 'Prompt Golf',
    description: 'Logra el output en mínimos tokens',
    icon: '⛳',
    isLocked: false,
  },
  {
    id: 'embedding-match',
    slug: 'embedding-match',
    name: 'Embedding Match',
    description: 'Memory de similitud semántica',
    icon: '🧠',
    isLocked: true,
    unlockRequirement: 'Completa 5 lecciones',
  },
];

export default function GamesScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mini Juegos',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.title}>Mini Juegos</Text>
            <Icon icon={Gamepad2} size="xl" color="#a855f7" />
          </View>
          <Text style={styles.subtitle}>
            Aprende conceptos de LLM Engineering mientras te diviertes
          </Text>
        </View>

        {/* Games Grid */}
        <View style={styles.gamesGrid}>
          {GAMES.map((game) => (
            <View key={game.id} style={styles.gameCardWrapper}>
              <GameCard {...game} />
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 8,
  },
  gamesGrid: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gameCardWrapper: {
    width: '100%',
    maxWidth: 400,
  },
});
