/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StreakBanner } from '../StreakBanner';

describe('StreakBanner', () => {
  const mockOnCheckin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with streak count', () => {
    const { getByText } = render(<StreakBanner currentStreak={5} onCheckin={mockOnCheckin} />);

    expect(getByText('5 días')).toBeTruthy();
    expect(getByText('Check-in')).toBeTruthy();
  });

  it('should show sparkle emoji for streak less than 3', () => {
    const { getByText } = render(<StreakBanner currentStreak={2} onCheckin={mockOnCheckin} />);

    expect(getByText('✨')).toBeTruthy();
  });

  it('should show lightning emoji for streak between 3 and 6', () => {
    const { getByText } = render(<StreakBanner currentStreak={5} onCheckin={mockOnCheckin} />);

    expect(getByText('⚡')).toBeTruthy();
  });

  it('should show fire emoji for streak 7 or more', () => {
    const { getByText } = render(<StreakBanner currentStreak={10} onCheckin={mockOnCheckin} />);

    expect(getByText('🔥')).toBeTruthy();
  });

  it('should call onCheckin when button is pressed', () => {
    const { getByText } = render(<StreakBanner currentStreak={3} onCheckin={mockOnCheckin} />);

    const checkinButton = getByText('Check-in');
    fireEvent.press(checkinButton);

    expect(mockOnCheckin).toHaveBeenCalledTimes(1);
  });

  it('should handle zero streak', () => {
    const { getByText } = render(<StreakBanner currentStreak={0} onCheckin={mockOnCheckin} />);

    expect(getByText('0 días')).toBeTruthy();
    expect(getByText('✨')).toBeTruthy();
  });

  it('should handle large streak numbers', () => {
    const { getByText } = render(<StreakBanner currentStreak={365} onCheckin={mockOnCheckin} />);

    expect(getByText('365 días')).toBeTruthy();
    expect(getByText('🔥')).toBeTruthy();
  });

  it('should call onCheckin multiple times when pressed multiple times', () => {
    const { getByText } = render(<StreakBanner currentStreak={5} onCheckin={mockOnCheckin} />);

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
    const { getByText } = render(<StreakBanner currentStreak={1} onCheckin={mockOnCheckin} />);

    expect(getByText('1 días')).toBeTruthy();
  });

  // New tests for enhanced functionality
  it('should show lost state with correct emoji and message', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={0} streakState="lost" onCheckin={mockOnCheckin} />
    );

    expect(getByText('💔')).toBeTruthy();
    expect(getByText('No te rindas, empieza de nuevo hoy')).toBeTruthy();
    expect(getByText('Reiniciar')).toBeTruthy();
  });

  it('should show at-risk state with correct emoji and message', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={5} streakState="at-risk" onCheckin={mockOnCheckin} />
    );

    expect(getByText('⚠️')).toBeTruthy();
    expect(getByText('Tu racha está en riesgo, completa una lección hoy')).toBeTruthy();
  });

  it('should show motivational message for low streak', () => {
    const { getByText } = render(<StreakBanner currentStreak={0} onCheckin={mockOnCheckin} />);

    expect(getByText('Buen comienzo, sigue así')).toBeTruthy();
  });

  it('should show building message for streak 1-2', () => {
    const { getByText } = render(<StreakBanner currentStreak={1} onCheckin={mockOnCheckin} />);

    expect(getByText('Vas muy bien, mantén el ritmo')).toBeTruthy();
  });

  it('should show hot message for streak 3-6', () => {
    const { getByText } = render(<StreakBanner currentStreak={5} onCheckin={mockOnCheckin} />);

    expect(getByText('Estás en llamas, sigue así')).toBeTruthy();
  });

  it('should show milestone message for 7 day streak', () => {
    const { getByText } = render(<StreakBanner currentStreak={7} onCheckin={mockOnCheckin} />);

    expect(getByText('Increíble, 7 días seguidos')).toBeTruthy();
    expect(getByText('🔥')).toBeTruthy();
  });

  it('should show milestone message for 30 day streak', () => {
    const { getByText } = render(<StreakBanner currentStreak={30} onCheckin={mockOnCheckin} />);

    expect(getByText('Eres una leyenda, 30 días de racha')).toBeTruthy();
    expect(getByText('🔥')).toBeTruthy();
  });

  it('should not render check-in button when onCheckin is not provided', () => {
    const { queryByText } = render(<StreakBanner currentStreak={5} />);

    expect(queryByText('Check-in')).toBeNull();
  });

  it('should render check-in button when onCheckin is provided', () => {
    const { getByText } = render(<StreakBanner currentStreak={5} onCheckin={mockOnCheckin} />);

    expect(getByText('Check-in')).toBeTruthy();
  });

  it('should show Reiniciar button for lost state', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={0} streakState="lost" onCheckin={mockOnCheckin} />
    );

    expect(getByText('Reiniciar')).toBeTruthy();
  });

  it('should handle active state correctly', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={10} streakState="active" onCheckin={mockOnCheckin} />
    );

    expect(getByText('10 días')).toBeTruthy();
    expect(getByText('Check-in')).toBeTruthy();
  });

  it('should display correct color for lost state', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={0} streakState="lost" onCheckin={mockOnCheckin} />
    );

    const streakText = getByText('0 días');
    expect(streakText).toBeTruthy();
  });

  it('should display correct color for at-risk state', () => {
    const { getByText } = render(
      <StreakBanner currentStreak={5} streakState="at-risk" onCheckin={mockOnCheckin} />
    );

    const streakText = getByText('5 días');
    expect(streakText).toBeTruthy();
  });

  it('should handle milestone thresholds correctly', () => {
    // Test 7 day milestone
    const { getByText: getText7 } = render(
      <StreakBanner currentStreak={7} onCheckin={mockOnCheckin} />
    );
    expect(getText7('Increíble, 7 días seguidos')).toBeTruthy();

    // Test 30 day milestone
    const { getByText: getText30 } = render(
      <StreakBanner currentStreak={30} onCheckin={mockOnCheckin} />
    );
    expect(getText30('Eres una leyenda, 30 días de racha')).toBeTruthy();

    // Test 100 day milestone (should still show 30 day message)
    const { getByText: getText100 } = render(
      <StreakBanner currentStreak={100} onCheckin={mockOnCheckin} />
    );
    expect(getText100('Eres una leyenda, 30 días de racha')).toBeTruthy();
  });
});
