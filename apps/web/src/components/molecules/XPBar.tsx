import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export interface Level {
  level: number;
  name: string;
  icon: string;
  color: string;
  minXP: number;
}

export interface XPBarProps {
  currentXP: number;
  currentLevel: Level;
  nextLevel: Level | null;
  xpProgress: number; // 0-100 percentage
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const SIZE_CONFIG = {
  sm: {
    barHeight: 8,
    iconSize: 24,
    fontSize: {
      title: 14,
      detail: 11,
    },
  },
  md: {
    barHeight: 12,
    iconSize: 32,
    fontSize: {
      title: 16,
      detail: 12,
    },
  },
  lg: {
    barHeight: 16,
    iconSize: 40,
    fontSize: {
      title: 18,
      detail: 14,
    },
  },
};

export function XPBar({
  currentXP,
  currentLevel,
  nextLevel,
  xpProgress,
  size = 'md',
  showDetails = true,
}: XPBarProps) {
  const config = SIZE_CONFIG[size];

  // Animated progress bar
  const progressWidth = useSharedValue(0);
  const dotPosition = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withSpring(xpProgress, {
      damping: 15,
      stiffness: 100,
    });
    dotPosition.value = withSpring(xpProgress, {
      damping: 15,
      stiffness: 100,
    });
  }, [xpProgress, progressWidth, dotPosition]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const animatedDotStyle = useAnimatedStyle(() => ({
    left: `${dotPosition.value}%`,
  }));

  const xpToNextLevel = nextLevel ? nextLevel.minXP - currentXP : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      {showDetails && (
        <View style={styles.header}>
          <View style={styles.levelInfo}>
            <Text style={[styles.icon, { fontSize: config.iconSize }]}>{currentLevel.icon}</Text>
            <View style={styles.levelText}>
              <Text style={[styles.levelName, { fontSize: config.fontSize.title }]}>
                {currentLevel.name}
              </Text>
              <Text style={[styles.levelNumber, { fontSize: config.fontSize.detail }]}>
                Level {currentLevel.level}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { height: config.barHeight }]}>
        <Animated.View style={[styles.progressBar, animatedProgressStyle]} />

        {/* Floating Dot Indicator */}
        {xpProgress > 0 && xpProgress < 100 && (
          <Animated.View
            style={[
              styles.progressDot,
              animatedDotStyle,
              {
                width: config.barHeight * 1.5,
                height: config.barHeight * 1.5,
                marginTop: -(config.barHeight * 0.25),
                marginLeft: -(config.barHeight * 0.75),
              },
            ]}
          />
        )}
      </View>

      {/* Footer */}
      {showDetails && nextLevel && (
        <View style={styles.footer}>
          <Text style={[styles.xpRemaining, { fontSize: config.fontSize.detail }]}>
            {xpToNextLevel.toLocaleString()} XP to {nextLevel.name}
          </Text>
          <Text style={[styles.xpProgress, { fontSize: config.fontSize.detail }]}>
            {Math.round(xpProgress)}%
          </Text>
        </View>
      )}

      {showDetails && !nextLevel && (
        <View style={styles.footer}>
          <Text style={[styles.xpRemaining, { fontSize: config.fontSize.detail }]}>
            Max Level Reached!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  levelText: {
    flexDirection: 'column',
  },
  levelName: {
    fontWeight: '600',
    color: '#F9FAFB',
  },
  levelNumber: {
    color: '#9CA3AF',
    marginTop: 2,
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#374151',
    borderRadius: 9999,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 9999,
  },
  progressDot: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#F9FAFB',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  xpRemaining: {
    color: '#9CA3AF',
  },
  xpProgress: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
