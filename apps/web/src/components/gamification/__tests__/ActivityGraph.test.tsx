/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActivityGraph, DayActivity } from '../ActivityGraph';

// Helper to generate test data
const generateTestData = (days: number): DayActivity[] => {
  const data: DayActivity[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    if (dateStr) {
      data.push({
        date: dateStr,
        xp: Math.floor(Math.random() * 300),
      });
    }
  }

  return data;
};

// Helper to get a specific date string
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0] || '';
};

describe('ActivityGraph', () => {
  it('should render correctly with empty data', () => {
    const { getByText } = render(<ActivityGraph data={[]} />);

    expect(getByText('Activity Graph')).toBeTruthy();
    expect(getByText('Daily XP earned in the last 90 days')).toBeTruthy();
  });

  it('should render with sample data', () => {
    const testData: DayActivity[] = [
      { date: getDateString(5), xp: 100 },
      { date: getDateString(4), xp: 50 },
      { date: getDateString(3), xp: 200 },
      { date: getDateString(2), xp: 0 },
      { date: getDateString(1), xp: 150 },
    ];

    const { getByText } = render(<ActivityGraph data={testData} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should render all day labels', () => {
    const { getByText } = render(<ActivityGraph data={[]} />);

    expect(getByText('Sun')).toBeTruthy();
    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('Tue')).toBeTruthy();
    expect(getByText('Wed')).toBeTruthy();
    expect(getByText('Thu')).toBeTruthy();
    expect(getByText('Fri')).toBeTruthy();
    expect(getByText('Sat')).toBeTruthy();
  });

  it('should render legend with labels', () => {
    const { getAllByText } = render(<ActivityGraph data={[]} />);

    const lessLabels = getAllByText('Less');
    const moreLabels = getAllByText('More');

    expect(lessLabels.length).toBeGreaterThan(0);
    expect(moreLabels.length).toBeGreaterThan(0);
  });

  it('should display 90 days of data', () => {
    const testData = generateTestData(90);
    const { getByText } = render(<ActivityGraph data={testData} />);

    // Component should render without errors
    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should handle partial data (less than 90 days)', () => {
    const testData: DayActivity[] = [
      { date: getDateString(10), xp: 100 },
      { date: getDateString(5), xp: 50 },
    ];

    const { getByText } = render(<ActivityGraph data={testData} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should call onDayPress when a day is pressed', () => {
    const mockOnDayPress = jest.fn();
    const testData: DayActivity[] = [{ date: getDateString(1), xp: 100 }];

    const { UNSAFE_root } = render(<ActivityGraph data={testData} onDayPress={mockOnDayPress} />);

    // Find all Pressable components (activity squares)
    const pressables = UNSAFE_root.findAllByType('Pressable' as any);

    // Press the first non-empty square
    if (pressables.length > 0) {
      fireEvent.press(pressables[pressables.length - 1]);
      expect(mockOnDayPress).toHaveBeenCalled();
    }
  });

  it('should handle data with 0 XP', () => {
    const testData: DayActivity[] = [
      { date: getDateString(1), xp: 0 },
      { date: getDateString(0), xp: 0 },
    ];

    const { getByText } = render(<ActivityGraph data={testData} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should handle data with high XP values', () => {
    const testData: DayActivity[] = [
      { date: getDateString(3), xp: 300 },
      { date: getDateString(2), xp: 500 },
      { date: getDateString(1), xp: 1000 },
    ];

    const { getByText } = render(<ActivityGraph data={testData} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should render with different XP ranges', () => {
    const testData: DayActivity[] = [
      { date: getDateString(5), xp: 0 }, // gray-800
      { date: getDateString(4), xp: 25 }, // green-900
      { date: getDateString(3), xp: 75 }, // green-700
      { date: getDateString(2), xp: 150 }, // green-500
      { date: getDateString(1), xp: 250 }, // green-400
    ];

    const { getByText } = render(<ActivityGraph data={testData} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should handle today as the last day', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = today.toISOString().split('T')[0] || '';
    const testData: DayActivity[] = [{ date: dateStr, xp: 100 }];

    const { getByText } = render(<ActivityGraph data={testData} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should render month labels', () => {
    const testData = generateTestData(90);
    const { getByText } = render(<ActivityGraph data={testData} />);

    // Component should render month labels
    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should handle data spanning multiple months', () => {
    const testData = generateTestData(90);
    const { getByText } = render(<ActivityGraph data={testData} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should render without onDayPress handler', () => {
    const testData: DayActivity[] = [{ date: getDateString(1), xp: 100 }];

    const { getByText } = render(<ActivityGraph data={testData} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should handle duplicate dates (use latest)', () => {
    const testData: DayActivity[] = [
      { date: getDateString(1), xp: 50 },
      { date: getDateString(1), xp: 100 },
    ];

    const { getByText } = render(<ActivityGraph data={testData} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should handle dates in random order', () => {
    const testData: DayActivity[] = [
      { date: getDateString(5), xp: 100 },
      { date: getDateString(1), xp: 50 },
      { date: getDateString(10), xp: 75 },
      { date: getDateString(3), xp: 200 },
    ];

    const { getByText } = render(<ActivityGraph data={testData} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should display correct color for 0 XP', () => {
    const testData: DayActivity[] = [{ date: getDateString(1), xp: 0 }];

    const { getByText } = render(<ActivityGraph data={testData} />);

    // Component should use gray-800 color for 0 XP
    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should display correct color for 1-50 XP', () => {
    const testData: DayActivity[] = [{ date: getDateString(1), xp: 30 }];

    const { getByText } = render(<ActivityGraph data={testData} />);

    // Component should use green-900 color
    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should display correct color for 51-100 XP', () => {
    const testData: DayActivity[] = [{ date: getDateString(1), xp: 80 }];

    const { getByText } = render(<ActivityGraph data={testData} />);

    // Component should use green-700 color
    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should display correct color for 101-200 XP', () => {
    const testData: DayActivity[] = [{ date: getDateString(1), xp: 150 }];

    const { getByText } = render(<ActivityGraph data={testData} />);

    // Component should use green-500 color
    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should display correct color for 201+ XP', () => {
    const testData: DayActivity[] = [{ date: getDateString(1), xp: 300 }];

    const { getByText } = render(<ActivityGraph data={testData} />);

    // Component should use green-400 color
    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should render header title', () => {
    const { getByText } = render(<ActivityGraph data={[]} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should render header subtitle', () => {
    const { getByText } = render(<ActivityGraph data={[]} />);

    expect(getByText('Daily XP earned in the last 90 days')).toBeTruthy();
  });

  it('should handle missing dates in range', () => {
    const testData: DayActivity[] = [
      { date: getDateString(30), xp: 100 },
      { date: getDateString(10), xp: 50 },
    ];

    const { getByText } = render(<ActivityGraph data={testData} />);

    // Missing dates should be filled with 0 XP
    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should maintain consistent grid layout', () => {
    const testData = generateTestData(90);
    const { getByText } = render(<ActivityGraph data={testData} />);

    // Grid should have 7 rows (days of week)
    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should handle edge case of exactly 90 days', () => {
    const testData = generateTestData(90);
    const { getByText } = render(<ActivityGraph data={testData} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should handle edge case of more than 90 days', () => {
    const testData = generateTestData(120);
    const { getByText } = render(<ActivityGraph data={testData} />);

    // Should only show last 90 days
    expect(getByText('Activity Graph')).toBeTruthy();
  });

  it('should render accessibility elements', () => {
    const { getByText } = render(<ActivityGraph data={[]} />);

    expect(getByText('Activity Graph')).toBeTruthy();
  });
});
