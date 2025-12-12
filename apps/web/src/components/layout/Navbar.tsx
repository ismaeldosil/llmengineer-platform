import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Bell, Zap, ChevronLeft, LogOut } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backLabel?: string;
  totalXp?: number;
  level?: number;
  levelTitle?: string;
  xpForNextLevel?: number;
  onLogout?: () => void;
}

export function Navbar({
  title,
  subtitle,
  showBack = false,
  backLabel = 'Volver al Dashboard',
  totalXp = 0,
  level = 1,
  levelTitle = 'Novato',
  xpForNextLevel = 16,
  onLogout,
}: NavbarProps) {
  return (
    <View style={styles.container}>
      {/* Left side - Back button or title */}
      <View style={styles.leftSection}>
        {showBack ? (
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Icon icon={ChevronLeft} size="md" variant="secondary" />
            <Text style={styles.backText}>{backLabel}</Text>
          </Pressable>
        ) : title ? (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        ) : null}
      </View>

      {/* Right side - Stats and actions */}
      <View style={styles.rightSection}>
        {/* Notifications */}
        <Pressable style={styles.iconButton}>
          <Icon icon={Bell} size="md" variant="secondary" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>0</Text>
          </View>
        </Pressable>

        {/* XP Display */}
        <View style={styles.xpContainer}>
          <Icon icon={Zap} size="sm" color="#facc15" />
          <Text style={styles.xpText}>{totalXp.toLocaleString()} XP</Text>
        </View>

        {/* Level Badge */}
        <View style={styles.levelContainer}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lvl {level}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelXpText}>
              {xpForNextLevel} XP para {levelTitle}
            </Text>
            <Text style={styles.levelTitleText}>Publisher</Text>
          </View>
        </View>

        {/* Settings / Logout */}
        {onLogout && (
          <Pressable style={styles.iconButton} onPress={onLogout}>
            <Icon icon={LogOut} size="md" variant="secondary" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    ...(Platform.OS === 'web' ? { minHeight: 64 } : { height: 64 }),
  },
  leftSection: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 4,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  levelInfo: {
    alignItems: 'flex-end',
  },
  levelXpText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  levelTitleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#f8fafc',
  },
});
