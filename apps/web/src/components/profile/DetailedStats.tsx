import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Clock, Award, Flame, Calendar } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import type { LucideIcon } from 'lucide-react-native';

export interface DetailedStatsProps {
  stats: {
    totalStudyTime: number; // minutes
    quizAverage: number;
    xpByWeek: { week: string; xp: number }[];
    lessonsByWeek: { week: string; count: number }[];
    longestStreak: number;
    registrationDate: Date;
  };
  loading?: boolean;
}

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string;
  description?: string;
}

function StatCard({ icon, iconColor, label, value, description }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Icon icon={icon} size="lg" color={iconColor} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {description && <Text style={styles.statDescription}>{description}</Text>}
      </View>
    </View>
  );
}

interface BarChartProps {
  title: string;
  data: { week: string; xp?: number; count?: number }[];
  color: string;
  valueKey: 'xp' | 'count';
  suffix?: string;
}

function BarChart({ title, data, color, valueKey, suffix = '' }: BarChartProps) {
  // Calculate max value for scaling
  const maxValue = Math.max(...data.map((item) => item[valueKey] || 0), 1);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.chart}>
        {data.map((item, index) => {
          const value = item[valueKey] || 0;
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(height, 2)}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>
                {value}
                {suffix}
              </Text>
              <Text style={styles.barLabel} numberOfLines={1}>
                {item.week}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={[styles.statCard, styles.skeletonCard]} />
        <View style={[styles.statCard, styles.skeletonCard]} />
        <View style={[styles.statCard, styles.skeletonCard]} />
        <View style={[styles.statCard, styles.skeletonCard]} />
      </View>
      <View style={[styles.chartContainer, styles.skeletonChart]} />
      <View style={[styles.chartContainer, styles.skeletonChart]} />
    </ScrollView>
  );
}

function formatStudyTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function DetailedStats({ stats, loading = false }: DetailedStatsProps) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  const { totalStudyTime, quizAverage, xpByWeek, lessonsByWeek, longestStreak, registrationDate } =
    stats;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Stats Cards Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon={Clock}
            iconColor="#3b82f6"
            label="Tiempo Total de Estudio"
            value={formatStudyTime(totalStudyTime)}
            description={`${totalStudyTime} minutos`}
          />
          <StatCard
            icon={Award}
            iconColor="#22c55e"
            label="Promedio en Quizzes"
            value={`${Math.round(quizAverage)}%`}
            description="Calificación promedio"
          />
          <StatCard
            icon={Flame}
            iconColor="#f97316"
            label="Mejor Racha"
            value={`${longestStreak} días`}
            description="Racha más larga"
          />
          <StatCard
            icon={Calendar}
            iconColor="#a855f7"
            label="Miembro Desde"
            value={formatDate(registrationDate)}
            description="Fecha de registro"
          />
        </View>
      </View>

      {/* XP by Week Chart */}
      {xpByWeek.length > 0 && (
        <View style={styles.section}>
          <BarChart
            title="XP Ganado por Semana"
            data={xpByWeek}
            color="#facc15"
            valueKey="xp"
            suffix=" XP"
          />
        </View>
      )}

      {/* Lessons by Week Chart */}
      {lessonsByWeek.length > 0 && (
        <View style={styles.section}>
          <BarChart
            title="Lecciones Completadas por Semana"
            data={lessonsByWeek}
            color="#3b82f6"
            valueKey="count"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  statDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  chartContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    gap: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    minHeight: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f8fafc',
    marginTop: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  skeletonCard: {
    height: 96,
    opacity: 0.5,
  },
  skeletonChart: {
    height: 280,
    opacity: 0.5,
  },
});
