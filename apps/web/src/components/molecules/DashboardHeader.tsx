import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DashboardHeaderProps {
  displayName: string;
  avatarUrl?: string;
  onProfilePress: () => void;
  onLogoutPress: () => void;
}

export function DashboardHeader({
  displayName,
  avatarUrl,
  onProfilePress,
  onLogoutPress,
}: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View>
          <Text style={styles.greeting}>Hola, {displayName}</Text>
          <Text style={styles.subtitle}>Continua tu aprendizaje</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Pressable
          style={styles.avatarButton}
          onPress={onProfilePress}
          testID="avatar-button"
        >
          {avatarUrl ? (
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          ) : (
            <Ionicons name="person-circle-outline" size={40} color="#3B82F6" />
          )}
        </Pressable>

        <Pressable
          style={styles.logoutButton}
          onPress={onLogoutPress}
          testID="logout-button"
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#111827',
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#7F1D1D',
  },
});
