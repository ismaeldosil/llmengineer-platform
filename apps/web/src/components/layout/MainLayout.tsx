import { View, StyleSheet, Platform } from 'react-native';
import { useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { useGetLessonsQuery } from '@/services/api';

// Nombres de las semanas del curso
const WEEK_TITLES: Record<number, string> = {
  1: 'Fundamentos',
  2: 'Prompting Básico',
  3: 'Contexto',
  4: 'Outputs y Errores',
  5: 'Producción Básica',
  6: 'RAG',
  7: 'Evaluación y Agentes',
  8: 'Agentes Avanzados',
  9: 'Fine-tuning y MLOps',
  10: 'Modelos Especializados',
};

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backLabel?: string;
  totalXp?: number;
  level?: number;
  levelTitle?: string;
  xpForNextLevel?: number;
  currentModuleId?: string;
  onLogout?: () => void;
}

export function MainLayout({
  children,
  title,
  subtitle,
  showBack = false,
  backLabel,
  totalXp = 0,
  level = 1,
  levelTitle = 'Novato',
  xpForNextLevel = 16,
  currentModuleId,
  onLogout,
}: MainLayoutProps) {
  const { isCollapsed, toggleCollapsed } = useSidebarCollapsed();
  const { data: lessons } = useGetLessonsQuery();

  // Transform lessons into modules grouped by week
  const modules = useMemo(() => {
    if (!lessons) return [];

    const byWeek: Record<number, { completed: number; total: number }> = {};

    for (const lesson of lessons) {
      if (!byWeek[lesson.week]) {
        byWeek[lesson.week] = { completed: 0, total: 0 };
      }
      byWeek[lesson.week].total++;
      if (lesson.isCompleted) {
        byWeek[lesson.week].completed++;
      }
    }

    return Object.entries(byWeek)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([week, data]) => ({
        id: week,
        title: `Semana ${week}: ${WEEK_TITLES[Number(week)] || ''}`,
        lessonsCompleted: data.completed,
        totalLessons: data.total,
        isComplete: data.completed === data.total && data.total > 0,
      }));
  }, [lessons]);

  // On mobile, don't show sidebar
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.mobileContainer}>
        <Navbar
          title={title}
          subtitle={subtitle}
          showBack={showBack}
          backLabel={backLabel}
          totalXp={totalXp}
          level={level}
          levelTitle={levelTitle}
          xpForNextLevel={xpForNextLevel}
          onLogout={onLogout}
        />
        <View style={styles.mobileContent}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Sidebar
        modules={modules}
        currentModuleId={currentModuleId}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapsed}
      />
      <View style={styles.mainArea}>
        <Navbar
          title={title}
          subtitle={subtitle}
          showBack={showBack}
          backLabel={backLabel}
          totalXp={totalXp}
          level={level}
          levelTitle={levelTitle}
          xpForNextLevel={xpForNextLevel}
          onLogout={onLogout}
        />
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#111827',
  },
  mainArea: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    backgroundColor: '#111827',
    paddingRight: 8,
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  mobileContent: {
    flex: 1,
  },
});
