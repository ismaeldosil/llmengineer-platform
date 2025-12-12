import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useGetLessonsQuery, useGetProgressQuery } from '@/services/api';
import { LessonCard } from '@/components/molecules/LessonCard';
import { MainLayout } from '@/components/layout';
import { ChevronRight, BookOpen, CheckCircle2 } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { getLevelTitle, XP_PER_LEVEL, getXpProgressInLevel } from '@llmengineer/shared';
import type { Lesson } from '@llmengineer/shared';

export default function LessonsScreen() {
  const { data: lessons, isLoading, error, refetch } = useGetLessonsQuery();
  const { data: progress } = useGetProgressQuery();
  const [refreshing, setRefreshing] = useState(false);

  const totalXp = progress?.totalXp || 0;
  const level = progress?.level || 1;
  const levelTitle = getLevelTitle(level);
  const xpInCurrentLevel = getXpProgressInLevel(totalXp);
  const xpForNextLevel = XP_PER_LEVEL - xpInCurrentLevel;

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

  const totalLessons = lessons?.length || 0;
  const completedLessons = lessons?.filter((l) => l.isCompleted).length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Pressable onPress={() => router.push('/dashboard')} style={styles.breadcrumbItem}>
          <Text style={styles.breadcrumbLink}>Dashboard</Text>
        </Pressable>
        <Icon icon={ChevronRight} size="sm" color="#6B7280" />
        <Text style={styles.breadcrumbCurrent}>Lecciones</Text>
      </View>

      {/* Page Title */}
      <View style={styles.titleRow}>
        <View style={styles.titleContainer}>
          <View style={styles.titleWithIcon}>
            <Icon icon={BookOpen} size="lg" color="#3B82F6" />
            <Text style={styles.pageTitle}>Lecciones</Text>
          </View>
          <Text style={styles.pageSubtitle}>
            Aprende los fundamentos de LLM Engineering paso a paso
          </Text>
        </View>
      </View>

      {/* Progress Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Icon icon={BookOpen} size="md" color="#3B82F6" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{totalLessons}</Text>
            <Text style={styles.statLabel}>Lecciones totales</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#10B98120' }]}>
            <Icon icon={CheckCircle2} size="md" color="#10B981" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{completedLessons}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Progreso General</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressPercent}% completado</Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MainLayout
        totalXp={totalXp}
        level={level}
        levelTitle={levelTitle}
        xpForNextLevel={xpForNextLevel}
      >
        <FlatList
          style={styles.container}
          data={groupedLessons}
          keyExtractor={(item) => `week-${item.week}`}
          ListHeaderComponent={renderHeader}
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
                  <LessonCard lesson={lesson} onPress={() => router.push(`/lessons/${lesson.id}`)} />
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
      </MainLayout>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    paddingHorizontal: 30,
    paddingBottom: 48,
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

  // Header styles
  headerSection: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  breadcrumbCurrent: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    marginLeft: 36,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    minWidth: 160,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  statLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  progressCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  // Week section styles
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
