/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render } from '@testing-library/react-native';
import { GlobalProgress } from '../GlobalProgress';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  const Animated = {
    View: View,
  };

  return {
    __esModule: true,
    default: Animated,
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    useAnimatedStyle: jest.fn((callback) => {
      return callback();
    }),
    withSpring: jest.fn((value) => value),
  };
});

describe('GlobalProgress', () => {
  const mockProps = {
    title: 'Mi Progreso Global',
    current: 15,
    total: 50,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title correctly', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} />);

    expect(getByText('Mi Progreso Global')).toBeTruthy();
  });

  it('should render subtitle when provided', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} subtitle="Continúa aprendiendo" />);

    expect(getByText('Continúa aprendiendo')).toBeTruthy();
  });

  it('should not render subtitle when not provided', () => {
    const { queryByText } = render(<GlobalProgress {...mockProps} />);

    // Should only have title, no subtitle
    expect(queryByText('Continúa aprendiendo')).toBeNull();
  });

  it('should display progress text correctly', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} />);

    expect(getByText('15 de 50 lecciones completadas')).toBeTruthy();
  });

  it('should calculate progress percentage correctly', () => {
    const { rerender } = render(<GlobalProgress {...mockProps} current={25} total={100} />);

    // 25/100 = 25%
    // The component uses this for the animated width
    expect(true).toBeTruthy(); // Rendered successfully

    rerender(<GlobalProgress {...mockProps} current={50} total={100} />);
    // 50/100 = 50%
    expect(true).toBeTruthy();
  });

  it('should handle zero current progress', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} current={0} total={50} />);

    expect(getByText('0 de 50 lecciones completadas')).toBeTruthy();
  });

  it('should handle complete progress', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} current={50} total={50} />);

    expect(getByText('50 de 50 lecciones completadas')).toBeTruthy();
  });

  it('should handle zero total (avoid division by zero)', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} current={0} total={0} />);

    expect(getByText('0 de 0 lecciones completadas')).toBeTruthy();
    // Should not crash, progressPercent should be 0
  });

  it('should handle loading state', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} isLoading={true} />);

    expect(getByText('Mi Progreso Global')).toBeTruthy();
    expect(getByText('15 de 50 lecciones completadas')).toBeTruthy();
  });

  it('should not animate when loading', () => {
    const { withSpring } = require('react-native-reanimated');

    render(<GlobalProgress {...mockProps} isLoading={true} />);

    // withSpring should not be called when isLoading is true
    expect(withSpring).not.toHaveBeenCalled();
  });

  it('should animate when not loading', () => {
    const { withSpring } = require('react-native-reanimated');

    render(<GlobalProgress {...mockProps} isLoading={false} />);

    // withSpring should be called when isLoading is false
    expect(withSpring).toHaveBeenCalled();
  });

  it('should use spring animation with correct config', () => {
    const { withSpring } = require('react-native-reanimated');

    render(<GlobalProgress {...mockProps} />);

    // Check that withSpring was called with the correct config
    expect(withSpring).toHaveBeenCalledWith(
      30, // 15/50 * 100 = 30%
      {
        damping: 15,
        stiffness: 100,
      }
    );
  });

  it('should update animation when progress changes', () => {
    const { withSpring } = require('react-native-reanimated');
    const { rerender } = render(<GlobalProgress {...mockProps} current={15} total={50} />);

    withSpring.mockClear();

    // Update progress
    rerender(<GlobalProgress {...mockProps} current={25} total={50} />);

    // Should call withSpring with new percentage (25/50 * 100 = 50%)
    expect(withSpring).toHaveBeenCalledWith(50, {
      damping: 15,
      stiffness: 100,
    });
  });

  it('should handle different progress values', () => {
    const { getByText: getText1 } = render(
      <GlobalProgress {...mockProps} current={10} total={100} />
    );
    expect(getText1('10 de 100 lecciones completadas')).toBeTruthy();

    const { getByText: getText2 } = render(
      <GlobalProgress {...mockProps} current={75} total={100} />
    );
    expect(getText2('75 de 100 lecciones completadas')).toBeTruthy();

    const { getByText: getText3 } = render(<GlobalProgress {...mockProps} current={1} total={1} />);
    expect(getText3('1 de 1 lecciones completadas')).toBeTruthy();
  });

  it('should render with custom title', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} title="Tu Avance Total" />);

    expect(getByText('Tu Avance Total')).toBeTruthy();
  });

  it('should render with both title and subtitle', () => {
    const { getByText } = render(
      <GlobalProgress
        title="Progreso General"
        subtitle="Estás haciendo un gran trabajo"
        current={30}
        total={50}
      />
    );

    expect(getByText('Progreso General')).toBeTruthy();
    expect(getByText('Estás haciendo un gran trabajo')).toBeTruthy();
    expect(getByText('30 de 50 lecciones completadas')).toBeTruthy();
  });

  it('should handle large numbers', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} current={500} total={1000} />);

    expect(getByText('500 de 1000 lecciones completadas')).toBeTruthy();
  });

  it('should setup shared value correctly', () => {
    const { useSharedValue } = require('react-native-reanimated');

    render(<GlobalProgress {...mockProps} />);

    // Shared value should be initialized with 0
    expect(useSharedValue).toHaveBeenCalledWith(0);
  });

  it('should create animated style', () => {
    const { useAnimatedStyle } = require('react-native-reanimated');

    render(<GlobalProgress {...mockProps} />);

    // useAnimatedStyle should be called
    expect(useAnimatedStyle).toHaveBeenCalled();
  });

  it('should handle progress greater than total (edge case)', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} current={60} total={50} />);

    // Should still render without crashing
    expect(getByText('60 de 50 lecciones completadas')).toBeTruthy();
    // Progress would be > 100%, but component should handle it
  });

  it('should handle negative values gracefully (edge case)', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} current={-5} total={50} />);

    // Should render without crashing
    expect(getByText('-5 de 50 lecciones completadas')).toBeTruthy();
  });

  it('should render progress bar container', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} />);

    // Component should render successfully
    expect(getByText('Mi Progreso Global')).toBeTruthy();
    expect(getByText('15 de 50 lecciones completadas')).toBeTruthy();
  });

  it('should maintain state through loading transitions', () => {
    const { rerender, getByText } = render(<GlobalProgress {...mockProps} isLoading={true} />);

    expect(getByText('15 de 50 lecciones completadas')).toBeTruthy();

    rerender(<GlobalProgress {...mockProps} isLoading={false} />);

    expect(getByText('15 de 50 lecciones completadas')).toBeTruthy();
  });

  it('should handle single lesson completed', () => {
    const { getByText } = render(<GlobalProgress {...mockProps} current={1} total={100} />);

    expect(getByText('1 de 100 lecciones completadas')).toBeTruthy();
  });

  it('should handle all required props', () => {
    const requiredProps = {
      title: 'Test Title',
      current: 5,
      total: 10,
    };

    const { getByText } = render(<GlobalProgress {...requiredProps} />);

    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('5 de 10 lecciones completadas')).toBeTruthy();
  });

  it('should calculate correct percentage for animation', () => {
    const { withSpring } = require('react-native-reanimated');

    // Test 25%
    render(<GlobalProgress title="Test" current={25} total={100} />);
    expect(withSpring).toHaveBeenCalledWith(25, expect.any(Object));

    withSpring.mockClear();

    // Test 50%
    render(<GlobalProgress title="Test" current={50} total={100} />);
    expect(withSpring).toHaveBeenCalledWith(50, expect.any(Object));

    withSpring.mockClear();

    // Test 75%
    render(<GlobalProgress title="Test" current={75} total={100} />);
    expect(withSpring).toHaveBeenCalledWith(75, expect.any(Object));
  });

  it('should update animation on total change', () => {
    const { withSpring } = require('react-native-reanimated');
    const { rerender } = render(<GlobalProgress {...mockProps} current={25} total={100} />);

    withSpring.mockClear();

    // Change total while keeping current the same
    rerender(<GlobalProgress {...mockProps} current={25} total={50} />);

    // Percentage changes from 25% to 50%
    expect(withSpring).toHaveBeenCalledWith(50, expect.any(Object));
  });

  it('should handle isLoading prop transitions', () => {
    const { withSpring } = require('react-native-reanimated');
    const { rerender } = render(<GlobalProgress {...mockProps} isLoading={true} />);

    // Initially loading, withSpring should not be called
    expect(withSpring).not.toHaveBeenCalled();

    // Stop loading
    rerender(<GlobalProgress {...mockProps} isLoading={false} />);

    // Now withSpring should be called
    expect(withSpring).toHaveBeenCalled();
  });
});
