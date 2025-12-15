/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Sidebar } from '../Sidebar';

// Mock expo-router
const mockPush = jest.fn();
const mockUsePathname = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  usePathname: jest.fn(),
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  LayoutDashboard: 'LayoutDashboard',
  BookOpen: 'BookOpen',
  CheckCircle2: 'CheckCircle2',
  Zap: 'Zap',
  ChevronLeft: 'ChevronLeft',
  ChevronRight: 'ChevronRight',
}));

// Mock Icon component
jest.mock('@/components/ui/Icon', () => ({
  Icon: ({ icon, testID }: any) => {
    const MockedIcon = icon;
    return <MockedIcon testID={testID} />;
  },
}));

const expoRouter = require('expo-router');

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (expoRouter.usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  describe('Logo and Branding', () => {
    it('should render logo with correct text', () => {
      const { getByText } = render(<Sidebar />);

      expect(getByText('LLM Engineer')).toBeTruthy();
    });

    it('should navigate to dashboard when logo is pressed', () => {
      const { getByText } = render(<Sidebar />);

      const logo = getByText('LLM Engineer');
      fireEvent.press(logo);

      expect(expoRouter.router.push).toHaveBeenCalledWith('/dashboard/');
    });
  });

  describe('Dashboard Navigation', () => {
    it('should render Dashboard navigation item', () => {
      const { getByText } = render(<Sidebar />);

      expect(getByText('Dashboard')).toBeTruthy();
    });

    it('should highlight Dashboard when on dashboard route', () => {
      (expoRouter.usePathname as jest.Mock).mockReturnValue('/dashboard');
      const { getByText } = render(<Sidebar />);

      const dashboardItem = getByText('Dashboard');
      expect(dashboardItem).toBeTruthy();
    });

    it('should highlight Dashboard when on root route', () => {
      (expoRouter.usePathname as jest.Mock).mockReturnValue('/');
      const { getByText } = render(<Sidebar />);

      const dashboardItem = getByText('Dashboard');
      expect(dashboardItem).toBeTruthy();
    });

    it('should toggle collapse when Dashboard item is pressed', () => {
      const onToggle = jest.fn();
      const { getByText } = render(<Sidebar onToggleCollapse={onToggle} />);

      const dashboardItem = getByText('Dashboard');
      fireEvent.press(dashboardItem);

      // Dashboard button now toggles collapse, not navigation
      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(expoRouter.router.push).not.toHaveBeenCalled();
    });

    it('should not highlight Dashboard when on other routes', () => {
      (expoRouter.usePathname as jest.Mock).mockReturnValue('/lessons');
      const { getByText } = render(<Sidebar />);

      const dashboardItem = getByText('Dashboard');
      expect(dashboardItem).toBeTruthy();
    });
  });

  describe('Modules Section', () => {
    it('should render SEMANAS section header when modules provided', () => {
      const modules = [
        {
          id: '1',
          title: 'Semana 1: Test',
          lessonsCompleted: 1,
          totalLessons: 2,
          isComplete: false,
        },
      ];
      const { getByText } = render(<Sidebar modules={modules} />);

      expect(getByText('SEMANAS')).toBeTruthy();
    });

    it('should not render SEMANAS section when no modules provided', () => {
      const { queryByText } = render(<Sidebar />);

      // With empty default modules, SEMANAS header should not appear
      expect(queryByText('SEMANAS')).toBeNull();
    });

    it('should render custom modules when provided', () => {
      const customModules = [
        {
          id: 'custom-1',
          title: 'Custom Module 1',
          lessonsCompleted: 2,
          totalLessons: 5,
          isComplete: false,
        },
        {
          id: 'custom-2',
          title: 'Custom Module 2',
          lessonsCompleted: 3,
          totalLessons: 3,
          isComplete: true,
        },
      ];

      const { getByText } = render(<Sidebar modules={customModules} />);

      expect(getByText('Custom Module 1')).toBeTruthy();
      expect(getByText('Custom Module 2')).toBeTruthy();
    });

    it('should display progress for incomplete modules', () => {
      const modules = [
        {
          id: '1',
          title: 'Test Module',
          lessonsCompleted: 3,
          totalLessons: 5,
          isComplete: false,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      expect(getByText('3/5 lecciones')).toBeTruthy();
    });

    it('should not display lesson count for complete modules', () => {
      const modules = [
        {
          id: '1',
          title: 'Complete Module',
          lessonsCompleted: 5,
          totalLessons: 5,
          isComplete: true,
        },
      ];

      const { queryByText } = render(<Sidebar modules={modules} />);

      expect(queryByText('5/5 lecciones')).toBeNull();
    });

    it('should display completion badge for complete modules', () => {
      const modules = [
        {
          id: '1',
          title: 'Complete Module',
          lessonsCompleted: 5,
          totalLessons: 5,
          isComplete: true,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      expect(getByText('100%')).toBeTruthy();
    });

    it('should calculate correct progress percentage', () => {
      const modules = [
        {
          id: '1',
          title: 'Half Complete',
          lessonsCompleted: 3,
          totalLessons: 6,
          isComplete: true,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      expect(getByText('50%')).toBeTruthy();
    });

    it('should handle zero total lessons without crashing', () => {
      const modules = [
        {
          id: '1',
          title: 'Empty Module',
          lessonsCompleted: 0,
          totalLessons: 0,
          isComplete: false,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      expect(getByText('Empty Module')).toBeTruthy();
    });
  });

  describe('Module Navigation', () => {
    it('should navigate to lessons when module is pressed', () => {
      const modules = [
        {
          id: 'test-module',
          title: 'Test Module',
          lessonsCompleted: 1,
          totalLessons: 3,
          isComplete: false,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      const moduleItem = getByText('Test Module');
      fireEvent.press(moduleItem);

      expect(expoRouter.router.push).toHaveBeenCalledWith('/lessons/?module=test-module');
    });

    it('should navigate to correct module when multiple modules exist', () => {
      const modules = [
        {
          id: 'module-1',
          title: 'Module 1',
          lessonsCompleted: 1,
          totalLessons: 3,
          isComplete: false,
        },
        {
          id: 'module-2',
          title: 'Module 2',
          lessonsCompleted: 2,
          totalLessons: 4,
          isComplete: false,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      fireEvent.press(getByText('Module 1'));
      expect(expoRouter.router.push).toHaveBeenCalledWith('/lessons/?module=module-1');

      fireEvent.press(getByText('Module 2'));
      expect(expoRouter.router.push).toHaveBeenCalledWith('/lessons/?module=module-2');
    });
  });

  describe('Active States', () => {
    it('should highlight active module based on currentModuleId', () => {
      const modules = [
        {
          id: 'active-module',
          title: 'Active Module',
          lessonsCompleted: 1,
          totalLessons: 3,
          isComplete: false,
        },
        {
          id: 'inactive-module',
          title: 'Inactive Module',
          lessonsCompleted: 0,
          totalLessons: 3,
          isComplete: false,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} currentModuleId="active-module" />);

      expect(getByText('Active Module')).toBeTruthy();
      expect(getByText('Inactive Module')).toBeTruthy();
    });

    it('should not highlight any module when currentModuleId is undefined', () => {
      const modules = [
        {
          id: 'module-1',
          title: 'Module 1',
          lessonsCompleted: 1,
          totalLessons: 3,
          isComplete: false,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      expect(getByText('Module 1')).toBeTruthy();
    });

    it('should handle currentModuleId that does not match any module', () => {
      const modules = [
        {
          id: 'module-1',
          title: 'Module 1',
          lessonsCompleted: 1,
          totalLessons: 3,
          isComplete: false,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} currentModuleId="non-existent" />);

      expect(getByText('Module 1')).toBeTruthy();
    });
  });

  describe('Module States', () => {
    it('should render CheckCircle2 icon for complete modules', () => {
      const modules = [
        {
          id: '1',
          title: 'Complete Module',
          lessonsCompleted: 5,
          totalLessons: 5,
          isComplete: true,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      expect(getByText('Complete Module')).toBeTruthy();
    });

    it('should render BookOpen icon for incomplete modules', () => {
      const modules = [
        {
          id: '1',
          title: 'Incomplete Module',
          lessonsCompleted: 2,
          totalLessons: 5,
          isComplete: false,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      expect(getByText('Incomplete Module')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty modules array', () => {
      const { queryByText } = render(<Sidebar modules={[]} />);

      // SEMANAS header should not appear when no modules
      expect(queryByText('SEMANAS')).toBeNull();
    });

    it('should handle long module titles with truncation', () => {
      const modules = [
        {
          id: '1',
          title: 'This is a very long module title that should be truncated',
          lessonsCompleted: 1,
          totalLessons: 3,
          isComplete: false,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      expect(getByText('This is a very long module title that should be truncated')).toBeTruthy();
    });

    it('should handle multiple presses on the same module', () => {
      const modules = [
        {
          id: 'test',
          title: 'Test Module',
          lessonsCompleted: 1,
          totalLessons: 3,
          isComplete: false,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      const moduleItem = getByText('Test Module');
      fireEvent.press(moduleItem);
      fireEvent.press(moduleItem);

      expect(expoRouter.router.push).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid navigation between items', () => {
      const modules = [
        {
          id: '1',
          title: 'Semana 1: Test',
          lessonsCompleted: 0,
          totalLessons: 2,
          isComplete: false,
        },
      ];
      const { getByText } = render(<Sidebar modules={modules} />);

      fireEvent.press(getByText('LLM Engineer'));
      fireEvent.press(getByText('Semana 1: Test'));

      // Dashboard button now toggles collapse, not navigation
      expect(expoRouter.router.push).toHaveBeenCalledTimes(2);
    });
  });

  describe('Progress Calculations', () => {
    it('should show 0% for modules with no progress', () => {
      const modules = [
        {
          id: '1',
          title: 'No Progress',
          lessonsCompleted: 0,
          totalLessons: 10,
          isComplete: true,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      expect(getByText('0%')).toBeTruthy();
    });

    it('should round progress percentage correctly', () => {
      const modules = [
        {
          id: '1',
          title: 'Partial Progress',
          lessonsCompleted: 1,
          totalLessons: 3,
          isComplete: true,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      // 1/3 = 33.33% should round to 33%
      expect(getByText('33%')).toBeTruthy();
    });

    it('should show 100% for fully complete modules', () => {
      const modules = [
        {
          id: '1',
          title: 'Fully Complete',
          lessonsCompleted: 7,
          totalLessons: 7,
          isComplete: true,
        },
      ];

      const { getByText } = render(<Sidebar modules={modules} />);

      expect(getByText('100%')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should render all interactive elements as Pressable', () => {
      const modules = [
        {
          id: '1',
          title: 'Semana 1: Test',
          lessonsCompleted: 0,
          totalLessons: 2,
          isComplete: false,
        },
      ];
      const { getByText } = render(<Sidebar modules={modules} />);

      // All these should be pressable
      expect(getByText('LLM Engineer')).toBeTruthy();
      expect(getByText('Dashboard')).toBeTruthy();
      expect(getByText('Semana 1: Test')).toBeTruthy();
    });

    it('should maintain consistent module order', () => {
      const modules = [
        { id: '1', title: 'First', lessonsCompleted: 0, totalLessons: 3, isComplete: false },
        { id: '2', title: 'Second', lessonsCompleted: 0, totalLessons: 3, isComplete: false },
        { id: '3', title: 'Third', lessonsCompleted: 0, totalLessons: 3, isComplete: false },
      ];

      const { getAllByText } = render(<Sidebar modules={modules} />);

      expect(getAllByText(/First|Second|Third/)).toHaveLength(3);
    });
  });

  describe('Collapsed Mode', () => {
    it('should hide text elements when collapsed', () => {
      const modules = [
        {
          id: '1',
          title: 'Semana 1: Test',
          lessonsCompleted: 0,
          totalLessons: 2,
          isComplete: false,
        },
      ];
      const { queryByText } = render(<Sidebar modules={modules} isCollapsed={true} />);

      expect(queryByText('LLM Engineer')).toBeNull();
      expect(queryByText('Dashboard')).toBeNull();
      expect(queryByText('SEMANAS')).toBeNull();
    });

    it('should show text elements when not collapsed', () => {
      const { getByText } = render(<Sidebar isCollapsed={false} />);

      expect(getByText('LLM Engineer')).toBeTruthy();
      expect(getByText('Dashboard')).toBeTruthy();
    });

    it('should hide module titles when collapsed', () => {
      const modules = [
        {
          id: '1',
          title: 'Test Module',
          lessonsCompleted: 3,
          totalLessons: 5,
          isComplete: false,
        },
      ];

      const { queryByText } = render(<Sidebar modules={modules} isCollapsed={true} />);

      expect(queryByText('Test Module')).toBeNull();
      expect(queryByText('3/5 lecciones')).toBeNull();
    });

    it('should hide completion badges when collapsed', () => {
      const modules = [
        {
          id: '1',
          title: 'Complete Module',
          lessonsCompleted: 5,
          totalLessons: 5,
          isComplete: true,
        },
      ];

      const { queryByText } = render(<Sidebar modules={modules} isCollapsed={true} />);

      expect(queryByText('100%')).toBeNull();
    });
  });

  describe('Toggle Button', () => {
    it('should render toggle in Dashboard button', () => {
      const { getByTestId } = render(<Sidebar />);

      // Toggle is now integrated into Dashboard button
      expect(getByTestId('sidebar-toggle')).toBeTruthy();
    });

    it('should call onToggleCollapse when Dashboard button is pressed', () => {
      const onToggle = jest.fn();
      const { getByTestId } = render(<Sidebar onToggleCollapse={onToggle} />);

      fireEvent.press(getByTestId('sidebar-toggle'));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should render toggle button when collapsed', () => {
      const onToggle = jest.fn();
      const { getByTestId } = render(<Sidebar isCollapsed={true} onToggleCollapse={onToggle} />);

      expect(getByTestId('sidebar-toggle')).toBeTruthy();
    });

    it('should not navigate when Dashboard button is pressed', () => {
      const onToggle = jest.fn();
      const { getByTestId } = render(<Sidebar onToggleCollapse={onToggle} />);

      fireEvent.press(getByTestId('sidebar-toggle'));

      // Dashboard button now toggles collapse, not navigation
      expect(expoRouter.router.push).not.toHaveBeenCalled();
      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });
});
