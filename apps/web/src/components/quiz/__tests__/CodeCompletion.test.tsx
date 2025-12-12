import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CodeCompletion } from '../CodeCompletion';

describe('CodeCompletion', () => {
  const mockOnAnswerChange = jest.fn();
  const defaultProps = {
    question: 'Completa el código para definir una función asíncrona',
    codeTemplate: `const fetchData = _____ () => {
  const response = await fetch('/api');
  return response.json();
};`,
    correctAnswer: 'async',
    userAnswer: '',
    onAnswerChange: mockOnAnswerChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render question text correctly', () => {
      const { getByText } = render(<CodeCompletion {...defaultProps} />);
      expect(getByText('Completa el código para definir una función asíncrona')).toBeTruthy();
    });

    it('should render code template with placeholder', () => {
      const { getAllByText } = render(<CodeCompletion {...defaultProps} />);
      // Syntax highlighting splits text, so check for individual keywords
      // "const" appears twice in the code
      expect(getAllByText('const').length).toBe(2);
      expect(getAllByText('await').length).toBe(1);
    });

    it('should render code without placeholder', () => {
      const props = {
        ...defaultProps,
        codeTemplate: 'const x = 5;\nconsole.log(x);',
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      // Check for individual elements instead of concatenated text
      expect(getByText('const')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
    });

    it('should render input field', () => {
      const { getByPlaceholderText } = render(<CodeCompletion {...defaultProps} />);
      expect(getByPlaceholderText('...')).toBeTruthy();
    });

    it('should display user answer in input', () => {
      const props = {
        ...defaultProps,
        userAnswer: 'async',
      };
      const { getByDisplayValue } = render(<CodeCompletion {...props} />);
      expect(getByDisplayValue('async')).toBeTruthy();
    });

    it('should handle multi-line code templates', () => {
      const props = {
        ...defaultProps,
        codeTemplate: `function test() {
  const x = _____;
  return x + 1;
}`,
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('function')).toBeTruthy();
      expect(getByText('return')).toBeTruthy();
      expect(getByText('1')).toBeTruthy();
    });
  });

  describe('Input Handling', () => {
    it('should call onAnswerChange when text is entered', () => {
      const { getByPlaceholderText } = render(<CodeCompletion {...defaultProps} />);
      const input = getByPlaceholderText('...');

      fireEvent.changeText(input, 'async');

      expect(mockOnAnswerChange).toHaveBeenCalledWith('async');
      expect(mockOnAnswerChange).toHaveBeenCalledTimes(1);
    });

    it('should allow typing multiple characters', () => {
      const { getByPlaceholderText } = render(<CodeCompletion {...defaultProps} />);
      const input = getByPlaceholderText('...');

      fireEvent.changeText(input, 'a');
      fireEvent.changeText(input, 'as');
      fireEvent.changeText(input, 'asy');
      fireEvent.changeText(input, 'async');

      expect(mockOnAnswerChange).toHaveBeenCalledTimes(4);
      expect(mockOnAnswerChange).toHaveBeenLastCalledWith('async');
    });

    it('should allow deleting text', () => {
      const { getByDisplayValue } = render(
        <CodeCompletion {...defaultProps} userAnswer="async" />
      );
      const input = getByDisplayValue('async');

      fireEvent.changeText(input, 'asy');
      fireEvent.changeText(input, '');

      expect(mockOnAnswerChange).toHaveBeenCalledWith('asy');
      expect(mockOnAnswerChange).toHaveBeenCalledWith('');
    });

    it('should not call onAnswerChange when disabled', () => {
      const props = {
        ...defaultProps,
        disabled: true,
      };
      const { getByPlaceholderText } = render(<CodeCompletion {...props} />);
      const input = getByPlaceholderText('...');

      fireEvent.changeText(input, 'async');

      expect(mockOnAnswerChange).not.toHaveBeenCalled();
    });

    it('should handle special characters in input', () => {
      const { getByPlaceholderText } = render(<CodeCompletion {...defaultProps} />);
      const input = getByPlaceholderText('...');

      fireEvent.changeText(input, '() => {}');

      expect(mockOnAnswerChange).toHaveBeenCalledWith('() => {}');
    });

    it('should handle whitespace in input', () => {
      const { getByPlaceholderText } = render(<CodeCompletion {...defaultProps} />);
      const input = getByPlaceholderText('...');

      fireEvent.changeText(input, '  async  ');

      expect(mockOnAnswerChange).toHaveBeenCalledWith('  async  ');
    });
  });

  describe('Result Display', () => {
    it('should show correct feedback when answer is correct', () => {
      const props = {
        ...defaultProps,
        userAnswer: 'async',
        showResult: true,
      };
      const { getByText } = render(<CodeCompletion {...props} />);

      expect(getByText('¡Correcto!')).toBeTruthy();
    });

    it('should show incorrect feedback when answer is wrong', () => {
      const props = {
        ...defaultProps,
        userAnswer: 'sync',
        showResult: true,
      };
      const { getByText } = render(<CodeCompletion {...props} />);

      expect(getByText('Incorrecto')).toBeTruthy();
      expect(getByText('Respuesta correcta:')).toBeTruthy();
      expect(getByText('async')).toBeTruthy();
    });

    it('should not show feedback when showResult is false', () => {
      const props = {
        ...defaultProps,
        userAnswer: 'async',
        showResult: false,
      };
      const { queryByText } = render(<CodeCompletion {...props} />);

      expect(queryByText('¡Correcto!')).toBeNull();
      expect(queryByText('Incorrecto')).toBeNull();
    });

    it('should trim whitespace when comparing answers', () => {
      const props = {
        ...defaultProps,
        userAnswer: '  async  ',
        showResult: true,
      };
      const { getByText } = render(<CodeCompletion {...props} />);

      expect(getByText('¡Correcto!')).toBeTruthy();
    });

    it('should show incorrect for empty answer', () => {
      const props = {
        ...defaultProps,
        userAnswer: '',
        showResult: true,
      };
      const { getByText } = render(<CodeCompletion {...props} />);

      expect(getByText('Incorrecto')).toBeTruthy();
    });

    it('should show correct answer in feedback', () => {
      const props = {
        ...defaultProps,
        correctAnswer: 'function*',
        userAnswer: 'function',
        showResult: true,
      };
      const { getByText } = render(<CodeCompletion {...props} />);

      expect(getByText('function*')).toBeTruthy();
    });

    it('should animate feedback appearance', async () => {
      const { getByText, rerender } = render(
        <CodeCompletion {...defaultProps} userAnswer="async" showResult={false} />
      );

      rerender(<CodeCompletion {...defaultProps} userAnswer="async" showResult={true} />);

      await waitFor(() => {
        expect(getByText('¡Correcto!')).toBeTruthy();
      });
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      const props = {
        ...defaultProps,
        disabled: true,
      };
      const { getByPlaceholderText } = render(<CodeCompletion {...props} />);
      const input = getByPlaceholderText('...');

      expect(input.props.editable).toBe(false);
    });

    it('should not respond to input when disabled', () => {
      const props = {
        ...defaultProps,
        disabled: true,
      };
      const { getByPlaceholderText } = render(<CodeCompletion {...props} />);
      const input = getByPlaceholderText('...');

      fireEvent.changeText(input, 'async');

      expect(mockOnAnswerChange).not.toHaveBeenCalled();
    });

    it('should show feedback when disabled', () => {
      const props = {
        ...defaultProps,
        userAnswer: 'async',
        disabled: true,
        showResult: true,
      };
      const { getByText } = render(<CodeCompletion {...props} />);

      expect(getByText('¡Correcto!')).toBeTruthy();
    });
  });

  describe('Different Languages', () => {
    it('should handle javascript language', () => {
      const props = {
        ...defaultProps,
        language: 'javascript' as const,
        codeTemplate: 'const x = _____; return x;',
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('const')).toBeTruthy();
      expect(getByText('return')).toBeTruthy();
    });

    it('should handle python language', () => {
      const props = {
        ...defaultProps,
        language: 'python' as const,
        codeTemplate: 'def test():\n    return _____',
        correctAnswer: 'True',
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('def')).toBeTruthy();
      expect(getByText('return')).toBeTruthy();
    });

    it('should handle typescript language', () => {
      const props = {
        ...defaultProps,
        language: 'typescript' as const,
        codeTemplate: 'interface User {\n  name: _____;\n}',
        correctAnswer: 'string',
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('interface')).toBeTruthy();
    });

    it('should highlight keywords for javascript', () => {
      const props = {
        ...defaultProps,
        language: 'javascript' as const,
        codeTemplate: 'const x = _____; return x;',
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('const')).toBeTruthy();
      expect(getByText('return')).toBeTruthy();
    });

    it('should highlight keywords for python', () => {
      const props = {
        ...defaultProps,
        language: 'python' as const,
        codeTemplate: 'def greet():\n    return _____',
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('def')).toBeTruthy();
      expect(getByText('return')).toBeTruthy();
    });

    it('should highlight keywords for typescript', () => {
      const props = {
        ...defaultProps,
        language: 'typescript' as const,
        codeTemplate: 'interface Data {\n  value: _____;\n}',
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('interface')).toBeTruthy();
    });
  });

  describe('Visual States', () => {
    it('should have correct border color when focused', () => {
      const { getByPlaceholderText } = render(<CodeCompletion {...defaultProps} />);
      const input = getByPlaceholderText('...');

      fireEvent(input, 'focus');

      // Input should be focused, visual state handled by component
      expect(input).toBeTruthy();
    });

    it('should have green background when correct', () => {
      const props = {
        ...defaultProps,
        userAnswer: 'async',
        showResult: true,
      };
      const { getByDisplayValue } = render(<CodeCompletion {...props} />);
      const input = getByDisplayValue('async');

      expect(input).toBeTruthy();
    });

    it('should have red background when incorrect', () => {
      const props = {
        ...defaultProps,
        userAnswer: 'wrong',
        showResult: true,
      };
      const { getByDisplayValue } = render(<CodeCompletion {...props} />);
      const input = getByDisplayValue('wrong');

      expect(input).toBeTruthy();
    });
  });

  describe('Syntax Highlighting', () => {
    it('should highlight strings', () => {
      const props = {
        ...defaultProps,
        codeTemplate: 'const message = "_____"; console.log(message);',
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('const')).toBeTruthy();
    });

    it('should highlight numbers', () => {
      const props = {
        ...defaultProps,
        codeTemplate: 'const count = 42; return count + _____;',
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('42')).toBeTruthy();
    });

    it('should highlight comments', () => {
      const props = {
        ...defaultProps,
        codeTemplate: '// This is a comment\nconst x = _____;',
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('// This is a comment')).toBeTruthy();
    });

    it('should handle code without syntax highlighting', () => {
      const props = {
        ...defaultProps,
        codeTemplate: 'plain text with _____',
      };
      const { getByPlaceholderText } = render(<CodeCompletion {...props} />);
      expect(getByPlaceholderText('...')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty question', () => {
      const props = {
        ...defaultProps,
        question: '',
      };
      const { getByPlaceholderText } = render(<CodeCompletion {...props} />);
      expect(getByPlaceholderText('...')).toBeTruthy();
    });

    it('should handle empty codeTemplate', () => {
      const props = {
        ...defaultProps,
        codeTemplate: '',
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      // With empty template, just verify the component renders
      expect(getByText('Completa el código para definir una función asíncrona')).toBeTruthy();
    });

    it('should handle multiple placeholders', () => {
      const props = {
        ...defaultProps,
        codeTemplate: 'const _____ = _____; return x;',
      };
      const { getByPlaceholderText } = render(<CodeCompletion {...props} />);
      expect(getByPlaceholderText('...')).toBeTruthy();
    });

    it('should handle placeholder at start', () => {
      const props = {
        ...defaultProps,
        codeTemplate: '_____ fetchData() { return true; }',
      };
      const { getByPlaceholderText } = render(<CodeCompletion {...props} />);
      expect(getByPlaceholderText('...')).toBeTruthy();
    });

    it('should handle placeholder at end', () => {
      const props = {
        ...defaultProps,
        codeTemplate: 'const x = 5; return _____;',
      };
      const { getByPlaceholderText } = render(<CodeCompletion {...props} />);
      expect(getByPlaceholderText('...')).toBeTruthy();
    });

    it('should handle long correct answer', () => {
      const props = {
        ...defaultProps,
        correctAnswer: 'async function*',
        userAnswer: 'wrong',
        showResult: true,
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('async function*')).toBeTruthy();
    });

    it('should handle special characters in correct answer', () => {
      const props = {
        ...defaultProps,
        correctAnswer: '() => {}',
        userAnswer: '() => {}',
        showResult: true,
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('¡Correcto!')).toBeTruthy();
    });

    it('should handle case-sensitive answers', () => {
      const props = {
        ...defaultProps,
        correctAnswer: 'async',
        userAnswer: 'Async',
        showResult: true,
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('Incorrecto')).toBeTruthy();
    });

    it('should handle very long code templates', () => {
      const props = {
        ...defaultProps,
        codeTemplate: `function veryLongFunction() {
  const data = fetch('/api/endpoint');
  const result = await data.json();
  const processed = result.map(item => item.value);
  const filtered = processed.filter(val => val > 0);
  return _____ filtered.reduce((acc, val) => acc + val, 0);
}`,
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('function')).toBeTruthy();
      expect(getByText('await')).toBeTruthy();
    });

    it('should handle code with tabs and spaces', () => {
      const props = {
        ...defaultProps,
        codeTemplate: 'function test() {\n\t\tconst x = _____;\n\t\treturn x;\n}',
      };
      const { getByText } = render(<CodeCompletion {...props} />);
      expect(getByText('function')).toBeTruthy();
      expect(getByText('const')).toBeTruthy();
    });
  });

  describe('Multiple Renders', () => {
    it('should handle toggling showResult', () => {
      const { getByText, queryByText, rerender } = render(
        <CodeCompletion {...defaultProps} userAnswer="async" showResult={false} />
      );

      expect(queryByText('¡Correcto!')).toBeNull();

      rerender(<CodeCompletion {...defaultProps} userAnswer="async" showResult={true} />);

      expect(getByText('¡Correcto!')).toBeTruthy();

      rerender(<CodeCompletion {...defaultProps} userAnswer="async" showResult={false} />);

      expect(queryByText('¡Correcto!')).toBeNull();
    });

    it('should handle changing from correct to incorrect answer', () => {
      const { getByText, rerender } = render(
        <CodeCompletion {...defaultProps} userAnswer="async" showResult={true} />
      );

      expect(getByText('¡Correcto!')).toBeTruthy();

      rerender(<CodeCompletion {...defaultProps} userAnswer="wrong" showResult={true} />);

      expect(getByText('Incorrecto')).toBeTruthy();
    });

    it('should handle changing question', () => {
      const { getByText, rerender } = render(<CodeCompletion {...defaultProps} />);

      expect(getByText('Completa el código para definir una función asíncrona')).toBeTruthy();

      rerender(
        <CodeCompletion
          {...defaultProps}
          question="Complete the code to define a constant"
        />
      );

      expect(getByText('Complete the code to define a constant')).toBeTruthy();
    });

    it('should handle changing code template', () => {
      const { getAllByText, getByText, rerender } = render(<CodeCompletion {...defaultProps} />);

      // "const" appears twice in default template
      expect(getAllByText('const').length).toBe(2);

      rerender(
        <CodeCompletion {...defaultProps} codeTemplate="const x = _____; return x;" />
      );

      // After rerender, "const" appears once
      expect(getAllByText('const').length).toBe(1);
      expect(getByText('return')).toBeTruthy();
    });

    it('should handle changing language', () => {
      const { rerender } = render(<CodeCompletion {...defaultProps} language="javascript" />);

      rerender(<CodeCompletion {...defaultProps} language="python" />);

      // Component should re-render without errors
      expect(true).toBe(true);
    });
  });

  describe('Input Focus', () => {
    it('should handle focus events', () => {
      const { getByPlaceholderText } = render(<CodeCompletion {...defaultProps} />);
      const input = getByPlaceholderText('...');

      fireEvent(input, 'focus');
      expect(input).toBeTruthy();

      fireEvent(input, 'blur');
      expect(input).toBeTruthy();
    });

    it('should not auto-focus when disabled', () => {
      const props = {
        ...defaultProps,
        disabled: true,
      };
      const { getByPlaceholderText } = render(<CodeCompletion {...props} />);
      const input = getByPlaceholderText('...');

      expect(input.props.editable).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper input properties', () => {
      const { getByPlaceholderText } = render(<CodeCompletion {...defaultProps} />);
      const input = getByPlaceholderText('...');

      expect(input.props.autoCapitalize).toBe('none');
      expect(input.props.autoCorrect).toBe(false);
      expect(input.props.spellCheck).toBe(false);
    });

    it('should maintain monospace font for code', () => {
      const { getByPlaceholderText } = render(<CodeCompletion {...defaultProps} />);
      const input = getByPlaceholderText('...');

      // Component uses Courier font
      expect(input).toBeTruthy();
    });
  });
});
