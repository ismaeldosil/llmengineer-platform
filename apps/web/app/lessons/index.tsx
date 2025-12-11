import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useGetLessonsQuery } from '@/services/api';
import { LessonCard } from '@/components/molecules/LessonCard';
import type { Lesson } from '@llmengineer/shared';

export default function LessonsScreen() {
  const { data: lessons, isLoading, error } = useGetLessonsQuery();

  const groupedLessons = lessons?.reduce((acc, lesson) => {
    const week = lesson.week;
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(lesson);
    return acc;
  }, {} as Record<number, Lesson[]>);

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
        data={Object.entries(groupedLessons || {})}
        keyExtractor={([week]) => week}
        renderItem={({ item: [week, weekLessons] }) => (
          <View style={styles.weekSection}>
            <View style={styles.weekHeader}>
              <Text style={styles.weekTitle}>Semana {week}</Text>
              <Text style={styles.weekProgress}>
                {weekLessons.filter((l) => l.isCompleted).length} / {weekLessons.length}
              </Text>
            </View>
            {weekLessons.map((lesson) => (
              <View key={lesson.id} style={styles.lessonItem}>
                <LessonCard
                  lesson={lesson}
                  onPress={() => router.push(`/lessons/${lesson.id}`)}
                />
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.content}
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
  weekProgress: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  lessonItem: {
    marginBottom: 12,
  },
});
