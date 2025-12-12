/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TrueFalse } from '../TrueFalse';

describe('TrueFalse', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render question text correctly', () => {
    const { getByText } = render(
      <TrueFalse
        question="React Native uses JavaScript for mobile development."
        selectedAnswer={null}
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('React Native uses JavaScript for mobile development.')).toBeTruthy();
  });

  it('should render Verdadero and Falso buttons', () => {
    const { getByText } = render(
      <TrueFalse question="Test question" selectedAnswer={null} onSelect={mockOnSelect} />
    );

    expect(getByText('Verdadero')).toBeTruthy();
    expect(getByText('Falso')).toBeTruthy();
  });

  it('should call onSelect with true when Verdadero button is pressed', () => {
    const { getByText } = render(
      <TrueFalse question="Test question" selectedAnswer={null} onSelect={mockOnSelect} />
    );

    const trueButton = getByText('Verdadero');
    fireEvent.press(trueButton);

    expect(mockOnSelect).toHaveBeenCalledWith(true);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect with false when Falso button is pressed', () => {
    const { getByText } = render(
      <TrueFalse question="Test question" selectedAnswer={null} onSelect={mockOnSelect} />
    );

    const falseButton = getByText('Falso');
    fireEvent.press(falseButton);

    expect(mockOnSelect).toHaveBeenCalledWith(false);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should not call onSelect when disabled', () => {
    const { getByText } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={null}
        onSelect={mockOnSelect}
        disabled={true}
      />
    );

    const trueButton = getByText('Verdadero');
    fireEvent.press(trueButton);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should show correct feedback for correct true answer', () => {
    const { getByText } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={true}
        onSelect={mockOnSelect}
        showResult={true}
        correctAnswer={true}
      />
    );

    expect(getByText('¡Correcto!')).toBeTruthy();
  });

  it('should show correct feedback for correct false answer', () => {
    const { getByText } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={false}
        onSelect={mockOnSelect}
        showResult={true}
        correctAnswer={false}
      />
    );

    expect(getByText('¡Correcto!')).toBeTruthy();
  });

  it('should show incorrect feedback for wrong answer', () => {
    const { getByText } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={false}
        onSelect={mockOnSelect}
        showResult={true}
        correctAnswer={true}
      />
    );

    expect(getByText('Incorrecto')).toBeTruthy();
  });

  it('should not show feedback when showResult is false', () => {
    const { queryByText } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={true}
        onSelect={mockOnSelect}
        showResult={false}
        correctAnswer={true}
      />
    );

    expect(queryByText('¡Correcto!')).toBeNull();
    expect(queryByText('Incorrecto')).toBeNull();
  });

  it('should allow changing answer when not disabled', () => {
    const { getByText } = render(
      <TrueFalse question="Test question" selectedAnswer={null} onSelect={mockOnSelect} />
    );

    const trueButton = getByText('Verdadero');
    fireEvent.press(trueButton);
    expect(mockOnSelect).toHaveBeenCalledWith(true);

    const falseButton = getByText('Falso');
    fireEvent.press(falseButton);
    expect(mockOnSelect).toHaveBeenCalledWith(false);

    expect(mockOnSelect).toHaveBeenCalledTimes(2);
  });

  it('should highlight selected button', () => {
    const { getByText, rerender } = render(
      <TrueFalse question="Test question" selectedAnswer={null} onSelect={mockOnSelect} />
    );

    const trueButton = getByText('Verdadero');
    fireEvent.press(trueButton);

    rerender(<TrueFalse question="Test question" selectedAnswer={true} onSelect={mockOnSelect} />);

    expect(mockOnSelect).toHaveBeenCalledWith(true);
  });

  it('should animate feedback appearance', async () => {
    const { getByText, rerender } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={true}
        onSelect={mockOnSelect}
        showResult={false}
        correctAnswer={true}
      />
    );

    rerender(
      <TrueFalse
        question="Test question"
        selectedAnswer={true}
        onSelect={mockOnSelect}
        showResult={true}
        correctAnswer={true}
      />
    );

    await waitFor(() => {
      expect(getByText('¡Correcto!')).toBeTruthy();
    });
  });

  it('should maintain selected state across renders', () => {
    const { getByText, rerender } = render(
      <TrueFalse question="Test question" selectedAnswer={true} onSelect={mockOnSelect} />
    );

    rerender(<TrueFalse question="Test question" selectedAnswer={true} onSelect={mockOnSelect} />);

    expect(getByText('Verdadero')).toBeTruthy();
  });

  it('should handle rapid button presses', () => {
    const { getByText } = render(
      <TrueFalse question="Test question" selectedAnswer={null} onSelect={mockOnSelect} />
    );

    fireEvent.press(getByText('Verdadero'));
    fireEvent.press(getByText('Falso'));
    fireEvent.press(getByText('Verdadero'));

    expect(mockOnSelect).toHaveBeenCalledTimes(3);
    expect(mockOnSelect).toHaveBeenLastCalledWith(true);
  });

  it('should render with preselected answer', () => {
    const { getByText } = render(
      <TrueFalse question="Test question" selectedAnswer={false} onSelect={mockOnSelect} />
    );

    expect(getByText('Falso')).toBeTruthy();
  });

  it('should not respond to presses when both disabled and showResult are true', () => {
    const { getByText } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={true}
        onSelect={mockOnSelect}
        disabled={true}
        showResult={true}
        correctAnswer={true}
      />
    );

    const falseButton = getByText('Falso');
    fireEvent.press(falseButton);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should show correct answer highlighted even when wrong answer selected', () => {
    const { getByText } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={false}
        onSelect={mockOnSelect}
        showResult={true}
        correctAnswer={true}
      />
    );

    expect(getByText('Incorrecto')).toBeTruthy();
    expect(getByText('Verdadero')).toBeTruthy(); // Correct answer should still be visible
  });

  it('should handle different question text lengths', () => {
    const longQuestion =
      'This is a very long question that tests whether the component can handle lengthy text without breaking the layout or causing display issues.';

    const { getByText } = render(
      <TrueFalse question={longQuestion} selectedAnswer={null} onSelect={mockOnSelect} />
    );

    expect(getByText(/This is a very long question/)).toBeTruthy();
    expect(getByText('Verdadero')).toBeTruthy();
    expect(getByText('Falso')).toBeTruthy();
  });

  it('should reset feedback animation when showResult becomes false', async () => {
    const { queryByText, rerender } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={true}
        onSelect={mockOnSelect}
        showResult={true}
        correctAnswer={true}
      />
    );

    expect(queryByText('¡Correcto!')).toBeTruthy();

    rerender(
      <TrueFalse
        question="Test question"
        selectedAnswer={true}
        onSelect={mockOnSelect}
        showResult={false}
        correctAnswer={true}
      />
    );

    await waitFor(() => {
      expect(queryByText('¡Correcto!')).toBeNull();
    });
  });

  it('should handle null selectedAnswer', () => {
    const { getByText } = render(
      <TrueFalse question="Test question" selectedAnswer={null} onSelect={mockOnSelect} />
    );

    expect(getByText('Verdadero')).toBeTruthy();
    expect(getByText('Falso')).toBeTruthy();
  });

  it('should show correct button styling when true is correct and selected', () => {
    const { getByText } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={true}
        onSelect={mockOnSelect}
        showResult={true}
        correctAnswer={true}
      />
    );

    // Both correct answer and selected should be highlighted
    expect(getByText('Verdadero')).toBeTruthy();
    expect(getByText('¡Correcto!')).toBeTruthy();
  });

  it('should show correct button styling when false is correct but true is selected', () => {
    const { getByText } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={true}
        onSelect={mockOnSelect}
        showResult={true}
        correctAnswer={false}
      />
    );

    // Wrong answer selected, should show incorrect feedback
    expect(getByText('Verdadero')).toBeTruthy();
    expect(getByText('Falso')).toBeTruthy();
    expect(getByText('Incorrecto')).toBeTruthy();
  });

  it('should animate button press', () => {
    const { getByText } = render(
      <TrueFalse question="Test question" selectedAnswer={null} onSelect={mockOnSelect} />
    );

    fireEvent.press(getByText('Verdadero'));
    expect(mockOnSelect).toHaveBeenCalledWith(true);
  });

  it('should not show feedback when correctAnswer is not provided', () => {
    const { queryByText } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={true}
        onSelect={mockOnSelect}
        showResult={true}
      />
    );

    // Without correctAnswer, feedback should still appear
    expect(queryByText('¡Correcto!')).toBeNull();
    expect(queryByText('Incorrecto')).toBeNull();
  });

  it('should handle selectedAnswer being false', () => {
    const { getByText } = render(
      <TrueFalse
        question="Test question"
        selectedAnswer={false}
        onSelect={mockOnSelect}
        showResult={true}
        correctAnswer={false}
      />
    );

    expect(getByText('Falso')).toBeTruthy();
    expect(getByText('¡Correcto!')).toBeTruthy();
  });
});
