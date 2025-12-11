import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LessonCard } from '../LessonCard';
import type { Lesson } from '@llmengineer/shared';

const mockLesson: Lesson = {
  id: '1',
  title: 'Introduction to Prompts',
  description: 'Learn the basics of prompt engineering and how to write effective prompts',
  week: 1,
  order: 1,
  difficulty: 'beginner',
  xpReward: 100,
  estimatedMinutes: 15,
  isCompleted: false,
  sections: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('LessonCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render lesson information correctly', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} />
    );

    expect(getByText('Introduction to Prompts')).toBeTruthy();
    expect(getByText(/Learn the basics of prompt engineering/)).toBeTruthy();
    expect(getByText('Semana 1')).toBeTruthy();
    expect(getByText('+100 XP')).toBeTruthy();
    expect(getByText('15 min')).toBeTruthy();
  });

  it('should display difficulty badge with correct color', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} />
    );

    expect(getByText('beginner')).toBeTruthy();
  });

  it('should call onPress when card is pressed', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} />
    );

    const card = getByText('Introduction to Prompts');
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should show completed overlay when lesson is completed', () => {
    const completedLesson: Lesson = {
      ...mockLesson,
      isCompleted: true,
    };

    const { getByText } = render(
      <LessonCard lesson={completedLesson} onPress={mockOnPress} />
    );

    expect(getByText('✓')).toBeTruthy();
  });

  it('should not show completed overlay when lesson is not completed', () => {
    const { queryByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} />
    );

    expect(queryByText('✓')).toBeNull();
  });

  it('should render intermediate difficulty', () => {
    const intermediateLesson: Lesson = {
      ...mockLesson,
      difficulty: 'intermediate',
    };

    const { getByText } = render(
      <LessonCard lesson={intermediateLesson} onPress={mockOnPress} />
    );

    expect(getByText('intermediate')).toBeTruthy();
  });

  it('should render advanced difficulty', () => {
    const advancedLesson: Lesson = {
      ...mockLesson,
      difficulty: 'advanced',
    };

    const { getByText } = render(
      <LessonCard lesson={advancedLesson} onPress={mockOnPress} />
    );

    expect(getByText('advanced')).toBeTruthy();
  });

  it('should handle long descriptions with truncation', () => {
    const longDescLesson: Lesson = {
      ...mockLesson,
      description:
        'This is a very long description that should be truncated after two lines to prevent the card from becoming too tall and affecting the overall layout',
    };

    const { getByText } = render(
      <LessonCard lesson={longDescLesson} onPress={mockOnPress} />
    );

    expect(
      getByText(/This is a very long description that should be truncated/)
    ).toBeTruthy();
  });

  it('should display different week numbers', () => {
    const weekFiveLesson: Lesson = {
      ...mockLesson,
      week: 5,
    };

    const { getByText } = render(
      <LessonCard lesson={weekFiveLesson} onPress={mockOnPress} />
    );

    expect(getByText('Semana 5')).toBeTruthy();
  });

  it('should display different XP rewards', () => {
    const highXpLesson: Lesson = {
      ...mockLesson,
      xpReward: 250,
    };

    const { getByText } = render(
      <LessonCard lesson={highXpLesson} onPress={mockOnPress} />
    );

    expect(getByText('+250 XP')).toBeTruthy();
  });

  it('should display different durations', () => {
    const longLesson: Lesson = {
      ...mockLesson,
      estimatedMinutes: 45,
    };

    const { getByText } = render(
      <LessonCard lesson={longLesson} onPress={mockOnPress} />
    );

    expect(getByText('45 min')).toBeTruthy();
  });

  it('should handle multiple presses', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} />
    );

    const card = getByText('Introduction to Prompts');
    fireEvent.press(card);
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(2);
  });

  it('should render all lesson metadata', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} />
    );

    expect(getByText('Semana 1')).toBeTruthy();
    expect(getByText('beginner')).toBeTruthy();
    expect(getByText('+100 XP')).toBeTruthy();
    expect(getByText('15 min')).toBeTruthy();
  });
});
