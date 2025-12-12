import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  useGetProgressQuery,
  useGetMeQuery,
  useGetLessonsQuery,
  useCheckinMutation,
} from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout';
import { StatsGrid, GlobalProgress, ModuleCard } from '@/components/molecules';
import { getLevelTitle, XP_PER_LEVEL, getXpProgressInLevel } from '@llmengineer/shared';
import { Rocket } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';

// Group lessons by week/module
interface Module {
  id: string;
  title: string;
  description: string;
  lessonsCompleted: number;
  totalLessons: number;
  isComplete: boolean;
}

const MODULE_INFO: Record<number, { title: string; description: string }> = {
  1: {
    title: 'Setup + Fundamentos',
    description: 'Configurar el environment y entender la arquitectura',
  },
  2: { title: 'Plugins Core + Web', description: 'Dominar los plugins principales' },
  3: { title: 'Desarrollo + Build', description: 'Compilar y desplegar para Android e iOS' },
  4: { title: 'Testing + App Store', description: 'Preparar y publicar en las tiendas de apps' },
};

export default function DashboardScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: userData } = useGetMeQuery();
  const {
    data: progress,
    isLoading: progressLoading,
    refetch: refetchProgress,
  } = useGetProgressQuery();
  const {
    data: lessons,
    isLoading: lessonsLoading,
    refetch: refetchLessons,
  } = useGetLessonsQuery();
  const [checkin] = useCheckinMutation();

  const displayName = user?.displayName || userData?.displayName || 'Developer';
  const totalXp = progress?.totalXp || 0;
  const level = progress?.level || 1;
  const levelTitle = getLevelTitle(level);
  const xpInCurrentLevel = getXpProgressInLevel(totalXp);
  const xpForNextLevel = XP_PER_LEVEL - xpInCurrentLevel;

  // Calculate modules from lessons
  const modules: Module[] = Object.entries(MODULE_INFO).map(([week, info]) => {
    const weekLessons = lessons?.filter((l) => l.week === Number(week)) || [];
    const completed = weekLessons.filter((l) => l.isCompleted).length;
    return {
      id: week,
      title: info.title,
      description: info.description,
      lessonsCompleted: completed,
      totalLessons: weekLessons.length,
      isComplete: weekLessons.length > 0 && completed === weekLessons.length,
    };
  });

  const totalLessons = lessons?.length || 0;
  const completedLessons = lessons?.filter((l) => l.isCompleted).length || 0;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to log out?')) {
        logout();
      }
    } else {
      Alert.alert('Cerrar Sesion', '¿Estas seguro que deseas cerrar sesion?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesion', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchProgress(), refetchLessons()]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchProgress, refetchLessons]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MainLayout
        totalXp={totalXp}
        level={level}
        levelTitle={levelTitle}
        xpForNextLevel={xpForNextLevel}
        onLogout={handleLogout}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        >
          {/* Welcome Header */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeHeader}>
              <Text style={styles.welcomeTitle}>¡Bienvenido, {displayName}! </Text>
              <Icon icon={Rocket} size="lg" color="#a855f7" />
            </View>
            <Text style={styles.welcomeSubtitle}>
              Continúa tu camino para convertirte en un experto de LLM Engineering
            </Text>
          </View>

          {/* Stats Grid */}
          <StatsGrid
            totalXp={totalXp}
            level={level}
            levelTitle={levelTitle}
            currentStreak={progress?.currentStreak || 0}
            progressPercent={progressPercent}
            isLoading={progressLoading}
          />

          {/* Global Progress */}
          <GlobalProgress
            title="Progreso General"
            current={completedLessons}
            total={totalLessons}
            isLoading={lessonsLoading}
          />

          {/* Modules Section */}
          <View style={styles.modulesSection}>
            <Text style={styles.sectionTitle}>Módulos del Curso</Text>
            <View style={styles.modulesGrid}>
              {modules.map((module) => (
                <View key={module.id} style={styles.moduleCardWrapper}>
                  <ModuleCard
                    id={module.id}
                    title={module.title}
                    description={module.description}
                    lessonsCompleted={module.lessonsCompleted}
                    totalLessons={module.totalLessons}
                    isComplete={module.isComplete}
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </MainLayout>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  welcomeSection: {
    paddingHorizontal: 30,
    paddingTop: 24,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 8,
  },
  modulesSection: {
    paddingHorizontal: 30,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 16,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  moduleCardWrapper: {
    width: '48.5%',
    marginBottom: 0,
  },
});
