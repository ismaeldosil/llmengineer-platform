import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useGetLessonQuery, useCompleteLessonMutation, useGetProgressQuery } from '@/services/api';
import { MarkdownContent } from '@/components/atoms/MarkdownContent';
import { MainLayout } from '@/components/layout';
import { ChevronRight, Clock, Zap } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { getLevelTitle, XP_PER_LEVEL, getXpProgressInLevel } from '@llmengineer/shared';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: lesson, isLoading, error } = useGetLessonQuery(id!);
  const { data: progress } = useGetProgressQuery();
  const [completeLesson, { isLoading: isCompleting }] = useCompleteLessonMutation();
  const [startTime] = useState(Date.now());

  const totalXp = progress?.totalXp || 0;
  const level = progress?.level || 1;
  const levelTitle = getLevelTitle(level);
  const xpInCurrentLevel = getXpProgressInLevel(totalXp);
  const xpForNextLevel = XP_PER_LEVEL - xpInCurrentLevel;

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
      <Stack.Screen options={{ headerShown: false }} />
      <MainLayout
        totalXp={totalXp}
        level={level}
        levelTitle={levelTitle}
        xpForNextLevel={xpForNextLevel}
      >
        <ScrollView style={styles.container}>
          {/* Breadcrumb */}
          <View style={styles.breadcrumb}>
            <Pressable
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onPress={() => router.push('/dashboard/' as any)}
              style={styles.breadcrumbItem}
            >
              <Text style={styles.breadcrumbLink}>Dashboard</Text>
            </Pressable>
            <Icon icon={ChevronRight} size="sm" color="#6B7280" />
            <Pressable
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onPress={() => router.push('/lessons/' as any)}
              style={styles.breadcrumbItem}
            >
              <Text style={styles.breadcrumbLink}>Lecciones</Text>
            </Pressable>
            <Icon icon={ChevronRight} size="sm" color="#6B7280" />
            <Text style={styles.breadcrumbCurrent}>Semana {lesson.week}</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badges}>
              <View style={styles.weekBadge}>
                <Text style={styles.weekBadgeText}>Semana {lesson.week}</Text>
              </View>
              <View style={styles.xpBadge}>
                <Icon icon={Zap} size="sm" color="#10B981" />
                <Text style={styles.xpBadgeText}>+{lesson.xpReward} XP</Text>
              </View>
              <View style={styles.timeBadge}>
                <Icon icon={Clock} size="sm" color="#9CA3AF" />
                <Text style={styles.timeBadgeText}>{lesson.estimatedMinutes} min</Text>
              </View>
              {lesson.isCompleted && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>Completada</Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>{lesson.title}</Text>
            <Text style={styles.description}>{lesson.description}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {lesson.sections?.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <MarkdownContent content={section.content} />
                {section.keyPoints && section.keyPoints.length > 0 && (
                  <View style={styles.keyPointsContainer}>
                    <Text style={styles.keyPointsTitle}>Puntos clave</Text>
                    {section.keyPoints.map((point: string, pointIndex: number) => (
                      <View key={pointIndex} style={styles.keyPoint}>
                        <Text style={styles.keyPointBullet}>•</Text>
                        <Text style={styles.keyPointText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Complete Button */}
          {!lesson.isCompleted && (
            <Pressable
              style={[styles.completeButton, isCompleting && styles.buttonDisabled]}
              onPress={handleComplete}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.completeButtonContent}>
                  <Icon icon={Zap} size="md" color="#FFFFFF" />
                  <Text style={styles.completeButtonText}>
                    Completar Lección (+{lesson.xpReward} XP)
                  </Text>
                </View>
              )}
            </Pressable>
          )}

          {lesson.isCompleted && (
            <View style={styles.completedBanner}>
              <Text style={styles.completedText}>✓ Lección completada</Text>
            </View>
          )}
        </ScrollView>
      </MainLayout>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 30,
    paddingTop: 24,
    paddingBottom: 16,
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

  // Header
  header: {
    paddingHorizontal: 30,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  weekBadge: {
    backgroundColor: '#3B82F620',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  weekBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B98120',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  completedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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

  // Content
  content: {
    padding: 30,
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
  keyPointsContainer: {
    marginTop: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  keyPointsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  keyPointBullet: {
    fontSize: 16,
    color: '#10B981',
    width: 20,
  },
  keyPointText: {
    flex: 1,
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 22,
  },

  // Complete button
  completeButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 30,
    marginBottom: 48,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  completeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedBanner: {
    backgroundColor: '#10B98120',
    marginHorizontal: 30,
    marginBottom: 48,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B98140',
  },
  completedText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
});
