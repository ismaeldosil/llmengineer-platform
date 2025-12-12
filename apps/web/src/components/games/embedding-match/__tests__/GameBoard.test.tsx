/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameBoard, Card } from '../GameBoard';

describe('GameBoard', () => {
  const mockCards: Card[] = [
    {
      id: 'card-1',
      text: 'Neural Network',
      pairId: 'pair-1',
      isFlipped: false,
      isMatched: false,
    },
    {
      id: 'card-2',
      text: 'Deep Learning',
      pairId: 'pair-1',
      isFlipped: false,
      isMatched: false,
    },
    {
      id: 'card-3',
      text: 'Transformer',
      pairId: 'pair-2',
      isFlipped: false,
      isMatched: false,
    },
    {
      id: 'card-4',
      text: 'Attention',
      pairId: 'pair-2',
      isFlipped: false,
      isMatched: false,
    },
  ];

  const defaultProps = {
    cards: mockCards,
    onCardPress: jest.fn(),
  };

  it('should render all cards', () => {
    const { getAllByText } = render(<GameBoard {...defaultProps} />);

    // All cards start face down, so they show 'LLM'
    const llmCards = getAllByText('LLM');
    expect(llmCards).toHaveLength(4);
  });

  it('should call onCardPress when a card is tapped', () => {
    const onCardPressMock = jest.fn();
    const { getAllByText } = render(<GameBoard {...defaultProps} onCardPress={onCardPressMock} />);

    const cards = getAllByText('LLM');
    fireEvent.press(cards[0]);

    expect(onCardPressMock).toHaveBeenCalledWith('card-1');
  });

  it('should not call onCardPress when disabled', () => {
    const onCardPressMock = jest.fn();
    const { getAllByText } = render(
      <GameBoard {...defaultProps} onCardPress={onCardPressMock} disabled={true} />
    );

    const cards = getAllByText('LLM');
    fireEvent.press(cards[0]);

    expect(onCardPressMock).not.toHaveBeenCalled();
  });

  it('should render flipped cards with their text', () => {
    const flippedCards = mockCards.map((card, index) =>
      index === 0 ? { ...card, isFlipped: true } : card
    );

    const { getByText } = render(<GameBoard {...defaultProps} cards={flippedCards} />);

    expect(getByText('Neural Network')).toBeTruthy();
  });

  it('should render matched cards', () => {
    const matchedCards = mockCards.map((card, index) =>
      index < 2 ? { ...card, isFlipped: true, isMatched: true } : card
    );

    const { getByText } = render(<GameBoard {...defaultProps} cards={matchedCards} />);

    expect(getByText('Neural Network')).toBeTruthy();
    expect(getByText('Deep Learning')).toBeTruthy();
  });
});
