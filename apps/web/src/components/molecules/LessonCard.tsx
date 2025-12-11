import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Lesson } from '@llmengineer/shared';

interface LessonCardProps {
  lesson: Lesson;
  onPress: () => void;
}

export function LessonCard({ lesson, onPress }: LessonCardProps) {
  const difficultyColors = {
    beginner: '#10B981',
    intermediate: '#F59E0B',
    advanced: '#EF4444',
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.weekBadge}>Semana {lesson.week}</Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColors[lesson.difficulty] + '20' },
            ]}
          >
            <Text style={[styles.difficultyText, { color: difficultyColors[lesson.difficulty] }]}>
              {lesson.difficulty}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {lesson.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{lesson.xpReward} XP</Text>
          </View>
          <Text style={styles.duration}>{lesson.estimatedMinutes} min</Text>
        </View>
      </View>

      {lesson.isCompleted && (
        <View style={styles.completedOverlay}>
          <Text style={styles.completedIcon}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
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
  xpBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  duration: {
    fontSize: 14,
    color: '#6B7280',
  },
  completedOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
