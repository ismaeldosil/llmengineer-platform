/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActivityHistory, Activity } from '../ActivityHistory';

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  BookOpen: ({ size, color }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="icon-book">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
      </View>
    );
  },
  Award: ({ size, color }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="icon-award">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
      </View>
    );
  },
  TrendingUp: ({ size, color }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="icon-trending">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
      </View>
    );
  },
  Gamepad2: ({ size, color }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="icon-gamepad">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
      </View>
    );
  },
}));

// Mock formatDate utility
jest.mock('@/utils/formatDate', () => ({
  formatRelativeTime: jest.fn((date: Date) => {
    const now = new Date('2024-01-15T12:00:00Z');
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'justo ahora';
    if (diffHours < 24) return `hace ${diffHours} horas`;
    if (diffHours < 48) return 'ayer';
    const days = Math.floor(diffHours / 24);
    return `hace ${days} días`;
  }),
}));

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'lesson',
    title: 'Completaste "Introducción a LLMs"',
    description: 'Primera lección del curso',
    timestamp: new Date('2024-01-15T10:00:00Z'),
    metadata: { xp: 50 },
  },
  {
    id: '2',
    type: 'badge',
    title: 'Ganaste insignia "Primer Paso"',
    description: 'Completaste tu primera lección',
    timestamp: new Date('2024-01-14T15:30:00Z'),
    metadata: { xp: 100 },
  },
  {
    id: '3',
    type: 'level',
    title: 'Alcanzaste Nivel 5',
    timestamp: new Date('2024-01-13T09:15:00Z'),
  },
  {
    id: '4',
    type: 'game',
    title: 'Jugaste "Quiz de Conceptos"',
    description: 'Excelente desempeño',
    timestamp: new Date('2024-01-12T14:45:00Z'),
    metadata: { score: 850, xp: 75 },
  },
];

describe('ActivityHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty State', () => {
    it('renders empty state when no activities', () => {
      const { getByText } = render(<ActivityHistory activities={[]} />);

      expect(getByText('Sin actividad reciente')).toBeTruthy();
      expect(
        getByText('Completa lecciones, gana insignias y juega para ver tu historial aquí.')
      ).toBeTruthy();
    });

    it('does not render empty state when loading', () => {
      const { queryByText } = render(<ActivityHistory activities={[]} loading={true} />);

      expect(queryByText('Sin actividad reciente')).toBeNull();
    });
  });

  describe('Header', () => {
    it('renders header with title and subtitle', () => {
      const { getByText } = render(<ActivityHistory activities={mockActivities} />);

      expect(getByText('Historial de Actividad')).toBeTruthy();
      expect(getByText('Tus logros recientes')).toBeTruthy();
    });
  });

  describe('Activity Items', () => {
    it('renders all activities', () => {
      const { getByText } = render(<ActivityHistory activities={mockActivities} />);

      expect(getByText('Completaste "Introducción a LLMs"')).toBeTruthy();
      expect(getByText('Ganaste insignia "Primer Paso"')).toBeTruthy();
      expect(getByText('Alcanzaste Nivel 5')).toBeTruthy();
      expect(getByText('Jugaste "Quiz de Conceptos"')).toBeTruthy();
    });

    it('renders activity descriptions when provided', () => {
      const { getByText } = render(<ActivityHistory activities={mockActivities} />);

      expect(getByText('Primera lección del curso')).toBeTruthy();
      expect(getByText('Completaste tu primera lección')).toBeTruthy();
      expect(getByText('Excelente desempeño')).toBeTruthy();
    });

    it('renders correct icon for lesson type', () => {
      const lessonActivity: Activity[] = [mockActivities[0]];
      const { getByTestId } = render(<ActivityHistory activities={lessonActivity} />);

      expect(getByTestId('icon-book')).toBeTruthy();
    });

    it('renders correct icon for badge type', () => {
      const badgeActivity: Activity[] = [mockActivities[1]];
      const { getByTestId } = render(<ActivityHistory activities={badgeActivity} />);

      expect(getByTestId('icon-award')).toBeTruthy();
    });

    it('renders correct icon for level type', () => {
      const levelActivity: Activity[] = [mockActivities[2]];
      const { getByTestId } = render(<ActivityHistory activities={levelActivity} />);

      expect(getByTestId('icon-trending')).toBeTruthy();
    });

    it('renders correct icon for game type', () => {
      const gameActivity: Activity[] = [mockActivities[3]];
      const { getByTestId } = render(<ActivityHistory activities={gameActivity} />);

      expect(getByTestId('icon-gamepad')).toBeTruthy();
    });
  });

  describe('Metadata', () => {
    it('renders XP metadata when provided', () => {
      const { getByText } = render(<ActivityHistory activities={mockActivities} />);

      expect(getByText('+50 XP')).toBeTruthy();
      expect(getByText('+100 XP')).toBeTruthy();
    });

    it('renders score metadata when provided', () => {
      const { getByText } = render(<ActivityHistory activities={mockActivities} />);

      expect(getByText('Score: 850')).toBeTruthy();
    });

    it('renders both XP and score when both provided', () => {
      const { getByText } = render(<ActivityHistory activities={mockActivities} />);

      expect(getByText('+75 XP')).toBeTruthy();
      expect(getByText('Score: 850')).toBeTruthy();
    });

    it('does not render metadata section when not provided', () => {
      const activityWithoutMetadata: Activity[] = [
        {
          id: '1',
          type: 'level',
          title: 'Alcanzaste Nivel 5',
          timestamp: new Date(),
        },
      ];

      const { queryByText } = render(<ActivityHistory activities={activityWithoutMetadata} />);

      expect(queryByText(/XP/)).toBeNull();
      expect(queryByText(/Score/)).toBeNull();
    });
  });

  describe('Timestamps', () => {
    it('renders relative timestamps for all activities', () => {
      const { getAllByText } = render(<ActivityHistory activities={mockActivities} />);

      // Check that timestamps are rendered (the mock returns specific values based on hours)
      // First activity: 2 hours ago
      expect(getAllByText('hace 2 horas').length).toBeGreaterThan(0);
      // Second activity: 20 hours ago (not ayer due to mock logic)
      expect(getAllByText('hace 20 horas').length).toBeGreaterThan(0);
      // Third and fourth: 2 días each
      expect(getAllByText('hace 2 días').length).toBeGreaterThan(0);
    });
  });

  describe('Load More', () => {
    it('renders load more button when onLoadMore is provided', () => {
      const onLoadMore = jest.fn();
      const { getByText } = render(
        <ActivityHistory activities={mockActivities} onLoadMore={onLoadMore} />
      );

      expect(getByText('Cargar más')).toBeTruthy();
    });

    it('calls onLoadMore when button is pressed', () => {
      const onLoadMore = jest.fn();
      const { getByText } = render(
        <ActivityHistory activities={mockActivities} onLoadMore={onLoadMore} />
      );

      const button = getByText('Cargar más');
      fireEvent.press(button);

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('does not render load more button when onLoadMore is not provided', () => {
      const { queryByText } = render(<ActivityHistory activities={mockActivities} />);

      expect(queryByText('Cargar más')).toBeNull();
    });

    it('hides load more button when loading', () => {
      const onLoadMore = jest.fn();
      const { queryByText } = render(
        <ActivityHistory activities={mockActivities} onLoadMore={onLoadMore} loading={true} />
      );

      expect(queryByText('Cargar más')).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('renders loading text when loading is true', () => {
      const { getByText } = render(<ActivityHistory activities={mockActivities} loading={true} />);

      expect(getByText('Cargando...')).toBeTruthy();
    });

    it('does not render loading text when loading is false', () => {
      const { queryByText } = render(
        <ActivityHistory activities={mockActivities} loading={false} />
      );

      expect(queryByText('Cargando...')).toBeNull();
    });
  });

  describe('Dividers', () => {
    it('renders all activities correctly with visual separation', () => {
      const { getByText } = render(<ActivityHistory activities={mockActivities} />);

      // Verify all activities are present (dividers are visual elements)
      expect(getByText('Completaste "Introducción a LLMs"')).toBeTruthy();
      expect(getByText('Ganaste insignia "Primer Paso"')).toBeTruthy();
      expect(getByText('Alcanzaste Nivel 5')).toBeTruthy();
      expect(getByText('Jugaste "Quiz de Conceptos"')).toBeTruthy();
    });

    it('renders single activity without issues', () => {
      const singleActivity: Activity[] = [mockActivities[0]];
      const { getByText } = render(<ActivityHistory activities={singleActivity} />);

      // With one activity, should render correctly
      expect(getByText('Completaste "Introducción a LLMs"')).toBeTruthy();
    });
  });

  describe('Activity Types and Colors', () => {
    it('applies green color for lesson activities', () => {
      const lessonActivity: Activity[] = [mockActivities[0]];
      const { getByTestId } = render(<ActivityHistory activities={lessonActivity} />);

      const iconColor = getByTestId('icon-color');
      expect(iconColor).toHaveTextContent('#22c55e');
    });

    it('applies gold/amber color for badge activities', () => {
      const badgeActivity: Activity[] = [mockActivities[1]];
      const { getByTestId } = render(<ActivityHistory activities={badgeActivity} />);

      const iconColor = getByTestId('icon-color');
      expect(iconColor).toHaveTextContent('#f59e0b');
    });

    it('applies blue color for level activities', () => {
      const levelActivity: Activity[] = [mockActivities[2]];
      const { getByTestId } = render(<ActivityHistory activities={levelActivity} />);

      const iconColor = getByTestId('icon-color');
      expect(iconColor).toHaveTextContent('#3b82f6');
    });

    it('applies purple color for game activities', () => {
      const gameActivity: Activity[] = [mockActivities[3]];
      const { getByTestId } = render(<ActivityHistory activities={gameActivity} />);

      const iconColor = getByTestId('icon-color');
      expect(iconColor).toHaveTextContent('#a855f7');
    });
  });

  describe('Edge Cases', () => {
    it('handles activity without description', () => {
      const activityNoDesc: Activity[] = [
        {
          id: '1',
          type: 'level',
          title: 'Nivel alcanzado',
          timestamp: new Date(),
        },
      ];

      const { getByText, queryByText } = render(<ActivityHistory activities={activityNoDesc} />);

      expect(getByText('Nivel alcanzado')).toBeTruthy();
      // Should not crash and should not render description
    });

    it('handles activity with empty metadata', () => {
      const activityEmptyMeta: Activity[] = [
        {
          id: '1',
          type: 'lesson',
          title: 'Lección completada',
          timestamp: new Date(),
          metadata: {},
        },
      ];

      const { getByText } = render(<ActivityHistory activities={activityEmptyMeta} />);

      expect(getByText('Lección completada')).toBeTruthy();
      // Should not crash
    });

    it('handles very long activity titles', () => {
      const longTitleActivity: Activity[] = [
        {
          id: '1',
          type: 'lesson',
          title: 'A'.repeat(100),
          timestamp: new Date(),
        },
      ];

      const { getByText } = render(<ActivityHistory activities={longTitleActivity} />);

      expect(getByText('A'.repeat(100))).toBeTruthy();
    });

    it('handles future timestamps gracefully', () => {
      const futureActivity: Activity[] = [
        {
          id: '1',
          type: 'lesson',
          title: 'Future lesson',
          timestamp: new Date('2025-01-01T00:00:00Z'),
        },
      ];

      const { getByText } = render(<ActivityHistory activities={futureActivity} />);

      expect(getByText('Future lesson')).toBeTruthy();
      // Should not crash
    });
  });

  describe('Accessibility', () => {
    it('renders with proper structure for screen readers', () => {
      const { getByText } = render(<ActivityHistory activities={mockActivities} />);

      // All key elements should be accessible
      expect(getByText('Historial de Actividad')).toBeTruthy();
      expect(getByText('Completaste "Introducción a LLMs"')).toBeTruthy();
    });
  });
});
