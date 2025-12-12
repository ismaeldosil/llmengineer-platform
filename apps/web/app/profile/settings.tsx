import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import type { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { Settings, Bell, Palette, Globe, LogOut, Info, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setShowLogoutModal(false);
    router.replace('/');
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Configuración',
          headerBackTitle: 'Perfil',
        }}
      />
      <ScrollView style={styles.container}>
        {/* Settings List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>

          {/* Notifications - Disabled (v2) */}
          <Pressable
            style={[styles.settingItem, styles.disabledItem]}
            disabled={true}
            accessibilityLabel="Notificaciones - Próximamente"
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
          >
            <View style={styles.settingIcon}>
              <Bell size={20} color="#6B7280" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Notificaciones</Text>
              <Text style={styles.comingSoonText}>Próximamente</Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </Pressable>

          {/* Theme - Disabled (v2) */}
          <Pressable
            style={[styles.settingItem, styles.disabledItem]}
            disabled={true}
            accessibilityLabel="Tema - Próximamente"
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
          >
            <View style={styles.settingIcon}>
              <Palette size={20} color="#6B7280" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Tema</Text>
              <Text style={styles.comingSoonText}>Próximamente</Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </Pressable>

          {/* Language - Disabled (v2) */}
          <Pressable
            style={[styles.settingItem, styles.disabledItem]}
            disabled={true}
            accessibilityLabel="Idioma - Próximamente"
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
          >
            <View style={styles.settingIcon}>
              <Globe size={20} color="#6B7280" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Idioma</Text>
              <Text style={styles.comingSoonText}>Próximamente</Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </Pressable>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Info size={20} color="#9CA3AF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Versión</Text>
              <Text style={styles.versionText}>0.1.0</Text>
            </View>
          </View>

          <View style={styles.creditsContainer}>
            <Text style={styles.creditsTitle}>Créditos</Text>
            <Text style={styles.creditsText}>
              LLM Engineer Platform es una plataforma educativa gamificada para aprender LLM Engineering.
            </Text>
            <Text style={styles.creditsText}>
              Desarrollado con React Native, Expo Router y NestJS.
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <Pressable
            style={styles.logoutButton}
            onPress={handleLogoutPress}
            accessibilityLabel="Cerrar sesión"
            accessibilityRole="button"
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que quieres cerrar sesión?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelLogout}
                accessibilityLabel="Cancelar"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
                accessibilityLabel="Confirmar cerrar sesión"
                accessibilityRole="button"
              >
                <Text style={styles.confirmButtonText}>Cerrar Sesión</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  disabledItem: {
    opacity: 0.5,
  },
  settingIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F9FAFB',
    marginBottom: 2,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  creditsContainer: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  creditsText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#1F2937',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  confirmButton: {
    backgroundColor: '#EF4444',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
