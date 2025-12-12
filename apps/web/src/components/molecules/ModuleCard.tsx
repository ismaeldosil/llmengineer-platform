import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { CheckCircle2, BookOpen, ChevronRight, Lock, Clock } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { useRef, useEffect } from 'react';

export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  lessonsCompleted: number;
  totalLessons: number;
  isComplete?: boolean;
  status?: ModuleStatus;
  iconEmoji?: string;
  estimatedMinutes?: number;
  isLocked?: boolean;
}

export function ModuleCard({
  id,
  title,
  description,
  lessonsCompleted,
  totalLessons,
  isComplete = false,
  status,
  iconEmoji,
  estimatedMinutes,
  isLocked = false,
}: ModuleCardProps) {
  const progressPercent =
    totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  // Determine the module status automatically if not provided
  const moduleStatus: ModuleStatus =
    status ||
    (isLocked
      ? 'locked'
      : isComplete
        ? 'completed'
        : lessonsCompleted > 0
          ? 'in_progress'
          : 'available');

  // Pulsing animation for in-progress state
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (moduleStatus === 'in_progress') {
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
  }, [moduleStatus, pulseAnim]);

  const handlePress = () => {
    if (moduleStatus === 'locked') return;
    router.push(`/lessons/?module=${id}` as any);
  };

  const handlePressIn = () => {
    if (moduleStatus === 'locked') return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (moduleStatus === 'locked') return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getIconComponent = () => {
    switch (moduleStatus) {
      case 'locked':
        return <Icon icon={Lock} size="lg" color="#64748b" />;
      case 'completed':
        return <Icon icon={CheckCircle2} size="lg" color="#22c55e" />;
      case 'in_progress':
        return <Icon icon={BookOpen} size="lg" color="#3b82f6" />;
      default:
        return <Icon icon={BookOpen} size="lg" color="#94a3b8" />;
    }
  };

  const getActionButtonText = () => {
    switch (moduleStatus) {
      case 'locked':
        return 'Bloqueado';
      case 'completed':
        return 'Revisar';
      case 'in_progress':
        return 'Continuar';
      default:
        return 'Comenzar';
    }
  };

  const getBorderColor = () => {
    switch (moduleStatus) {
      case 'in_progress':
        return '#3b82f6'; // primary-500
      case 'completed':
        return '#22c55e'; // green-500
      default:
        return '#334155'; // slate-700
    }
  };

  const getBackgroundColor = () => {
    return moduleStatus === 'completed' ? '#0f1e13' : '#1e293b';
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[
          styles.card,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            opacity: moduleStatus === 'locked' ? 0.6 : 1,
            cursor: moduleStatus === 'locked' ? 'not-allowed' : 'pointer',
          } as any,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={moduleStatus === 'locked'}
      >
        {/* Pulsing indicator for in-progress state */}
        {moduleStatus === 'in_progress' && (
          <Animated.View
            style={[
              styles.pulsingIndicator,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        )}

        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              moduleStatus === 'completed' && styles.iconContainerComplete,
              moduleStatus === 'in_progress' && styles.iconContainerInProgress,
              moduleStatus === 'locked' && styles.iconContainerLocked,
            ]}
          >
            {iconEmoji ? <Text style={styles.iconEmoji}>{iconEmoji}</Text> : getIconComponent()}
          </View>
          {moduleStatus === 'completed' && (
            <View style={styles.completeBadge}>
              <Icon icon={CheckCircle2} size="sm" color="#22c55e" />
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        <View style={styles.metaInfo}>
          <View style={styles.metaRow}>
            <Text style={styles.lessonsText}>
              {lessonsCompleted}/{totalLessons} lecciones
            </Text>
            {estimatedMinutes && (
              <View style={styles.timeEstimate}>
                <Icon icon={Clock} size="xs" color="#64748b" />
                <Text style={styles.timeText}>{estimatedMinutes} min</Text>
              </View>
            )}
          </View>
          <Text style={styles.progressText}>{progressPercent}%</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressPercent}%`,
                backgroundColor:
                  moduleStatus === 'completed'
                    ? '#22c55e'
                    : moduleStatus === 'in_progress'
                      ? '#3b82f6'
                      : '#22c55e',
              },
            ]}
          />
        </View>

        {/* Action button */}
        <Pressable
          style={[styles.actionButton, moduleStatus === 'locked' && styles.actionButtonLocked]}
          onPress={handlePress}
          disabled={moduleStatus === 'locked'}
        >
          <Text style={[styles.actionText, moduleStatus === 'locked' && styles.actionTextLocked]}>
            {getActionButtonText()}
          </Text>
          <Icon
            icon={moduleStatus === 'locked' ? Lock : ChevronRight}
            size="sm"
            variant={moduleStatus === 'locked' ? 'muted' : 'primary'}
          />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 280,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    position: 'relative',
    // Hover effects will be applied via web CSS
  },
  pulsingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
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
  iconContainerComplete: {
    backgroundColor: '#166534',
  },
  iconContainerInProgress: {
    backgroundColor: '#1e3a8a',
  },
  iconContainerLocked: {
    backgroundColor: '#1e293b',
  },
  iconEmoji: {
    fontSize: 28,
  },
  completeBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lessonsText: {
    fontSize: 13,
    color: '#64748b',
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#64748b',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f8fafc',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  actionButtonLocked: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  actionTextLocked: {
    color: '#64748b',
  },
});
