import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useState } from 'react';
import type { Badge, BadgeCategory } from '@llmengineer/shared';

// Mock data - replace with actual API calls
const MOCK_EARNED_BADGES: Badge[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    category: 'progress',
    earnedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    earnedAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Quiz Master',
    description: 'Score 100% on 5 quizzes',
    icon: '⭐',
    category: 'mastery',
    earnedAt: '2024-01-25',
  },
];

const MOCK_LOCKED_BADGES: Badge[] = [
  {
    id: '4',
    name: 'Code Ninja',
    description: 'Complete 50 lessons',
    icon: '🥷',
    category: 'progress',
  },
  {
    id: '5',
    name: 'Streak Legend',
    description: 'Maintain a 30-day streak',
    icon: '⚡',
    category: 'streak',
  },
  {
    id: '6',
    name: 'Perfect Scholar',
    description: 'Score 100% on 20 quizzes',
    icon: '👑',
    category: 'mastery',
  },
];

const CATEGORIES: { label: string; value: BadgeCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Progress', value: 'progress' },
  { label: 'Streaks', value: 'streak' },
  { label: 'Mastery', value: 'mastery' },
];

export default function BadgesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const filterBadges = (badges: Badge[]) => {
    if (selectedCategory === 'all') return badges;
    return badges.filter((badge) => badge.category === selectedCategory);
  };

  const filteredEarnedBadges = filterBadges(MOCK_EARNED_BADGES);
  const filteredLockedBadges = filterBadges(MOCK_LOCKED_BADGES);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Badges</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stats}>
            {MOCK_EARNED_BADGES.length} / {MOCK_EARNED_BADGES.length + MOCK_LOCKED_BADGES.length}{' '}
            Earned
          </Text>
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <Pressable
            key={category.value}
            style={[
              styles.categoryButton,
              selectedCategory === category.value && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.value)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.value && styles.categoryButtonTextActive,
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Earned Badges */}
        {filteredEarnedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earned</Text>
            <View style={styles.badgesGrid}>
              {filteredEarnedBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  locked={false}
                  onPress={() => setSelectedBadge(badge)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Locked Badges */}
        {filteredLockedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Locked</Text>
            <View style={styles.badgesGrid}>
              {filteredLockedBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  locked={true}
                  onPress={() => setSelectedBadge(badge)}
                />
              ))}
            </View>
          </View>
        )}

        {filteredEarnedBadges.length === 0 && filteredLockedBadges.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No badges in this category</Text>
          </View>
        )}
      </ScrollView>

      {/* Badge Detail Modal */}
      <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
    </View>
  );
}

interface BadgeCardProps {
  badge: Badge;
  locked: boolean;
  onPress: () => void;
}

function BadgeCard({ badge, locked, onPress }: BadgeCardProps) {
  return (
    <Pressable style={[styles.badgeCard, locked && styles.badgeCardLocked]} onPress={onPress}>
      <View style={[styles.badgeIconContainer, locked && styles.badgeIconContainerLocked]}>
        <Text style={[styles.badgeIcon, locked && styles.badgeIconLocked]}>{badge.icon}</Text>
      </View>
      <Text style={[styles.badgeName, locked && styles.badgeNameLocked]} numberOfLines={2}>
        {badge.name}
      </Text>
      {locked && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      )}
    </Pressable>
  );
}

interface BadgeDetailModalProps {
  badge: Badge | null;
  onClose: () => void;
}

function BadgeDetailModal({ badge, onClose }: BadgeDetailModalProps) {
  if (!badge) return null;

  const isLocked = !badge.earnedAt;

  return (
    <Modal visible={!!badge} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={[styles.modalIconContainer, isLocked && styles.modalIconContainerLocked]}>
            <Text style={styles.modalIcon}>{badge.icon}</Text>
            {isLocked && (
              <View style={styles.modalLockOverlay}>
                <Text style={styles.modalLockIcon}>🔒</Text>
              </View>
            )}
          </View>

          <Text style={styles.modalBadgeName}>{badge.name}</Text>
          <Text style={styles.modalBadgeDescription}>{badge.description}</Text>

          {badge.earnedAt && (
            <View style={styles.earnedDateContainer}>
              <Text style={styles.earnedDateLabel}>Earned on</Text>
              <Text style={styles.earnedDate}>
                {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}

          {isLocked && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Keep going to unlock this badge!</Text>
            </View>
          )}

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1F2937',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  categoriesContainer: {
    maxHeight: 60,
    backgroundColor: '#1F2937',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badgeCard: {
    width: '30%',
    minWidth: 100,
    aspectRatio: 1,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    position: 'relative',
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIconContainerLocked: {
    backgroundColor: '#374151',
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeIconLocked: {
    opacity: 0.4,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F9FAFB',
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#9CA3AF',
  },
  lockOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  lockIcon: {
    fontSize: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  modalIconContainerLocked: {
    backgroundColor: '#374151',
  },
  modalIcon: {
    fontSize: 56,
  },
  modalLockOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 50,
  },
  modalLockIcon: {
    fontSize: 32,
  },
  modalBadgeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalBadgeDescription: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  earnedDateContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  earnedDateLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  earnedDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  progressContainer: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  progressLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
