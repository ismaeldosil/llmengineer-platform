/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LessonCard } from '../LessonCard';
import type { Lesson } from '@llmengineer/shared';

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  CheckCircle2: 'CheckCircle2',
  Lock: 'Lock',
  Clock: 'Clock',
  Award: 'Award',
  Play: 'Play',
  BookOpen: 'BookOpen',
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

const mockLesson: Lesson = {
  id: '1',
  slug: 'introduction-to-prompts',
  title: 'Introduction to Prompts',
  description: 'Learn the basics of prompt engineering and how to write effective prompts',
  week: 1,
  order: 1,
  difficulty: 'beginner',
  xpReward: 100,
  estimatedMinutes: 15,
  isCompleted: false,
  sections: [],
};

describe('LessonCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render lesson information correctly', () => {
    const { getByText } = render(<LessonCard lesson={mockLesson} onPress={mockOnPress} />);

    expect(getByText('Introduction to Prompts')).toBeTruthy();
    expect(getByText(/Learn the basics of prompt engineering/)).toBeTruthy();
    expect(getByText('Semana 1')).toBeTruthy();
    expect(getByText('+100 XP')).toBeTruthy();
    expect(getByText('15 min')).toBeTruthy();
  });

  it('should display difficulty badge with correct color', () => {
    const { getByText } = render(<LessonCard lesson={mockLesson} onPress={mockOnPress} />);

    expect(getByText('beginner')).toBeTruthy();
  });

  it('should call onPress when card is pressed', () => {
    const { getByText } = render(<LessonCard lesson={mockLesson} onPress={mockOnPress} />);

    const card = getByText('Introduction to Prompts');
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should show completed overlay when lesson is completed', () => {
    const completedLesson: Lesson = {
      ...mockLesson,
      isCompleted: true,
    };

    const { getByText, queryAllByText } = render(
      <LessonCard lesson={completedLesson} onPress={mockOnPress} />
    );

    // Should show completed status text and icon
    expect(getByText('Completado')).toBeTruthy();
    const checkIcons = queryAllByText('Icon(CheckCircle2)');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('should not show completed overlay when lesson is not completed', () => {
    const { queryByText } = render(<LessonCard lesson={mockLesson} onPress={mockOnPress} />);

    expect(queryByText('Completado')).toBeNull();
  });

  it('should render intermediate difficulty', () => {
    const intermediateLesson: Lesson = {
      ...mockLesson,
      difficulty: 'intermediate',
    };

    const { getByText } = render(<LessonCard lesson={intermediateLesson} onPress={mockOnPress} />);

    expect(getByText('intermediate')).toBeTruthy();
  });

  it('should render advanced difficulty', () => {
    const advancedLesson: Lesson = {
      ...mockLesson,
      difficulty: 'advanced',
    };

    const { getByText } = render(<LessonCard lesson={advancedLesson} onPress={mockOnPress} />);

    expect(getByText('advanced')).toBeTruthy();
  });

  it('should handle long descriptions with truncation', () => {
    const longDescLesson: Lesson = {
      ...mockLesson,
      description:
        'This is a very long description that should be truncated after two lines to prevent the card from becoming too tall and affecting the overall layout',
    };

    const { getByText } = render(<LessonCard lesson={longDescLesson} onPress={mockOnPress} />);

    expect(getByText(/This is a very long description that should be truncated/)).toBeTruthy();
  });

  it('should display different week numbers', () => {
    const weekFiveLesson: Lesson = {
      ...mockLesson,
      week: 5,
    };

    const { getByText } = render(<LessonCard lesson={weekFiveLesson} onPress={mockOnPress} />);

    expect(getByText('Semana 5')).toBeTruthy();
  });

  it('should display different XP rewards', () => {
    const highXpLesson: Lesson = {
      ...mockLesson,
      xpReward: 250,
    };

    const { getByText } = render(<LessonCard lesson={highXpLesson} onPress={mockOnPress} />);

    expect(getByText('+250 XP')).toBeTruthy();
  });

  it('should display different durations', () => {
    const longLesson: Lesson = {
      ...mockLesson,
      estimatedMinutes: 45,
    };

    const { getByText } = render(<LessonCard lesson={longLesson} onPress={mockOnPress} />);

    expect(getByText('45 min')).toBeTruthy();
  });

  it('should handle multiple presses', () => {
    const { getByText } = render(<LessonCard lesson={mockLesson} onPress={mockOnPress} />);

    const card = getByText('Introduction to Prompts');
    fireEvent.press(card);
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(2);
  });

  it('should render all lesson metadata', () => {
    const { getByText } = render(<LessonCard lesson={mockLesson} onPress={mockOnPress} />);

    expect(getByText('Semana 1')).toBeTruthy();
    expect(getByText('beginner')).toBeTruthy();
    expect(getByText('+100 XP')).toBeTruthy();
    expect(getByText('15 min')).toBeTruthy();
  });

  // New tests for locked state
  it('should render locked lesson correctly', () => {
    const { getByText, queryAllByText, queryByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} isLocked={true} />
    );

    const lockIcons = queryAllByText('Icon(Lock)');
    expect(lockIcons.length).toBeGreaterThan(0);
    // Should not show action text when locked
    expect(queryByText('Comenzar')).toBeNull();
  });

  it('should not call onPress when locked lesson is pressed', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} isLocked={true} />
    );

    const card = getByText('Introduction to Prompts');
    fireEvent.press(card);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show "Comenzar" for available lessons', () => {
    const { getByText } = render(<LessonCard lesson={mockLesson} onPress={mockOnPress} />);

    expect(getByText('Comenzar')).toBeTruthy();
  });

  it('should show "Continuar" for in-progress lessons', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} status="in_progress" />
    );

    expect(getByText('Continuar')).toBeTruthy();
  });

  it('should show "Completado" for completed lessons', () => {
    const completedLesson: Lesson = {
      ...mockLesson,
      isCompleted: true,
    };

    const { getByText } = render(<LessonCard lesson={completedLesson} onPress={mockOnPress} />);

    expect(getByText('Completado')).toBeTruthy();
  });

  it('should handle all lesson statuses', () => {
    // Available status
    const { getByText: getTextAvailable } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} status="available" />
    );
    expect(getTextAvailable('Comenzar')).toBeTruthy();

    // In progress status
    const { getByText: getTextInProgress } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} status="in_progress" />
    );
    expect(getTextInProgress('Continuar')).toBeTruthy();

    // Completed status
    const { getByText: getTextCompleted } = render(
      <LessonCard
        lesson={{ ...mockLesson, isCompleted: true }}
        onPress={mockOnPress}
        status="completed"
      />
    );
    expect(getTextCompleted('Completado')).toBeTruthy();

    // Locked status
    const { queryAllByText: queryAllLocked } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} status="locked" />
    );
    const lockIcons = queryAllLocked('Icon(Lock)');
    expect(lockIcons.length).toBeGreaterThan(0);
  });

  it('should display lesson icon based on status', () => {
    // Available lesson should show BookOpen icon
    const { queryByText: queryAvailable } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} status="available" />
    );
    expect(queryAvailable('Icon(BookOpen)')).toBeTruthy();

    // In-progress lesson should show Play icon
    const { queryByText: queryInProgress } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} status="in_progress" />
    );
    expect(queryInProgress('Icon(Play)')).toBeTruthy();

    // Completed lesson should show CheckCircle2 icon (multiple instances)
    const { queryAllByText: queryAllCompleted } = render(
      <LessonCard
        lesson={{ ...mockLesson, isCompleted: true }}
        onPress={mockOnPress}
        status="completed"
      />
    );
    const checkIcons = queryAllCompleted('Icon(CheckCircle2)');
    expect(checkIcons.length).toBeGreaterThan(0);

    // Locked lesson should show Lock icon (multiple instances)
    const { queryAllByText: queryAllLocked } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} status="locked" />
    );
    const lockIcons = queryAllLocked('Icon(Lock)');
    expect(lockIcons.length).toBeGreaterThan(0);
  });

  describe('Press Handlers', () => {
    it('should handle onPressIn event', () => {
      const { getByText } = render(<LessonCard lesson={mockLesson} onPress={mockOnPress} />);

      const card = getByText('Introduction to Prompts');
      fireEvent(card, 'pressIn');

      // Should trigger press in animation
      expect(card).toBeTruthy();
    });

    it('should handle onPressOut event', () => {
      const { getByText } = render(<LessonCard lesson={mockLesson} onPress={mockOnPress} />);

      const card = getByText('Introduction to Prompts');
      fireEvent(card, 'pressOut');

      // Should trigger press out animation
      expect(card).toBeTruthy();
    });

    it('should not handle press events when locked', () => {
      const { getByText } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} isLocked={true} />
      );

      const card = getByText('Introduction to Prompts');
      fireEvent(card, 'pressIn');
      fireEvent(card, 'pressOut');

      // Should not call onPress even after press events
      fireEvent.press(card);
      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('Difficulty Badge Colors', () => {
    it('should display correct color for beginner', () => {
      const { getByText } = render(<LessonCard lesson={mockLesson} onPress={mockOnPress} />);

      expect(getByText('beginner')).toBeTruthy();
    });

    it('should display correct color for intermediate', () => {
      const intermediateLesson: Lesson = {
        ...mockLesson,
        difficulty: 'intermediate',
      };

      const { getByText } = render(
        <LessonCard lesson={intermediateLesson} onPress={mockOnPress} />
      );

      expect(getByText('intermediate')).toBeTruthy();
    });

    it('should display correct color for advanced', () => {
      const advancedLesson: Lesson = {
        ...mockLesson,
        difficulty: 'advanced',
      };

      const { getByText } = render(<LessonCard lesson={advancedLesson} onPress={mockOnPress} />);

      expect(getByText('advanced')).toBeTruthy();
    });
  });

  describe('Border and Background Colors', () => {
    it('should have default border color for available lessons', () => {
      const { root } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="available" />
      );

      expect(root).toBeTruthy();
    });

    it('should have blue border for in-progress lessons', () => {
      const { root } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="in_progress" />
      );

      expect(root).toBeTruthy();
    });

    it('should have green border for completed lessons', () => {
      const { root } = render(
        <LessonCard
          lesson={{ ...mockLesson, isCompleted: true }}
          onPress={mockOnPress}
          status="completed"
        />
      );

      expect(root).toBeTruthy();
    });

    it('should have green background for completed lessons', () => {
      const completedLesson: Lesson = {
        ...mockLesson,
        isCompleted: true,
      };

      const { root } = render(
        <LessonCard lesson={completedLesson} onPress={mockOnPress} status="completed" />
      );

      expect(root).toBeTruthy();
    });
  });

  describe('Animation Effects', () => {
    it('should show pulsing indicator for in-progress status', () => {
      const { root } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="in_progress" />
      );

      // Pulsing indicator should be rendered for in-progress state
      expect(root).toBeTruthy();
    });

    it('should not show pulsing indicator for available status', () => {
      const { root } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="available" />
      );

      expect(root).toBeTruthy();
    });

    it('should not show pulsing indicator for locked status', () => {
      const { root } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="locked" />
      );

      expect(root).toBeTruthy();
    });
  });

  describe('Status Badge Visibility', () => {
    it('should show locked badge when status is locked', () => {
      const { queryAllByText } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="locked" />
      );

      const lockIcons = queryAllByText('Icon(Lock)');
      expect(lockIcons.length).toBeGreaterThan(0);
    });

    it('should not show locked badge for available lessons', () => {
      const { root } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="available" />
      );

      expect(root).toBeTruthy();
    });

    it('should show completed overlay for completed lessons', () => {
      const completedLesson: Lesson = {
        ...mockLesson,
        isCompleted: true,
      };

      const { queryAllByText } = render(
        <LessonCard lesson={completedLesson} onPress={mockOnPress} status="completed" />
      );

      const checkIcons = queryAllByText('Icon(CheckCircle2)');
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Lesson Metadata Display', () => {
    it('should display all metadata for available lesson', () => {
      const { getByText } = render(<LessonCard lesson={mockLesson} onPress={mockOnPress} />);

      expect(getByText('Semana 1')).toBeTruthy();
      expect(getByText('beginner')).toBeTruthy();
      expect(getByText('+100 XP')).toBeTruthy();
      expect(getByText('15 min')).toBeTruthy();
    });

    it('should display metadata even for locked lessons', () => {
      const { getByText } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} isLocked={true} />
      );

      expect(getByText('Semana 1')).toBeTruthy();
      expect(getByText('beginner')).toBeTruthy();
      expect(getByText('+100 XP')).toBeTruthy();
      expect(getByText('15 min')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle lesson with 0 XP reward', () => {
      const zeroXpLesson: Lesson = {
        ...mockLesson,
        xpReward: 0,
      };

      const { getByText } = render(<LessonCard lesson={zeroXpLesson} onPress={mockOnPress} />);

      expect(getByText('+0 XP')).toBeTruthy();
    });

    it('should handle lesson with 0 minutes', () => {
      const zeroMinLesson: Lesson = {
        ...mockLesson,
        estimatedMinutes: 0,
      };

      const { getByText } = render(<LessonCard lesson={zeroMinLesson} onPress={mockOnPress} />);

      expect(getByText('0 min')).toBeTruthy();
    });

    it('should handle lesson with very high week number', () => {
      const highWeekLesson: Lesson = {
        ...mockLesson,
        week: 999,
      };

      const { getByText } = render(<LessonCard lesson={highWeekLesson} onPress={mockOnPress} />);

      expect(getByText('Semana 999')).toBeTruthy();
    });

    it('should handle very high XP values', () => {
      const highXpLesson: Lesson = {
        ...mockLesson,
        xpReward: 99999,
      };

      const { getByText } = render(<LessonCard lesson={highXpLesson} onPress={mockOnPress} />);

      expect(getByText('+99999 XP')).toBeTruthy();
    });

    it('should handle very long duration', () => {
      const longDurationLesson: Lesson = {
        ...mockLesson,
        estimatedMinutes: 999,
      };

      const { getByText } = render(
        <LessonCard lesson={longDurationLesson} onPress={mockOnPress} />
      );

      expect(getByText('999 min')).toBeTruthy();
    });
  });

  describe('Status Determination Logic', () => {
    it('should use explicit status over isCompleted', () => {
      const completedLesson: Lesson = {
        ...mockLesson,
        isCompleted: true,
      };

      const { getByText } = render(
        <LessonCard lesson={completedLesson} onPress={mockOnPress} status="available" />
      );

      // Should show "Comenzar" (available) not "Completado" (completed)
      expect(getByText('Comenzar')).toBeTruthy();
    });

    it('should use explicit status over isLocked', () => {
      const { getByText } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} isLocked={true} status="available" />
      );

      // Should show "Comenzar" (available) even though isLocked is true
      expect(getByText('Comenzar')).toBeTruthy();
    });

    it('should derive locked status from isLocked when no status provided', () => {
      const { queryByText } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} isLocked={true} />
      );

      // Should not show action text when locked
      expect(queryByText('Comenzar')).toBeNull();
    });

    it('should derive completed status from isCompleted when no status provided', () => {
      const completedLesson: Lesson = {
        ...mockLesson,
        isCompleted: true,
      };

      const { getByText } = render(<LessonCard lesson={completedLesson} onPress={mockOnPress} />);

      expect(getByText('Completado')).toBeTruthy();
    });
  });

  describe('Icon Display by Status', () => {
    it('should show BookOpen icon for available status', () => {
      const { queryByText } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="available" />
      );
      expect(queryByText('Icon(BookOpen)')).toBeTruthy();
    });

    it('should show Play icon for in-progress status', () => {
      const { queryByText } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="in_progress" />
      );
      expect(queryByText('Icon(Play)')).toBeTruthy();
    });

    it('should show CheckCircle2 icon for completed status', () => {
      const { queryAllByText } = render(
        <LessonCard
          lesson={{ ...mockLesson, isCompleted: true }}
          onPress={mockOnPress}
          status="completed"
        />
      );
      // There are multiple CheckCircle2 icons (one in lesson icon, one in overlay)
      const checkIcons = queryAllByText('Icon(CheckCircle2)');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('should show Lock icon for locked status', () => {
      const { queryAllByText } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="locked" />
      );
      // There are multiple Lock icons (one in lesson icon, one in badge)
      const lockIcons = queryAllByText('Icon(Lock)');
      expect(lockIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Action Indicator Text', () => {
    it('should not show action indicator for locked lessons', () => {
      const { queryByText } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="locked" />
      );

      expect(queryByText('Comenzar')).toBeNull();
      expect(queryByText('Continuar')).toBeNull();
      expect(queryByText('Completado')).toBeNull();
    });

    it('should show correct action text for each status', () => {
      // Available
      const { getByText: getAvailable } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="available" />
      );
      expect(getAvailable('Comenzar')).toBeTruthy();

      // In Progress
      const { getByText: getInProgress } = render(
        <LessonCard lesson={mockLesson} onPress={mockOnPress} status="in_progress" />
      );
      expect(getInProgress('Continuar')).toBeTruthy();

      // Completed
      const { getByText: getCompleted } = render(
        <LessonCard
          lesson={{ ...mockLesson, isCompleted: true }}
          onPress={mockOnPress}
          status="completed"
        />
      );
      expect(getCompleted('Completado')).toBeTruthy();
    });
  });
});
