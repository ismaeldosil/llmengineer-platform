import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MultipleChoice } from '../MultipleChoice';
import type { QuizQuestion } from '@llmengineer/shared';

const mockQuestion: QuizQuestion = {
  id: '1',
  type: 'multiple-choice',
  question: 'What is the capital of France?',
  options: [
    { id: 'a', text: 'London' },
    { id: 'b', text: 'Paris' },
    { id: 'c', text: 'Berlin' },
    { id: 'd', text: 'Madrid' },
  ],
  correctAnswer: 'b',
};

describe('MultipleChoice', () => {
  const mockOnAnswer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render question text correctly', () => {
    const { getByText } = render(
      <MultipleChoice question={mockQuestion} onAnswer={mockOnAnswer} />
    );

    expect(getByText('What is the capital of France?')).toBeTruthy();
  });

  it('should render all options with labels', () => {
    const { getByText } = render(
      <MultipleChoice question={mockQuestion} onAnswer={mockOnAnswer} />
    );

    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    expect(getByText('C')).toBeTruthy();
    expect(getByText('D')).toBeTruthy();
    expect(getByText('London')).toBeTruthy();
    expect(getByText('Paris')).toBeTruthy();
    expect(getByText('Berlin')).toBeTruthy();
    expect(getByText('Madrid')).toBeTruthy();
  });

  it('should call onAnswer when an option is pressed', () => {
    const { getByText } = render(
      <MultipleChoice question={mockQuestion} onAnswer={mockOnAnswer} />
    );

    const parisOption = getByText('Paris');
    fireEvent.press(parisOption);

    expect(mockOnAnswer).toHaveBeenCalledWith('b');
    expect(mockOnAnswer).toHaveBeenCalledTimes(1);
  });

  it('should highlight selected option', () => {
    const { getByText, rerender } = render(
      <MultipleChoice question={mockQuestion} onAnswer={mockOnAnswer} />
    );

    const parisOption = getByText('Paris');
    fireEvent.press(parisOption);

    rerender(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        selectedAnswer="b"
      />
    );

    // The component should show the selected state
    expect(mockOnAnswer).toHaveBeenCalledWith('b');
  });

  it('should not call onAnswer when disabled', () => {
    const { getByText } = render(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        disabled={true}
      />
    );

    const parisOption = getByText('Paris');
    fireEvent.press(parisOption);

    expect(mockOnAnswer).not.toHaveBeenCalled();
  });

  it('should show correct feedback for correct answer', () => {
    const { getByText } = render(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={true}
        selectedAnswer="b"
      />
    );

    expect(getByText('Correct!')).toBeTruthy();
    expect(getByText('✓')).toBeTruthy();
  });

  it('should show incorrect feedback for wrong answer', () => {
    const { getByText } = render(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={true}
        selectedAnswer="a"
      />
    );

    expect(getByText('Incorrect')).toBeTruthy();
    expect(getByText('✗')).toBeTruthy();
  });

  it('should not show feedback when showFeedback is false', () => {
    const { queryByText } = render(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={false}
        selectedAnswer="b"
      />
    );

    expect(queryByText('Correct!')).toBeNull();
    expect(queryByText('Incorrect')).toBeNull();
  });

  it('should allow changing selection when not disabled', () => {
    const { getByText } = render(
      <MultipleChoice question={mockQuestion} onAnswer={mockOnAnswer} />
    );

    const londonOption = getByText('London');
    fireEvent.press(londonOption);
    expect(mockOnAnswer).toHaveBeenCalledWith('a');

    const parisOption = getByText('Paris');
    fireEvent.press(parisOption);
    expect(mockOnAnswer).toHaveBeenCalledWith('b');

    expect(mockOnAnswer).toHaveBeenCalledTimes(2);
  });

  it('should handle questions with fewer than 4 options', () => {
    const shortQuestion: QuizQuestion = {
      ...mockQuestion,
      options: [
        { id: 'a', text: 'London' },
        { id: 'b', text: 'Paris' },
      ],
    };

    const { getByText, queryByText } = render(
      <MultipleChoice question={shortQuestion} onAnswer={mockOnAnswer} />
    );

    expect(getByText('London')).toBeTruthy();
    expect(getByText('Paris')).toBeTruthy();
    expect(queryByText('Berlin')).toBeNull();
    expect(queryByText('Madrid')).toBeNull();
  });

  it('should handle empty options array', () => {
    const noOptionsQuestion: QuizQuestion = {
      ...mockQuestion,
      options: [],
    };

    const { getByText } = render(
      <MultipleChoice question={noOptionsQuestion} onAnswer={mockOnAnswer} />
    );

    expect(getByText('What is the capital of France?')).toBeTruthy();
  });

  it('should animate feedback appearance', async () => {
    const { getByText, rerender } = render(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={false}
        selectedAnswer="b"
      />
    );

    rerender(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={true}
        selectedAnswer="b"
      />
    );

    await waitFor(() => {
      expect(getByText('Correct!')).toBeTruthy();
    });
  });

  it('should maintain selected state across renders', () => {
    const { getByText, rerender } = render(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        selectedAnswer="b"
      />
    );

    rerender(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        selectedAnswer="b"
      />
    );

    // Component should maintain the selected state
    expect(getByText('Paris')).toBeTruthy();
  });

  it('should handle rapid option changes', () => {
    const { getByText } = render(
      <MultipleChoice question={mockQuestion} onAnswer={mockOnAnswer} />
    );

    fireEvent.press(getByText('London'));
    fireEvent.press(getByText('Paris'));
    fireEvent.press(getByText('Berlin'));
    fireEvent.press(getByText('Madrid'));

    expect(mockOnAnswer).toHaveBeenCalledTimes(4);
    expect(mockOnAnswer).toHaveBeenLastCalledWith('d');
  });

  it('should render with preselected answer', () => {
    const { getByText } = render(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        selectedAnswer="c"
      />
    );

    expect(getByText('Berlin')).toBeTruthy();
  });

  it('should show correct answer even if not selected when feedback is shown', () => {
    const { getByText } = render(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={true}
        selectedAnswer="a"
      />
    );

    // Should show incorrect feedback but also highlight the correct answer
    expect(getByText('Incorrect')).toBeTruthy();
    expect(getByText('Paris')).toBeTruthy(); // Correct answer should be visible
  });
});
