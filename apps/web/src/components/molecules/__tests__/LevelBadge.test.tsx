import React from 'react';
import { render } from '@testing-library/react-native';
import { LevelBadge, type Level } from '../LevelBadge';
import { Trophy, Star, Zap } from 'lucide-react-native';

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
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
  Star: ({ size, color, strokeWidth }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-star-icon">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
        <Text testID="icon-stroke">{strokeWidth}</Text>
      </View>
    );
  },
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
}));

describe('LevelBadge', () => {
  const mockLevel: Level = {
    level: 5,
    icon: Trophy,
    color: '#3B82F6',
  };

  describe('default variant', () => {
    it('renders with default props', () => {
      const { getByText } = render(<LevelBadge level={mockLevel} />);

      expect(getByText('Lvl 5')).toBeTruthy();
    });

    it('displays level number with "Lvl" prefix', () => {
      const { getByText } = render(<LevelBadge level={mockLevel} variant="default" />);

      expect(getByText('Lvl 5')).toBeTruthy();
    });

    it('renders icon with correct color', () => {
      const { getByTestId } = render(<LevelBadge level={mockLevel} variant="default" />);

      const iconColor = getByTestId('icon-color');
      expect(iconColor.props.children).toBe('#3B82F6');
    });

    it('applies correct size for small variant', () => {
      const { getByTestId } = render(<LevelBadge level={mockLevel} size="sm" />);

      const iconSize = getByTestId('icon-size');
      expect(iconSize.props.children).toBe(16);
    });

    it('applies correct size for medium variant', () => {
      const { getByTestId } = render(<LevelBadge level={mockLevel} size="md" />);

      const iconSize = getByTestId('icon-size');
      expect(iconSize.props.children).toBe(20);
    });

    it('applies correct size for large variant', () => {
      const { getByTestId } = render(<LevelBadge level={mockLevel} size="lg" />);

      const iconSize = getByTestId('icon-size');
      expect(iconSize.props.children).toBe(24);
    });
  });

  describe('minimal variant', () => {
    it('renders with minimal variant', () => {
      const { getByText } = render(<LevelBadge level={mockLevel} variant="minimal" />);

      expect(getByText('5')).toBeTruthy();
    });

    it('displays only level number without "Lvl" prefix', () => {
      const { getByText, queryByText } = render(<LevelBadge level={mockLevel} variant="minimal" />);

      expect(getByText('5')).toBeTruthy();
      expect(queryByText('Lvl 5')).toBeNull();
    });

    it('renders icon with correct color in minimal variant', () => {
      const { getByTestId } = render(<LevelBadge level={mockLevel} variant="minimal" />);

      const iconColor = getByTestId('icon-color');
      expect(iconColor.props.children).toBe('#3B82F6');
    });

    it('applies correct size for small minimal variant', () => {
      const { getByTestId } = render(<LevelBadge level={mockLevel} variant="minimal" size="sm" />);

      const iconSize = getByTestId('icon-size');
      expect(iconSize.props.children).toBe(16);
    });
  });

  describe('different level configurations', () => {
    it('renders level 1 correctly', () => {
      const level1: Level = {
        level: 1,
        icon: Star,
        color: '#10B981',
      };

      const { getByText, getByTestId } = render(<LevelBadge level={level1} />);

      expect(getByText('Lvl 1')).toBeTruthy();
      const iconColor = getByTestId('icon-color');
      expect(iconColor.props.children).toBe('#10B981');
    });

    it('renders level 10 correctly', () => {
      const level10: Level = {
        level: 10,
        icon: Zap,
        color: '#F59E0B',
      };

      const { getByText, getByTestId } = render(<LevelBadge level={level10} />);

      expect(getByText('Lvl 10')).toBeTruthy();
      const iconColor = getByTestId('icon-color');
      expect(iconColor.props.children).toBe('#F59E0B');
    });

    it('handles different icons correctly', () => {
      const levelWithZap: Level = {
        level: 7,
        icon: Zap,
        color: '#8B5CF6',
      };

      const { getByTestId } = render(<LevelBadge level={levelWithZap} />);

      expect(getByTestId('mock-zap-icon')).toBeTruthy();
    });
  });

  describe('color handling', () => {
    it('applies custom color to text and icon', () => {
      const customColorLevel: Level = {
        level: 3,
        icon: Trophy,
        color: '#EF4444',
      };

      const { getByTestId, getByText } = render(<LevelBadge level={customColorLevel} />);

      const iconColor = getByTestId('icon-color');
      expect(iconColor.props.children).toBe('#EF4444');

      const levelText = getByText('Lvl 3');
      expect(levelText.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#EF4444' })])
      );
    });
  });

  describe('accessibility', () => {
    it('renders text content that can be read by screen readers', () => {
      const { getByText } = render(<LevelBadge level={mockLevel} />);

      const levelText = getByText('Lvl 5');
      expect(levelText).toBeTruthy();
    });

    it('renders minimal variant text for screen readers', () => {
      const { getByText } = render(<LevelBadge level={mockLevel} variant="minimal" />);

      const levelText = getByText('5');
      expect(levelText).toBeTruthy();
    });
  });
});
