/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameResult } from '../GameResult';

describe('GameResult', () => {
  const defaultProps = {
    score: 850,
    timeElapsed: 45,
    matchedPairs: 8,
    totalPairs: 8,
    level: 'medium' as const,
    accuracy: 88.5,
    isVictory: true,
    onPlayAgain: jest.fn(),
    onChangeLevel: jest.fn(),
    onGoHome: jest.fn(),
  };

  it('should render victory message', () => {
    const { getByText } = render(<GameResult {...defaultProps} />);
    expect(getByText('Excellent!')).toBeTruthy();
  });

  it('should render defeat message when not victory', () => {
    const { getByText } = render(<GameResult {...defaultProps} isVictory={false} />);
    expect(getByText("Time's Up!")).toBeTruthy();
  });

  it('should display score correctly', () => {
    const { getByText } = render(<GameResult {...defaultProps} />);
    expect(getByText('850')).toBeTruthy();
  });

  it('should format time correctly', () => {
    const { getByText } = render(<GameResult {...defaultProps} />);
    expect(getByText('0:45')).toBeTruthy();
  });

  it('should display matched pairs', () => {
    const { getByText } = render(<GameResult {...defaultProps} />);
    expect(getByText('8/8')).toBeTruthy();
  });

  it('should display accuracy percentage', () => {
    const { getByText } = render(<GameResult {...defaultProps} />);
    expect(getByText('89%')).toBeTruthy();
  });

  it('should call onPlayAgain when Play Again is pressed', () => {
    const onPlayAgainMock = jest.fn();
    const { getByText } = render(<GameResult {...defaultProps} onPlayAgain={onPlayAgainMock} />);

    fireEvent.press(getByText('Play Again'));
    expect(onPlayAgainMock).toHaveBeenCalledTimes(1);
  });

  it('should call onChangeLevel when Change Level is pressed', () => {
    const onChangeLevelMock = jest.fn();
    const { getByText } = render(
      <GameResult {...defaultProps} onChangeLevel={onChangeLevelMock} />
    );

    fireEvent.press(getByText('Change Level'));
    expect(onChangeLevelMock).toHaveBeenCalledTimes(1);
  });

  it('should call onGoHome when Home is pressed', () => {
    const onGoHomeMock = jest.fn();
    const { getByText } = render(<GameResult {...defaultProps} onGoHome={onGoHomeMock} />);

    fireEvent.press(getByText('Home'));
    expect(onGoHomeMock).toHaveBeenCalledTimes(1);
  });

  it('should show Perfect message for high accuracy and fast time', () => {
    const { getByText } = render(<GameResult {...defaultProps} accuracy={95} timeElapsed={50} />);
    expect(getByText('Perfect!')).toBeTruthy();
  });

  it('should display level', () => {
    const { getByText } = render(<GameResult {...defaultProps} />);
    expect(getByText('Medium')).toBeTruthy();
  });

  it('should render no stars when not victory', () => {
    const { queryByText } = render(<GameResult {...defaultProps} isVictory={false} />);
    // Stars should not be visible for non-victory
    expect(queryByText('Perfect!')).toBeFalsy();
  });
});
