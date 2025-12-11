import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

type StreakState = 'active' | 'at-risk' | 'lost';

interface StreakBannerProps {
  currentStreak: number;
  streakState?: StreakState;
  lastCheckin?: Date;
  onCheckin?: () => void;
}

const MOTIVATIONAL_MESSAGES: Record<string, string> = {
  lost: 'No te rindas, empieza de nuevo hoy',
  atRisk: 'Tu racha está en riesgo, completa una lección hoy',
  low: 'Buen comienzo, sigue así',
  building: 'Vas muy bien, mantén el ritmo',
  hot: 'Estás en llamas, sigue así',
  milestone7: 'Increíble, 7 días seguidos',
  milestone30: 'Eres una leyenda, 30 días de racha',
};

const MILESTONE_THRESHOLDS = [7, 30, 100];

export function StreakBanner({
  currentStreak,
  streakState = 'active',
  lastCheckin: _lastCheckin,
  onCheckin,
}: StreakBannerProps) {
  const getStreakEmoji = () => {
    if (streakState === 'lost') return '💔';
    if (streakState === 'at-risk') return '⚠️';
    if (currentStreak >= 30) return '🔥';
    if (currentStreak >= 7) return '🔥';
    if (currentStreak >= 3) return '⚡';
    return '✨';
  };

  const getMotivationalMessage = () => {
    if (streakState === 'lost') return MOTIVATIONAL_MESSAGES.lost;
    if (streakState === 'at-risk') return MOTIVATIONAL_MESSAGES.atRisk;
    if (currentStreak >= 30) return MOTIVATIONAL_MESSAGES.milestone30;
    if (currentStreak >= 7) return MOTIVATIONAL_MESSAGES.milestone7;
    if (currentStreak >= 3) return MOTIVATIONAL_MESSAGES.hot;
    if (currentStreak >= 1) return MOTIVATIONAL_MESSAGES.building;
    return MOTIVATIONAL_MESSAGES.low;
  };

  const getBorderColor = () => {
    if (streakState === 'lost') return '#EF444440';
    if (streakState === 'at-risk') return '#F59E0B40';
    if (currentStreak >= 7) return '#F59E0B40';
    return '#374151';
  };

  const getStreakColor = () => {
    if (streakState === 'lost') return '#EF4444';
    if (streakState === 'at-risk') return '#F59E0B';
    return '#F59E0B';
  };

  // Milestone animation
  const scale = useSharedValue(1);
  const isMilestone = MILESTONE_THRESHOLDS.includes(currentStreak);

  useEffect(() => {
    if (isMilestone) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
    }
  }, [currentStreak, isMilestone]);

  const animatedEmojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { borderColor: getBorderColor() }]}>
      <View style={styles.streakInfo}>
        <Animated.Text style={[styles.emoji, animatedEmojiStyle]}>{getStreakEmoji()}</Animated.Text>
        <View style={styles.textContainer}>
          <Text style={[styles.streakCount, { color: getStreakColor() }]}>
            {currentStreak} días
          </Text>
          <Text style={styles.streakLabel}>{getMotivationalMessage()}</Text>
        </View>
      </View>

      {onCheckin && (
        <Pressable
          style={[styles.checkinButton, streakState === 'lost' && styles.checkinButtonLost]}
          onPress={onCheckin}
        >
          <Text style={styles.checkinText}>
            {streakState === 'lost' ? 'Reiniciar' : 'Check-in'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  streakCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  checkinButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  checkinButtonLost: {
    backgroundColor: '#EF4444',
  },
  checkinText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});
