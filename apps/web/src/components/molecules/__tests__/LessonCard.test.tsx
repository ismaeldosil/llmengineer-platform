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

    const { getByText, queryByText } = render(
      <LessonCard lesson={completedLesson} onPress={mockOnPress} />
    );

    // Should show completed status text and icon
    expect(getByText('Completado')).toBeTruthy();
    expect(queryByText('Icon(CheckCircle2)')).toBeTruthy();
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
    const { getByText, queryByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} isLocked={true} />
    );

    expect(queryByText('Icon(Lock)')).toBeTruthy();
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
    const { queryByText: queryTextLocked } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} status="locked" />
    );
    expect(queryTextLocked('Icon(Lock)')).toBeTruthy();
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

    // Completed lesson should show CheckCircle2 icon
    const { queryByText: queryCompleted } = render(
      <LessonCard
        lesson={{ ...mockLesson, isCompleted: true }}
        onPress={mockOnPress}
        status="completed"
      />
    );
    expect(queryCompleted('Icon(CheckCircle2)')).toBeTruthy();

    // Locked lesson should show Lock icon
    const { queryByText: queryLocked } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} status="locked" />
    );
    expect(queryLocked('Icon(Lock)')).toBeTruthy();
  });
});
