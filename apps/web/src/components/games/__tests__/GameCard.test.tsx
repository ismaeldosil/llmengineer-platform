import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameCard } from '../GameCard';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Lock: 'Lock',
  Trophy: 'Trophy',
  ChevronRight: 'ChevronRight',
}));

// Mock Icon component
jest.mock('@/components/ui/Icon', () => ({
  Icon: ({ icon, size, color, variant }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    const iconName = typeof icon === 'string' ? icon : 'Icon';
    return React.createElement(Text, { testID: `icon-${iconName}` }, `Icon(${iconName})`);
  },
}));

const { router } = require('expo-router');

describe('GameCard', () => {
  const mockGameProps = {
    id: 'token-tetris',
    slug: 'token-tetris' as const,
    name: 'Token Tetris',
    description: 'Optimiza tokens mientras juegas Tetris',
    icon: '🧱',
    isLocked: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render game information correctly', () => {
    const { getByText } = render(<GameCard {...mockGameProps} />);

    expect(getByText('Token Tetris')).toBeTruthy();
    expect(getByText('Optimiza tokens mientras juegas Tetris')).toBeTruthy();
    expect(getByText('🧱')).toBeTruthy();
    expect(getByText('Jugar')).toBeTruthy();
  });

  it('should navigate to game route when card is pressed', () => {
    const { getByText } = render(<GameCard {...mockGameProps} />);

    const card = getByText('Token Tetris');
    fireEvent.press(card.parent?.parent?.parent);

    expect(router.push).toHaveBeenCalledWith('/games/token-tetris');
  });

  it('should navigate when play button is pressed', () => {
    const { getByText } = render(<GameCard {...mockGameProps} />);

    const playButton = getByText('Jugar');
    fireEvent.press(playButton.parent);

    expect(router.push).toHaveBeenCalledWith('/games/token-tetris');
  });

  it('should display high score badge when highScore is provided', () => {
    const { getByText } = render(<GameCard {...mockGameProps} highScore={1250} />);

    expect(getByText('1250')).toBeTruthy();
    expect(getByText('Icon(Trophy)')).toBeTruthy();
  });

  it('should not display high score badge when highScore is not provided', () => {
    const { queryByText } = render(<GameCard {...mockGameProps} />);

    expect(queryByText('Icon(Trophy)')).toBeNull();
  });

  it('should render locked state correctly', () => {
    const { getByText, queryByText, getAllByText } = render(
      <GameCard {...mockGameProps} isLocked={true} unlockRequirement="Completa 5 lecciones" />
    );

    expect(getByText('Completa 5 lecciones')).toBeTruthy();
    expect(queryByText('Jugar')).toBeNull();
    // Should show lock icons (header and footer)
    const lockIcons = getAllByText('Icon(Lock)');
    expect(lockIcons.length).toBeGreaterThan(0);
  });

  it('should not navigate when locked game is pressed', () => {
    const { getByText } = render(<GameCard {...mockGameProps} isLocked={true} />);

    const card = getByText('Token Tetris');
    fireEvent.press(card.parent?.parent?.parent);

    expect(router.push).not.toHaveBeenCalled();
  });

  it('should show default locked message when no unlock requirement provided', () => {
    const { getByText } = render(<GameCard {...mockGameProps} isLocked={true} />);

    expect(getByText('Bloqueado')).toBeTruthy();
  });

  it('should not display emoji icon when game is locked', () => {
    const { queryByText, getAllByText } = render(<GameCard {...mockGameProps} isLocked={true} />);

    expect(queryByText('🧱')).toBeNull();
    const lockIcons = getAllByText('Icon(Lock)');
    expect(lockIcons.length).toBeGreaterThan(0);
  });

  it('should handle multiple presses on unlocked game', () => {
    const { getByText } = render(<GameCard {...mockGameProps} />);

    const card = getByText('Token Tetris');
    fireEvent.press(card.parent?.parent?.parent);
    fireEvent.press(card.parent?.parent?.parent);

    expect(router.push).toHaveBeenCalledTimes(2);
  });

  it('should render different game slugs correctly', () => {
    const promptGolfProps = {
      ...mockGameProps,
      id: 'prompt-golf',
      slug: 'prompt-golf' as const,
      name: 'Prompt Golf',
      description: 'Logra el output en mínimos tokens',
      icon: '⛳',
    };

    const { getByText } = render(<GameCard {...promptGolfProps} />);

    expect(getByText('Prompt Golf')).toBeTruthy();
    expect(getByText('Logra el output en mínimos tokens')).toBeTruthy();
    expect(getByText('⛳')).toBeTruthy();

    fireEvent.press(getByText('Prompt Golf').parent?.parent?.parent);
    expect(router.push).toHaveBeenCalledWith('/games/prompt-golf');
  });

  it('should handle long game names with truncation', () => {
    const longName = 'This is a very long game name that should be truncated';
    const { getByText } = render(<GameCard {...mockGameProps} name={longName} />);

    expect(getByText(longName)).toBeTruthy();
  });

  it('should handle long descriptions with truncation', () => {
    const longDescription =
      'This is a very long description that should be truncated after two lines to prevent the card from becoming too tall and affecting the overall layout.';
    const { getByText } = render(<GameCard {...mockGameProps} description={longDescription} />);

    expect(getByText(longDescription)).toBeTruthy();
  });

  it('should display high score of zero correctly', () => {
    const { getByText } = render(<GameCard {...mockGameProps} highScore={0} />);

    expect(getByText('0')).toBeTruthy();
    expect(getByText('Icon(Trophy)')).toBeTruthy();
  });

  it('should handle large high score numbers', () => {
    const { getByText } = render(<GameCard {...mockGameProps} highScore={999999} />);

    expect(getByText('999999')).toBeTruthy();
  });

  it('should render all three game types correctly', () => {
    const games = [
      {
        id: 'token-tetris',
        slug: 'token-tetris' as const,
        name: 'Token Tetris',
        description: 'Optimiza tokens mientras juegas Tetris',
        icon: '🧱',
        isLocked: false,
      },
      {
        id: 'prompt-golf',
        slug: 'prompt-golf' as const,
        name: 'Prompt Golf',
        description: 'Logra el output en mínimos tokens',
        icon: '⛳',
        isLocked: false,
      },
      {
        id: 'embedding-match',
        slug: 'embedding-match' as const,
        name: 'Embedding Match',
        description: 'Memory de similitud semántica',
        icon: '🧠',
        isLocked: true,
        unlockRequirement: 'Completa 5 lecciones',
      },
    ];

    games.forEach((game) => {
      const { getByText, getAllByText } = render(<GameCard {...game} />);

      expect(getByText(game.name)).toBeTruthy();
      expect(getByText(game.description)).toBeTruthy();

      if (game.isLocked) {
        const lockIcons = getAllByText('Icon(Lock)');
        expect(lockIcons.length).toBeGreaterThan(0);
      } else {
        expect(getByText(game.icon)).toBeTruthy();
        expect(getByText('Jugar')).toBeTruthy();
      }
    });
  });

  it('should show play button with ChevronRight icon for unlocked games', () => {
    const { getByText } = render(<GameCard {...mockGameProps} />);

    expect(getByText('Jugar')).toBeTruthy();
    expect(getByText('Icon(ChevronRight)')).toBeTruthy();
  });

  it('should not show high score badge when game is locked even if highScore provided', () => {
    const { queryByText } = render(
      <GameCard {...mockGameProps} isLocked={true} highScore={1000} />
    );

    expect(queryByText('1000')).toBeNull();
    expect(queryByText('Icon(Trophy)')).toBeNull();
  });

  it('should maintain game metadata after interaction', () => {
    const { getByText } = render(<GameCard {...mockGameProps} highScore={500} />);

    // Interact with card
    const playButton = getByText('Jugar');
    fireEvent.press(playButton.parent);

    // Verify navigation was called
    expect(router.push).toHaveBeenCalledWith('/games/token-tetris');

    // Verify all content is still displayed
    expect(getByText('Token Tetris')).toBeTruthy();
    expect(getByText('Optimiza tokens mientras juegas Tetris')).toBeTruthy();
    expect(getByText('🧱')).toBeTruthy();
    expect(getByText('500')).toBeTruthy();
  });

  it('should handle press in and press out events', () => {
    const { getByText } = render(<GameCard {...mockGameProps} />);

    const card = getByText('Token Tetris').parent?.parent?.parent;

    // Should not throw errors
    expect(() => {
      fireEvent(card, 'pressIn');
      fireEvent(card, 'pressOut');
    }).not.toThrow();
  });

  it('should not animate when locked game is pressed', () => {
    const { getByText } = render(<GameCard {...mockGameProps} isLocked={true} />);

    const card = getByText('Token Tetris').parent?.parent?.parent;

    // Should not throw errors and should not navigate
    expect(() => {
      fireEvent(card, 'pressIn');
      fireEvent(card, 'pressOut');
      fireEvent.press(card);
    }).not.toThrow();

    expect(router.push).not.toHaveBeenCalled();
  });

  it('should display custom unlock requirements', () => {
    const customRequirements = [
      'Completa el tutorial',
      'Alcanza nivel 5',
      'Gana 3 juegos',
    ];

    customRequirements.forEach((requirement) => {
      const { getByText } = render(
        <GameCard {...mockGameProps} isLocked={true} unlockRequirement={requirement} />
      );

      expect(getByText(requirement)).toBeTruthy();
    });
  });
});
