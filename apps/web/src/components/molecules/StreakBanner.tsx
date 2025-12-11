import { View, Text, StyleSheet, Pressable } from 'react-native';

interface StreakBannerProps {
  currentStreak: number;
  onCheckin: () => void;
}

export function StreakBanner({ currentStreak, onCheckin }: StreakBannerProps) {
  const streakEmoji = currentStreak >= 7 ? '🔥' : currentStreak >= 3 ? '⚡' : '✨';

  return (
    <View style={styles.container}>
      <View style={styles.streakInfo}>
        <Text style={styles.emoji}>{streakEmoji}</Text>
        <View>
          <Text style={styles.streakCount}>{currentStreak} días</Text>
          <Text style={styles.streakLabel}>Racha actual</Text>
        </View>
      </View>

      <Pressable style={styles.checkinButton} onPress={onCheckin}>
        <Text style={styles.checkinText}>Check-in</Text>
      </Pressable>
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
    borderColor: '#F59E0B40',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  streakCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  streakLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  checkinButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkinText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});
