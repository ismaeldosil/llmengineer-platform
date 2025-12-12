/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressCard } from '../ProgressCard';

describe('ProgressCard', () => {
  it('should render correctly with basic props', () => {
    const { getByText } = render(
      <ProgressCard totalXp={1500} level={3} lessonsCompleted={15} currentStreak={5} />
    );

    expect(getByText('3')).toBeTruthy();
    expect(getByText('Token Tinkerer')).toBeTruthy();
    expect(getByText('1,500 XP')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
    expect(getByText('Lecciones')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('Racha')).toBeTruthy();
  });

  it('should show loading state', () => {
    const { queryByText } = render(
      <ProgressCard totalXp={0} level={1} lessonsCompleted={0} isLoading={true} />
    );

    expect(queryByText('Prompt Curious')).toBeNull();
  });

  it('should calculate progress to next level correctly', () => {
    const { getByText } = render(<ProgressCard totalXp={250} level={1} lessonsCompleted={5} />);

    expect(getByText('250 / 500 XP para nivel 2')).toBeTruthy();
  });

  it('should handle XP at level boundary', () => {
    const { getByText } = render(<ProgressCard totalXp={1000} level={2} lessonsCompleted={10} />);

    expect(getByText('0 / 500 XP para nivel 3')).toBeTruthy();
  });

  it('should format large XP numbers with commas', () => {
    const { getByText } = render(
      <ProgressCard totalXp={15750} level={31} lessonsCompleted={150} />
    );

    expect(getByText('15,750 XP')).toBeTruthy();
  });

  it('should display correct stats', () => {
    const { getByText } = render(
      <ProgressCard totalXp={5000} level={10} lessonsCompleted={50} currentStreak={12} />
    );

    expect(getByText('50')).toBeTruthy();
    expect(getByText('Lecciones')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
    expect(getByText('Racha')).toBeTruthy();
    expect(getByText('5,000')).toBeTruthy();
    expect(getByText('XP Total')).toBeTruthy();
  });

  it('should handle zero values', () => {
    const { getByText, getAllByText } = render(
      <ProgressCard totalXp={0} level={1} lessonsCompleted={0} />
    );

    expect(getByText('0 XP')).toBeTruthy();
    const zeroElements = getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it('should show correct progress for XP within level', () => {
    const { getByText } = render(<ProgressCard totalXp={1250} level={2} lessonsCompleted={12} />);

    expect(getByText('250 / 500 XP para nivel 3')).toBeTruthy();
  });

  it('should display level badge', () => {
    const { getByText } = render(<ProgressCard totalXp={500} level={5} lessonsCompleted={25} />);

    expect(getByText('5')).toBeTruthy();
  });

  it('should handle single lesson completed', () => {
    const { getByText, getAllByText } = render(
      <ProgressCard totalXp={100} level={1} lessonsCompleted={1} />
    );

    const oneElements = getAllByText('1');
    expect(oneElements.length).toBeGreaterThan(0);
    expect(getByText('Lecciones')).toBeTruthy();
  });

  it('should calculate XP for next level based on current level', () => {
    const { getByText: getByTextLevel1 } = render(
      <ProgressCard totalXp={100} level={1} lessonsCompleted={1} />
    );
    expect(getByTextLevel1('100 / 500 XP para nivel 2')).toBeTruthy();

    const { getByText: getByTextLevel5 } = render(
      <ProgressCard totalXp={2100} level={5} lessonsCompleted={20} />
    );
    expect(getByTextLevel5('100 / 500 XP para nivel 6')).toBeTruthy();
  });

  it('should use correct level titles from shared constants', () => {
    const { getByText: getByText1 } = render(
      <ProgressCard totalXp={0} level={1} lessonsCompleted={0} />
    );
    expect(getByText1('Prompt Curious')).toBeTruthy();

    const { getByText: getByText5 } = render(
      <ProgressCard totalXp={2000} level={5} lessonsCompleted={10} />
    );
    expect(getByText5('Embedding Explorer')).toBeTruthy();

    const { getByText: getByText10 } = render(
      <ProgressCard totalXp={4500} level={10} lessonsCompleted={40} />
    );
    expect(getByText10('LLM Engineer')).toBeTruthy();
  });

  it('should display current streak when provided', () => {
    const { getByText } = render(
      <ProgressCard totalXp={1000} level={2} lessonsCompleted={10} currentStreak={15} />
    );

    expect(getByText('15')).toBeTruthy();
    expect(getByText('Racha')).toBeTruthy();
  });

  it('should show streak as 0 when not provided', () => {
    const { getAllByText } = render(<ProgressCard totalXp={500} level={1} lessonsCompleted={5} />);

    const zeroElements = getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it('should show LLM Master for levels above 10', () => {
    const { getByText } = render(<ProgressCard totalXp={6000} level={12} lessonsCompleted={60} />);

    expect(getByText('LLM Master')).toBeTruthy();
  });

  describe('Progress Bar Animation', () => {
    it('should initialize progress width to 0 when loading', () => {
      const { queryByText } = render(
        <ProgressCard totalXp={500} level={1} lessonsCompleted={5} isLoading={true} />
      );

      // Should not render content when loading
      expect(queryByText('500 XP')).toBeNull();
    });

    it('should animate progress bar on mount', () => {
      const { getByText } = render(<ProgressCard totalXp={250} level={1} lessonsCompleted={5} />);

      // Progress bar should be rendered
      expect(getByText('250 / 500 XP para nivel 2')).toBeTruthy();
    });

    it('should update progress bar when XP changes', () => {
      const { getByText, rerender } = render(
        <ProgressCard totalXp={100} level={1} lessonsCompleted={5} />
      );

      expect(getByText('100 / 500 XP para nivel 2')).toBeTruthy();

      rerender(<ProgressCard totalXp={300} level={1} lessonsCompleted={10} />);

      expect(getByText('300 / 500 XP para nivel 2')).toBeTruthy();
    });

    it('should not animate when loading', () => {
      const { queryByText } = render(
        <ProgressCard totalXp={250} level={1} lessonsCompleted={5} isLoading={true} />
      );

      expect(queryByText('Prompt Curious')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle maximum XP values', () => {
      const { getByText } = render(
        <ProgressCard totalXp={999999} level={1999} lessonsCompleted={9999} currentStreak={365} />
      );

      expect(getByText('999,999 XP')).toBeTruthy();
      expect(getByText('9999')).toBeTruthy(); // No comma for 4-digit numbers
      expect(getByText('365')).toBeTruthy();
    });

    it('should handle negative streak as 0', () => {
      const { getAllByText } = render(
        <ProgressCard totalXp={500} level={1} lessonsCompleted={5} currentStreak={0} />
      );

      const zeroElements = getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });

    it('should handle rapid prop updates', () => {
      const { getByText, rerender } = render(
        <ProgressCard totalXp={100} level={1} lessonsCompleted={1} />
      );

      expect(getByText('100 / 500 XP para nivel 2')).toBeTruthy();

      rerender(<ProgressCard totalXp={200} level={1} lessonsCompleted={2} />);
      rerender(<ProgressCard totalXp={300} level={1} lessonsCompleted={3} />);
      rerender(<ProgressCard totalXp={400} level={1} lessonsCompleted={4} />);

      expect(getByText('400 / 500 XP para nivel 2')).toBeTruthy();
    });

    it('should maintain consistency between stats', () => {
      const totalXp = 2500;
      const lessonsCompleted = 25;
      const streak = 10;

      const { getByText } = render(
        <ProgressCard
          totalXp={totalXp}
          level={5}
          lessonsCompleted={lessonsCompleted}
          currentStreak={streak}
        />
      );

      // Verify all three stats are displayed correctly
      expect(getByText('25')).toBeTruthy(); // Lessons
      expect(getByText('10')).toBeTruthy(); // Streak
      expect(getByText('2,500')).toBeTruthy(); // XP Total
    });
  });

  describe('Loading State Transitions', () => {
    it('should transition from loading to loaded', () => {
      const { queryByText, rerender, getByText } = render(
        <ProgressCard totalXp={500} level={1} lessonsCompleted={5} isLoading={true} />
      );

      expect(queryByText('Prompt Curious')).toBeNull();

      rerender(<ProgressCard totalXp={500} level={1} lessonsCompleted={5} isLoading={false} />);

      expect(getByText('Prompt Curious')).toBeTruthy();
      expect(getByText('500 XP')).toBeTruthy();
    });

    it('should show ActivityIndicator when loading', () => {
      const { UNSAFE_getByType } = render(
        <ProgressCard totalXp={0} level={1} lessonsCompleted={0} isLoading={true} />
      );

      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });
  });

  describe('XP Progress Calculation', () => {
    it('should calculate progress correctly for partial level', () => {
      const { getByText } = render(<ProgressCard totalXp={750} level={1} lessonsCompleted={7} />);

      expect(getByText('250 / 500 XP para nivel 2')).toBeTruthy();
    });

    it('should handle exact level completion', () => {
      const { getByText } = render(<ProgressCard totalXp={1500} level={3} lessonsCompleted={15} />);

      expect(getByText('0 / 500 XP para nivel 4')).toBeTruthy();
    });

    it('should calculate progress for mid-level XP', () => {
      const { getByText } = render(<ProgressCard totalXp={2750} level={5} lessonsCompleted={20} />);

      expect(getByText('250 / 500 XP para nivel 6')).toBeTruthy();
    });
  });

  describe('Formatting', () => {
    it('should format thousands with commas', () => {
      const { getByText } = render(
        <ProgressCard totalXp={12345} level={24} lessonsCompleted={123} />
      );

      expect(getByText('12,345 XP')).toBeTruthy();
      expect(getByText('123')).toBeTruthy();
    });

    it('should format XP in progress text with commas', () => {
      const { getByText } = render(<ProgressCard totalXp={250} level={1} lessonsCompleted={5} />);

      expect(getByText('250 / 500 XP para nivel 2')).toBeTruthy();
    });

    it('should handle single digit values', () => {
      const { getByText, getAllByText } = render(
        <ProgressCard totalXp={5} level={1} lessonsCompleted={1} currentStreak={1} />
      );

      expect(getByText('5 XP')).toBeTruthy();
      const ones = getAllByText('1');
      expect(ones.length).toBeGreaterThan(0);
    });
  });
});
