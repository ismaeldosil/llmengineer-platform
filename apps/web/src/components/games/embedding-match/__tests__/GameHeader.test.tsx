import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameHeader } from '../GameHeader';

describe('GameHeader', () => {
  const defaultProps = {
    score: 500,
    timeRemaining: 120,
    level: 'medium' as const,
    matchedPairs: 3,
    totalPairs: 8,
    isPaused: false,
    onPauseToggle: jest.fn(),
  };

  it('should render score correctly', () => {
    const { getByText } = render(<GameHeader {...defaultProps} />);
    expect(getByText('500')).toBeTruthy();
  });

  it('should format time correctly', () => {
    const { getByText } = render(<GameHeader {...defaultProps} />);
    expect(getByText('2:00')).toBeTruthy();
  });

  it('should display matched pairs progress', () => {
    const { getByText } = render(<GameHeader {...defaultProps} />);
    expect(getByText('3/8')).toBeTruthy();
  });

  it('should display level correctly', () => {
    const { getByText } = render(<GameHeader {...defaultProps} />);
    expect(getByText('Medium')).toBeTruthy();
  });

  it('should call onPauseToggle when pause button is pressed', () => {
    const onPauseToggleMock = jest.fn();
    const { getByText } = render(
      <GameHeader {...defaultProps} onPauseToggle={onPauseToggleMock} />
    );

    fireEvent.press(getByText('Pause'));
    expect(onPauseToggleMock).toHaveBeenCalledTimes(1);
  });

  it('should show Resume when paused', () => {
    const { getByText } = render(<GameHeader {...defaultProps} isPaused={true} />);
    expect(getByText('Resume')).toBeTruthy();
  });

  it('should format time with leading zero for seconds', () => {
    const { getByText } = render(<GameHeader {...defaultProps} timeRemaining={65} />);
    expect(getByText('1:05')).toBeTruthy();
  });

  it('should display easy level in green', () => {
    const { getByText } = render(<GameHeader {...defaultProps} level="easy" />);
    expect(getByText('Easy')).toBeTruthy();
  });

  it('should display hard level in red', () => {
    const { getByText } = render(<GameHeader {...defaultProps} level="hard" />);
    expect(getByText('Hard')).toBeTruthy();
  });
});
