import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { LayoutDashboard, BookOpen, CheckCircle2, Zap } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';

interface Module {
  id: string;
  title: string;
  lessonsCompleted: number;
  totalLessons: number;
  isComplete: boolean;
}

interface SidebarProps {
  modules?: Module[];
  currentModuleId?: string;
}

const DEFAULT_MODULES: Module[] = [
  { id: '1', title: 'Setup + Fundamentos', lessonsCompleted: 5, totalLessons: 5, isComplete: true },
  { id: '2', title: 'Plugins Core + Web', lessonsCompleted: 6, totalLessons: 6, isComplete: true },
  { id: '3', title: 'Desarrollo + Build', lessonsCompleted: 5, totalLessons: 5, isComplete: true },
  { id: '4', title: 'Testing + App Store', lessonsCompleted: 0, totalLessons: 4, isComplete: false },
];

export function Sidebar({ modules = DEFAULT_MODULES, currentModuleId }: SidebarProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard' || pathname === '/';

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Pressable style={styles.logoContainer} onPress={() => router.push('/dashboard/' as any)}>
        <View style={styles.logoIcon}>
          <Icon icon={Zap} size="lg" color="#22c55e" />
        </View>
        <Text style={styles.logoText}>LLM Engineer</Text>
      </Pressable>

      {/* Dashboard Link */}
      <Pressable
        style={[styles.navItem, isDashboard && styles.navItemActive]}
        onPress={() => router.push('/dashboard/' as any)}
      >
        <Icon icon={LayoutDashboard} size="md" variant={isDashboard ? 'primary' : 'secondary'} />
        <Text style={[styles.navItemText, isDashboard && styles.navItemTextActive]}>
          Dashboard
        </Text>
      </Pressable>

      {/* Modules Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MÓDULOS</Text>
      </View>

      {modules.map((module) => {
        const isActive = currentModuleId === module.id;
        const progress = module.totalLessons > 0
          ? Math.round((module.lessonsCompleted / module.totalLessons) * 100)
          : 0;

        return (
          <Pressable
            key={module.id}
            style={[styles.moduleItem, isActive && styles.moduleItemActive]}
            onPress={() => router.push(`/lessons/?module=${module.id}` as any)}
          >
            <View style={styles.moduleIconContainer}>
              {module.isComplete ? (
                <Icon icon={CheckCircle2} size="md" color="#22c55e" />
              ) : (
                <Icon icon={BookOpen} size="md" variant="secondary" />
              )}
            </View>
            <View style={styles.moduleInfo}>
              <Text
                style={[styles.moduleTitle, isActive && styles.moduleTitleActive]}
                numberOfLines={1}
              >
                {module.title}
              </Text>
              {!module.isComplete && (
                <Text style={styles.moduleProgress}>
                  {module.lessonsCompleted}/{module.totalLessons} lecciones
                </Text>
              )}
            </View>
            {module.isComplete && (
              <View style={styles.completeBadge}>
                <Text style={styles.completeBadgeText}>{progress}%</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    backgroundColor: '#0f172a',
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
    paddingVertical: 16,
    ...(Platform.OS === 'web' ? { height: '100vh' as unknown as number } : { flex: 1 }),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginLeft: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: '#1e3a8a',
  },
  navItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#94a3b8',
    marginLeft: 12,
  },
  navItemTextActive: {
    color: '#f8fafc',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 1,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  moduleItemActive: {
    backgroundColor: '#1e293b',
  },
  moduleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#cbd5e1',
  },
  moduleTitleActive: {
    color: '#f8fafc',
  },
  moduleProgress: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  completeBadge: {
    backgroundColor: '#166534',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  completeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22c55e',
  },
});
