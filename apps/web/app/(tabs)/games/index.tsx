import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

interface Game {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  locked: boolean;
  highScore?: number;
  unlockRequirement?: string;
}

// Mock data - replace with actual API calls
const MOCK_GAMES: Game[] = [
  {
    id: '1',
    slug: 'code-memory',
    name: 'Code Memory',
    description: 'Match pairs of programming concepts and syntax',
    icon: '🧠',
    locked: false,
    highScore: 1250,
  },
  {
    id: '2',
    slug: 'syntax-speed',
    name: 'Syntax Speed',
    description: 'Type code snippets as fast as you can',
    icon: '⚡',
    locked: false,
    highScore: 890,
  },
  {
    id: '3',
    slug: 'debug-detective',
    name: 'Debug Detective',
    description: 'Find and fix bugs in code before time runs out',
    icon: '🔍',
    locked: false,
    highScore: 2100,
  },
  {
    id: '4',
    slug: 'algorithm-arena',
    name: 'Algorithm Arena',
    description: 'Solve algorithmic challenges under pressure',
    icon: '⚔️',
    locked: true,
    unlockRequirement: 'Reach Level 5',
  },
  {
    id: '5',
    slug: 'pattern-puzzle',
    name: 'Pattern Puzzle',
    description: 'Complete coding patterns and sequences',
    icon: '🧩',
    locked: true,
    unlockRequirement: 'Complete 20 lessons',
  },
  {
    id: '6',
    slug: 'refactor-rush',
    name: 'Refactor Rush',
    description: 'Improve code quality with quick refactoring',
    icon: '♻️',
    locked: true,
    unlockRequirement: 'Earn Code Master badge',
  },
];

export default function GamesHubScreen() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleGamePress = (game: Game) => {
    if (game.locked) {
      setSelectedGame(game);
      return;
    }

    // Navigate to game screen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(`/games/${game.slug}` as any);
  };

  const unlockedGames = MOCK_GAMES.filter((game) => !game.locked);
  const lockedGames = MOCK_GAMES.filter((game) => game.locked);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Games Hub</Text>
        <Text style={styles.subtitle}>Practice and earn XP through fun challenges</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Available Games */}
        {unlockedGames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Games</Text>
            <View style={styles.gamesGrid}>
              {unlockedGames.map((game) => (
                <GameCard key={game.id} game={game} onPress={() => handleGamePress(game)} />
              ))}
            </View>
          </View>
        )}

        {/* Locked Games */}
        {lockedGames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Locked Games</Text>
            <View style={styles.gamesGrid}>
              {lockedGames.map((game) => (
                <GameCard key={game.id} game={game} onPress={() => handleGamePress(game)} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Locked Game Info Overlay */}
      {selectedGame && selectedGame.locked && (
        <Pressable style={styles.overlay} onPress={() => setSelectedGame(null)}>
          <View style={styles.lockedInfoCard}>
            <Text style={styles.lockedInfoIcon}>{selectedGame.icon}</Text>
            <Text style={styles.lockedInfoTitle}>{selectedGame.name}</Text>
            <Text style={styles.lockedInfoDescription}>{selectedGame.description}</Text>
            <View style={styles.unlockRequirementContainer}>
              <Text style={styles.unlockRequirementLabel}>Unlock Requirement:</Text>
              <Text style={styles.unlockRequirementText}>{selectedGame.unlockRequirement}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={() => setSelectedGame(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </View>
  );
}

interface GameCardProps {
  game: Game;
  onPress: () => void;
}

function GameCard({ game, onPress }: GameCardProps) {
  return (
    <Pressable style={[styles.gameCard, game.locked && styles.gameCardLocked]} onPress={onPress}>
      {/* Icon */}
      <View style={[styles.iconContainer, game.locked && styles.iconContainerLocked]}>
        <Text style={[styles.icon, game.locked && styles.iconLocked]}>{game.icon}</Text>
        {game.locked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.gameContent}>
        <Text style={[styles.gameName, game.locked && styles.gameNameLocked]}>{game.name}</Text>
        <Text
          style={[styles.gameDescription, game.locked && styles.gameDescriptionLocked]}
          numberOfLines={2}
        >
          {game.description}
        </Text>

        {/* High Score or Lock Message */}
        {!game.locked && game.highScore !== undefined ? (
          <View style={styles.highScoreContainer}>
            <Text style={styles.highScoreLabel}>High Score:</Text>
            <Text style={styles.highScoreValue}>{game.highScore.toLocaleString()}</Text>
          </View>
        ) : game.locked ? (
          <View style={styles.lockedContainer}>
            <Text style={styles.lockedText}>Tap to view requirements</Text>
          </View>
        ) : (
          <View style={styles.highScoreContainer}>
            <Text style={styles.noScoreText}>Not played yet</Text>
          </View>
        )}
      </View>

      {/* Play Button */}
      {!game.locked && (
        <View style={styles.playButtonContainer}>
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>Play</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1F2937',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  gamesGrid: {
    gap: 16,
  },
  gameCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: '#374151',
  },
  gameCardLocked: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainerLocked: {
    backgroundColor: '#374151',
  },
  icon: {
    fontSize: 40,
  },
  iconLocked: {
    opacity: 0.4,
  },
  lockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#1F2937',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  lockIcon: {
    fontSize: 14,
  },
  gameContent: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  gameNameLocked: {
    color: '#9CA3AF',
  },
  gameDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
    lineHeight: 20,
  },
  gameDescriptionLocked: {
    color: '#6B7280',
  },
  highScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highScoreLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  highScoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FCD34D',
  },
  noScoreText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  lockedContainer: {
    marginTop: 4,
  },
  lockedText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  playButtonContainer: {
    marginLeft: 'auto',
  },
  playButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockedInfoCard: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  lockedInfoIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.4,
  },
  lockedInfoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 12,
    textAlign: 'center',
  },
  lockedInfoDescription: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  unlockRequirementContainer: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  unlockRequirementLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unlockRequirementText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FCD34D',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
