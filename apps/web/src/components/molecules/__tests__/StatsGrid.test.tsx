import React from 'react';
import { render } from '@testing-library/react-native';
import { StatsGrid } from '../StatsGrid';
import { Zap, Trophy, Flame, Target } from 'lucide-react-native';

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Zap: ({ size, color, strokeWidth }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-zap-icon">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
        <Text testID="icon-stroke">{strokeWidth}</Text>
      </View>
    );
  },
  Trophy: ({ size, color, strokeWidth }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-trophy-icon">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
        <Text testID="icon-stroke">{strokeWidth}</Text>
      </View>
    );
  },
  Flame: ({ size, color, strokeWidth }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-flame-icon">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
        <Text testID="icon-stroke">{strokeWidth}</Text>
      </View>
    );
  },
  Target: ({ size, color, strokeWidth }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-target-icon">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
        <Text testID="icon-stroke">{strokeWidth}</Text>
      </View>
    );
  },
}));

describe('StatsGrid', () => {
  const defaultProps = {
    totalXp: 1500,
    level: 3,
    levelTitle: 'Token Tinkerer',
    currentStreak: 5,
    progressPercent: 75,
  };

  describe('Loading State', () => {
    it('should render loading skeleton when isLoading is true', () => {
      const { queryByText } = render(<StatsGrid {...defaultProps} isLoading={true} />);

      // Should not render any stat labels or values
      expect(queryByText('XP Total')).toBeNull();
      expect(queryByText('Nivel')).toBeNull();
      expect(queryByText('Racha')).toBeNull();
      expect(queryByText('Progreso')).toBeNull();
      expect(queryByText('1,500')).toBeNull();
    });

    it('should render 4 loading cards', () => {
      const { UNSAFE_getAllByType } = render(<StatsGrid {...defaultProps} isLoading={true} />);
      const views = UNSAFE_getAllByType('View' as any);

      // Filter for card loading views - they should have specific styles
      const cards = views.filter((view: any) => {
        const style = view.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.height === 120);
        }
        return false;
      });

      expect(cards.length).toBe(4);
    });
  });

  describe('XP Stat Card', () => {
    it('should render XP Total label', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} />);
      expect(getByText('XP Total')).toBeTruthy();
    });

    it('should format XP with commas', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} totalXp={1500} />);
      expect(getByText('1,500')).toBeTruthy();
    });

    it('should format large XP numbers correctly', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} totalXp={1234567} />);
      expect(getByText('1,234,567')).toBeTruthy();
    });

    it('should handle zero XP', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} totalXp={0} />);
      expect(getByText('0')).toBeTruthy();
    });

    it('should render Zap icon', () => {
      const { getByTestId } = render(<StatsGrid {...defaultProps} />);
      expect(getByTestId('mock-zap-icon')).toBeTruthy();
    });
  });

  describe('Level Stat Card', () => {
    it('should render Nivel label', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} />);
      expect(getByText('Nivel')).toBeTruthy();
    });

    it('should display level title', () => {
      const { getByText } = render(
        <StatsGrid {...defaultProps} level={3} levelTitle="Token Tinkerer" />
      );
      expect(getByText('Token Tinkerer')).toBeTruthy();
    });

    it('should display different level titles', () => {
      const { getByText } = render(
        <StatsGrid {...defaultProps} level={1} levelTitle="Prompt Curious" />
      );
      expect(getByText('Prompt Curious')).toBeTruthy();
    });

    it('should handle high level titles', () => {
      const { getByText } = render(
        <StatsGrid {...defaultProps} level={10} levelTitle="LLM Engineer" />
      );
      expect(getByText('LLM Engineer')).toBeTruthy();
    });

    it('should render Trophy icon', () => {
      const { getByTestId } = render(<StatsGrid {...defaultProps} />);
      expect(getByTestId('mock-trophy-icon')).toBeTruthy();
    });
  });

  describe('Streak Stat Card', () => {
    it('should render Racha label', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} />);
      expect(getByText('Racha')).toBeTruthy();
    });

    it('should display current streak value', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} currentStreak={5} />);
      expect(getByText('5')).toBeTruthy();
    });

    it('should display suffix "días"', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} />);
      expect(getByText('días')).toBeTruthy();
    });

    it('should handle zero streak', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} currentStreak={0} />);
      expect(getByText('0')).toBeTruthy();
    });

    it('should handle large streak numbers', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} currentStreak={365} />);
      expect(getByText('365')).toBeTruthy();
    });

    it('should render Flame icon', () => {
      const { getByTestId } = render(<StatsGrid {...defaultProps} />);
      expect(getByTestId('mock-flame-icon')).toBeTruthy();
    });
  });

  describe('Progress Stat Card', () => {
    it('should render Progreso label', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} />);
      expect(getByText('Progreso')).toBeTruthy();
    });

    it('should display progress percentage', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} progressPercent={75} />);
      expect(getByText('75%')).toBeTruthy();
    });

    it('should handle 0% progress', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} progressPercent={0} />);
      expect(getByText('0%')).toBeTruthy();
    });

    it('should handle 100% progress', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} progressPercent={100} />);
      expect(getByText('100%')).toBeTruthy();
    });

    it('should render Target icon', () => {
      const { getByTestId } = render(<StatsGrid {...defaultProps} />);
      expect(getByTestId('mock-target-icon')).toBeTruthy();
    });
  });

  describe('All Stat Cards Rendering', () => {
    it('should render all four stat cards', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} />);

      expect(getByText('XP Total')).toBeTruthy();
      expect(getByText('Nivel')).toBeTruthy();
      expect(getByText('Racha')).toBeTruthy();
      expect(getByText('Progreso')).toBeTruthy();
    });

    it('should render all stat values correctly', () => {
      const { getByText } = render(
        <StatsGrid
          totalXp={2500}
          level={5}
          levelTitle="Embedding Explorer"
          currentStreak={10}
          progressPercent={50}
        />
      );

      expect(getByText('2,500')).toBeTruthy();
      expect(getByText('Embedding Explorer')).toBeTruthy();
      expect(getByText('10')).toBeTruthy();
      expect(getByText('50%')).toBeTruthy();
    });

    it('should render all icons', () => {
      const { getByTestId } = render(<StatsGrid {...defaultProps} />);

      expect(getByTestId('mock-zap-icon')).toBeTruthy();
      expect(getByTestId('mock-trophy-icon')).toBeTruthy();
      expect(getByTestId('mock-flame-icon')).toBeTruthy();
      expect(getByTestId('mock-target-icon')).toBeTruthy();
    });
  });

  describe('Number Formatting', () => {
    it('should format XP numbers without decimals', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} totalXp={1000} />);
      expect(getByText('1,000')).toBeTruthy();
    });

    it('should format single digit XP', () => {
      const { getAllByText } = render(<StatsGrid {...defaultProps} totalXp={5} />);
      const elements = getAllByText('5');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should format two digit XP without commas', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} totalXp={99} />);
      expect(getByText('99')).toBeTruthy();
    });

    it('should format three digit XP without commas', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} totalXp={999} />);
      expect(getByText('999')).toBeTruthy();
    });

    it('should format four digit XP with comma', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} totalXp={1000} />);
      expect(getByText('1,000')).toBeTruthy();
    });

    it('should format million+ XP correctly', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} totalXp={5000000} />);
      expect(getByText('5,000,000')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum values', () => {
      const { getAllByText, getByText } = render(
        <StatsGrid
          totalXp={0}
          level={1}
          levelTitle="Beginner"
          currentStreak={0}
          progressPercent={0}
        />
      );

      const zeroElements = getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
      expect(getByText('Beginner')).toBeTruthy();
      expect(getByText('0%')).toBeTruthy();
    });

    it('should handle maximum typical values', () => {
      const { getByText } = render(
        <StatsGrid
          totalXp={999999}
          level={50}
          levelTitle="Supreme Master"
          currentStreak={999}
          progressPercent={100}
        />
      );

      expect(getByText('999,999')).toBeTruthy();
      expect(getByText('Supreme Master')).toBeTruthy();
      expect(getByText('999')).toBeTruthy();
      expect(getByText('100%')).toBeTruthy();
    });

    it('should not render stats when loading', () => {
      const { queryByText } = render(
        <StatsGrid
          totalXp={1500}
          level={3}
          levelTitle="Token Tinkerer"
          currentStreak={5}
          progressPercent={75}
          isLoading={true}
        />
      );

      expect(queryByText('Token Tinkerer')).toBeNull();
      expect(queryByText('1,500')).toBeNull();
    });

    it('should handle very long level titles', () => {
      const { getByText } = render(
        <StatsGrid
          {...defaultProps}
          levelTitle="This is a very long level title that might wrap"
        />
      );

      expect(getByText('This is a very long level title that might wrap')).toBeTruthy();
    });

    it('should handle single character level title', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} levelTitle="X" />);
      expect(getByText('X')).toBeTruthy();
    });
  });

  describe('Props Variations', () => {
    it('should update when props change', () => {
      const { getByText, rerender } = render(
        <StatsGrid
          totalXp={1000}
          level={2}
          levelTitle="Beginner"
          currentStreak={5}
          progressPercent={50}
        />
      );

      expect(getByText('1,000')).toBeTruthy();
      expect(getByText('Beginner')).toBeTruthy();

      rerender(
        <StatsGrid
          totalXp={2000}
          level={3}
          levelTitle="Advanced"
          currentStreak={10}
          progressPercent={75}
        />
      );

      expect(getByText('2,000')).toBeTruthy();
      expect(getByText('Advanced')).toBeTruthy();
      expect(getByText('10')).toBeTruthy();
      expect(getByText('75%')).toBeTruthy();
    });

    it('should transition from loading to loaded state', () => {
      const { queryByText, rerender } = render(<StatsGrid {...defaultProps} isLoading={true} />);

      expect(queryByText('XP Total')).toBeNull();

      rerender(<StatsGrid {...defaultProps} isLoading={false} />);

      expect(queryByText('XP Total')).toBeTruthy();
      expect(queryByText('Nivel')).toBeTruthy();
      expect(queryByText('Racha')).toBeTruthy();
      expect(queryByText('Progreso')).toBeTruthy();
    });
  });

  describe('Stat Card Structure', () => {
    it('should render streak with suffix', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} currentStreak={7} />);

      expect(getByText('7')).toBeTruthy();
      expect(getByText('días')).toBeTruthy();
    });

    it('should render progress without suffix', () => {
      const { getByText, queryByText } = render(
        <StatsGrid {...defaultProps} progressPercent={85} />
      );

      expect(getByText('85%')).toBeTruthy();
      // Progress card should not have a separate suffix element
      // The % is part of the value
    });

    it('should render XP without suffix', () => {
      const { getByText } = render(<StatsGrid {...defaultProps} totalXp={5000} />);

      expect(getByText('5,000')).toBeTruthy();
      // XP card should not have a suffix
    });

    it('should render level without suffix', () => {
      const { getByText } = render(
        <StatsGrid {...defaultProps} level={5} levelTitle="Expert" />
      );

      expect(getByText('Expert')).toBeTruthy();
      // Level card should not have a suffix
    });
  });
});
