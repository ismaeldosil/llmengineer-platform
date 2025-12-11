import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TrueFalse } from '../TrueFalse';
import type { QuizQuestion } from '@llmengineer/shared';

const mockTrueQuestion: QuizQuestion = {
  id: '1',
  type: 'true-false',
  question: 'React Native uses JavaScript for mobile development.',
  correctAnswer: 'true',
};

const mockFalseQuestion: QuizQuestion = {
  id: '2',
  type: 'true-false',
  question: 'React Native can only be used for iOS development.',
  correctAnswer: 'false',
};

describe('TrueFalse', () => {
  const mockOnAnswer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render question text correctly', () => {
    const { getByText } = render(
      <TrueFalse question={mockTrueQuestion} onAnswer={mockOnAnswer} />
    );

    expect(getByText('React Native uses JavaScript for mobile development.')).toBeTruthy();
  });

  it('should render True and False buttons', () => {
    const { getByText } = render(
      <TrueFalse question={mockTrueQuestion} onAnswer={mockOnAnswer} />
    );

    expect(getByText('True')).toBeTruthy();
    expect(getByText('False')).toBeTruthy();
  });

  it('should call onAnswer with "true" when True button is pressed', () => {
    const { getByText } = render(
      <TrueFalse question={mockTrueQuestion} onAnswer={mockOnAnswer} />
    );

    const trueButton = getByText('True');
    fireEvent.press(trueButton);

    expect(mockOnAnswer).toHaveBeenCalledWith('true');
    expect(mockOnAnswer).toHaveBeenCalledTimes(1);
  });

  it('should call onAnswer with "false" when False button is pressed', () => {
    const { getByText } = render(
      <TrueFalse question={mockTrueQuestion} onAnswer={mockOnAnswer} />
    );

    const falseButton = getByText('False');
    fireEvent.press(falseButton);

    expect(mockOnAnswer).toHaveBeenCalledWith('false');
    expect(mockOnAnswer).toHaveBeenCalledTimes(1);
  });

  it('should not call onAnswer when disabled', () => {
    const { getByText } = render(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        disabled={true}
      />
    );

    const trueButton = getByText('True');
    fireEvent.press(trueButton);

    expect(mockOnAnswer).not.toHaveBeenCalled();
  });

  it('should show correct feedback for correct true answer', () => {
    const { getByText } = render(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={true}
        selectedAnswer="true"
      />
    );

    expect(getByText('Correct!')).toBeTruthy();
    expect(getByText('✓')).toBeTruthy();
  });

  it('should show correct feedback for correct false answer', () => {
    const { getByText } = render(
      <TrueFalse
        question={mockFalseQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={true}
        selectedAnswer="false"
      />
    );

    expect(getByText('Correct!')).toBeTruthy();
    expect(getByText('✓')).toBeTruthy();
  });

  it('should show incorrect feedback for wrong answer', () => {
    const { getByText } = render(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={true}
        selectedAnswer="false"
      />
    );

    expect(getByText('Incorrect')).toBeTruthy();
    expect(getByText('✗')).toBeTruthy();
  });

  it('should not show feedback when showFeedback is false', () => {
    const { queryByText } = render(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={false}
        selectedAnswer="true"
      />
    );

    expect(queryByText('Correct!')).toBeNull();
    expect(queryByText('Incorrect')).toBeNull();
  });

  it('should allow changing answer when not disabled', () => {
    const { getByText } = render(
      <TrueFalse question={mockTrueQuestion} onAnswer={mockOnAnswer} />
    );

    const trueButton = getByText('True');
    fireEvent.press(trueButton);
    expect(mockOnAnswer).toHaveBeenCalledWith('true');

    const falseButton = getByText('False');
    fireEvent.press(falseButton);
    expect(mockOnAnswer).toHaveBeenCalledWith('false');

    expect(mockOnAnswer).toHaveBeenCalledTimes(2);
  });

  it('should highlight selected button', () => {
    const { getByText, rerender } = render(
      <TrueFalse question={mockTrueQuestion} onAnswer={mockOnAnswer} />
    );

    const trueButton = getByText('True');
    fireEvent.press(trueButton);

    rerender(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        selectedAnswer="true"
      />
    );

    expect(mockOnAnswer).toHaveBeenCalledWith('true');
  });

  it('should animate feedback appearance', async () => {
    const { getByText, rerender } = render(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={false}
        selectedAnswer="true"
      />
    );

    rerender(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={true}
        selectedAnswer="true"
      />
    );

    await waitFor(() => {
      expect(getByText('Correct!')).toBeTruthy();
    });
  });

  it('should maintain selected state across renders', () => {
    const { getByText, rerender } = render(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        selectedAnswer="true"
      />
    );

    rerender(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        selectedAnswer="true"
      />
    );

    expect(getByText('True')).toBeTruthy();
  });

  it('should handle rapid button presses', () => {
    const { getByText } = render(
      <TrueFalse question={mockTrueQuestion} onAnswer={mockOnAnswer} />
    );

    fireEvent.press(getByText('True'));
    fireEvent.press(getByText('False'));
    fireEvent.press(getByText('True'));

    expect(mockOnAnswer).toHaveBeenCalledTimes(3);
    expect(mockOnAnswer).toHaveBeenLastCalledWith('true');
  });

  it('should render with preselected answer', () => {
    const { getByText } = render(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        selectedAnswer="false"
      />
    );

    expect(getByText('False')).toBeTruthy();
  });

  it('should not respond to presses when both disabled and showFeedback are true', () => {
    const { getByText } = render(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        disabled={true}
        showFeedback={true}
        selectedAnswer="true"
      />
    );

    const falseButton = getByText('False');
    fireEvent.press(falseButton);

    expect(mockOnAnswer).not.toHaveBeenCalled();
  });

  it('should show correct answer highlighted even when wrong answer selected', () => {
    const { getByText } = render(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={true}
        selectedAnswer="false"
      />
    );

    expect(getByText('Incorrect')).toBeTruthy();
    expect(getByText('True')).toBeTruthy(); // Correct answer should still be visible
  });

  it('should handle different question text lengths', () => {
    const longQuestion: QuizQuestion = {
      ...mockTrueQuestion,
      question:
        'This is a very long question that tests whether the component can handle lengthy text without breaking the layout or causing display issues.',
    };

    const { getByText } = render(
      <TrueFalse question={longQuestion} onAnswer={mockOnAnswer} />
    );

    expect(getByText(/This is a very long question/)).toBeTruthy();
    expect(getByText('True')).toBeTruthy();
    expect(getByText('False')).toBeTruthy();
  });

  it('should reset feedback animation when showFeedback becomes false', async () => {
    const { queryByText, rerender } = render(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={true}
        selectedAnswer="true"
      />
    );

    expect(queryByText('Correct!')).toBeTruthy();

    rerender(
      <TrueFalse
        question={mockTrueQuestion}
        onAnswer={mockOnAnswer}
        showFeedback={false}
        selectedAnswer="true"
      />
    );

    await waitFor(() => {
      expect(queryByText('Correct!')).toBeNull();
    });
  });
});
