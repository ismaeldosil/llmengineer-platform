import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { XP_PER_LEVEL, getLevelTitle, getXpProgressInLevel } from '@llmengineer/shared';

interface ProgressCardProps {
  totalXp: number;
  level: number;
  lessonsCompleted: number;
  currentStreak?: number;
  isLoading?: boolean;
}

export function ProgressCard({
  totalXp,
  level,
  lessonsCompleted,
  currentStreak = 0,
  isLoading,
}: ProgressCardProps) {
  const levelTitle = getLevelTitle(level);
  const xpInCurrentLevel = getXpProgressInLevel(totalXp);
  const xpProgress = xpInCurrentLevel / XP_PER_LEVEL;

  // Animated progress bar - hooks must be called before any conditional returns
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (!isLoading) {
      progressWidth.value = withSpring(xpProgress * 100, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [xpProgress, isLoading, progressWidth]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{level}</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={styles.levelTitle}>{levelTitle}</Text>
          <Text style={styles.xpText}>{totalXp.toLocaleString()} XP</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
      </View>
      <Text style={styles.progressText}>
        {xpInCurrentLevel.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()} XP para nivel{' '}
        {level + 1}
      </Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{lessonsCompleted}</Text>
          <Text style={styles.statLabel}>Lecciones</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Racha</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalXp.toLocaleString()}</Text>
          <Text style={styles.statLabel}>XP Total</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelInfo: {
    marginLeft: 12,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  xpText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#374151',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
