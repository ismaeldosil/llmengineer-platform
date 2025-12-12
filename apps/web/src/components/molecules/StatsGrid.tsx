import { View, Text, StyleSheet, Platform } from 'react-native';
import { Zap, Trophy, Flame, Target } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import type { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string | number;
  suffix?: string;
}

function StatCard({ icon, iconColor, label, value, suffix }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Icon icon={icon} size="lg" color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

interface StatsGridProps {
  totalXp: number;
  level: number;
  levelTitle: string;
  currentStreak: number;
  progressPercent: number;
  isLoading?: boolean;
}

export function StatsGrid({
  totalXp,
  level,
  levelTitle,
  currentStreak,
  progressPercent,
  isLoading,
}: StatsGridProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.card, styles.cardLoading]} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatCard
        icon={Zap}
        iconColor="#facc15"
        label="XP Total"
        value={totalXp.toLocaleString()}
      />
      <StatCard
        icon={Trophy}
        iconColor="#a855f7"
        label="Nivel"
        value={levelTitle}
      />
      <StatCard
        icon={Flame}
        iconColor="#f97316"
        label="Racha"
        value={currentStreak}
        suffix="días"
      />
      <StatCard
        icon={Target}
        iconColor="#3b82f6"
        label="Progreso"
        value={`${progressPercent}%`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 24,
    marginTop: 24,
    ...(Platform.OS === 'web' ? {} : { paddingHorizontal: 16 }),
  },
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardLoading: {
    height: 120,
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  suffix: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
});
