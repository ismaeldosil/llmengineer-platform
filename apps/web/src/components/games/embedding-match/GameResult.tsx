import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Trophy, Star, Clock, RotateCcw, Home } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { DifficultyLevel } from './GameHeader';

export interface GameResultProps {
  score: number;
  timeElapsed: number;
  matchedPairs: number;
  totalPairs: number;
  level: DifficultyLevel;
  accuracy: number;
  isVictory: boolean;
  onPlayAgain: () => void;
  onChangeLevel: () => void;
  onGoHome: () => void;
}

export const GameResult: React.FC<GameResultProps> = ({
  score,
  timeElapsed,
  matchedPairs,
  totalPairs,
  level,
  accuracy,
  isVictory,
  onPlayAgain,
  onChangeLevel,
  onGoHome,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getResultMessage = (): string => {
    if (!isVictory) return "Time's Up!";
    if (accuracy >= 90 && timeElapsed <= 60) return 'Perfect!';
    if (accuracy >= 80) return 'Excellent!';
    if (accuracy >= 70) return 'Great Job!';
    return 'Well Done!';
  };

  const getResultColor = (): string => {
    if (!isVictory) return '#ef4444';
    if (accuracy >= 90 && timeElapsed <= 60) return '#fbbf24';
    if (accuracy >= 80) return '#10b981';
    return '#3b82f6';
  };

  const getStarCount = (): number => {
    if (!isVictory) return 0;
    if (accuracy >= 90 && timeElapsed <= 60) return 3;
    if (accuracy >= 80 || timeElapsed <= 90) return 2;
    return 1;
  };

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />

      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: getResultColor() + '20' }]}>
            <Icon icon={isVictory ? Trophy : Clock} size="xl" color={getResultColor()} />
          </View>
          <Text style={[styles.resultTitle, { color: getResultColor() }]}>
            {getResultMessage()}
          </Text>

          {/* Stars */}
          {isVictory && (
            <View style={styles.starsContainer}>
              {[1, 2, 3].map((starIndex) => (
                <Icon
                  key={starIndex}
                  icon={Star}
                  size="lg"
                  color={starIndex <= getStarCount() ? '#fbbf24' : '#334155'}
                />
              ))}
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Icon icon={Trophy} size="sm" color="#fbbf24" />
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>

            <View style={styles.statItem}>
              <Icon icon={Clock} size="sm" color="#3b82f6" />
              <Text style={styles.statLabel}>Time</Text>
              <Text style={styles.statValue}>{formatTime(timeElapsed)}</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Icon icon={Star} size="sm" color="#10b981" />
              <Text style={styles.statLabel}>Matched</Text>
              <Text style={styles.statValue}>
                {matchedPairs}/{totalPairs}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>{accuracy.toFixed(0)}%</Text>
            </View>
          </View>

          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>Level:</Text>
            <Text style={styles.levelValue}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={[styles.button, styles.primaryButton]} onPress={onPlayAgain}>
            <Icon icon={RotateCcw} size="sm" color="#ffffff" />
            <Text style={styles.buttonText}>Play Again</Text>
          </Pressable>

          <View style={styles.secondaryActions}>
            <Pressable style={[styles.button, styles.secondaryButton]} onPress={onChangeLevel}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Change Level</Text>
            </Pressable>

            <Pressable style={[styles.button, styles.secondaryButton]} onPress={onGoHome}>
              <Icon icon={Home} size="sm" color="#94a3b8" />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Home</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modal: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#334155',
    zIndex: 1001,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  stats: {
    gap: 16,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statEmoji: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    fontFamily: 'monospace',
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  levelLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  levelValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  actions: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#94a3b8',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
