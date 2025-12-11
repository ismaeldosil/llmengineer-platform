import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, Stack, router } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export default function Home() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated]);

  return (
    <>
      <Stack.Screen options={{ title: 'LLM Engineer' }} />
      <View style={styles.container}>
        <Text style={styles.title}>LLM Engineer Platform</Text>
        <Text style={styles.subtitle}>Aprende LLM Engineering en 8 semanas</Text>

        <View style={styles.buttonContainer}>
          <Link href="/auth/login" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </Pressable>
          </Link>

          <Link href="/auth/register" asChild>
            <Pressable style={[styles.button, styles.buttonSecondary]}>
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Registrarse</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 48,
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 320,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#3B82F6',
  },
});
