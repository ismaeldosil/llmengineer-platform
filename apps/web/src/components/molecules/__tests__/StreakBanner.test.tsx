import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StreakBanner } from '../StreakBanner';

describe('StreakBanner', () => {
  const mockOnCheckin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with streak count', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={5} onCheckin={mockOnCheckin} />
    );

    expect(getByText('5 días')).toBeTruthy();
    expect(getByText('Racha actual')).toBeTruthy();
    expect(getByText('Check-in')).toBeTruthy();
  });

  it('should show sparkle emoji for streak less than 3', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={2} onCheckin={mockOnCheckin} />
    );

    expect(getByText('✨')).toBeTruthy();
  });

  it('should show lightning emoji for streak between 3 and 6', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={5} onCheckin={mockOnCheckin} />
    );

    expect(getByText('⚡')).toBeTruthy();
  });

  it('should show fire emoji for streak 7 or more', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={10} onCheckin={mockOnCheckin} />
    );

    expect(getByText('🔥')).toBeTruthy();
  });

  it('should call onCheckin when button is pressed', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={3} onCheckin={mockOnCheckin} />
    );

    const checkinButton = getByText('Check-in');
    fireEvent.press(checkinButton);

    expect(mockOnCheckin).toHaveBeenCalledTimes(1);
  });

  it('should handle zero streak', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={0} onCheckin={mockOnCheckin} />
    );

    expect(getByText('0 días')).toBeTruthy();
    expect(getByText('✨')).toBeTruthy();
  });

  it('should handle large streak numbers', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={365} onCheckin={mockOnCheckin} />
    );

    expect(getByText('365 días')).toBeTruthy();
    expect(getByText('🔥')).toBeTruthy();
  });

  it('should call onCheckin multiple times when pressed multiple times', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={5} onCheckin={mockOnCheckin} />
    );

    const checkinButton = getByText('Check-in');
    fireEvent.press(checkinButton);
    fireEvent.press(checkinButton);
    fireEvent.press(checkinButton);

    expect(mockOnCheckin).toHaveBeenCalledTimes(3);
  });

  it('should show correct emoji at boundary values', () => {
    const { getByText: getByText3 } = render(
      <StreakBanner currentStreak={3} onCheckin={mockOnCheckin} />
    );
    expect(getByText3('⚡')).toBeTruthy();

    const { getByText: getByText7 } = render(
      <StreakBanner currentStreak={7} onCheckin={mockOnCheckin} />
    );
    expect(getByText7('🔥')).toBeTruthy();
  });

  it('should render single day streak', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={1} onCheckin={mockOnCheckin} />
    );

    expect(getByText('1 días')).toBeTruthy();
  });
});
