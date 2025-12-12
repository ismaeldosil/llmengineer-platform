import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';

interface GlobalProgressProps {
  title: string;
  subtitle?: string;
  current: number;
  total: number;
  isLoading?: boolean;
}

export function GlobalProgress({
  title,
  subtitle,
  current,
  total,
  isLoading,
}: GlobalProgressProps) {
  const progressPercent = total > 0 ? (current / total) * 100 : 0;
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (!isLoading) {
      progressWidth.value = withSpring(progressPercent, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [progressPercent, isLoading, progressWidth]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
        </View>
      </View>

      <Text style={styles.progressText}>
        {current} de {total} lecciones completadas
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#a855f7',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 13,
    color: '#94a3b8',
  },
});
