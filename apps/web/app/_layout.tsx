import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { store } from '@/store';
import { useAuth } from '@/hooks/useAuth';

// Keep the splash screen visible while we fetch resources (native only)
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

function RootLayoutNav() {
  const { isLoading, restoreSession } = useAuth();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await restoreSession();
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        if (Platform.OS !== 'web') {
          await SplashScreen.hideAsync();
        }
      }
    };

    initAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#111827',
        },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StatusBar style="light" />
      <RootLayoutNav />
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
});
