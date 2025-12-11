import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NextLessonWidget } from '../NextLessonWidget';
import type { Lesson } from '@llmengineer/shared';

const mockLesson: Lesson = {
  id: '1',
  slug: 'introduction-to-prompts',
  title: 'Introduction to Prompts',
  description: 'Learn the basics of prompt engineering',
  week: 1,
  order: 1,
  difficulty: 'beginner',
  xpReward: 100,
  estimatedMinutes: 15,
  isCompleted: false,
  sections: [],
};

describe('NextLessonWidget', () => {
  const mockOnPress = jest.fn();
  const mockOnViewAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render lesson when provided', () => {
    const { getByText } = render(
      <NextLessonWidget lesson={mockLesson} onPress={mockOnPress} onViewAll={mockOnViewAll} />
    );

    expect(getByText('Proxima Leccion')).toBeTruthy();
    expect(getByText('Ver todas')).toBeTruthy();
    expect(getByText('Introduction to Prompts')).toBeTruthy();
  });

  it('should show loading state', () => {
    const { queryByText } = render(
      <NextLessonWidget isLoading={true} onPress={mockOnPress} onViewAll={mockOnViewAll} />
    );

    expect(queryByText('Introduction to Prompts')).toBeNull();
  });

  it('should show empty state when no lesson', () => {
    const { getByText } = render(
      <NextLessonWidget lesson={null} onPress={mockOnPress} onViewAll={mockOnViewAll} />
    );

    expect(getByText('No hay lecciones pendientes')).toBeTruthy();
    expect(getByText('Has completado todas las lecciones disponibles')).toBeTruthy();
  });

  it('should call onViewAll when "Ver todas" is pressed', () => {
    const { getByTestId } = render(
      <NextLessonWidget lesson={mockLesson} onPress={mockOnPress} onViewAll={mockOnViewAll} />
    );

    const viewAllButton = getByTestId('view-all-button');
    fireEvent.press(viewAllButton);

    expect(mockOnViewAll).toHaveBeenCalledTimes(1);
  });

  it('should call onPress when lesson card is pressed', () => {
    const { getByText } = render(
      <NextLessonWidget lesson={mockLesson} onPress={mockOnPress} onViewAll={mockOnViewAll} />
    );

    const lessonCard = getByText('Introduction to Prompts');
    fireEvent.press(lessonCard);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should render with undefined lesson', () => {
    const { getByText } = render(
      <NextLessonWidget lesson={undefined} onPress={mockOnPress} onViewAll={mockOnViewAll} />
    );

    expect(getByText('No hay lecciones pendientes')).toBeTruthy();
  });

  it('should handle isLoading false with lesson', () => {
    const { getByText, queryByText } = render(
      <NextLessonWidget
        lesson={mockLesson}
        isLoading={false}
        onPress={mockOnPress}
        onViewAll={mockOnViewAll}
      />
    );

    expect(getByText('Introduction to Prompts')).toBeTruthy();
    expect(queryByText('No hay lecciones pendientes')).toBeNull();
  });

  it('should always show header', () => {
    const { getByText: getByTextWithLesson } = render(
      <NextLessonWidget lesson={mockLesson} onPress={mockOnPress} onViewAll={mockOnViewAll} />
    );

    expect(getByTextWithLesson('Proxima Leccion')).toBeTruthy();

    const { getByText: getByTextEmpty } = render(
      <NextLessonWidget lesson={null} onPress={mockOnPress} onViewAll={mockOnViewAll} />
    );

    expect(getByTextEmpty('Proxima Leccion')).toBeTruthy();
  });

  it('should handle completed lesson', () => {
    const completedLesson: Lesson = {
      ...mockLesson,
      isCompleted: true,
    };

    const { getByText } = render(
      <NextLessonWidget lesson={completedLesson} onPress={mockOnPress} onViewAll={mockOnViewAll} />
    );

    expect(getByText('Introduction to Prompts')).toBeTruthy();
  });
});
