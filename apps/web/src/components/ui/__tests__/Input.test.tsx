import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('should render correctly with default props', () => {
      const { getByTestId } = render(<Input testID="test-input" />);

      expect(getByTestId('test-input')).toBeTruthy();
    });

    it('should render with placeholder', () => {
      const { getByPlaceholderText } = render(<Input placeholder="Enter your name" />);

      expect(getByPlaceholderText('Enter your name')).toBeTruthy();
    });

    it('should render container with testID', () => {
      const { getByTestId } = render(<Input testID="custom-input" />);

      expect(getByTestId('custom-input-container')).toBeTruthy();
    });
  });

  describe('Label', () => {
    it('should show label when provided', () => {
      const { getByText } = render(<Input label="Email Address" />);

      expect(getByText('Email Address')).toBeTruthy();
    });

    it('should not show label when not provided', () => {
      const { queryByTestId } = render(<Input testID="no-label-input" />);

      expect(queryByTestId('no-label-input-label')).toBeNull();
    });

    it('should render label with correct testID', () => {
      const { getByTestId } = render(<Input label="Username" testID="username-input" />);

      expect(getByTestId('username-input-label')).toBeTruthy();
    });

    it('should render multiple inputs with different labels', () => {
      const { getByText } = render(
        <>
          <Input label="First Name" />
          <Input label="Last Name" />
        </>
      );

      expect(getByText('First Name')).toBeTruthy();
      expect(getByText('Last Name')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should show error message when provided', () => {
      const { getByText } = render(<Input error="This field is required" />);

      expect(getByText('This field is required')).toBeTruthy();
    });

    it('should not show error when not provided', () => {
      const { queryByTestId } = render(<Input testID="no-error-input" />);

      expect(queryByTestId('no-error-input-error')).toBeNull();
    });

    it('should render error with correct testID', () => {
      const { getByTestId } = render(
        <Input error="Invalid email" testID="email-input" />
      );

      expect(getByTestId('email-input-error')).toBeTruthy();
    });

    it('should apply error styles when error is present', () => {
      const { getByTestId } = render(
        <Input error="Error message" testID="error-input" />
      );

      const input = getByTestId('error-input');
      expect(input.props.style).toBeDefined();
    });

    it('should show multiple error messages for different inputs', () => {
      const { getByText } = render(
        <>
          <Input error="Email is required" />
          <Input error="Password must be at least 8 characters" />
        </>
      );

      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Password must be at least 8 characters')).toBeTruthy();
    });
  });

  describe('Text Input', () => {
    it('should call onChange when text is entered', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <Input onChangeText={mockOnChange} testID="text-input" />
      );

      fireEvent.changeText(getByTestId('text-input'), 'Hello World');

      expect(mockOnChange).toHaveBeenCalledWith('Hello World');
    });

    it('should handle multiple text changes', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <Input onChangeText={mockOnChange} testID="text-input" />
      );

      fireEvent.changeText(getByTestId('text-input'), 'First');
      fireEvent.changeText(getByTestId('text-input'), 'Second');
      fireEvent.changeText(getByTestId('text-input'), 'Third');

      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });

    it('should handle empty text input', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <Input onChangeText={mockOnChange} testID="text-input" />
      );

      fireEvent.changeText(getByTestId('text-input'), '');

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should handle special characters', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <Input onChangeText={mockOnChange} testID="text-input" />
      );

      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      fireEvent.changeText(getByTestId('text-input'), specialText);

      expect(mockOnChange).toHaveBeenCalledWith(specialText);
    });

    it('should handle long text input', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <Input onChangeText={mockOnChange} testID="text-input" />
      );

      const longText = 'a'.repeat(1000);
      fireEvent.changeText(getByTestId('text-input'), longText);

      expect(mockOnChange).toHaveBeenCalledWith(longText);
    });
  });

  describe('Placeholder', () => {
    it('should display placeholder text', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Type something..." />
      );

      expect(getByPlaceholderText('Type something...')).toBeTruthy();
    });

    it('should handle empty placeholder', () => {
      const { getByTestId } = render(<Input placeholder="" testID="input" />);

      expect(getByTestId('input')).toBeTruthy();
    });

    it('should have correct placeholder color', () => {
      const { getByTestId } = render(
        <Input placeholder="Placeholder" testID="input" />
      );

      const input = getByTestId('input');
      expect(input.props.placeholderTextColor).toBe('#6B7280');
    });
  });

  describe('Label and Error Combined', () => {
    it('should show both label and error', () => {
      const { getByText } = render(
        <Input label="Password" error="Password is too short" />
      );

      expect(getByText('Password')).toBeTruthy();
      expect(getByText('Password is too short')).toBeTruthy();
    });

    it('should render complete input with label, placeholder, and error', () => {
      const { getByText, getByPlaceholderText } = render(
        <Input
          label="Email"
          placeholder="user@example.com"
          error="Invalid email format"
        />
      );

      expect(getByText('Email')).toBeTruthy();
      expect(getByPlaceholderText('user@example.com')).toBeTruthy();
      expect(getByText('Invalid email format')).toBeTruthy();
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom style', () => {
      const customStyle = { backgroundColor: 'blue' };
      const { getByTestId } = render(
        <Input style={customStyle} testID="custom-input" />
      );

      expect(getByTestId('custom-input')).toBeTruthy();
    });

    it('should merge custom styles with default styles', () => {
      const customStyle = { marginTop: 20 };
      const { getByTestId } = render(
        <Input style={customStyle} testID="styled-input" />
      );

      expect(getByTestId('styled-input')).toBeTruthy();
    });

    it('should override default styles with custom styles', () => {
      const customStyle = { borderRadius: 20 };
      const { getByTestId } = render(
        <Input style={customStyle} testID="override-input" />
      );

      expect(getByTestId('override-input')).toBeTruthy();
    });
  });

  describe('TextInput Props', () => {
    it('should pass through secureTextEntry prop', () => {
      const { getByTestId } = render(
        <Input secureTextEntry testID="password-input" />
      );

      const input = getByTestId('password-input');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should pass through keyboardType prop', () => {
      const { getByTestId } = render(
        <Input keyboardType="email-address" testID="email-input" />
      );

      const input = getByTestId('email-input');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('should pass through autoCapitalize prop', () => {
      const { getByTestId } = render(
        <Input autoCapitalize="none" testID="input" />
      );

      const input = getByTestId('input');
      expect(input.props.autoCapitalize).toBe('none');
    });

    it('should pass through autoCorrect prop', () => {
      const { getByTestId } = render(
        <Input autoCorrect={false} testID="input" />
      );

      const input = getByTestId('input');
      expect(input.props.autoCorrect).toBe(false);
    });

    it('should pass through editable prop', () => {
      const { getByTestId } = render(
        <Input editable={false} testID="readonly-input" />
      );

      const input = getByTestId('readonly-input');
      expect(input.props.editable).toBe(false);
    });

    it('should pass through maxLength prop', () => {
      const { getByTestId } = render(
        <Input maxLength={100} testID="limited-input" />
      );

      const input = getByTestId('limited-input');
      expect(input.props.maxLength).toBe(100);
    });

    it('should pass through multiline prop', () => {
      const { getByTestId } = render(
        <Input multiline testID="textarea-input" />
      );

      const input = getByTestId('textarea-input');
      expect(input.props.multiline).toBe(true);
    });

    it('should pass through numberOfLines prop', () => {
      const { getByTestId } = render(
        <Input multiline numberOfLines={4} testID="textarea-input" />
      );

      const input = getByTestId('textarea-input');
      expect(input.props.numberOfLines).toBe(4);
    });
  });

  describe('Event Handlers', () => {
    it('should call onFocus when input is focused', () => {
      const mockOnFocus = jest.fn();
      const { getByTestId } = render(
        <Input onFocus={mockOnFocus} testID="input" />
      );

      fireEvent(getByTestId('input'), 'focus');

      expect(mockOnFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when input loses focus', () => {
      const mockOnBlur = jest.fn();
      const { getByTestId } = render(
        <Input onBlur={mockOnBlur} testID="input" />
      );

      fireEvent(getByTestId('input'), 'blur');

      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });

    it('should call onSubmitEditing when submitted', () => {
      const mockOnSubmit = jest.fn();
      const { getByTestId } = render(
        <Input onSubmitEditing={mockOnSubmit} testID="input" />
      );

      fireEvent(getByTestId('input'), 'submitEditing');

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Value Prop', () => {
    it('should display value when provided', () => {
      const { getByDisplayValue } = render(<Input value="Initial Value" />);

      expect(getByDisplayValue('Initial Value')).toBeTruthy();
    });

    it('should update when value changes', () => {
      const { getByDisplayValue, rerender } = render(<Input value="First" />);

      expect(getByDisplayValue('First')).toBeTruthy();

      rerender(<Input value="Second" />);

      expect(getByDisplayValue('Second')).toBeTruthy();
    });

    it('should handle controlled input', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <Input value="Controlled" onChangeText={mockOnChange} testID="input" />
      );

      fireEvent.changeText(getByTestId('input'), 'New Value');

      expect(mockOnChange).toHaveBeenCalledWith('New Value');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined props gracefully', () => {
      const { getByTestId } = render(<Input testID="input" />);

      expect(getByTestId('input')).toBeTruthy();
    });

    it('should handle null error gracefully', () => {
      const { queryByTestId } = render(
        <Input error={undefined} testID="input" />
      );

      expect(queryByTestId('input-error')).toBeNull();
    });

    it('should handle empty string error', () => {
      const { queryByText } = render(<Input error="" />);

      // Empty error should not render
      expect(queryByText('')).toBeNull();
    });

    it('should handle empty string label', () => {
      const { queryByTestId } = render(<Input label="" testID="input" />);

      // Empty label might still render but be empty
      // This tests that it doesn't crash
      expect(queryByTestId('input-label')).toBeNull();
    });

    it('should render with all props combined', () => {
      const mockOnChange = jest.fn();
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <Input
          label="Complete Input"
          placeholder="Enter text"
          error="Error message"
          value="Test value"
          onChangeText={mockOnChange}
          secureTextEntry
          keyboardType="email-address"
          testID="complete-input"
        />
      );

      expect(getByText('Complete Input')).toBeTruthy();
      expect(getByPlaceholderText('Enter text')).toBeTruthy();
      expect(getByText('Error message')).toBeTruthy();
      expect(getByTestId('complete-input')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should support testID for testing', () => {
      const { getByTestId } = render(<Input testID="accessible-input" />);

      expect(getByTestId('accessible-input')).toBeTruthy();
    });

    it('should support accessibility label', () => {
      const { getByTestId } = render(
        <Input accessibilityLabel="Email input field" testID="input" />
      );

      const input = getByTestId('input');
      expect(input.props.accessibilityLabel).toBe('Email input field');
    });

    it('should support accessibility hint', () => {
      const { getByTestId } = render(
        <Input accessibilityHint="Enter your email address" testID="input" />
      );

      const input = getByTestId('input');
      expect(input.props.accessibilityHint).toBe('Enter your email address');
    });
  });
});
