import { Stack, Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export default function LeaderboardLayout() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#111827',
        },
        headerTintColor: '#F9FAFB',
        contentStyle: {
          backgroundColor: '#111827',
        },
      }}
    />
  );
}
