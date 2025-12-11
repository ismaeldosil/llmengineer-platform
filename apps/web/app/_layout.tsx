import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { store } from '@/store';
import { useAuth } from '@/hooks/useAuth';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoading, restoreSession } = useAuth();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await restoreSession();
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        await SplashScreen.hideAsync();
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
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#F9FAFB',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
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
