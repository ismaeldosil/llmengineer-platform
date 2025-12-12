import { View, Text, StyleSheet, Pressable } from 'react-native';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface BadgeGridProps {
  badges: Badge[];
  unlockedBadgeIds: string[];
  onBadgePress?: (badge: Badge) => void;
}

export function BadgeGrid({ badges, unlockedBadgeIds, onBadgePress }: BadgeGridProps) {
  const isUnlocked = (badgeId: string) => unlockedBadgeIds.includes(badgeId);

  return (
    <View style={styles.grid}>
      {badges.map((badge) => {
        const unlocked = isUnlocked(badge.id);

        return (
          <Pressable
            key={badge.id}
            style={[styles.badgeItem, unlocked ? styles.badgeItemUnlocked : styles.badgeItemLocked]}
            onPress={() => onBadgePress?.(badge)}
            disabled={!onBadgePress}
            testID={`badge-${badge.id}`}
          >
            <View
              style={[
                styles.iconContainer,
                unlocked ? styles.iconContainerUnlocked : styles.iconContainerLocked,
              ]}
            >
              <Text style={[styles.icon, unlocked ? styles.iconUnlocked : styles.iconLocked]}>
                {badge.icon}
              </Text>
            </View>
            <Text style={styles.badgeName} numberOfLines={2}>
              {badge.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badgeItem: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    // Calculate width to fit 4 columns on mobile, 8 on larger screens
    // Using percentage with gap: (100% - (3 * gap)) / 4 ≈ 22%
    width: '22%',
    minWidth: 70,
  },
  badgeItemUnlocked: {
    backgroundColor: '#1F2937', // gray-800
    opacity: 1,
  },
  badgeItemLocked: {
    backgroundColor: 'transparent',
    opacity: 0.3,
  },
  iconContainer: {
    borderRadius: 9999, // full rounded
    padding: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerUnlocked: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)', // primary-500/20 (purple)
  },
  iconContainerLocked: {
    backgroundColor: '#374151', // gray-700
  },
  icon: {
    fontSize: 24,
  },
  iconUnlocked: {
    color: '#c084fc', // primary-400 (purple-400)
  },
  iconLocked: {
    color: '#6B7280', // gray-500
  },
  badgeName: {
    fontSize: 12,
    color: '#9CA3AF', // gray-400
    textAlign: 'center',
  },
});
