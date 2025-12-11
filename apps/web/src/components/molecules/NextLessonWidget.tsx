import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import type { Lesson } from '@llmengineer/shared';
import { LessonCard } from './LessonCard';

interface NextLessonWidgetProps {
  lesson?: Lesson | null;
  isLoading?: boolean;
  onPress: () => void;
  onViewAll: () => void;
}

export function NextLessonWidget({ lesson, isLoading, onPress, onViewAll }: NextLessonWidgetProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Proxima Leccion</Text>
        <Pressable onPress={onViewAll} testID="view-all-button">
          <Text style={styles.seeAll}>Ver todas</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#3B82F6" />
        </View>
      ) : lesson ? (
        <LessonCard lesson={lesson} onPress={onPress} />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay lecciones pendientes</Text>
          <Text style={styles.emptySubtext}>Has completado todas las lecciones disponibles</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  seeAll: {
    fontSize: 14,
    color: '#3B82F6',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
