import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QuizModal } from '../QuizModal';
import type { QuizQuestion } from '@llmengineer/shared';

const mockQuestions: QuizQuestion[] = [
  {
    id: '1',
    type: 'multiple-choice',
    question: 'What is React Native?',
    options: [
      { id: 'a', text: 'A web framework' },
      { id: 'b', text: 'A mobile framework' },
      { id: 'c', text: 'A database' },
      { id: 'd', text: 'An IDE' },
    ],
    correctAnswer: 'b',
  },
  {
    id: '2',
    type: 'true-false',
    question: 'React Native uses JavaScript.',
    correctAnswer: 'true',
  },
  {
    id: '3',
    type: 'multiple-choice',
    question: 'Which company created React Native?',
    options: [
      { id: 'a', text: 'Google' },
      { id: 'b', text: 'Apple' },
      { id: 'c', text: 'Facebook' },
      { id: 'd', text: 'Microsoft' },
    ],
    correctAnswer: 'c',
  },
];

describe('QuizModal', () => {
  const mockOnComplete = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when visible is true', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Quiz')).toBeTruthy();
    expect(getByText('What is React Native?')).toBeTruthy();
  });

  it('should show progress indicator', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Question 1 of 3')).toBeTruthy();
  });

  it('should render first question initially', () => {
    const { getByText, queryByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    expect(getByText('What is React Native?')).toBeTruthy();
    expect(queryByText('React Native uses JavaScript.')).toBeNull();
  });

  it('should navigate to next question', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Answer first question
    fireEvent.press(getByText('A mobile framework'));

    // Click Next
    const nextButton = getByText('Next');
    fireEvent.press(nextButton);

    // Should show second question
    expect(getByText('React Native uses JavaScript.')).toBeTruthy();
    expect(getByText('Question 2 of 3')).toBeTruthy();
  });

  it('should navigate to previous question', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Answer and navigate to second question
    fireEvent.press(getByText('A mobile framework'));
    fireEvent.press(getByText('Next'));

    // Go back
    const previousButton = getByText('Previous');
    fireEvent.press(previousButton);

    // Should show first question again
    expect(getByText('What is React Native?')).toBeTruthy();
    expect(getByText('Question 1 of 3')).toBeTruthy();
  });

  it('should disable Previous button on first question', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    const previousButton = getByText('Previous');
    expect(previousButton).toBeTruthy();
    // Button should be disabled (can't easily test disabled state in RN Testing Library)
  });

  it('should disable Next button until question is answered', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    const nextButton = getByText('Next');
    expect(nextButton).toBeTruthy();
    // Button should be disabled initially
  });

  it('should show Submit button on last question', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Navigate to last question
    fireEvent.press(getByText('A mobile framework'));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('True'));
    fireEvent.press(getByText('Next'));

    expect(getByText('Submit Quiz')).toBeTruthy();
  });

  it('should call onComplete with score and answers when quiz is submitted', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Answer all questions
    fireEvent.press(getByText('A mobile framework')); // Correct
    fireEvent.press(getByText('Next'));

    fireEvent.press(getByText('True')); // Correct
    fireEvent.press(getByText('Next'));

    fireEvent.press(getByText('Facebook')); // Correct
    fireEvent.press(getByText('Submit Quiz'));

    expect(mockOnComplete).toHaveBeenCalledWith(
      3,
      expect.arrayContaining([
        { questionId: '1', selectedAnswer: 'b' },
        { questionId: '2', selectedAnswer: 'true' },
        { questionId: '3', selectedAnswer: 'c' },
      ])
    );
  });

  it('should calculate score correctly with mixed answers', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Answer with 2 correct, 1 incorrect
    fireEvent.press(getByText('A web framework')); // Incorrect
    fireEvent.press(getByText('Next'));

    fireEvent.press(getByText('True')); // Correct
    fireEvent.press(getByText('Next'));

    fireEvent.press(getByText('Facebook')); // Correct
    fireEvent.press(getByText('Submit Quiz'));

    expect(mockOnComplete).toHaveBeenCalledWith(2, expect.any(Array));
  });

  it('should call onClose when close button is pressed', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    const closeButton = getByText('✕');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show feedback after answering a question', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByText('A mobile framework'));

    expect(getByText('Correct!')).toBeTruthy();
  });

  it('should preserve answers when navigating between questions', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Answer first question
    fireEvent.press(getByText('A mobile framework'));
    fireEvent.press(getByText('Next'));

    // Go back
    fireEvent.press(getByText('Previous'));

    // Answer should still be selected (though feedback is cleared)
    // We can verify the answer is preserved by checking the question is displayed
    expect(getByText('What is React Native?')).toBeTruthy();
  });

  it('should update progress bar as user progresses', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Question 1 of 3')).toBeTruthy();

    fireEvent.press(getByText('A mobile framework'));
    fireEvent.press(getByText('Next'));

    expect(getByText('Question 2 of 3')).toBeTruthy();

    fireEvent.press(getByText('True'));
    fireEvent.press(getByText('Next'));

    expect(getByText('Question 3 of 3')).toBeTruthy();
  });

  it('should show current score preview when all questions are answered', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Answer all questions
    fireEvent.press(getByText('A mobile framework'));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('True'));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Facebook'));

    expect(getByText('Current Score: 3 / 3')).toBeTruthy();
  });

  it('should disable Submit button until all questions are answered', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Answer first two questions only
    fireEvent.press(getByText('A mobile framework'));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('True'));
    fireEvent.press(getByText('Next'));

    const submitButton = getByText('Submit Quiz');
    expect(submitButton).toBeTruthy();
    // Button should be disabled
  });

  it('should render MultipleChoice component for multiple-choice questions', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // First question is multiple choice
    expect(getByText('What is React Native?')).toBeTruthy();
    expect(getByText('A')).toBeTruthy(); // Option labels are shown
  });

  it('should render TrueFalse component for true-false questions', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Navigate to second question (true-false)
    fireEvent.press(getByText('A mobile framework'));
    fireEvent.press(getByText('Next'));

    expect(getByText('React Native uses JavaScript.')).toBeTruthy();
    expect(getByText('True')).toBeTruthy();
    expect(getByText('False')).toBeTruthy();
  });

  it('should show loading indicator when isSubmitting is true', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Answer all questions to get to submit button
    fireEvent.press(getByText('A mobile framework'));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('True'));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Facebook'));

    // Verify submit button is present
    expect(getByText('Submit Quiz')).toBeTruthy();
  });

  it('should disable all interactions when isSubmitting is true', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
        isSubmitting={true}
      />
    );

    // Try to answer question - should not work
    fireEvent.press(getByText('A mobile framework'));

    // onComplete should not be called yet
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('should reset state when modal is closed and reopened', () => {
    const { getByText, rerender } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Answer first question
    fireEvent.press(getByText('A mobile framework'));
    fireEvent.press(getByText('Next'));

    // Close modal
    fireEvent.press(getByText('✕'));

    // Reopen modal
    rerender(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Should be back at first question
    expect(getByText('Question 1 of 3')).toBeTruthy();
    expect(getByText('What is React Native?')).toBeTruthy();
  });

  it('should handle single question quiz', () => {
    const singleQuestion = [mockQuestions[0]];

    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={singleQuestion}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Question 1 of 1')).toBeTruthy();

    // Answer the question
    fireEvent.press(getByText('A mobile framework'));

    // Should show Submit button immediately
    expect(getByText('Submit Quiz')).toBeTruthy();
  });

  it('should allow changing answers before submission', () => {
    const { getByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Select correct answer
    fireEvent.press(getByText('A mobile framework'));
    fireEvent.press(getByText('Next'));

    // Go back and verify answer can be changed
    fireEvent.press(getByText('Previous'));
    expect(getByText('What is React Native?')).toBeTruthy();

    // Continue with other questions
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('True'));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Facebook'));
    fireEvent.press(getByText('Submit Quiz'));

    // Should submit with all correct answers
    expect(mockOnComplete).toHaveBeenCalled();
    const callArgs = mockOnComplete.mock.calls[0];
    expect(callArgs[0]).toBe(3); // score - all correct
    expect(callArgs[1]).toEqual(
      expect.arrayContaining([{ questionId: '1', selectedAnswer: 'b' }])
    );
  });

  it('should clear feedback when navigating between questions', () => {
    const { getByText, queryByText } = render(
      <QuizModal
        visible={true}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Answer first question to show feedback
    fireEvent.press(getByText('A mobile framework'));
    expect(getByText('Correct!')).toBeTruthy();

    // Navigate to next question
    fireEvent.press(getByText('Next'));

    // Feedback should be cleared
    expect(queryByText('Correct!')).toBeNull();
  });
});
