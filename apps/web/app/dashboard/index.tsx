import { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  useGetProgressQuery,
  useGetMeQuery,
  useGetNextLessonQuery,
  useCheckinMutation,
} from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import {
  ProgressCard,
  StreakBanner,
  DashboardHeader,
  QuickActionsGrid,
  NextLessonWidget,
  type QuickAction,
} from '@/components/molecules';

export default function DashboardScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: userData,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useGetMeQuery();
  const {
    data: progress,
    isLoading: progressLoading,
    refetch: refetchProgress,
  } = useGetProgressQuery();
  const {
    data: nextLesson,
    isLoading: nextLessonLoading,
    refetch: refetchNextLesson,
  } = useGetNextLessonQuery();
  const [checkin] = useCheckinMutation();

  const displayName = user?.displayName || userData?.displayName || 'Estudiante';

  const handleCheckin = async () => {
    try {
      await checkin().unwrap();
    } catch (err) {
      console.error('Checkin failed:', err);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesion', '¿Estas seguro que deseas cerrar sesion?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesion',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchUser(), refetchProgress(), refetchNextLesson()]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchUser, refetchProgress, refetchNextLesson]);

  const quickActions: QuickAction[] = [
    {
      id: 'lessons',
      icon: '📚',
      label: 'Lecciones',
      onPress: () => router.push('/lessons'),
    },
    {
      id: 'games',
      icon: '🎮',
      label: 'Mini-juegos',
      onPress: () => router.push('/games'),
    },
    {
      id: 'leaderboard',
      icon: '🏆',
      label: 'Ranking',
      onPress: () => router.push('/leaderboard'),
    },
    {
      id: 'profile',
      icon: '👤',
      label: 'Perfil',
      onPress: () => router.push('/profile'),
    },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Dashboard', headerShown: false }} />
      <View style={styles.container}>
        <DashboardHeader
          displayName={displayName}
          onProfilePress={() => router.push('/profile')}
          onLogoutPress={handleLogout}
        />

        <ScrollView
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        >
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

          <NextLessonWidget
            lesson={nextLesson}
            isLoading={nextLessonLoading}
            onPress={() => nextLesson && router.push(`/lessons/${nextLesson.id}`)}
            onViewAll={() => router.push('/lessons')}
          />

          <QuickActionsGrid actions={quickActions} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollContainer: {
    flex: 1,
  },
});
