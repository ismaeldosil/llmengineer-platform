import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CheckCircle2, BookOpen, ChevronRight } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';

interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  lessonsCompleted: number;
  totalLessons: number;
  isComplete: boolean;
  iconEmoji?: string;
}

export function ModuleCard({
  id,
  title,
  description,
  lessonsCompleted,
  totalLessons,
  isComplete,
}: ModuleCardProps) {
  const progressPercent = totalLessons > 0
    ? Math.round((lessonsCompleted / totalLessons) * 100)
    : 0;

  const handlePress = () => {
    router.push(`/lessons/?module=${id}` as any);
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, isComplete && styles.iconContainerComplete]}>
          {isComplete ? (
            <Icon icon={CheckCircle2} size="lg" color="#22c55e" />
          ) : (
            <Icon icon={BookOpen} size="lg" color="#94a3b8" />
          )}
        </View>
        {isComplete && (
          <View style={styles.completeBadge}>
            <Icon icon={CheckCircle2} size="sm" color="#22c55e" />
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.description} numberOfLines={2}>{description}</Text>

      <View style={styles.footer}>
        <Text style={styles.lessonsText}>
          {lessonsCompleted}/{totalLessons} lecciones
        </Text>
        <Text style={styles.progressText}>{progressPercent}%</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>

      <Pressable style={styles.actionButton} onPress={handlePress}>
        <Text style={styles.actionText}>
          {isComplete ? 'Revisar' : lessonsCompleted > 0 ? 'Continuar' : 'Comenzar'}
        </Text>
        <Icon icon={ChevronRight} size="sm" variant="primary" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 280,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
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
    borderRadius: 14,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerComplete: {
    backgroundColor: '#166534',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonsText: {
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
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
