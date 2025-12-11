import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useGetLessonsQuery } from '@/services/api';
import { LessonCard } from '@/components/molecules/LessonCard';
import type { Lesson } from '@llmengineer/shared';

export default function LessonsScreen() {
  const { data: lessons, isLoading, error, refetch } = useGetLessonsQuery();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const groupedLessons = useMemo(() => {
    if (!lessons) return [];

    const grouped = lessons.reduce(
      (acc, lesson) => {
        const week = lesson.week;
        if (!acc[week]) {
          acc[week] = [];
        }
        acc[week].push(lesson);
        return acc;
      },
      {} as Record<number, Lesson[]>
    );

    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([week, weekLessons]) => ({
        week: Number(week),
        lessons: weekLessons,
        completed: weekLessons.filter((l) => l.isCompleted).length,
        total: weekLessons.length,
      }));
  }, [lessons]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error al cargar lecciones</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Lecciones' }} />
      <FlatList
        style={styles.container}
        data={groupedLessons}
        keyExtractor={(item) => `week-${item.week}`}
        renderItem={({ item }) => (
          <View style={styles.weekSection}>
            <View style={styles.weekHeader}>
              <Text style={styles.weekTitle}>Semana {item.week}</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.weekProgress}>
                  {item.completed} / {item.total}
                </Text>
              </View>
            </View>
            {item.lessons.map((lesson) => (
              <View key={lesson.id} style={styles.lessonItem}>
                <LessonCard
                  lesson={lesson}
                  onPress={() => router.push(`/lessons/${lesson.id}`)}
                />
              </View>
            ))}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          !isLoading && !error ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No hay lecciones disponibles</Text>
            </View>
          ) : null
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    padding: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  weekSection: {
    marginBottom: 32,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  progressBadge: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  weekProgress: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  lessonItem: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
