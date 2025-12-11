import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginScreen from '../login';
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
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

describe('LoginScreen', () => {
  const renderLoginScreen = () => {
    return render(
      <Provider store={mockStore}>
        <LoginScreen />
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    const { getByPlaceholderText, getByText } = renderLoginScreen();

    expect(getByText('Bienvenido de vuelta')).toBeTruthy();
    expect(getByText('Continúa tu viaje de aprendizaje')).toBeTruthy();
    expect(getByPlaceholderText('tu@email.com')).toBeTruthy();
    expect(getByPlaceholderText('Tu contraseña')).toBeTruthy();
    expect(getByText('Iniciar Sesión')).toBeTruthy();
  });

  it('should show email error on invalid email', async () => {
    const { getByPlaceholderText, getByText } = renderLoginScreen();

    const emailInput = getByPlaceholderText('tu@email.com');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent(emailInput, 'blur');

    await waitFor(() => {
      expect(getByText('Email inválido')).toBeTruthy();
    });
  });

  it('should show password error when empty', async () => {
    const { getByPlaceholderText, getByText } = renderLoginScreen();

    const emailInput = getByPlaceholderText('tu@email.com');
    const passwordInput = getByPlaceholderText('Tu contraseña');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent(passwordInput, 'blur');

    await waitFor(() => {
      expect(getByText('La contraseña es requerida')).toBeTruthy();
    });
  });

  it('should disable submit button when form is invalid', () => {
    const { getByText } = renderLoginScreen();

    const submitButton = getByText('Iniciar Sesión').parent;
    expect(submitButton?.props.accessibilityState?.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', async () => {
    const { getByPlaceholderText, getByText } = renderLoginScreen();

    const emailInput = getByPlaceholderText('tu@email.com');
    const passwordInput = getByPlaceholderText('Tu contraseña');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'TestPass123');

    await waitFor(() => {
      const submitButton = getByText('Iniciar Sesión').parent;
      expect(submitButton?.props.accessibilityState?.disabled).toBe(false);
    });
  });

  it('should show link to register', () => {
    const { getByText } = renderLoginScreen();

    expect(getByText('¿No tienes cuenta? Regístrate')).toBeTruthy();
  });

  it('should validate email in real-time after first blur', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderLoginScreen();

    const emailInput = getByPlaceholderText('tu@email.com');

    // Type invalid email and blur
    fireEvent.changeText(emailInput, 'invalid');
    fireEvent(emailInput, 'blur');

    await waitFor(() => {
      expect(getByText('Email inválido')).toBeTruthy();
    });

    // Fix email without blur
    fireEvent.changeText(emailInput, 'test@example.com');

    await waitFor(() => {
      expect(queryByText('Email inválido')).toBeNull();
    });
  });
});
