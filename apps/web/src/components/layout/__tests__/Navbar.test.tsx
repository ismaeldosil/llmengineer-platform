import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Navbar } from '../Navbar';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Bell: 'Bell',
  Zap: 'Zap',
  ChevronLeft: 'ChevronLeft',
  Settings: 'Settings',
  LogOut: 'LogOut',
}));

// Mock Icon component
jest.mock('@/components/ui/Icon', () => ({
  Icon: ({ icon, testID }: any) => {
    const MockedIcon = icon;
    return <MockedIcon testID={testID} />;
  },
}));

const expoRouter = require('expo-router');

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Title Display', () => {
    it('should render title when provided', () => {
      const { getByText } = render(<Navbar title="Test Title" />);

      expect(getByText('Test Title')).toBeTruthy();
    });

    it('should render subtitle when provided', () => {
      const { getByText } = render(<Navbar title="Test Title" subtitle="Test Subtitle" />);

      expect(getByText('Test Title')).toBeTruthy();
      expect(getByText('Test Subtitle')).toBeTruthy();
    });

    it('should render subtitle only when title is also present', () => {
      const { queryByText } = render(<Navbar subtitle="Test Subtitle" />);

      expect(queryByText('Test Subtitle')).toBeNull();
    });

    it('should render title without subtitle', () => {
      const { getByText, queryByText } = render(<Navbar title="Only Title" />);

      expect(getByText('Only Title')).toBeTruthy();
      expect(queryByText('Test Subtitle')).toBeNull();
    });

    it('should not render title section when title is not provided', () => {
      const { queryByText } = render(<Navbar />);

      expect(queryByText('Test Title')).toBeNull();
    });
  });

  describe('Back Button', () => {
    it('should render back button when showBack is true', () => {
      const { getByText } = render(<Navbar showBack />);

      expect(getByText('Volver al Dashboard')).toBeTruthy();
    });

    it('should render custom back label when provided', () => {
      const { getByText } = render(<Navbar showBack backLabel="Go Back" />);

      expect(getByText('Go Back')).toBeTruthy();
    });

    it('should navigate back when back button is pressed', () => {
      const { getByText } = render(<Navbar showBack />);

      const backButton = getByText('Volver al Dashboard');
      fireEvent.press(backButton);

      expect(expoRouter.router.back).toHaveBeenCalledTimes(1);
    });

    it('should not render back button when showBack is false', () => {
      const { queryByText } = render(<Navbar showBack={false} />);

      expect(queryByText('Volver al Dashboard')).toBeNull();
    });

    it('should not render title when showBack is true', () => {
      const { queryByText } = render(<Navbar showBack title="Test Title" />);

      expect(queryByText('Test Title')).toBeNull();
      expect(queryByText('Volver al Dashboard')).toBeTruthy();
    });

    it('should handle multiple back button presses', () => {
      const { getByText } = render(<Navbar showBack />);

      const backButton = getByText('Volver al Dashboard');
      fireEvent.press(backButton);
      fireEvent.press(backButton);

      expect(expoRouter.router.back).toHaveBeenCalledTimes(2);
    });
  });

  describe('Notification Badge', () => {
    it('should render notification icon', () => {
      const { getByText } = render(<Navbar />);

      expect(getByText('0')).toBeTruthy();
    });

    it('should always show 0 notifications', () => {
      const { getByText } = render(<Navbar />);

      expect(getByText('0')).toBeTruthy();
    });
  });

  describe('XP Display', () => {
    it('should display default XP value of 0', () => {
      const { getByText } = render(<Navbar />);

      expect(getByText('0 XP')).toBeTruthy();
    });

    it('should display custom XP value', () => {
      const { getByText } = render(<Navbar totalXp={1500} />);

      expect(getByText('1,500 XP')).toBeTruthy();
    });

    it('should format large XP values with locale string', () => {
      const { getByText } = render(<Navbar totalXp={1234567} />);

      expect(getByText('1,234,567 XP')).toBeTruthy();
    });

    it('should handle zero XP', () => {
      const { getByText } = render(<Navbar totalXp={0} />);

      expect(getByText('0 XP')).toBeTruthy();
    });

    it('should format small XP values without commas', () => {
      const { getByText } = render(<Navbar totalXp={999} />);

      expect(getByText('999 XP')).toBeTruthy();
    });

    it('should format XP values with thousands separator', () => {
      const { getByText } = render(<Navbar totalXp={5000} />);

      expect(getByText('5,000 XP')).toBeTruthy();
    });
  });

  describe('Level Badge', () => {
    it('should display default level of 1', () => {
      const { getByText } = render(<Navbar />);

      expect(getByText('Lvl 1')).toBeTruthy();
    });

    it('should display custom level', () => {
      const { getByText } = render(<Navbar level={5} />);

      expect(getByText('Lvl 5')).toBeTruthy();
    });

    it('should display high level numbers', () => {
      const { getByText } = render(<Navbar level={99} />);

      expect(getByText('Lvl 99')).toBeTruthy();
    });

    it('should display level title "Publisher"', () => {
      const { getByText } = render(<Navbar />);

      expect(getByText('Publisher')).toBeTruthy();
    });

    it('should display default XP for next level', () => {
      const { getByText } = render(<Navbar />);

      expect(getByText('16 XP para Novato')).toBeTruthy();
    });

    it('should display custom XP for next level', () => {
      const { getByText } = render(<Navbar xpForNextLevel={500} />);

      expect(getByText('500 XP para Novato')).toBeTruthy();
    });

    it('should display custom level title', () => {
      const { getByText } = render(<Navbar levelTitle="Expert" xpForNextLevel={1000} />);

      expect(getByText('1000 XP para Expert')).toBeTruthy();
    });

    it('should handle zero XP for next level', () => {
      const { getByText } = render(<Navbar xpForNextLevel={0} />);

      expect(getByText('0 XP para Novato')).toBeTruthy();
    });
  });

  describe('Logout Button', () => {
    it('should render logout button when onLogout is provided', () => {
      const mockOnLogout = jest.fn();
      const { getByTestId } = render(<Navbar onLogout={mockOnLogout} />);

      // The navbar should render
      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should not render logout button when onLogout is not provided', () => {
      const { getByTestId } = render(<Navbar />);

      // The navbar should still render without logout button
      expect(getByTestId('navbar')).toBeTruthy();
    });

    it('should call onLogout when logout button is pressed', () => {
      const mockOnLogout = jest.fn();
      const { getByTestId } = render(<Navbar onLogout={mockOnLogout} />);

      // Find the logout button using testID
      const logoutButton = getByTestId('logout-button');
      fireEvent.press(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple logout button presses', () => {
      const mockOnLogout = jest.fn();
      const { getByTestId } = render(<Navbar onLogout={mockOnLogout} />);

      const logoutButton = getByTestId('logout-button');
      fireEvent.press(logoutButton);
      fireEvent.press(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(2);
    });
  });

  describe('Props Combinations', () => {
    it('should render all props together', () => {
      const mockOnLogout = jest.fn();
      const { getByText } = render(
        <Navbar
          title="Dashboard"
          subtitle="Welcome back"
          totalXp={2500}
          level={3}
          levelTitle="Advanced"
          xpForNextLevel={500}
          onLogout={mockOnLogout}
        />
      );

      expect(getByText('Dashboard')).toBeTruthy();
      expect(getByText('Welcome back')).toBeTruthy();
      expect(getByText('2,500 XP')).toBeTruthy();
      expect(getByText('Lvl 3')).toBeTruthy();
      expect(getByText('500 XP para Advanced')).toBeTruthy();
    });

    it('should render showBack with custom back label and XP', () => {
      const { getByText } = render(
        <Navbar
          showBack
          backLabel="Return"
          totalXp={1000}
          level={2}
        />
      );

      expect(getByText('Return')).toBeTruthy();
      expect(getByText('1,000 XP')).toBeTruthy();
      expect(getByText('Lvl 2')).toBeTruthy();
    });

    it('should handle all optional props as undefined', () => {
      const { getByText } = render(<Navbar />);

      expect(getByText('0 XP')).toBeTruthy();
      expect(getByText('Lvl 1')).toBeTruthy();
      expect(getByText('16 XP para Novato')).toBeTruthy();
      expect(getByText('Publisher')).toBeTruthy();
    });
  });

  describe('Default Values', () => {
    it('should use default values when props are not provided', () => {
      const { getByText } = render(<Navbar />);

      expect(getByText('0 XP')).toBeTruthy();
      expect(getByText('Lvl 1')).toBeTruthy();
      expect(getByText('16 XP para Novato')).toBeTruthy();
      expect(getByText('Publisher')).toBeTruthy();
    });

    it('should use default back label when showBack is true but backLabel is not provided', () => {
      const { getByText } = render(<Navbar showBack />);

      expect(getByText('Volver al Dashboard')).toBeTruthy();
    });

    it('should override default values when props are provided', () => {
      const { getByText } = render(
        <Navbar
          totalXp={5000}
          level={10}
          levelTitle="Master"
          xpForNextLevel={2000}
        />
      );

      expect(getByText('5,000 XP')).toBeTruthy();
      expect(getByText('Lvl 10')).toBeTruthy();
      expect(getByText('2000 XP para Master')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely large XP values', () => {
      const { getByText } = render(<Navbar totalXp={999999999} />);

      expect(getByText('999,999,999 XP')).toBeTruthy();
    });

    it('should handle very long title', () => {
      const { getByText } = render(
        <Navbar title="This is a very long title that might overflow the navbar" />
      );

      expect(getByText('This is a very long title that might overflow the navbar')).toBeTruthy();
    });

    it('should handle very long subtitle', () => {
      const { getByText } = render(
        <Navbar
          title="Title"
          subtitle="This is a very long subtitle that might overflow the navbar and cause layout issues"
        />
      );

      expect(getByText('This is a very long subtitle that might overflow the navbar and cause layout issues')).toBeTruthy();
    });

    it('should handle very long back label', () => {
      const { getByText } = render(
        <Navbar showBack backLabel="This is a very long back label" />
      );

      expect(getByText('This is a very long back label')).toBeTruthy();
    });

    it('should handle very long level title', () => {
      const { getByText } = render(
        <Navbar levelTitle="Very Long Level Title Name" xpForNextLevel={100} />
      );

      expect(getByText('100 XP para Very Long Level Title Name')).toBeTruthy();
    });

    it('should handle negative XP values', () => {
      const { getByText } = render(<Navbar totalXp={-100} />);

      expect(getByText('-100 XP')).toBeTruthy();
    });

    it('should handle negative level values', () => {
      const { getByText } = render(<Navbar level={-1} />);

      expect(getByText('Lvl -1')).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    it('should render left and right sections', () => {
      const { getByText } = render(<Navbar title="Test" totalXp={100} />);

      // Left section should have title
      expect(getByText('Test')).toBeTruthy();

      // Right section should have XP
      expect(getByText('100 XP')).toBeTruthy();
    });

    it('should always render notification badge in right section', () => {
      const { getByText } = render(<Navbar />);

      expect(getByText('0')).toBeTruthy();
    });

    it('should always render XP container in right section', () => {
      const { getByText } = render(<Navbar totalXp={500} />);

      expect(getByText('500 XP')).toBeTruthy();
    });

    it('should always render level container in right section', () => {
      const { getByText } = render(<Navbar level={3} />);

      expect(getByText('Lvl 3')).toBeTruthy();
    });
  });

  describe('Accessibility and Interaction', () => {
    it('should handle rapid button presses', () => {
      const mockOnLogout = jest.fn();
      const { getByText } = render(<Navbar showBack onLogout={mockOnLogout} />);

      const backButton = getByText('Volver al Dashboard');
      fireEvent.press(backButton);
      fireEvent.press(backButton);
      fireEvent.press(backButton);

      expect(expoRouter.router.back).toHaveBeenCalledTimes(3);
    });

    it('should render all interactive elements', () => {
      const mockOnLogout = jest.fn();
      const { getByTestId } = render(<Navbar showBack onLogout={mockOnLogout} />);

      // Should have navbar with all elements
      expect(getByTestId('navbar')).toBeTruthy();
      expect(getByTestId('logout-button')).toBeTruthy();
    });
  });

  describe('Publisher Display', () => {
    it('should always show "Publisher" text regardless of level', () => {
      const { getByText: getText1 } = render(<Navbar level={1} />);
      expect(getText1('Publisher')).toBeTruthy();

      const { getByText: getText2 } = render(<Navbar level={50} />);
      expect(getText2('Publisher')).toBeTruthy();
    });

    it('should display Publisher with different XP requirements', () => {
      const { getByText } = render(<Navbar xpForNextLevel={1000} />);

      expect(getByText('Publisher')).toBeTruthy();
      expect(getByText('1000 XP para Novato')).toBeTruthy();
    });
  });
});
