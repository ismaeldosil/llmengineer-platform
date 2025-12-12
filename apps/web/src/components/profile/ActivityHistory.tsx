import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BookOpen, Award, TrendingUp, Gamepad2, LucideIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeTime } from '@/utils/formatDate';

export interface Activity {
  id: string;
  type: 'lesson' | 'badge' | 'level' | 'game';
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: {
    xp?: number;
    score?: number;
    badgeIcon?: string;
  };
}

export interface ActivityHistoryProps {
  activities: Activity[];
  onLoadMore?: () => void;
  loading?: boolean;
}

interface ActivityTypeConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
}

const activityTypeConfig: Record<Activity['type'], ActivityTypeConfig> = {
  lesson: {
    icon: BookOpen,
    color: '#22c55e', // green-500
    bgColor: '#22c55e20', // green-500 with opacity
    label: 'Lección',
  },
  badge: {
    icon: Award,
    color: '#f59e0b', // amber-500 (gold)
    bgColor: '#f59e0b20', // amber-500 with opacity
    label: 'Insignia',
  },
  level: {
    icon: TrendingUp,
    color: '#3b82f6', // blue-500
    bgColor: '#3b82f620', // blue-500 with opacity
    label: 'Nivel',
  },
  game: {
    icon: Gamepad2,
    color: '#a855f7', // purple-500
    bgColor: '#a855f720', // purple-500 with opacity
    label: 'Juego',
  },
};

function ActivityItem({ activity }: { activity: Activity }) {
  const config = activityTypeConfig[activity.type];
  const relativeTime = formatRelativeTime(activity.timestamp);

  return (
    <View style={styles.activityItem}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
        <Icon icon={config.icon} size="md" color={config.color} />
      </View>

      {/* Content */}
      <View style={styles.activityContent}>
        {/* Title */}
        <Text style={styles.activityTitle}>{activity.title}</Text>

        {/* Description */}
        {activity.description && (
          <Text style={styles.activityDescription}>{activity.description}</Text>
        )}

        {/* Metadata */}
        {activity.metadata && (
          <View style={styles.metadataRow}>
            {activity.metadata.xp !== undefined && (
              <View style={styles.metadataBadge}>
                <Text style={[styles.metadataText, { color: config.color }]}>
                  +{activity.metadata.xp} XP
                </Text>
              </View>
            )}
            {activity.metadata.score !== undefined && (
              <View style={styles.metadataBadge}>
                <Text style={[styles.metadataText, { color: config.color }]}>
                  Score: {activity.metadata.score}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>{relativeTime}</Text>
      </View>
    </View>
  );
}

export function ActivityHistory({ activities, onLoadMore, loading = false }: ActivityHistoryProps) {
  // Empty state
  if (!loading && activities.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Sin actividad reciente"
        description="Completa lecciones, gana insignias y juega para ver tu historial aquí."
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial de Actividad</Text>
        <Text style={styles.headerSubtitle}>Tus logros recientes</Text>
      </View>

      {/* Activity List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activities.map((activity, index) => (
          <View key={activity.id}>
            <ActivityItem activity={activity} />
            {/* Divider - don't show after last item */}
            {index < activities.length - 1 && <View style={styles.divider} />}
          </View>
        ))}

        {/* Load More Button */}
        {onLoadMore && !loading && (
          <View style={styles.loadMoreContainer}>
            <Button onPress={onLoadMore} variant="outline" size="md" fullWidth>
              Cargar más
            </Button>
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // gray-900
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151', // gray-700
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb', // gray-50
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af', // gray-400
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  activityItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb', // gray-50
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#9ca3af', // gray-400
    marginBottom: 6,
    lineHeight: 20,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  metadataBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#1f2937', // gray-800
  },
  metadataText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280', // gray-500
  },
  divider: {
    height: 1,
    backgroundColor: '#374151', // gray-700
    marginHorizontal: 16,
    marginVertical: 8,
  },
  loadMoreContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af', // gray-400
  },
});
