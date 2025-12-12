/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BadgeGrid, Badge, BadgeGridProps } from '../BadgeGrid';

describe('BadgeGrid', () => {
  const mockBadges: Badge[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🎯',
      unlockedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Quick Learner',
      description: 'Complete 5 lessons',
      icon: '⚡',
    },
    {
      id: '3',
      name: 'Dedicated',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      unlockedAt: new Date('2024-01-05'),
    },
    {
      id: '4',
      name: 'Expert',
      description: 'Complete all modules',
      icon: '🏆',
    },
  ];

  const defaultProps: BadgeGridProps = {
    badges: mockBadges,
    unlockedBadgeIds: ['1', '3'],
  };

  describe('Rendering', () => {
    it('should render all badges', () => {
      const { getByText } = render(<BadgeGrid {...defaultProps} />);

      expect(getByText('First Steps')).toBeTruthy();
      expect(getByText('Quick Learner')).toBeTruthy();
      expect(getByText('Dedicated')).toBeTruthy();
      expect(getByText('Expert')).toBeTruthy();
    });

    it('should render badge icons', () => {
      const { getByText } = render(<BadgeGrid {...defaultProps} />);

      expect(getByText('🎯')).toBeTruthy();
      expect(getByText('⚡')).toBeTruthy();
      expect(getByText('🔥')).toBeTruthy();
      expect(getByText('🏆')).toBeTruthy();
    });

    it('should render with empty badges array', () => {
      const { queryByText } = render(<BadgeGrid badges={[]} unlockedBadgeIds={[]} />);

      expect(queryByText('First Steps')).toBeNull();
    });

    it('should render single badge', () => {
      const { getByText } = render(
        <BadgeGrid badges={[mockBadges[0]!]} unlockedBadgeIds={['1']} />
      );

      expect(getByText('First Steps')).toBeTruthy();
      expect(getByText('🎯')).toBeTruthy();
    });

    it('should render with testID for each badge', () => {
      const { getByTestId } = render(<BadgeGrid {...defaultProps} />);

      expect(getByTestId('badge-1')).toBeTruthy();
      expect(getByTestId('badge-2')).toBeTruthy();
      expect(getByTestId('badge-3')).toBeTruthy();
      expect(getByTestId('badge-4')).toBeTruthy();
    });
  });

  describe('Unlocked State', () => {
    it('should display unlocked badges with full opacity', () => {
      const { getByTestId } = render(<BadgeGrid {...defaultProps} />);

      const unlockedBadge1 = getByTestId('badge-1');
      const unlockedBadge3 = getByTestId('badge-3');

      // Check that unlocked badges have the unlocked style
      expect(unlockedBadge1.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ opacity: 1 })])
      );
      expect(unlockedBadge3.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ opacity: 1 })])
      );
    });

    it('should display locked badges with reduced opacity', () => {
      const { getByTestId } = render(<BadgeGrid {...defaultProps} />);

      const lockedBadge2 = getByTestId('badge-2');
      const lockedBadge4 = getByTestId('badge-4');

      // Check that locked badges have the locked style
      expect(lockedBadge2.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ opacity: 0.3 })])
      );
      expect(lockedBadge4.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ opacity: 0.3 })])
      );
    });

    it('should handle all badges unlocked', () => {
      const { getByTestId } = render(
        <BadgeGrid badges={mockBadges} unlockedBadgeIds={['1', '2', '3', '4']} />
      );

      ['1', '2', '3', '4'].forEach((id) => {
        const badge = getByTestId(`badge-${id}`);
        expect(badge.props.style).toEqual(
          expect.arrayContaining([expect.objectContaining({ opacity: 1 })])
        );
      });
    });

    it('should handle all badges locked', () => {
      const { getByTestId } = render(<BadgeGrid badges={mockBadges} unlockedBadgeIds={[]} />);

      ['1', '2', '3', '4'].forEach((id) => {
        const badge = getByTestId(`badge-${id}`);
        expect(badge.props.style).toEqual(
          expect.arrayContaining([expect.objectContaining({ opacity: 0.3 })])
        );
      });
    });

    it('should correctly identify unlocked badges', () => {
      const { getByTestId } = render(
        <BadgeGrid badges={mockBadges} unlockedBadgeIds={['2', '4']} />
      );

      // Badge 2 and 4 should be unlocked
      const badge2 = getByTestId('badge-2');
      const badge4 = getByTestId('badge-4');
      expect(badge2.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ opacity: 1 })])
      );
      expect(badge4.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ opacity: 1 })])
      );

      // Badge 1 and 3 should be locked
      const badge1 = getByTestId('badge-1');
      const badge3 = getByTestId('badge-3');
      expect(badge1.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ opacity: 0.3 })])
      );
      expect(badge3.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ opacity: 0.3 })])
      );
    });
  });

  describe('Badge Press Interaction', () => {
    it('should call onBadgePress when badge is pressed', () => {
      const onBadgePress = jest.fn();
      const { getByTestId } = render(<BadgeGrid {...defaultProps} onBadgePress={onBadgePress} />);

      const badge1 = getByTestId('badge-1');
      fireEvent.press(badge1);

      expect(onBadgePress).toHaveBeenCalledTimes(1);
      expect(onBadgePress).toHaveBeenCalledWith(mockBadges[0]!);
    });

    it('should call onBadgePress with correct badge data', () => {
      const onBadgePress = jest.fn();
      const { getByTestId } = render(<BadgeGrid {...defaultProps} onBadgePress={onBadgePress} />);

      const badge3 = getByTestId('badge-3');
      fireEvent.press(badge3);

      expect(onBadgePress).toHaveBeenCalledWith({
        id: '3',
        name: 'Dedicated',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        unlockedAt: expect.any(Date),
      });
    });

    it('should handle multiple badge presses', () => {
      const onBadgePress = jest.fn();
      const { getByTestId } = render(<BadgeGrid {...defaultProps} onBadgePress={onBadgePress} />);

      fireEvent.press(getByTestId('badge-1'));
      fireEvent.press(getByTestId('badge-2'));
      fireEvent.press(getByTestId('badge-3'));

      expect(onBadgePress).toHaveBeenCalledTimes(3);
    });

    it('should not call onBadgePress when not provided', () => {
      const { getByTestId } = render(<BadgeGrid {...defaultProps} />);

      const badge1 = getByTestId('badge-1');
      // Should not throw error when pressed without onBadgePress
      expect(() => fireEvent.press(badge1)).not.toThrow();
    });

    it('should disable press when onBadgePress is not provided', () => {
      const { getByTestId } = render(<BadgeGrid {...defaultProps} />);

      const badge1 = getByTestId('badge-1');
      expect(badge1.props.accessibilityState?.disabled).toBe(true);
    });

    it('should enable press when onBadgePress is provided', () => {
      const { getByTestId } = render(<BadgeGrid {...defaultProps} onBadgePress={jest.fn()} />);

      const badge1 = getByTestId('badge-1');
      expect(badge1.props.accessibilityState?.disabled).toBe(false);
    });

    it('should allow pressing both locked and unlocked badges', () => {
      const onBadgePress = jest.fn();
      const { getByTestId } = render(<BadgeGrid {...defaultProps} onBadgePress={onBadgePress} />);

      // Press unlocked badge
      fireEvent.press(getByTestId('badge-1'));
      expect(onBadgePress).toHaveBeenCalledWith(mockBadges[0]!);

      // Press locked badge
      fireEvent.press(getByTestId('badge-2'));
      expect(onBadgePress).toHaveBeenCalledWith(mockBadges[1]!);

      expect(onBadgePress).toHaveBeenCalledTimes(2);
    });
  });

  describe('Badge Names', () => {
    it('should truncate long badge names', () => {
      const longNameBadges: Badge[] = [
        {
          id: '1',
          name: 'This is a very long badge name that should be truncated',
          description: 'Test description',
          icon: '🎯',
        },
      ];

      const { getByText } = render(<BadgeGrid badges={longNameBadges} unlockedBadgeIds={[]} />);

      const badgeName = getByText('This is a very long badge name that should be truncated');
      expect(badgeName.props.numberOfLines).toBe(2);
    });

    it('should render short badge names', () => {
      const shortNameBadges: Badge[] = [
        {
          id: '1',
          name: 'Pro',
          description: 'Test',
          icon: '⭐',
        },
      ];

      const { getByText } = render(<BadgeGrid badges={shortNameBadges} unlockedBadgeIds={['1']} />);

      expect(getByText('Pro')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle badges with missing unlockedAt date', () => {
      const { getByText } = render(<BadgeGrid {...defaultProps} />);

      expect(getByText('Quick Learner')).toBeTruthy();
      expect(getByText('Expert')).toBeTruthy();
    });

    it('should handle empty unlockedBadgeIds array', () => {
      const { getByTestId } = render(<BadgeGrid badges={mockBadges} unlockedBadgeIds={[]} />);

      mockBadges.forEach((badge) => {
        const badgeElement = getByTestId(`badge-${badge.id}`);
        expect(badgeElement.props.style).toEqual(
          expect.arrayContaining([expect.objectContaining({ opacity: 0.3 })])
        );
      });
    });

    it('should handle duplicate badge IDs in unlockedBadgeIds', () => {
      const { getByTestId } = render(
        <BadgeGrid badges={mockBadges} unlockedBadgeIds={['1', '1', '1']} />
      );

      const badge1 = getByTestId('badge-1');
      expect(badge1.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ opacity: 1 })])
      );
    });

    it('should handle unlockedBadgeIds that do not match any badge', () => {
      const { getByTestId } = render(
        <BadgeGrid badges={mockBadges} unlockedBadgeIds={['999', '1000']} />
      );

      // All badges should be locked
      mockBadges.forEach((badge) => {
        const badgeElement = getByTestId(`badge-${badge.id}`);
        expect(badgeElement.props.style).toEqual(
          expect.arrayContaining([expect.objectContaining({ opacity: 0.3 })])
        );
      });
    });

    it('should handle badges with special characters in names', () => {
      const specialBadges: Badge[] = [
        {
          id: '1',
          name: 'Badge & More!',
          description: 'Special chars',
          icon: '🎉',
        },
        {
          id: '2',
          name: 'Badge "Quotes"',
          description: 'With quotes',
          icon: '✨',
        },
      ];

      const { getByText } = render(
        <BadgeGrid badges={specialBadges} unlockedBadgeIds={['1', '2']} />
      );

      expect(getByText('Badge & More!')).toBeTruthy();
      expect(getByText('Badge "Quotes"')).toBeTruthy();
    });

    it('should handle unicode emojis in icon field', () => {
      const emojiBadges: Badge[] = [
        { id: '1', name: 'Fire', description: 'Hot', icon: '🔥' },
        { id: '2', name: 'Star', description: 'Bright', icon: '⭐' },
        { id: '3', name: 'Heart', description: 'Love', icon: '❤️' },
      ];

      const { getByText } = render(
        <BadgeGrid badges={emojiBadges} unlockedBadgeIds={['1', '2', '3']} />
      );

      expect(getByText('🔥')).toBeTruthy();
      expect(getByText('⭐')).toBeTruthy();
      expect(getByText('❤️')).toBeTruthy();
    });
  });

  describe('Grid Layout', () => {
    it('should render all badges in a grid layout', () => {
      const { getByTestId } = render(<BadgeGrid {...defaultProps} />);

      // All badges should be rendered
      expect(getByTestId('badge-1')).toBeTruthy();
      expect(getByTestId('badge-2')).toBeTruthy();
      expect(getByTestId('badge-3')).toBeTruthy();
      expect(getByTestId('badge-4')).toBeTruthy();
    });

    it('should handle large number of badges', () => {
      const manyBadges: Badge[] = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Badge ${i + 1}`,
        description: `Description ${i + 1}`,
        icon: '🎯',
      }));

      const { getByTestId } = render(
        <BadgeGrid badges={manyBadges} unlockedBadgeIds={['1', '5', '10']} />
      );

      // Check first and last badges are rendered
      expect(getByTestId('badge-1')).toBeTruthy();
      expect(getByTestId('badge-20')).toBeTruthy();
    });

    it('should handle odd number of badges', () => {
      const oddBadges = mockBadges.slice(0, 3);
      const { getByTestId } = render(<BadgeGrid badges={oddBadges} unlockedBadgeIds={['1']} />);

      expect(getByTestId('badge-1')).toBeTruthy();
      expect(getByTestId('badge-2')).toBeTruthy();
      expect(getByTestId('badge-3')).toBeTruthy();
    });
  });

  describe('Props Update', () => {
    it('should update when badges change', () => {
      const { getByText, rerender, queryByText } = render(
        <BadgeGrid badges={[mockBadges[0]!]} unlockedBadgeIds={['1']} />
      );

      expect(getByText('First Steps')).toBeTruthy();
      expect(queryByText('Quick Learner')).toBeNull();

      rerender(<BadgeGrid badges={mockBadges} unlockedBadgeIds={['1', '2']} />);

      expect(getByText('First Steps')).toBeTruthy();
      expect(getByText('Quick Learner')).toBeTruthy();
    });

    it('should update when unlockedBadgeIds change', () => {
      const { getByTestId, rerender } = render(
        <BadgeGrid badges={mockBadges} unlockedBadgeIds={['1']} />
      );

      let badge2 = getByTestId('badge-2');
      expect(badge2.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ opacity: 0.3 })])
      );

      rerender(<BadgeGrid badges={mockBadges} unlockedBadgeIds={['1', '2']} />);

      badge2 = getByTestId('badge-2');
      expect(badge2.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ opacity: 1 })])
      );
    });

    it('should update onBadgePress callback', () => {
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();

      const { getByTestId, rerender } = render(
        <BadgeGrid {...defaultProps} onBadgePress={firstCallback} />
      );

      fireEvent.press(getByTestId('badge-1'));
      expect(firstCallback).toHaveBeenCalledTimes(1);
      expect(secondCallback).not.toHaveBeenCalled();

      rerender(<BadgeGrid {...defaultProps} onBadgePress={secondCallback} />);

      fireEvent.press(getByTestId('badge-1'));
      expect(firstCallback).toHaveBeenCalledTimes(1);
      expect(secondCallback).toHaveBeenCalledTimes(1);
    });
  });
});
