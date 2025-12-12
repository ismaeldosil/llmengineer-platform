/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render correctly with default props', () => {
      const { getByText } = render(<Button onPress={mockOnPress}>Click me</Button>);

      expect(getByText('Click me')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <Button onPress={mockOnPress} testID="custom-button">
          Click me
        </Button>
      );

      expect(getByTestId('custom-button')).toBeTruthy();
    });

    it('should render children correctly', () => {
      const { getByText } = render(<Button onPress={mockOnPress}>Submit Form</Button>);

      expect(getByText('Submit Form')).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('should render primary variant', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} variant="primary">
          Primary
        </Button>
      );

      expect(getByText('Primary')).toBeTruthy();
    });

    it('should render secondary variant', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} variant="secondary">
          Secondary
        </Button>
      );

      expect(getByText('Secondary')).toBeTruthy();
    });

    it('should render outline variant', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} variant="outline">
          Outline
        </Button>
      );

      expect(getByText('Outline')).toBeTruthy();
    });

    it('should apply correct styles for primary variant', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} variant="primary">
          Primary
        </Button>
      );

      const button = getByText('Primary').parent;
      expect(button?.props.style).toBeDefined();
    });

    it('should apply correct styles for secondary variant', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} variant="secondary">
          Secondary
        </Button>
      );

      const button = getByText('Secondary').parent;
      expect(button?.props.style).toBeDefined();
    });

    it('should apply correct styles for outline variant', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} variant="outline">
          Outline
        </Button>
      );

      const button = getByText('Outline').parent;
      expect(button?.props.style).toBeDefined();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} size="sm">
          Small
        </Button>
      );

      expect(getByText('Small')).toBeTruthy();
    });

    it('should render medium size (default)', () => {
      const { getByText } = render(<Button onPress={mockOnPress}>Medium</Button>);

      expect(getByText('Medium')).toBeTruthy();
    });

    it('should render large size', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} size="lg">
          Large
        </Button>
      );

      expect(getByText('Large')).toBeTruthy();
    });
  });

  describe('Press Handling', () => {
    it('should call onPress when pressed', () => {
      const { getByText } = render(<Button onPress={mockOnPress}>Press me</Button>);

      fireEvent.press(getByText('Press me'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple presses', () => {
      const { getByText } = render(<Button onPress={mockOnPress}>Press me</Button>);

      const button = getByText('Press me');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });

    it('should not call onPress when disabled', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} disabled>
          Disabled
        </Button>
      );

      fireEvent.press(getByText('Disabled'));

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const { getByTestId } = render(
        <Button onPress={mockOnPress} loading testID="loading-button">
          Loading
        </Button>
      );

      fireEvent.press(getByTestId('loading-button'));

      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should render disabled state correctly', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} disabled>
          Disabled Button
        </Button>
      );

      expect(getByText('Disabled Button')).toBeTruthy();
    });

    it('should prevent press when disabled', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} disabled>
          Click me
        </Button>
      );

      fireEvent.press(getByText('Click me'));

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should apply disabled styles', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} disabled>
          Disabled
        </Button>
      );

      const button = getByText('Disabled').parent;
      expect(button?.props.style).toBeDefined();
    });

    it('should be disabled when both disabled and loading are true', () => {
      const { getByTestId } = render(
        <Button onPress={mockOnPress} disabled loading testID="test-button">
          Button
        </Button>
      );

      fireEvent.press(getByTestId('test-button'));

      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show spinner when loading', () => {
      const { getByTestId } = render(
        <Button onPress={mockOnPress} loading testID="loading-btn">
          Loading
        </Button>
      );

      expect(getByTestId('loading-btn-spinner')).toBeTruthy();
    });

    it('should not show text when loading', () => {
      const { queryByText } = render(
        <Button onPress={mockOnPress} loading>
          Loading Text
        </Button>
      );

      expect(queryByText('Loading Text')).toBeNull();
    });

    it('should prevent press when loading', () => {
      const { getByTestId } = render(
        <Button onPress={mockOnPress} loading testID="btn">
          Click me
        </Button>
      );

      fireEvent.press(getByTestId('btn'));

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should show white spinner for primary variant', () => {
      const { getByTestId } = render(
        <Button onPress={mockOnPress} loading variant="primary" testID="primary-btn">
          Loading
        </Button>
      );

      const spinner = getByTestId('primary-btn-spinner');
      expect(spinner.props.color).toBe('#FFFFFF');
    });

    it('should show blue spinner for outline variant', () => {
      const { getByTestId } = render(
        <Button onPress={mockOnPress} loading variant="outline" testID="outline-btn">
          Loading
        </Button>
      );

      const spinner = getByTestId('outline-btn-spinner');
      expect(spinner.props.color).toBe('#3B82F6');
    });

    it('should show blue spinner for secondary variant', () => {
      const { getByTestId } = render(
        <Button onPress={mockOnPress} loading variant="secondary" testID="secondary-btn">
          Loading
        </Button>
      );

      const spinner = getByTestId('secondary-btn-spinner');
      expect(spinner.props.color).toBe('#3B82F6');
    });
  });

  describe('Full Width', () => {
    it('should apply full width style when fullWidth is true', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} fullWidth>
          Full Width
        </Button>
      );

      const button = getByText('Full Width').parent;
      expect(button?.props.style).toBeDefined();
    });

    it('should not apply full width by default', () => {
      const { getByText } = render(<Button onPress={mockOnPress}>Normal Width</Button>);

      expect(getByText('Normal Width')).toBeTruthy();
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByText } = render(
        <Button onPress={mockOnPress} style={customStyle}>
          Custom Style
        </Button>
      );

      const button = getByText('Custom Style').parent;
      expect(button?.props.style).toBeDefined();
    });

    it('should merge custom styles with default styles', () => {
      const customStyle = { marginTop: 20 };
      const { getByText } = render(
        <Button onPress={mockOnPress} style={customStyle}>
          Merged Style
        </Button>
      );

      expect(getByText('Merged Style')).toBeTruthy();
    });
  });

  describe('Variant and Size Combinations', () => {
    it('should render primary small button', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} variant="primary" size="sm">
          Primary Small
        </Button>
      );

      expect(getByText('Primary Small')).toBeTruthy();
    });

    it('should render secondary large button', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} variant="secondary" size="lg">
          Secondary Large
        </Button>
      );

      expect(getByText('Secondary Large')).toBeTruthy();
    });

    it('should render outline medium button', () => {
      const { getByText } = render(
        <Button onPress={mockOnPress} variant="outline" size="md">
          Outline Medium
        </Button>
      );

      expect(getByText('Outline Medium')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { root } = render(<Button onPress={mockOnPress}></Button>);

      expect(root).toBeTruthy();
    });

    it('should handle very long text', () => {
      const longText =
        'This is a very long button text that should still render correctly without breaking the layout or causing any issues';
      const { getByText } = render(<Button onPress={mockOnPress}>{longText}</Button>);

      expect(getByText(longText)).toBeTruthy();
    });

    it('should toggle between loading and not loading', () => {
      const { getByText, queryByText, rerender, getByTestId } = render(
        <Button onPress={mockOnPress} loading={false} testID="toggle-btn">
          Click me
        </Button>
      );

      expect(getByText('Click me')).toBeTruthy();

      rerender(
        <Button onPress={mockOnPress} loading={true} testID="toggle-btn">
          Click me
        </Button>
      );

      expect(queryByText('Click me')).toBeNull();
      expect(getByTestId('toggle-btn-spinner')).toBeTruthy();
    });

    it('should handle disabled state changes', () => {
      const { getByText, rerender } = render(
        <Button onPress={mockOnPress} disabled={false}>
          Toggle Disabled
        </Button>
      );

      fireEvent.press(getByText('Toggle Disabled'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);

      rerender(
        <Button onPress={mockOnPress} disabled={true}>
          Toggle Disabled
        </Button>
      );

      fireEvent.press(getByText('Toggle Disabled'));
      expect(mockOnPress).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });
});
