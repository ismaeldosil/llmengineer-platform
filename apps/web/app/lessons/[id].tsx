import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useGetLessonQuery, useCompleteLessonMutation } from '@/services/api';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: lesson, isLoading, error } = useGetLessonQuery(id!);
  const [completeLesson, { isLoading: isCompleting }] = useCompleteLessonMutation();
  const [startTime] = useState(Date.now());

  const handleComplete = async () => {
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    try {
      await completeLesson({ lessonId: id!, timeSpentSeconds }).unwrap();
      router.back();
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error al cargar la lección</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: lesson.title }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.badges}>
            <Text style={styles.weekBadge}>Semana {lesson.week}</Text>
            <Text style={styles.xpBadge}>+{lesson.xpReward} XP</Text>
          </View>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.description}>{lesson.description}</Text>
        </View>

        <View style={styles.content}>
          {lesson.sections?.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
              {section.codeExample && (
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>{section.codeExample}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {!lesson.isCompleted && (
          <Pressable
            style={[styles.completeButton, isCompleting && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.completeButtonText}>
                Completar Lección (+{lesson.xpReward} XP)
              </Text>
            )}
          </Pressable>
        )}

        {lesson.isCompleted && (
          <View style={styles.completedBanner}>
            <Text style={styles.completedText}>✓ Lección completada</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
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
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
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
  xpBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 26,
  },
  codeBlock: {
    backgroundColor: '#0D1117',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#E6EDF3',
  },
  completeButton: {
    backgroundColor: '#10B981',
    margin: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedBanner: {
    backgroundColor: '#10B98120',
    margin: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
});
