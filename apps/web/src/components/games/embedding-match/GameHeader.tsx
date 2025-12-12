import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Timer, Trophy, Star, Pause, Play } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface GameHeaderProps {
  score: number;
  timeRemaining: number;
  level: DifficultyLevel;
  matchedPairs: number;
  totalPairs: number;
  isPaused: boolean;
  onPauseToggle: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  timeRemaining,
  level,
  matchedPairs,
  totalPairs,
  isPaused,
  onPauseToggle,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelColor = (lvl: DifficultyLevel): string => {
    switch (lvl) {
      case 'easy':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getLevelLabel = (lvl: DifficultyLevel): string => {
    return lvl.charAt(0).toUpperCase() + lvl.slice(1);
  };

  const getTimeColor = (): string => {
    if (timeRemaining <= 10) return '#ef4444';
    if (timeRemaining <= 30) return '#f59e0b';
    return '#10b981';
  };

  return (
    <View style={styles.container}>
      {/* Top Row - Timer and Pause */}
      <View style={styles.topRow}>
        <View style={styles.statGroup}>
          <Icon icon={Timer} size="sm" color={getTimeColor()} />
          <Text style={[styles.statValue, { color: getTimeColor() }]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>

        <Pressable
          style={[styles.pauseButton, isPaused && styles.pauseButtonActive]}
          onPress={onPauseToggle}
        >
          <Icon icon={isPaused ? Play : Pause} size="sm" color="#f8fafc" />
          <Text style={styles.pauseButtonText}>
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </Pressable>
      </View>

      {/* Bottom Row - Stats */}
      <View style={styles.bottomRow}>
        <View style={styles.statGroup}>
          <Icon icon={Trophy} size="sm" color="#fbbf24" />
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
        </View>

        <View style={styles.statGroup}>
          <Icon icon={Star} size="sm" color="#3b82f6" />
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Pairs</Text>
            <Text style={styles.statValue}>
              {matchedPairs}/{totalPairs}
            </Text>
          </View>
        </View>

        <View style={styles.levelBadge}>
          <Text style={[styles.levelText, { color: getLevelColor(level) }]}>
            {getLevelLabel(level)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#334155',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statContent: {
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    fontFamily: 'monospace',
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#475569',
  },
  pauseButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
  },
  pauseButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f8fafc',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
