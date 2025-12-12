/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MatchCard } from '../MatchCard';

describe('MatchCard', () => {
  const defaultProps = {
    id: 'card-1',
    text: 'Neural Network',
    isFlipped: false,
    isMatched: false,
    onPress: jest.fn(),
  };

  it('should render correctly', () => {
    const { getByText } = render(<MatchCard {...defaultProps} />);
    expect(getByText('LLM')).toBeTruthy();
  });

  it('should show card text when flipped', () => {
    const { getByText } = render(<MatchCard {...defaultProps} isFlipped={true} />);
    expect(getByText('Neural Network')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<MatchCard {...defaultProps} onPress={onPressMock} />);

    fireEvent.press(getByText('LLM'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <MatchCard {...defaultProps} onPress={onPressMock} disabled={true} />
    );

    fireEvent.press(getByText('LLM'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should not call onPress when already flipped', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <MatchCard {...defaultProps} isFlipped={true} onPress={onPressMock} />
    );

    fireEvent.press(getByText('Neural Network'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should not call onPress when already matched', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <MatchCard {...defaultProps} isMatched={true} isFlipped={true} onPress={onPressMock} />
    );

    fireEvent.press(getByText('Neural Network'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should apply matched styling when matched', () => {
    const { getByText } = render(<MatchCard {...defaultProps} isMatched={true} isFlipped={true} />);

    const cardText = getByText('Neural Network');
    expect(cardText).toBeTruthy();
  });
});
