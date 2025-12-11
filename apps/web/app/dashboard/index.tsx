import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import type { RootState } from '@/store';
import { useGetProgressQuery, useGetLessonsQuery, useCheckinMutation } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { ProgressCard } from '@/components/molecules/ProgressCard';
import { LessonCard } from '@/components/molecules/LessonCard';
import { StreakBanner } from '@/components/molecules/StreakBanner';

export default function DashboardScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { logout } = useAuth();
  const { data: progress, isLoading: progressLoading } = useGetProgressQuery();
  const { data: lessons, isLoading: lessonsLoading } = useGetLessonsQuery();
  const [checkin] = useCheckinMutation();

  const nextLesson = lessons?.find((lesson) => !lesson.isCompleted);

  const handleCheckin = async () => {
    try {
      await checkin().unwrap();
    } catch (err) {
      console.error('Checkin failed:', err);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Dashboard', headerShown: false }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {user?.displayName || 'Estudiante'}</Text>
            <Text style={styles.subtitle}>Continúa tu aprendizaje</Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </Pressable>
        </View>

        <StreakBanner
          currentStreak={progress?.currentStreak || 0}
          onCheckin={handleCheckin}
        />

        <ProgressCard
          totalXp={progress?.totalXp || 0}
          level={progress?.level || 1}
          levelTitle={progress?.levelTitle || 'Prompt Curious'}
          lessonsCompleted={progress?.lessonsCompleted || 0}
          isLoading={progressLoading}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próxima Lección</Text>
            <Pressable onPress={() => router.push('/lessons')}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </Pressable>
          </View>

          {nextLesson && (
            <LessonCard
              lesson={nextLesson}
              onPress={() => router.push(`/lessons/${nextLesson.id}`)}
            />
          )}
        </View>

        <View style={styles.quickActions}>
          <Pressable style={styles.actionButton} onPress={() => router.push('/lessons')}>
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.actionText}>Lecciones</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => router.push('/games')}>
            <Text style={styles.actionIcon}>🎮</Text>
            <Text style={styles.actionText}>Mini-juegos</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => router.push('/leaderboard')}>
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={styles.actionText}>Ranking</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => router.push('/profile')}>
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>Perfil</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#7F1D1D',
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  seeAll: {
    fontSize: 14,
    color: '#3B82F6',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F9FAFB',
  },
});
