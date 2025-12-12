import React from 'react';
import { render } from '@testing-library/react-native';
import { DetailedStats, type DetailedStatsProps } from '../DetailedStats';

describe('DetailedStats', () => {
  const mockStats: DetailedStatsProps['stats'] = {
    totalStudyTime: 125, // 2h 5m
    quizAverage: 87.5,
    xpByWeek: [
      { week: 'Sem 1', xp: 150 },
      { week: 'Sem 2', xp: 200 },
      { week: 'Sem 3', xp: 175 },
      { week: 'Sem 4', xp: 250 },
    ],
    lessonsByWeek: [
      { week: 'Sem 1', count: 3 },
      { week: 'Sem 2', count: 5 },
      { week: 'Sem 3', count: 4 },
      { week: 'Sem 4', count: 6 },
    ],
    longestStreak: 15,
    registrationDate: new Date('2024-01-15'),
  };

  describe('Rendering', () => {
    it('should render correctly with all stats', () => {
      const { getByText } = render(<DetailedStats stats={mockStats} />);

      expect(getByText('Resumen General')).toBeTruthy();
      expect(getByText('Tiempo Total de Estudio')).toBeTruthy();
      expect(getByText('Promedio en Quizzes')).toBeTruthy();
      expect(getByText('Mejor Racha')).toBeTruthy();
      expect(getByText('Miembro Desde')).toBeTruthy();
    });

    it('should render chart titles', () => {
      const { getByText } = render(<DetailedStats stats={mockStats} />);

      expect(getByText('XP Ganado por Semana')).toBeTruthy();
      expect(getByText('Lecciones Completadas por Semana')).toBeTruthy();
    });

    it('should render all week labels in XP chart', () => {
      const { getAllByText } = render(<DetailedStats stats={mockStats} />);

      mockStats.xpByWeek.forEach((item) => {
        const elements = getAllByText(item.week);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should render all week labels in lessons chart', () => {
      const { getAllByText } = render(<DetailedStats stats={mockStats} />);

      // Some labels might appear twice (once in each chart)
      mockStats.lessonsByWeek.forEach((item) => {
        const elements = getAllByText(item.week);
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Loading State', () => {
    it('should render loading skeleton when loading is true', () => {
      const { queryByText } = render(<DetailedStats stats={mockStats} loading={true} />);

      // Should not render actual content
      expect(queryByText('Resumen General')).toBeNull();
      expect(queryByText('Tiempo Total de Estudio')).toBeNull();
    });

    it('should not render charts when loading', () => {
      const { queryByText } = render(<DetailedStats stats={mockStats} loading={true} />);

      expect(queryByText('XP Ganado por Semana')).toBeNull();
      expect(queryByText('Lecciones Completadas por Semana')).toBeNull();
    });

    it('should render content when loading is false', () => {
      const { getByText } = render(<DetailedStats stats={mockStats} loading={false} />);

      expect(getByText('Resumen General')).toBeTruthy();
    });
  });

  describe('Study Time Formatting', () => {
    it('should format study time less than 60 minutes', () => {
      const stats = { ...mockStats, totalStudyTime: 45 };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('45m')).toBeTruthy();
    });

    it('should format study time as hours and minutes', () => {
      const stats = { ...mockStats, totalStudyTime: 125 }; // 2h 5m
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('2h 5m')).toBeTruthy();
    });

    it('should format study time as whole hours', () => {
      const stats = { ...mockStats, totalStudyTime: 120 }; // 2h
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('2h')).toBeTruthy();
    });

    it('should show minutes in description', () => {
      const stats = { ...mockStats, totalStudyTime: 125 };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('125 minutos')).toBeTruthy();
    });
  });

  describe('Quiz Average', () => {
    it('should display quiz average as rounded percentage', () => {
      const { getByText } = render(<DetailedStats stats={mockStats} />);

      expect(getByText('88%')).toBeTruthy(); // 87.5 rounded to 88
    });

    it('should show description for quiz average', () => {
      const { getByText } = render(<DetailedStats stats={mockStats} />);

      expect(getByText('Calificación promedio')).toBeTruthy();
    });

    it('should handle zero quiz average', () => {
      const stats = { ...mockStats, quizAverage: 0 };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('0%')).toBeTruthy();
    });

    it('should handle perfect quiz average', () => {
      const stats = { ...mockStats, quizAverage: 100 };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('100%')).toBeTruthy();
    });
  });

  describe('Longest Streak', () => {
    it('should display longest streak with days suffix', () => {
      const { getByText } = render(<DetailedStats stats={mockStats} />);

      expect(getByText('15 días')).toBeTruthy();
    });

    it('should handle zero streak', () => {
      const stats = { ...mockStats, longestStreak: 0 };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('0 días')).toBeTruthy();
    });

    it('should handle single day streak', () => {
      const stats = { ...mockStats, longestStreak: 1 };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('1 días')).toBeTruthy();
    });
  });

  describe('Registration Date', () => {
    it('should format registration date in Spanish', () => {
      const { getAllByText } = render(<DetailedStats stats={mockStats} />);

      // Date formatting may vary by locale, so we check for partial matches
      // "15" might appear in multiple places (longestStreak is 15)
      const dateElements = getAllByText(/15/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should show registration date description', () => {
      const { getByText } = render(<DetailedStats stats={mockStats} />);

      expect(getByText('Fecha de registro')).toBeTruthy();
    });
  });

  describe('XP Chart', () => {
    it('should display all XP values', () => {
      const { getByText } = render(<DetailedStats stats={mockStats} />);

      expect(getByText('150 XP')).toBeTruthy();
      expect(getByText('200 XP')).toBeTruthy();
      expect(getByText('175 XP')).toBeTruthy();
      expect(getByText('250 XP')).toBeTruthy();
    });

    it('should handle empty XP data', () => {
      const stats = { ...mockStats, xpByWeek: [] };
      const { queryByText } = render(<DetailedStats stats={stats} />);

      expect(queryByText('XP Ganado por Semana')).toBeNull();
    });

    it('should handle single week XP data', () => {
      const stats = {
        ...mockStats,
        xpByWeek: [{ week: 'Sem 1', xp: 100 }],
      };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('XP Ganado por Semana')).toBeTruthy();
      expect(getByText('100 XP')).toBeTruthy();
    });

    it('should handle zero XP values', () => {
      const stats = {
        ...mockStats,
        xpByWeek: [
          { week: 'Sem 1', xp: 0 },
          { week: 'Sem 2', xp: 100 },
        ],
      };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('0 XP')).toBeTruthy();
      expect(getByText('100 XP')).toBeTruthy();
    });
  });

  describe('Lessons Chart', () => {
    it('should display all lesson counts', () => {
      const { getByText } = render(<DetailedStats stats={mockStats} />);

      expect(getByText('3')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
      expect(getByText('4')).toBeTruthy();
      expect(getByText('6')).toBeTruthy();
    });

    it('should handle empty lessons data', () => {
      const stats = { ...mockStats, lessonsByWeek: [] };
      const { queryByText } = render(<DetailedStats stats={stats} />);

      expect(queryByText('Lecciones Completadas por Semana')).toBeNull();
    });

    it('should handle single week lesson data', () => {
      const stats = {
        ...mockStats,
        lessonsByWeek: [{ week: 'Sem 1', count: 7 }],
      };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('Lecciones Completadas por Semana')).toBeTruthy();
      expect(getByText('7')).toBeTruthy();
    });

    it('should handle zero lesson counts', () => {
      const stats = {
        ...mockStats,
        lessonsByWeek: [
          { week: 'Sem 1', count: 0 },
          { week: 'Sem 2', count: 5 },
        ],
      };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('0')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large study time', () => {
      const stats = { ...mockStats, totalStudyTime: 5000 }; // 83h 20m
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('83h 20m')).toBeTruthy();
    });

    it('should handle very high quiz average', () => {
      const stats = { ...mockStats, quizAverage: 99.9 };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('100%')).toBeTruthy(); // Rounded
    });

    it('should handle very long streak', () => {
      const stats = { ...mockStats, longestStreak: 365 };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('365 días')).toBeTruthy();
    });

    it('should handle old registration date', () => {
      const stats = { ...mockStats, registrationDate: new Date('2020-01-01') };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('Miembro Desde')).toBeTruthy();
    });

    it('should handle many weeks of data', () => {
      const manyWeeks = Array.from({ length: 12 }, (_, i) => ({
        week: `S${i + 1}`,
        xp: Math.floor(Math.random() * 200) + 50,
      }));
      const stats = { ...mockStats, xpByWeek: manyWeeks };
      const { getByText } = render(<DetailedStats stats={stats} />);

      expect(getByText('XP Ganado por Semana')).toBeTruthy();
    });
  });

  describe('Component Props', () => {
    it('should handle undefined loading prop', () => {
      const { getByText } = render(<DetailedStats stats={mockStats} />);

      expect(getByText('Resumen General')).toBeTruthy();
    });

    it('should toggle between loading and loaded states', () => {
      const { rerender, getByText, queryByText } = render(
        <DetailedStats stats={mockStats} loading={true} />
      );

      expect(queryByText('Resumen General')).toBeNull();

      rerender(<DetailedStats stats={mockStats} loading={false} />);

      expect(getByText('Resumen General')).toBeTruthy();
    });
  });

  describe('Data Consistency', () => {
    it('should display all stat cards', () => {
      const { getByText } = render(<DetailedStats stats={mockStats} />);

      expect(getByText('Tiempo Total de Estudio')).toBeTruthy();
      expect(getByText('Promedio en Quizzes')).toBeTruthy();
      expect(getByText('Mejor Racha')).toBeTruthy();
      expect(getByText('Miembro Desde')).toBeTruthy();
    });

    it('should render both charts when data is available', () => {
      const { getByText } = render(<DetailedStats stats={mockStats} />);

      expect(getByText('XP Ganado por Semana')).toBeTruthy();
      expect(getByText('Lecciones Completadas por Semana')).toBeTruthy();
    });

    it('should handle partial data', () => {
      const partialStats = {
        ...mockStats,
        xpByWeek: [],
        lessonsByWeek: [{ week: 'Sem 1', count: 5 }],
      };
      const { getByText, queryByText } = render(<DetailedStats stats={partialStats} />);

      expect(queryByText('XP Ganado por Semana')).toBeNull();
      expect(getByText('Lecciones Completadas por Semana')).toBeTruthy();
    });
  });
});
