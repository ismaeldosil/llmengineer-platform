import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export default function AuthLayout() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace('/dashboard/' as any);
    }
  }, [isAuthenticated]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#111827',
        },
        headerTintColor: '#F9FAFB',
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: '#111827',
        },
      }}
    />
  );
}
