import { View, StyleSheet, Platform } from 'react-native';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';

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
