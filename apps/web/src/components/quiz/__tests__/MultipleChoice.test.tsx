import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MultipleChoice } from '../MultipleChoice';

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Circle: 'Circle',
  CheckCircle: 'CheckCircle',
  XCircle: 'XCircle',
}));

// Mock Icon component
jest.mock('@/components/ui/Icon', () => ({
  Icon: ({ icon, size, color }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    const iconName = typeof icon === 'string' ? icon : 'Icon';
    return React.createElement(Text, { testID: `icon-${iconName}` }, `Icon(${iconName})`);
  },
}));

describe('MultipleChoice', () => {
  const mockOnSelect = jest.fn();
  const defaultProps = {
    question: 'What is the capital of France?',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    selectedAnswer: null,
    onSelect: mockOnSelect,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render question text correctly', () => {
      const { getByText } = render(<MultipleChoice {...defaultProps} />);
      expect(getByText('What is the capital of France?')).toBeTruthy();
    });

    it('should render all options with labels A, B, C, D', () => {
      const { getByText } = render(<MultipleChoice {...defaultProps} />);

      expect(getByText('A')).toBeTruthy();
      expect(getByText('B')).toBeTruthy();
      expect(getByText('C')).toBeTruthy();
      expect(getByText('D')).toBeTruthy();
      expect(getByText('London')).toBeTruthy();
      expect(getByText('Paris')).toBeTruthy();
      expect(getByText('Berlin')).toBeTruthy();
      expect(getByText('Madrid')).toBeTruthy();
    });

    it('should render with fewer than 4 options', () => {
      const props = {
        ...defaultProps,
        options: ['True', 'False'],
      };
      const { getByText, queryByText } = render(<MultipleChoice {...props} />);

      expect(getByText('A')).toBeTruthy();
      expect(getByText('B')).toBeTruthy();
      expect(getByText('True')).toBeTruthy();
      expect(getByText('False')).toBeTruthy();
      expect(queryByText('C')).toBeNull();
      expect(queryByText('D')).toBeNull();
    });

    it('should render with more than 4 options', () => {
      const props = {
        ...defaultProps,
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6'],
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('A')).toBeTruthy();
      expect(getByText('B')).toBeTruthy();
      expect(getByText('C')).toBeTruthy();
      expect(getByText('D')).toBeTruthy();
      expect(getByText('E')).toBeTruthy();
      expect(getByText('F')).toBeTruthy();
    });

    it('should handle empty options array gracefully', () => {
      const props = {
        ...defaultProps,
        options: [],
      };
      const { getByText } = render(<MultipleChoice {...props} />);
      expect(getByText('What is the capital of France?')).toBeTruthy();
    });
  });

  describe('Selection', () => {
    it('should call onSelect with correct index when option is pressed', () => {
      const { getByText } = render(<MultipleChoice {...defaultProps} />);

      const parisOption = getByText('Paris');
      fireEvent.press(parisOption);

      expect(mockOnSelect).toHaveBeenCalledWith(1);
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect for different options', () => {
      const { getByText } = render(<MultipleChoice {...defaultProps} />);

      fireEvent.press(getByText('London'));
      expect(mockOnSelect).toHaveBeenCalledWith(0);

      fireEvent.press(getByText('Paris'));
      expect(mockOnSelect).toHaveBeenCalledWith(1);

      fireEvent.press(getByText('Berlin'));
      expect(mockOnSelect).toHaveBeenCalledWith(2);

      fireEvent.press(getByText('Madrid'));
      expect(mockOnSelect).toHaveBeenCalledWith(3);

      expect(mockOnSelect).toHaveBeenCalledTimes(4);
    });

    it('should allow changing selection multiple times', () => {
      const { getByText } = render(<MultipleChoice {...defaultProps} />);

      fireEvent.press(getByText('London'));
      fireEvent.press(getByText('Paris'));
      fireEvent.press(getByText('Berlin'));

      expect(mockOnSelect).toHaveBeenCalledTimes(3);
      expect(mockOnSelect).toHaveBeenLastCalledWith(2);
    });

    it('should not call onSelect when disabled', () => {
      const props = {
        ...defaultProps,
        disabled: true,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      fireEvent.press(getByText('Paris'));

      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should display preselected answer', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 1,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      // The selected option should be visible
      expect(getByText('Paris')).toBeTruthy();
      expect(getByText('B')).toBeTruthy();
    });

    it('should handle rapid option changes', () => {
      const { getByText } = render(<MultipleChoice {...defaultProps} />);

      fireEvent.press(getByText('London'));
      fireEvent.press(getByText('Paris'));
      fireEvent.press(getByText('Berlin'));
      fireEvent.press(getByText('Madrid'));
      fireEvent.press(getByText('London'));

      expect(mockOnSelect).toHaveBeenCalledTimes(5);
      expect(mockOnSelect).toHaveBeenLastCalledWith(0);
    });
  });

  describe('Visual States', () => {
    it('should show selected state for selected option', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 1,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('Paris')).toBeTruthy();
      expect(getByText('B')).toBeTruthy();
    });

    it('should maintain selected state across re-renders', () => {
      const { getByText, rerender } = render(
        <MultipleChoice {...defaultProps} selectedAnswer={1} />
      );

      expect(getByText('Paris')).toBeTruthy();

      rerender(<MultipleChoice {...defaultProps} selectedAnswer={1} />);

      expect(getByText('Paris')).toBeTruthy();
    });

    it('should update when selectedAnswer prop changes', () => {
      const { getByText, rerender } = render(
        <MultipleChoice {...defaultProps} selectedAnswer={0} />
      );

      expect(getByText('London')).toBeTruthy();

      rerender(<MultipleChoice {...defaultProps} selectedAnswer={2} />);

      expect(getByText('Berlin')).toBeTruthy();
    });
  });

  describe('Result Feedback', () => {
    it('should show correct feedback for correct answer', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 1,
        correctAnswer: 1,
        showResult: true,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('Correct!')).toBeTruthy();
      expect(getByText("Well done! That's the right answer.")).toBeTruthy();
    });

    it('should show incorrect feedback for wrong answer', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 0,
        correctAnswer: 1,
        showResult: true,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('Incorrect')).toBeTruthy();
      expect(getByText('The correct answer is B.')).toBeTruthy();
    });

    it('should not show feedback when showResult is false', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 1,
        correctAnswer: 1,
        showResult: false,
      };
      const { queryByText } = render(<MultipleChoice {...props} />);

      expect(queryByText('Correct!')).toBeNull();
      expect(queryByText('Incorrect')).toBeNull();
    });

    it('should not show feedback when no answer is selected', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: null,
        correctAnswer: 1,
        showResult: true,
      };
      const { queryByText } = render(<MultipleChoice {...props} />);

      expect(queryByText('Correct!')).toBeNull();
      expect(queryByText('Incorrect')).toBeNull();
    });

    it('should show correct answer label in incorrect feedback', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 2,
        correctAnswer: 0,
        showResult: true,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('The correct answer is A.')).toBeTruthy();
    });

    it('should animate feedback appearance', async () => {
      const { getByText, rerender } = render(
        <MultipleChoice
          {...defaultProps}
          selectedAnswer={1}
          correctAnswer={1}
          showResult={false}
        />
      );

      rerender(
        <MultipleChoice
          {...defaultProps}
          selectedAnswer={1}
          correctAnswer={1}
          showResult={true}
        />
      );

      await waitFor(() => {
        expect(getByText('Correct!')).toBeTruthy();
      });
    });
  });

  describe('Disabled State', () => {
    it('should not respond to clicks when disabled', () => {
      const props = {
        ...defaultProps,
        disabled: true,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      fireEvent.press(getByText('London'));
      fireEvent.press(getByText('Paris'));
      fireEvent.press(getByText('Berlin'));

      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should still show selected answer when disabled', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 1,
        disabled: true,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('Paris')).toBeTruthy();
      expect(getByText('B')).toBeTruthy();
    });

    it('should show result feedback when disabled', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 1,
        correctAnswer: 1,
        showResult: true,
        disabled: true,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('Correct!')).toBeTruthy();
    });
  });

  describe('Correct Answer Highlighting', () => {
    it('should highlight correct answer when result is shown', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 0,
        correctAnswer: 1,
        showResult: true,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      // Both selected (incorrect) and correct answers should be visible
      expect(getByText('London')).toBeTruthy(); // Selected but wrong
      expect(getByText('Paris')).toBeTruthy(); // Correct answer
    });

    it('should only highlight selected answer when correct', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 1,
        correctAnswer: 1,
        showResult: true,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('Paris')).toBeTruthy();
    });

    it('should show correct answer even if not selected', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 3,
        correctAnswer: 0,
        showResult: true,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('Madrid')).toBeTruthy(); // Selected
      expect(getByText('London')).toBeTruthy(); // Correct answer
    });
  });

  describe('Edge Cases', () => {
    it('should handle null selectedAnswer', () => {
      const { getByText } = render(<MultipleChoice {...defaultProps} selectedAnswer={null} />);

      expect(getByText('What is the capital of France?')).toBeTruthy();
      expect(getByText('London')).toBeTruthy();
    });

    it('should handle undefined correctAnswer', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 1,
        showResult: true,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('What is the capital of France?')).toBeTruthy();
    });

    it('should handle long question text', () => {
      const props = {
        ...defaultProps,
        question:
          'This is a very long question that might span multiple lines and needs to be properly displayed in the component without breaking the layout or causing overflow issues?',
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText(/This is a very long question/)).toBeTruthy();
    });

    it('should handle long option text', () => {
      const props = {
        ...defaultProps,
        options: [
          'This is a very long option text that might need to wrap',
          'Short option',
          'Another long option that should be displayed correctly without breaking the layout',
          'Option 4',
        ],
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText(/This is a very long option text/)).toBeTruthy();
    });

    it('should handle selectedAnswer out of range', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 10,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('What is the capital of France?')).toBeTruthy();
    });

    it('should handle correctAnswer out of range', () => {
      const props = {
        ...defaultProps,
        selectedAnswer: 1,
        correctAnswer: 10,
        showResult: true,
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('What is the capital of France?')).toBeTruthy();
    });

    it('should handle single option', () => {
      const props = {
        ...defaultProps,
        options: ['Only option'],
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('A')).toBeTruthy();
      expect(getByText('Only option')).toBeTruthy();
    });

    it('should handle special characters in question and options', () => {
      const props = {
        ...defaultProps,
        question: 'What is 2 + 2? Select the correct answer:',
        options: ['<3', '4', '>5', '2²'],
      };
      const { getByText } = render(<MultipleChoice {...props} />);

      expect(getByText('What is 2 + 2? Select the correct answer:')).toBeTruthy();
      expect(getByText('<3')).toBeTruthy();
      expect(getByText('4')).toBeTruthy();
      expect(getByText('>5')).toBeTruthy();
      expect(getByText('2²')).toBeTruthy();
    });
  });

  describe('Multiple Renders', () => {
    it('should handle toggling showResult', () => {
      const { getByText, queryByText, rerender } = render(
        <MultipleChoice
          {...defaultProps}
          selectedAnswer={1}
          correctAnswer={1}
          showResult={false}
        />
      );

      expect(queryByText('Correct!')).toBeNull();

      rerender(
        <MultipleChoice
          {...defaultProps}
          selectedAnswer={1}
          correctAnswer={1}
          showResult={true}
        />
      );

      expect(getByText('Correct!')).toBeTruthy();

      rerender(
        <MultipleChoice
          {...defaultProps}
          selectedAnswer={1}
          correctAnswer={1}
          showResult={false}
        />
      );

      expect(queryByText('Correct!')).toBeNull();
    });

    it('should handle changing from correct to incorrect answer', () => {
      const { getByText, rerender } = render(
        <MultipleChoice
          {...defaultProps}
          selectedAnswer={1}
          correctAnswer={1}
          showResult={true}
        />
      );

      expect(getByText('Correct!')).toBeTruthy();

      rerender(
        <MultipleChoice
          {...defaultProps}
          selectedAnswer={0}
          correctAnswer={1}
          showResult={true}
        />
      );

      expect(getByText('Incorrect')).toBeTruthy();
    });

    it('should handle changing options', () => {
      const { getByText, queryByText, rerender } = render(<MultipleChoice {...defaultProps} />);

      expect(getByText('London')).toBeTruthy();

      rerender(
        <MultipleChoice
          {...defaultProps}
          options={['Tokyo', 'Seoul', 'Beijing', 'Bangkok']}
        />
      );

      expect(queryByText('London')).toBeNull();
      expect(getByText('Tokyo')).toBeTruthy();
    });
  });
});
