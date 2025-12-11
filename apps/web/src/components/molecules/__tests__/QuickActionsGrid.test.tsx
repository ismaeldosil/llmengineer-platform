import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickActionsGrid, type QuickAction } from '../QuickActionsGrid';

describe('QuickActionsGrid', () => {
  const mockActions: QuickAction[] = [
    { id: 'lessons', icon: '📚', label: 'Lecciones', onPress: jest.fn() },
    { id: 'games', icon: '🎮', label: 'Mini-juegos', onPress: jest.fn() },
    { id: 'leaderboard', icon: '🏆', label: 'Ranking', onPress: jest.fn() },
    { id: 'profile', icon: '👤', label: 'Perfil', onPress: jest.fn() },
  ];

  beforeEach(() => {
    mockActions.forEach((action) => {
      (action.onPress as jest.Mock).mockClear();
    });
  });

  it('should render all actions', () => {
    const { getByText } = render(<QuickActionsGrid actions={mockActions} />);

    expect(getByText('Lecciones')).toBeTruthy();
    expect(getByText('Mini-juegos')).toBeTruthy();
    expect(getByText('Ranking')).toBeTruthy();
    expect(getByText('Perfil')).toBeTruthy();
  });

  it('should render all action icons', () => {
    const { getByText } = render(<QuickActionsGrid actions={mockActions} />);

    expect(getByText('📚')).toBeTruthy();
    expect(getByText('🎮')).toBeTruthy();
    expect(getByText('🏆')).toBeTruthy();
    expect(getByText('👤')).toBeTruthy();
  });

  it('should call onPress when action is pressed', () => {
    const { getByTestId } = render(<QuickActionsGrid actions={mockActions} />);

    const lessonsButton = getByTestId('action-lessons');
    fireEvent.press(lessonsButton);

    expect(mockActions[0].onPress).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple presses correctly', () => {
    const { getByTestId } = render(<QuickActionsGrid actions={mockActions} />);

    const lessonsButton = getByTestId('action-lessons');
    const gamesButton = getByTestId('action-games');

    fireEvent.press(lessonsButton);
    fireEvent.press(gamesButton);
    fireEvent.press(lessonsButton);

    expect(mockActions[0].onPress).toHaveBeenCalledTimes(2);
    expect(mockActions[1].onPress).toHaveBeenCalledTimes(1);
  });

  it('should render empty grid with no actions', () => {
    const { queryByText } = render(<QuickActionsGrid actions={[]} />);

    expect(queryByText('Lecciones')).toBeNull();
  });

  it('should render single action correctly', () => {
    const singleAction: QuickAction[] = [
      { id: 'test', icon: '🧪', label: 'Test', onPress: jest.fn() },
    ];

    const { getByText, getByTestId } = render(
      <QuickActionsGrid actions={singleAction} />
    );

    expect(getByText('Test')).toBeTruthy();
    expect(getByText('🧪')).toBeTruthy();

    const button = getByTestId('action-test');
    fireEvent.press(button);

    expect(singleAction[0].onPress).toHaveBeenCalledTimes(1);
  });

  it('should render all actions with testIDs', () => {
    const { getByTestId } = render(<QuickActionsGrid actions={mockActions} />);

    expect(getByTestId('action-lessons')).toBeTruthy();
    expect(getByTestId('action-games')).toBeTruthy();
    expect(getByTestId('action-leaderboard')).toBeTruthy();
    expect(getByTestId('action-profile')).toBeTruthy();
  });

  it('should not crash with long labels', () => {
    const longLabelActions: QuickAction[] = [
      {
        id: 'long',
        icon: '📖',
        label: 'This is a very long label that might wrap',
        onPress: jest.fn(),
      },
    ];

    const { getByText } = render(<QuickActionsGrid actions={longLabelActions} />);

    expect(getByText('This is a very long label that might wrap')).toBeTruthy();
  });
});
