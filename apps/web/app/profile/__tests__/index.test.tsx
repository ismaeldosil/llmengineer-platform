import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProfileScreen from '../index';
import authReducer, { logout } from '@/store/slices/authSlice';
import progressReducer from '@/store/slices/progressSlice';
import { apiSlice } from '@/services/api';
import type { User, UserProgress, Badge } from '@llmengineer/shared';

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: any) => null,
  },
  router: {
    replace: (path: string) => mockReplace(path),
  },
}));

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockProgress: UserProgress = {
  totalXp: 1250,
  level: 3,
  levelTitle: 'Prompt Apprentice',
  currentStreak: 5,
  longestStreak: 10,
  lessonsCompleted: 8,
  badges: [],
};

const mockBadges: { earned: Badge[]; locked: Badge[] } = {
  earned: [
    {
      id: '1',
      slug: 'first-lesson',
      name: 'Primera Lección',
      description: 'Completaste tu primera lección',
      icon: '🎯',
      category: 'progress',
      earnedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: '2',
      slug: 'week-streak',
      name: 'Racha de 7 días',
      description: 'Mantuviste una racha de 7 días',
      icon: '🔥',
      category: 'streak',
      earnedAt: '2024-01-08T00:00:00.000Z',
    },
  ],
  locked: [
    {
      id: '3',
      slug: 'month-streak',
      name: 'Racha de 30 días',
      description: 'Mantén una racha de 30 días',
      icon: '🔥',
      category: 'streak',
    },
    {
      id: '4',
      slug: 'all-lessons',
      name: 'Maestro Completo',
      description: 'Completa todas las lecciones',
      icon: '🏆',
      category: 'completion',
    },
  ],
};

// Mock API hooks
let mockGetProgressQuery = jest.fn();
let mockGetBadgesQuery = jest.fn();

jest.mock('@/services/api', () => {
  const actual = jest.requireActual('@/services/api');
  return {
    ...actual,
    useGetProgressQuery: () => mockGetProgressQuery(),
    useGetBadgesQuery: () => mockGetBadgesQuery(),
  };
});

const createMockStore = (user: User | null = mockUser) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      progress: progressReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    preloadedState: {
      auth: {
        user,
        token: user ? 'mock-token' : null,
        isAuthenticated: !!user,
        isLoading: false,
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });

  return store;
};

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();

    // Default mock responses
    mockGetProgressQuery.mockReturnValue({
      data: mockProgress,
      isLoading: false,
      isError: false,
    });

    mockGetBadgesQuery.mockReturnValue({
      data: mockBadges,
      isLoading: false,
      isError: false,
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when progress is loading', () => {
      mockGetProgressQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Cargando perfil...')).toBeTruthy();
    });

    it('should show loading indicator when badges are loading', () => {
      mockGetBadgesQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Cargando perfil...')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should show error message when progress fails to load', () => {
      mockGetProgressQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      });

      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Error al cargar el perfil')).toBeTruthy();
      expect(getByText('Por favor, intenta nuevamente')).toBeTruthy();
    });

    it('should show error message when badges fail to load', () => {
      mockGetBadgesQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      });

      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Error al cargar el perfil')).toBeTruthy();
    });
  });

  describe('User Information', () => {
    it('should display user avatar with first letter of displayName', () => {
      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('T')).toBeTruthy(); // First letter of "Test User"
    });

    it('should display user displayName and email', () => {
      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Test User')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
    });

    it('should display level and level title', () => {
      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Nivel 3 • Prompt Apprentice')).toBeTruthy();
    });

    it('should show fallback avatar when user has no displayName', () => {
      const userWithoutName = { ...mockUser, displayName: '' };
      const store = createMockStore(userWithoutName);
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('?')).toBeTruthy();
    });
  });

  describe('Progress Stats', () => {
    it('should display total XP with proper formatting', () => {
      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('1,250')).toBeTruthy(); // Formatted XP
      expect(getByText('XP Total')).toBeTruthy();
    });

    it('should display lessons completed count', () => {
      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('8')).toBeTruthy();
      expect(getByText('Lecciones')).toBeTruthy();
    });

    it('should display longest streak', () => {
      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('10')).toBeTruthy();
      expect(getByText('Mejor Racha')).toBeTruthy();
    });

    it('should show 0 for stats when progress is undefined', () => {
      mockGetProgressQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });

      const store = createMockStore();
      const { getAllByText, getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      // Should show "0" for multiple stats
      const zeros = getAllByText('0');
      expect(zeros.length).toBeGreaterThan(0);
      expect(getByText('Nivel 1 • Prompt Curious')).toBeTruthy(); // Default values
    });
  });

  describe('Current Streak Display', () => {
    it('should display current streak with correct emoji for 7+ days', () => {
      mockGetProgressQuery.mockReturnValue({
        data: { ...mockProgress, currentStreak: 7 },
        isLoading: false,
        isError: false,
      });

      const store = createMockStore();
      const { getByText, getAllByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      // There might be multiple fire emojis (streak + badges), so use getAllByText
      const fireEmojis = getAllByText('🔥');
      expect(fireEmojis.length).toBeGreaterThan(0);
      expect(getByText('7 días')).toBeTruthy();
      expect(getByText('Racha actual')).toBeTruthy();
    });

    it('should display current streak with correct emoji for 3-6 days', () => {
      const store = createMockStore(); // currentStreak is 5
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('⚡')).toBeTruthy();
      expect(getByText('5 días')).toBeTruthy();
    });

    it('should display current streak with correct emoji for 0-2 days', () => {
      mockGetProgressQuery.mockReturnValue({
        data: { ...mockProgress, currentStreak: 2 },
        isLoading: false,
        isError: false,
      });

      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('✨')).toBeTruthy();
      expect(getByText('2 días')).toBeTruthy();
    });
  });

  describe('Badges', () => {
    it('should display earned badges', () => {
      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Insignias Ganadas')).toBeTruthy();
      expect(getByText('Primera Lección')).toBeTruthy();
      expect(getByText('Racha de 7 días')).toBeTruthy();
      expect(getByText('🎯')).toBeTruthy();
    });

    it('should display locked badges', () => {
      const store = createMockStore();
      const { getByText, getAllByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Próximas Insignias')).toBeTruthy();
      expect(getByText('Racha de 30 días')).toBeTruthy();
      expect(getByText('Maestro Completo')).toBeTruthy();

      // Locked badges should show lock icons
      const lockIcons = getAllByText('🔒');
      expect(lockIcons.length).toBe(2);
    });

    it('should show message when no badges are earned', () => {
      mockGetBadgesQuery.mockReturnValue({
        data: { earned: [], locked: mockBadges.locked },
        isLoading: false,
        isError: false,
      });

      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Aún no tienes insignias')).toBeTruthy();
    });

    it('should limit locked badges display to 6', () => {
      const manyLockedBadges = {
        earned: mockBadges.earned,
        locked: Array.from({ length: 10 }, (_, i) => ({
          id: `locked-${i}`,
          name: `Badge ${i}`,
          description: `Description ${i}`,
          icon: '🔒',
          category: 'progress' as const,
        })),
      };

      mockGetBadgesQuery.mockReturnValue({
        data: manyLockedBadges,
        isLoading: false,
        isError: false,
      });

      const store = createMockStore();
      const { getAllByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      // Should show only 6 lock icons for locked badges
      const lockIcons = getAllByText('🔒');
      expect(lockIcons.length).toBe(6);
    });
  });

  describe('Edit Profile Button', () => {
    it('should render edit profile button', () => {
      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Editar Perfil')).toBeTruthy();
    });

    it('should call handleEditProfile when edit button is pressed', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      const editButton = getByText('Editar Perfil');
      fireEvent.press(editButton);

      expect(consoleSpy).toHaveBeenCalledWith('Edit profile - to be implemented');
      consoleSpy.mockRestore();
    });

    it('should have correct accessibility props', () => {
      const store = createMockStore();
      const { getByLabelText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      const editButton = getByLabelText('Editar perfil');
      expect(editButton).toBeTruthy();
      expect(editButton.props.accessibilityRole).toBe('button');
    });
  });

  describe('Logout Functionality', () => {
    it('should render logout button in settings section', () => {
      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Configuración')).toBeTruthy();
      expect(getByText('Cerrar Sesión')).toBeTruthy();
    });

    it('should dispatch logout action and navigate to home when logout is pressed', () => {
      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      const logoutButton = getByText('Cerrar Sesión');
      fireEvent.press(logoutButton);

      // Check that router.replace was called with '/'
      expect(mockReplace).toHaveBeenCalledWith('/');

      // Check that auth state was cleared
      const state = store.getState();
      expect(state.auth.user).toBeNull();
      expect(state.auth.token).toBeNull();
      expect(state.auth.isAuthenticated).toBe(false);
    });

    it('should have correct accessibility props for logout button', () => {
      const store = createMockStore();
      const { getByLabelText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      const logoutButton = getByLabelText('Cerrar sesión');
      expect(logoutButton).toBeTruthy();
      expect(logoutButton.props.accessibilityRole).toBe('button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null user gracefully', () => {
      const store = createMockStore(null);
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      // Should still render without crashing
      expect(getByText('?')).toBeTruthy(); // Fallback avatar
    });

    it('should handle empty badges array', () => {
      mockGetBadgesQuery.mockReturnValue({
        data: { earned: [], locked: [] },
        isLoading: false,
        isError: false,
      });

      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Aún no tienes insignias')).toBeTruthy();
    });

    it('should handle large XP numbers with proper formatting', () => {
      mockGetProgressQuery.mockReturnValue({
        data: { ...mockProgress, totalXp: 1234567 },
        isLoading: false,
        isError: false,
      });

      const store = createMockStore();
      const { getByText } = render(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('1,234,567')).toBeTruthy();
    });
  });
});
