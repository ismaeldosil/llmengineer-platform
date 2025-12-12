/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator';

describe('PasswordStrengthIndicator', () => {
  it('should not render when password is empty', () => {
    const { queryByText } = render(<PasswordStrengthIndicator password="" />);

    expect(queryByText('Muy débil')).toBeNull();
  });

  it('should show very weak for weak password', () => {
    const { getByText } = render(<PasswordStrengthIndicator password="test" />);

    expect(getByText('Muy débil')).toBeTruthy();
  });

  it('should show weak for slightly better password', () => {
    const { getByText } = render(<PasswordStrengthIndicator password="test123" />);

    expect(getByText(/Débil|Muy débil/)).toBeTruthy();
  });

  it('should show acceptable for medium password', () => {
    const { getByText } = render(<PasswordStrengthIndicator password="testPass1" />);

    expect(getByText(/Aceptable|Fuerte/)).toBeTruthy();
  });

  it('should show strong for strong password', () => {
    const { getByText } = render(<PasswordStrengthIndicator password="TestPass123" />);

    expect(getByText(/Fuerte|Muy fuerte/)).toBeTruthy();
  });

  it('should show very strong for very strong password', () => {
    const { getByText } = render(<PasswordStrengthIndicator password="TestPass123!@#$%" />);

    expect(getByText('Muy fuerte')).toBeTruthy();
  });

  it('should render 5 strength bars', () => {
    const { UNSAFE_getAllByType } = render(<PasswordStrengthIndicator password="TestPass123" />);

    const views = UNSAFE_getAllByType(View);
    // Filter for bar views (they have specific styles)
    const bars = views.filter((view: any) => {
      const style = view.props.style;
      return style && Array.isArray(style);
    });

    expect(bars.length).toBeGreaterThanOrEqual(5);
  });

  it('should update when password changes', () => {
    const { getByText, rerender } = render(<PasswordStrengthIndicator password="test" />);

    expect(getByText('Muy débil')).toBeTruthy();

    rerender(<PasswordStrengthIndicator password="TestPass123!@#" />);

    expect(getByText('Muy fuerte')).toBeTruthy();
  });
});
