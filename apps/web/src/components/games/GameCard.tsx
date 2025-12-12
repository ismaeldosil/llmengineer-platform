import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { Lock, Trophy, ChevronRight } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { useRef } from 'react';

export interface GameCardProps {
  id: string;
  slug: 'token-tetris' | 'prompt-golf' | 'embedding-match';
  name: string;
  description: string;
  icon: string; // emoji or icon name
  highScore?: number;
  isLocked: boolean;
  unlockRequirement?: string;
}

export function GameCard({
  id: _id,
  slug,
  name,
  description,
  icon,
  highScore,
  isLocked,
  unlockRequirement,
}: GameCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (isLocked) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(`/games/${slug}` as any);
  };

  const handlePressIn = () => {
    if (isLocked) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (isLocked) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={[
          styles.card,
          isLocked && styles.cardLocked,
          {
            cursor: isLocked ? 'not-allowed' : 'pointer',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLocked}
      >
        {/* Header with Icon and High Score */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, isLocked && styles.iconContainerLocked]}>
            {isLocked ? (
              <Icon icon={Lock} size="lg" color="#64748b" />
            ) : (
              <Text style={styles.iconEmoji}>{icon}</Text>
            )}
          </View>
          {highScore !== undefined && !isLocked && (
            <View style={styles.highScoreBadge}>
              <Icon icon={Trophy} size="xs" color="#fbbf24" />
              <Text style={styles.highScoreText}>{highScore}</Text>
            </View>
          )}
        </View>

        {/* Game Info */}
        <Text style={[styles.name, isLocked && styles.nameLocked]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.description, isLocked && styles.descriptionLocked]} numberOfLines={2}>
          {description}
        </Text>

        {/* Footer - Lock Message or Play Button */}
        {isLocked ? (
          <View style={styles.lockContainer}>
            <Icon icon={Lock} size="sm" color="#64748b" />
            <Text style={styles.lockText}>{unlockRequirement || 'Bloqueado'}</Text>
          </View>
        ) : (
          <Pressable style={styles.playButton} onPress={handlePress}>
            <Text style={styles.playButtonText}>Jugar</Text>
            <Icon icon={ChevronRight} size="sm" variant="primary" />
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#334155',
    minHeight: 200,
  },
  cardLocked: {
    backgroundColor: '#1a1f2e',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerLocked: {
    backgroundColor: '#1e293b',
  },
  iconEmoji: {
    fontSize: 32,
  },
  highScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#422006',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#78350f',
  },
  highScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  nameLocked: {
    color: '#64748b',
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 16,
    flex: 1,
  },
  descriptionLocked: {
    color: '#475569',
  },
  lockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  lockText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingVertical: 8,
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
