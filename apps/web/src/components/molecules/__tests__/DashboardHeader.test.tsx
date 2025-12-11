import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DashboardHeader } from '../DashboardHeader';

describe('DashboardHeader', () => {
  const mockOnProfilePress = jest.fn();
  const mockOnLogoutPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with display name', () => {
    const { getByText } = render(
      <DashboardHeader
        displayName="John Doe"
        onProfilePress={mockOnProfilePress}
        onLogoutPress={mockOnLogoutPress}
      />
    );

    expect(getByText('Hola, John Doe')).toBeTruthy();
    expect(getByText('Continua tu aprendizaje')).toBeTruthy();
  });

  it('should call onProfilePress when avatar is pressed', () => {
    const { getByTestId } = render(
      <DashboardHeader
        displayName="John Doe"
        onProfilePress={mockOnProfilePress}
        onLogoutPress={mockOnLogoutPress}
      />
    );

    const avatarButton = getByTestId('avatar-button');
    fireEvent.press(avatarButton);

    expect(mockOnProfilePress).toHaveBeenCalledTimes(1);
  });

  it('should call onLogoutPress when logout button is pressed', () => {
    const { getByTestId } = render(
      <DashboardHeader
        displayName="John Doe"
        onProfilePress={mockOnProfilePress}
        onLogoutPress={mockOnLogoutPress}
      />
    );

    const logoutButton = getByTestId('logout-button');
    fireEvent.press(logoutButton);

    expect(mockOnLogoutPress).toHaveBeenCalledTimes(1);
  });

  it('should render avatar button when no avatarUrl', () => {
    const { getByTestId } = render(
      <DashboardHeader
        displayName="Alice Smith"
        onProfilePress={mockOnProfilePress}
        onLogoutPress={mockOnLogoutPress}
      />
    );

    expect(getByTestId('avatar-button')).toBeTruthy();
  });

  it('should handle single character names', () => {
    const { getByText } = render(
      <DashboardHeader
        displayName="X"
        onProfilePress={mockOnProfilePress}
        onLogoutPress={mockOnLogoutPress}
      />
    );

    expect(getByText('Hola, X')).toBeTruthy();
  });

  it('should handle names with lowercase', () => {
    const { getByText } = render(
      <DashboardHeader
        displayName="bob"
        onProfilePress={mockOnProfilePress}
        onLogoutPress={mockOnLogoutPress}
      />
    );

    expect(getByText('Hola, bob')).toBeTruthy();
  });

  it('should not crash when pressing buttons multiple times', () => {
    const { getByTestId } = render(
      <DashboardHeader
        displayName="Test User"
        onProfilePress={mockOnProfilePress}
        onLogoutPress={mockOnLogoutPress}
      />
    );

    const avatarButton = getByTestId('avatar-button');
    const logoutButton = getByTestId('logout-button');

    fireEvent.press(avatarButton);
    fireEvent.press(avatarButton);
    fireEvent.press(logoutButton);
    fireEvent.press(logoutButton);

    expect(mockOnProfilePress).toHaveBeenCalledTimes(2);
    expect(mockOnLogoutPress).toHaveBeenCalledTimes(2);
  });
});
