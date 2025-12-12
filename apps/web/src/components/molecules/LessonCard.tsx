import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { CheckCircle2, Lock, Clock, Award, Play, BookOpen } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import type { Lesson } from '@llmengineer/shared';
import { useRef, useEffect } from 'react';

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface LessonCardProps {
  lesson: Lesson;
  onPress: () => void;
  status?: LessonStatus;
  isLocked?: boolean;
}

export function LessonCard({ lesson, onPress, status, isLocked = false }: LessonCardProps) {
  const difficultyColors = {
    beginner: '#10B981',
    intermediate: '#F59E0B',
    advanced: '#EF4444',
  };

  // Determine lesson status automatically if not provided
  const lessonStatus: LessonStatus =
    status || (isLocked ? 'locked' : lesson.isCompleted ? 'completed' : 'available');

  // Pulsing animation for in-progress state
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (lessonStatus === 'in_progress') {
      // Create pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [lessonStatus, pulseAnim]);

  const handlePress = () => {
    if (lessonStatus === 'locked') return;
    onPress();
  };

  const handlePressIn = () => {
    if (lessonStatus === 'locked') return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (lessonStatus === 'locked') return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getBorderColor = () => {
    switch (lessonStatus) {
      case 'in_progress':
        return '#3b82f6'; // primary-500
      case 'completed':
        return '#22c55e'; // green-500
      default:
        return '#374151'; // gray-700
    }
  };

  const getBackgroundColor = () => {
    return lessonStatus === 'completed' ? '#0f1e13' : '#1F2937';
  };

  const getIconForStatus = () => {
    switch (lessonStatus) {
      case 'locked':
        return <Icon icon={Lock} size="lg" color="#64748b" />;
      case 'completed':
        return <Icon icon={CheckCircle2} size="lg" color="#22c55e" />;
      case 'in_progress':
        return <Icon icon={Play} size="lg" color="#3b82f6" />;
      default:
        return <Icon icon={BookOpen} size="lg" color="#94a3b8" />;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[
          styles.container,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            opacity: lessonStatus === 'locked' ? 0.6 : 1,
            cursor: lessonStatus === 'locked' ? 'not-allowed' : 'pointer',
          } as any,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={lessonStatus === 'locked'}
      >
        {/* Pulsing indicator for in-progress state */}
        {lessonStatus === 'in_progress' && (
          <Animated.View
            style={[
              styles.pulsingIndicator,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        )}

        <View style={styles.content}>
          {/* Header with badges */}
          <View style={styles.header}>
            <View style={styles.leftBadges}>
              <Text style={styles.weekBadge}>Semana {lesson.week}</Text>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: difficultyColors[lesson.difficulty] + '20' },
                ]}
              >
                <Text
                  style={[styles.difficultyText, { color: difficultyColors[lesson.difficulty] }]}
                >
                  {lesson.difficulty}
                </Text>
              </View>
            </View>
            {lessonStatus === 'locked' && (
              <View style={styles.lockedBadge}>
                <Icon icon={Lock} size="sm" color="#64748b" />
              </View>
            )}
          </View>

          {/* Lesson icon */}
          <View
            style={[
              styles.lessonIcon,
              lessonStatus === 'completed' && styles.lessonIconComplete,
              lessonStatus === 'in_progress' && styles.lessonIconInProgress,
              lessonStatus === 'locked' && styles.lessonIconLocked,
            ]}
          >
            {getIconForStatus()}
          </View>

          {/* Title and description */}
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {lesson.description}
          </Text>

          {/* Meta information */}
          <View style={styles.footer}>
            <View style={styles.metaRow}>
              <View style={styles.xpBadge}>
                <Icon icon={Award} size="xs" color="#10B981" />
                <Text style={styles.xpText}>+{lesson.xpReward} XP</Text>
              </View>
              <View style={styles.timeBadge}>
                <Icon icon={Clock} size="xs" color="#6B7280" />
                <Text style={styles.duration}>{lesson.estimatedMinutes} min</Text>
              </View>
            </View>
            {lessonStatus !== 'locked' && (
              <View style={styles.actionIndicator}>
                {lessonStatus === 'completed' ? (
                  <Text style={styles.actionTextCompleted}>Completado</Text>
                ) : lessonStatus === 'in_progress' ? (
                  <Text style={styles.actionTextInProgress}>Continuar</Text>
                ) : (
                  <Text style={styles.actionText}>Comenzar</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Completed overlay badge */}
        {lessonStatus === 'completed' && (
          <View style={styles.completedOverlay}>
            <Icon icon={CheckCircle2} size="md" color="#FFFFFF" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    position: 'relative',
  },
  pulsingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    zIndex: 10,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  weekBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    backgroundColor: '#3B82F620',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  lockedBadge: {
    backgroundColor: '#1e293b',
    padding: 4,
    borderRadius: 6,
  },
  lessonIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonIconComplete: {
    backgroundColor: '#166534',
  },
  lessonIconInProgress: {
    backgroundColor: '#1e3a8a',
  },
  lessonIconLocked: {
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionIndicator: {
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  actionTextInProgress: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  actionTextCompleted: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22c55e',
  },
  completedOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
});
