import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useGetProgressQuery, useGetBadgesQuery } from '@/services/api';
import { Settings } from 'lucide-react-native';

export default function ProfileScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const {
    data: progress,
    isLoading: progressLoading,
    isError: progressError,
  } = useGetProgressQuery();
  const { data: badges, isLoading: badgesLoading, isError: badgesError } = useGetBadgesQuery();

  const handleEditProfile = () => {
    // Placeholder for future implementation
    // TODO: Implement edit profile modal
  };

  const handleNavigateToSettings = () => {
    router.push('/profile/settings');
  };

  const isLoading = progressLoading || badgesLoading;
  const hasError = progressError || badgesError;

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Perfil' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <Stack.Screen options={{ title: 'Perfil' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>Error al cargar el perfil</Text>
          <Text style={styles.errorSubtext}>Por favor, intenta nuevamente</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Perfil' }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.displayName}>{user?.displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>
              Nivel {progress?.level || 1} • {progress?.levelTitle || 'Prompt Curious'}
            </Text>
          </View>
          <Pressable
            style={styles.editButton}
            onPress={handleEditProfile}
            accessibilityLabel="Editar perfil"
            accessibilityRole="button"
          >
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </Pressable>
        </View>

        {/* Current Streak Display */}
        <View style={styles.streakContainer}>
          <Text style={styles.streakEmoji}>
            {progress?.currentStreak && progress.currentStreak >= 7
              ? '🔥'
              : progress?.currentStreak && progress.currentStreak >= 3
                ? '⚡'
                : '✨'}
          </Text>
          <View style={styles.streakInfo}>
            <Text style={styles.streakCount}>{progress?.currentStreak || 0} días</Text>
            <Text style={styles.streakLabel}>Racha actual</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress?.totalXp?.toLocaleString() || 0}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress?.lessonsCompleted || 0}</Text>
            <Text style={styles.statLabel}>Lecciones</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress?.longestStreak || 0}</Text>
            <Text style={styles.statLabel}>Mejor Racha</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insignias Ganadas</Text>
          <View style={styles.badgesGrid}>
            {badges?.earned.map((badge) => (
              <View key={badge.id} style={styles.badge}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
            {(!badges?.earned || badges.earned.length === 0) && (
              <Text style={styles.emptyText}>Aún no tienes insignias</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas Insignias</Text>
          <View style={styles.badgesGrid}>
            {badges?.locked.slice(0, 6).map((badge) => (
              <View key={badge.id} style={[styles.badge, styles.lockedBadge]}>
                <Text style={styles.badgeIcon}>🔒</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          <Pressable
            style={styles.settingsButton}
            onPress={handleNavigateToSettings}
            accessibilityLabel="Ir a configuración"
            accessibilityRole="button"
          >
            <Settings size={20} color="#3B82F6" />
            <Text style={styles.settingsButtonText}>Configuración</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  levelBadge: {
    backgroundColor: '#3B82F620',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  streakLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  stats: {
    flexDirection: 'row',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#374151',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#374151',
  },
  lockedBadge: {
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    color: '#F9FAFB',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  settingsSection: {
    padding: 24,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    backgroundColor: '#1F2937',
    gap: 8,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
