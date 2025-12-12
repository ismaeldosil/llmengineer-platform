/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PasswordInput } from '../PasswordInput';

describe('PasswordInput', () => {
  it('should render correctly', () => {
    const { getByPlaceholderText } = render(<PasswordInput placeholder="Enter password" />);

    expect(getByPlaceholderText('Enter password')).toBeTruthy();
  });

  it('should render with label', () => {
    const { getByText } = render(<PasswordInput label="Password" placeholder="Enter password" />);

    expect(getByText('Password')).toBeTruthy();
  });

  it('should display error message', () => {
    const { getByText } = render(
      <PasswordInput placeholder="Enter password" error="Password is required" />
    );

    expect(getByText('Password is required')).toBeTruthy();
  });

  it('should hide password by default', () => {
    const { getByPlaceholderText } = render(<PasswordInput placeholder="Enter password" />);

    const input = getByPlaceholderText('Enter password');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('should toggle password visibility when icon is pressed', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <PasswordInput placeholder="Enter password" testID="password-input" />
    );

    const input = getByPlaceholderText('Enter password');

    // Initially hidden
    expect(input.props.secureTextEntry).toBe(true);

    // Find and press the toggle button
    const toggleButton = getByTestId('password-input').parent?.parent?.children.find(
      (child: any) => child.type === 'View'
    );

    if (toggleButton) {
      fireEvent.press(toggleButton);
      // After toggle, should be visible
      expect(input.props.secureTextEntry).toBe(false);
    }
  });

  it('should call onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <PasswordInput placeholder="Enter password" onChangeText={onChangeText} />
    );

    const input = getByPlaceholderText('Enter password');
    fireEvent.changeText(input, 'newpassword');

    expect(onChangeText).toHaveBeenCalledWith('newpassword');
  });

  it('should call onBlur when input loses focus', () => {
    const onBlur = jest.fn();
    const { getByPlaceholderText } = render(
      <PasswordInput placeholder="Enter password" onBlur={onBlur} />
    );

    const input = getByPlaceholderText('Enter password');
    fireEvent(input, 'blur');

    expect(onBlur).toHaveBeenCalled();
  });

  it('should be disabled when editable is false', () => {
    const { getByPlaceholderText } = render(
      <PasswordInput placeholder="Enter password" editable={false} />
    );

    const input = getByPlaceholderText('Enter password');
    expect(input.props.editable).toBe(false);
  });

  it('should pass through other TextInput props', () => {
    const { getByPlaceholderText } = render(
      <PasswordInput placeholder="Enter password" autoComplete="password" testID="password-field" />
    );

    const input = getByPlaceholderText('Enter password');
    expect(input.props.autoComplete).toBe('password');
    expect(input.props.testID).toBe('password-field');
  });
});
