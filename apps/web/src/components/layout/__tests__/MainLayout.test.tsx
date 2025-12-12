import React from 'react';
import { render } from '@testing-library/react-native';
import { Platform, Text } from 'react-native';
import { MainLayout } from '../MainLayout';

// Mock Sidebar component
jest.mock('../Sidebar', () => ({
  Sidebar: ({ currentModuleId }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text testID="sidebar">Sidebar-{currentModuleId || 'none'}</Text>;
  },
}));

// Mock Navbar component
jest.mock('../Navbar', () => ({
  Navbar: (props: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return (
      <Text testID="navbar">
        Navbar-{props.title || 'no-title'}-{props.totalXp || 0}
      </Text>
    );
  },
}));

describe('MainLayout', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset Platform.OS after each test
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatform,
      writable: true,
    });
  });

  describe('Children Rendering', () => {
    it('should render children content on web', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { getByText } = render(
        <MainLayout>
          <Text>Test Content</Text>
        </MainLayout>
      );

      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should render children content on mobile', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });

      const { getByText } = render(
        <MainLayout>
          <Text>Mobile Content</Text>
        </MainLayout>
      );

      expect(getByText('Mobile Content')).toBeTruthy();
    });

    it('should render multiple children', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { getByText } = render(
        <MainLayout>
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </MainLayout>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });

    it('should render complex children components', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const ComplexComponent = () => (
        <>
          <Text>Header</Text>
          <Text>Body</Text>
          <Text>Footer</Text>
        </>
      );

      const { getByText } = render(
        <MainLayout>
          <ComplexComponent />
        </MainLayout>
      );

      expect(getByText('Header')).toBeTruthy();
      expect(getByText('Body')).toBeTruthy();
      expect(getByText('Footer')).toBeTruthy();
    });
  });

  describe('Web Layout', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });
    });

    it('should render Sidebar on web platform', () => {
      const { getByTestId } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('sidebar')).toBeTruthy();
    });

    it('should render Navbar on web platform', () => {
      const { getByTestId } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should pass currentModuleId to Sidebar', () => {
      const { getByText } = render(
        <MainLayout currentModuleId="module-123">
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByText('Sidebar-module-123')).toBeTruthy();
    });

    it('should render Sidebar without currentModuleId', () => {
      const { getByText } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByText('Sidebar-none')).toBeTruthy();
    });
  });

  describe('Mobile Layout', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
    });

    it('should not render Sidebar on mobile', () => {
      const { queryByTestId } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(queryByTestId('sidebar')).toBeNull();
    });

    it('should render Navbar on mobile', () => {
      const { getByTestId } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should work on Android platform', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        writable: true,
      });

      const { queryByTestId, getByTestId, getByText } = render(
        <MainLayout>
          <Text>Android Content</Text>
        </MainLayout>
      );

      expect(queryByTestId('sidebar')).toBeNull();
      expect(getByTestId('navbar')).toBeTruthy();
      expect(getByText('Android Content')).toBeTruthy();
    });
  });

  describe('Navbar Props', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });
    });

    it('should pass title to Navbar', () => {
      const { getByText } = render(
        <MainLayout title="Dashboard">
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByText(/Navbar-Dashboard/)).toBeTruthy();
    });

    it('should pass subtitle to Navbar', () => {
      const { getByTestId } = render(
        <MainLayout title="Test" subtitle="Subtitle">
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should pass showBack to Navbar', () => {
      const { getByTestId } = render(
        <MainLayout showBack>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should pass backLabel to Navbar', () => {
      const { getByTestId } = render(
        <MainLayout showBack backLabel="Go Back">
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should pass totalXp to Navbar', () => {
      const { getByText } = render(
        <MainLayout totalXp={5000}>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByText(/5000/)).toBeTruthy();
    });

    it('should pass level to Navbar', () => {
      const { getByTestId } = render(
        <MainLayout level={10}>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should pass levelTitle to Navbar', () => {
      const { getByTestId } = render(
        <MainLayout levelTitle="Expert">
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should pass xpForNextLevel to Navbar', () => {
      const { getByTestId } = render(
        <MainLayout xpForNextLevel={1000}>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should pass onLogout to Navbar', () => {
      const mockOnLogout = jest.fn();
      const { getByTestId } = render(
        <MainLayout onLogout={mockOnLogout}>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should pass all props to Navbar', () => {
      const mockOnLogout = jest.fn();
      const { getByTestId, getByText } = render(
        <MainLayout
          title="Dashboard"
          subtitle="Welcome"
          showBack
          backLabel="Back"
          totalXp={2500}
          level={5}
          levelTitle="Advanced"
          xpForNextLevel={500}
          onLogout={mockOnLogout}
        >
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
      expect(getByText(/Dashboard/)).toBeTruthy();
      expect(getByText(/2500/)).toBeTruthy();
    });
  });

  describe('Default Props', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });
    });

    it('should use default showBack value (false)', () => {
      const { getByTestId } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should use default totalXp value (0)', () => {
      const { getByText } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByText(/0/)).toBeTruthy();
    });

    it('should use default level value (1)', () => {
      const { getByTestId } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should use default levelTitle value (Novato)', () => {
      const { getByTestId } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should use default xpForNextLevel value (16)', () => {
      const { getByTestId } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    it('should render with web layout structure', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { getByTestId, getByText } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('sidebar')).toBeTruthy();
      expect(getByTestId('navbar')).toBeTruthy();
      expect(getByText('Content')).toBeTruthy();
    });

    it('should render with mobile layout structure', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });

      const { queryByTestId, getByTestId, getByText } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(queryByTestId('sidebar')).toBeNull();
      expect(getByTestId('navbar')).toBeTruthy();
      expect(getByText('Content')).toBeTruthy();
    });

    it('should maintain layout with multiple content items on web', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { getByTestId, getByText } = render(
        <MainLayout>
          <Text>Item 1</Text>
          <Text>Item 2</Text>
          <Text>Item 3</Text>
        </MainLayout>
      );

      expect(getByTestId('sidebar')).toBeTruthy();
      expect(getByTestId('navbar')).toBeTruthy();
      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 2')).toBeTruthy();
      expect(getByText('Item 3')).toBeTruthy();
    });

    it('should maintain layout with multiple content items on mobile', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });

      const { getByText } = render(
        <MainLayout>
          <Text>Item 1</Text>
          <Text>Item 2</Text>
          <Text>Item 3</Text>
        </MainLayout>
      );

      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 2')).toBeTruthy();
      expect(getByText('Item 3')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { getByTestId } = render(<MainLayout>{null}</MainLayout>);

      expect(getByTestId('sidebar')).toBeTruthy();
      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should handle undefined children', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { getByTestId } = render(<MainLayout>{undefined}</MainLayout>);

      expect(getByTestId('sidebar')).toBeTruthy();
      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should handle false children', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { getByTestId } = render(<MainLayout>{false}</MainLayout>);

      expect(getByTestId('sidebar')).toBeTruthy();
      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should handle conditional children', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const showContent = true;
      const { getByText } = render(
        <MainLayout>{showContent && <Text>Conditional Content</Text>}</MainLayout>
      );

      expect(getByText('Conditional Content')).toBeTruthy();
    });

    it('should render with very long title', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const longTitle = 'This is a very long title that should not break the layout';
      const { getByText } = render(
        <MainLayout title={longTitle}>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByText(new RegExp(longTitle))).toBeTruthy();
    });

    it('should handle extremely large XP values', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { getByText } = render(
        <MainLayout totalXp={999999999}>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByText(/999999999/)).toBeTruthy();
    });

    it('should handle negative XP values', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { getByTestId } = render(
        <MainLayout totalXp={-100}>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('navbar')).toBeTruthy();
    });
  });

  describe('Platform Detection', () => {
    it('should correctly detect web platform', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { getByTestId } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByTestId('sidebar')).toBeTruthy();
    });

    it('should correctly detect iOS platform', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });

      const { queryByTestId, getByTestId } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(queryByTestId('sidebar')).toBeNull();
      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should correctly detect Android platform', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        writable: true,
      });

      const { queryByTestId, getByTestId } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(queryByTestId('sidebar')).toBeNull();
      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should treat unknown platform as non-web', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'unknown' as any,
        writable: true,
      });

      const { queryByTestId } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(queryByTestId('sidebar')).toBeNull();
    });
  });

  describe('CurrentModuleId Prop', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });
    });

    it('should pass currentModuleId to Sidebar', () => {
      const { getByText } = render(
        <MainLayout currentModuleId="active-module">
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByText('Sidebar-active-module')).toBeTruthy();
    });

    it('should handle undefined currentModuleId', () => {
      const { getByText } = render(
        <MainLayout>
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByText('Sidebar-none')).toBeTruthy();
    });

    it('should change currentModuleId dynamically', () => {
      const { getByText, rerender } = render(
        <MainLayout currentModuleId="module-1">
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByText('Sidebar-module-1')).toBeTruthy();

      rerender(
        <MainLayout currentModuleId="module-2">
          <Text>Content</Text>
        </MainLayout>
      );

      expect(getByText('Sidebar-module-2')).toBeTruthy();
    });

    it('should not pass currentModuleId on mobile', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });

      const { queryByTestId } = render(
        <MainLayout currentModuleId="module-1">
          <Text>Content</Text>
        </MainLayout>
      );

      expect(queryByTestId('sidebar')).toBeNull();
    });
  });

  describe('Integration', () => {
    it('should integrate Sidebar and Navbar on web', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { getByTestId, getByText } = render(
        <MainLayout title="Test" totalXp={1000} currentModuleId="test-module">
          <Text>Main Content</Text>
        </MainLayout>
      );

      expect(getByTestId('sidebar')).toBeTruthy();
      expect(getByTestId('navbar')).toBeTruthy();
      expect(getByText('Sidebar-test-module')).toBeTruthy();
      expect(getByText(/Test/)).toBeTruthy();
      expect(getByText(/1000/)).toBeTruthy();
      expect(getByText('Main Content')).toBeTruthy();
    });

    it('should integrate Navbar only on mobile', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });

      const { queryByTestId, getByTestId, getByText } = render(
        <MainLayout title="Mobile Test" totalXp={500}>
          <Text>Mobile Content</Text>
        </MainLayout>
      );

      expect(queryByTestId('sidebar')).toBeNull();
      expect(getByTestId('navbar')).toBeTruthy();
      expect(getByText('Mobile Content')).toBeTruthy();
    });

    it('should handle all props together on web', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const mockOnLogout = jest.fn();
      const { getByTestId, getByText } = render(
        <MainLayout
          title="Full Integration"
          subtitle="Testing all props"
          showBack
          backLabel="Go Back"
          totalXp={5000}
          level={10}
          levelTitle="Master"
          xpForNextLevel={2000}
          currentModuleId="full-test"
          onLogout={mockOnLogout}
        >
          <Text>Integrated Content</Text>
        </MainLayout>
      );

      expect(getByTestId('sidebar')).toBeTruthy();
      expect(getByTestId('navbar')).toBeTruthy();
      expect(getByText('Sidebar-full-test')).toBeTruthy();
      expect(getByText(/Full Integration/)).toBeTruthy();
      expect(getByText(/5000/)).toBeTruthy();
      expect(getByText('Integrated Content')).toBeTruthy();
    });
  });
});
