/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RegisterScreen from '../register';
import authReducer from '@/store/slices/authSlice';
import { apiSlice } from '@/services/api';

// Mocks are in jest.setup.js

// Mock storage
jest.mock('@/utils/storage', () => ({
  storage: {
    saveToken: jest.fn(),
    saveUser: jest.fn(),
    clearAuth: jest.fn(),
  },
}));

const mockStore = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

describe('RegisterScreen', () => {
  const renderRegisterScreen = () => {
    return render(
      <Provider store={mockStore}>
        <RegisterScreen />
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render registration form', () => {
    const { getByPlaceholderText, getByText } = renderRegisterScreen();

    expect(getByText('Crea tu cuenta')).toBeTruthy();
    expect(getByText('Comienza tu viaje en LLM Engineering')).toBeTruthy();
    expect(getByPlaceholderText('Tu nombre')).toBeTruthy();
    expect(getByPlaceholderText('tu@email.com')).toBeTruthy();
    expect(getByPlaceholderText('Mínimo 8 caracteres')).toBeTruthy();
    expect(getByPlaceholderText('Repite tu contraseña')).toBeTruthy();
    expect(getByText('Crear Cuenta')).toBeTruthy();
  });

  it('should show display name error on invalid input', async () => {
    const { getByPlaceholderText, getByText } = renderRegisterScreen();

    const nameInput = getByPlaceholderText('Tu nombre');
    fireEvent.changeText(nameInput, 'A');
    fireEvent(nameInput, 'blur');

    await waitFor(() => {
      expect(getByText('El nombre debe tener al menos 2 caracteres')).toBeTruthy();
    });
  });

  it('should show email error on invalid email', async () => {
    const { getByPlaceholderText, getByText } = renderRegisterScreen();

    const emailInput = getByPlaceholderText('tu@email.com');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent(emailInput, 'blur');

    await waitFor(() => {
      expect(getByText('Email inválido')).toBeTruthy();
    });
  });

  it('should show password error on weak password', async () => {
    const { getByPlaceholderText, getByText } = renderRegisterScreen();

    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');
    fireEvent.changeText(passwordInput, 'weak');
    fireEvent(passwordInput, 'blur');

    await waitFor(() => {
      expect(getByText('La contraseña debe tener al menos 8 caracteres')).toBeTruthy();
    });
  });

  it('should show password mismatch error', async () => {
    const { getByPlaceholderText, getByText } = renderRegisterScreen();

    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');
    const confirmPasswordInput = getByPlaceholderText('Repite tu contraseña');

    fireEvent.changeText(passwordInput, 'TestPass123');
    fireEvent.changeText(confirmPasswordInput, 'DifferentPass123');
    fireEvent(confirmPasswordInput, 'blur');

    await waitFor(() => {
      expect(getByText('Las contraseñas no coinciden')).toBeTruthy();
    });
  });

  it('should show password strength indicator', async () => {
    const { getByPlaceholderText, getByText } = renderRegisterScreen();

    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');
    fireEvent.changeText(passwordInput, 'TestPass123!@#');

    await waitFor(() => {
      expect(getByText(/Fuerte|Muy fuerte/)).toBeTruthy();
    });
  });

  it('should disable submit button when form is invalid', () => {
    const { getByTestId } = renderRegisterScreen();

    // Button should be disabled when form is empty/invalid
    const submitButton = getByTestId('register-submit-button');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when form is valid', async () => {
    const { getByPlaceholderText, getByTestId } = renderRegisterScreen();

    const nameInput = getByPlaceholderText('Tu nombre');
    const emailInput = getByPlaceholderText('tu@email.com');
    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');
    const confirmPasswordInput = getByPlaceholderText('Repite tu contraseña');

    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'TestPass123');
    fireEvent.changeText(confirmPasswordInput, 'TestPass123');

    await waitFor(() => {
      const submitButton = getByTestId('register-submit-button');
      expect(submitButton).toBeEnabled();
    });
  });

  it('should show link to login', () => {
    const { getByText } = renderRegisterScreen();

    expect(getByText('¿Ya tienes cuenta? Inicia sesión')).toBeTruthy();
  });

  it('should validate all fields in real-time after blur', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderRegisterScreen();

    const nameInput = getByPlaceholderText('Tu nombre');
    const emailInput = getByPlaceholderText('tu@email.com');
    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');

    // Invalid inputs
    fireEvent.changeText(nameInput, 'A');
    fireEvent(nameInput, 'blur');
    fireEvent.changeText(emailInput, 'invalid');
    fireEvent(emailInput, 'blur');
    fireEvent.changeText(passwordInput, 'weak');
    fireEvent(passwordInput, 'blur');

    await waitFor(() => {
      expect(getByText('El nombre debe tener al menos 2 caracteres')).toBeTruthy();
      expect(getByText('Email inválido')).toBeTruthy();
      expect(getByText('La contraseña debe tener al menos 8 caracteres')).toBeTruthy();
    });

    // Fix inputs
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'TestPass123');

    await waitFor(() => {
      expect(queryByText('El nombre debe tener al menos 2 caracteres')).toBeNull();
      expect(queryByText('Email inválido')).toBeNull();
      expect(queryByText('La contraseña debe tener al menos 8 caracteres')).toBeNull();
    });
  });

  it('should not show password strength if password has errors', async () => {
    const { getByPlaceholderText, queryByText } = renderRegisterScreen();

    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');
    fireEvent.changeText(passwordInput, 'weak');
    fireEvent(passwordInput, 'blur');

    await waitFor(() => {
      expect(queryByText(/Muy débil|Débil|Aceptable|Fuerte|Muy fuerte/)).toBeNull();
    });
  });
});
