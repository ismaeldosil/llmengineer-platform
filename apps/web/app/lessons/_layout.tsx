import { Stack, Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export default function LessonsLayout() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a',
        },
        headerTintColor: '#F9FAFB',
        contentStyle: {
          backgroundColor: '#0f172a',
        },
      }}
    />
  );
}
