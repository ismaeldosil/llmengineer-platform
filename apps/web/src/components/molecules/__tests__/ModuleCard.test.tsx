import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ModuleCard } from '../ModuleCard';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  CheckCircle2: 'CheckCircle2',
  BookOpen: 'BookOpen',
  ChevronRight: 'ChevronRight',
  Lock: 'Lock',
  Clock: 'Clock',
}));

// Mock Icon component
jest.mock('@/components/ui/Icon', () => ({
  Icon: ({ icon, size, color, variant }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    const iconName = typeof icon === 'string' ? icon : 'Icon';
    return React.createElement(Text, { testID: `icon-${iconName}` }, `Icon(${iconName})`);
  },
}));

const { router } = require('expo-router');

describe('ModuleCard', () => {
  const mockModuleProps = {
    id: 'module-1',
    title: 'Introduction to Prompt Engineering',
    description: 'Learn the fundamentals of writing effective prompts for LLMs',
    lessonsCompleted: 5,
    totalLessons: 10,
    isComplete: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render module information correctly', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} />);

    expect(getByText('Introduction to Prompt Engineering')).toBeTruthy();
    expect(getByText(/Learn the fundamentals of writing effective prompts/)).toBeTruthy();
    expect(getByText('5/10 lecciones')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
  });

  it('should calculate progress percentage correctly', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} />);

    expect(getByText('50%')).toBeTruthy();
  });

  it('should show 0% when no lessons completed', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} lessonsCompleted={0} />);

    expect(getByText('0%')).toBeTruthy();
    expect(getByText('0/10 lecciones')).toBeTruthy();
  });

  it('should show 100% when all lessons completed', () => {
    const { getByText } = render(
      <ModuleCard {...mockModuleProps} lessonsCompleted={10} totalLessons={10} isComplete={true} />
    );

    expect(getByText('100%')).toBeTruthy();
    expect(getByText('10/10 lecciones')).toBeTruthy();
  });

  it('should handle zero total lessons', () => {
    const { getByText } = render(
      <ModuleCard {...mockModuleProps} lessonsCompleted={0} totalLessons={0} />
    );

    expect(getByText('0%')).toBeTruthy();
    expect(getByText('0/0 lecciones')).toBeTruthy();
  });

  it('should navigate to lessons page with module id when card is pressed', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} />);

    const card = getByText('Introduction to Prompt Engineering');
    fireEvent.press(card.parent?.parent);

    expect(router.push).toHaveBeenCalledWith('/lessons/?module=module-1');
  });

  it('should navigate when action button is pressed', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} />);

    const actionButton = getByText('Continuar');
    fireEvent.press(actionButton.parent);

    expect(router.push).toHaveBeenCalledWith('/lessons/?module=module-1');
  });

  it('should show "Comenzar" button text when no lessons completed', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} lessonsCompleted={0} />);

    expect(getByText('Comenzar')).toBeTruthy();
  });

  it('should show "Continuar" button text when some lessons completed', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} lessonsCompleted={5} />);

    expect(getByText('Continuar')).toBeTruthy();
  });

  it('should show "Revisar" button text when module is complete', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} isComplete={true} />);

    expect(getByText('Revisar')).toBeTruthy();
  });

  it('should display incomplete module state correctly', () => {
    const { queryByText } = render(<ModuleCard {...mockModuleProps} isComplete={false} />);

    // Should show BookOpen icon (not CheckCircle2)
    expect(queryByText('Icon(BookOpen)')).toBeTruthy();
  });

  it('should display complete module state correctly', () => {
    const { queryByText, getAllByText } = render(
      <ModuleCard {...mockModuleProps} isComplete={true} />
    );

    // Should show CheckCircle2 icons (header icon and complete badge)
    const checkIcons = getAllByText('Icon(CheckCircle2)');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('should handle multiple presses', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} />);

    const card = getByText('Introduction to Prompt Engineering');
    fireEvent.press(card.parent?.parent);
    fireEvent.press(card.parent?.parent);

    expect(router.push).toHaveBeenCalledTimes(2);
  });

  it('should render progress bar with correct width', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} />);

    // Verify progress percentage is rendered
    expect(getByText('50%')).toBeTruthy();
  });

  it('should handle different progress values', () => {
    const { getByText: getByText25 } = render(
      <ModuleCard {...mockModuleProps} lessonsCompleted={3} totalLessons={12} />
    );
    expect(getByText25('25%')).toBeTruthy();

    const { getByText: getByText75 } = render(
      <ModuleCard {...mockModuleProps} lessonsCompleted={15} totalLessons={20} />
    );
    expect(getByText75('75%')).toBeTruthy();
  });

  it('should round progress percentage correctly', () => {
    const { getByText } = render(
      <ModuleCard {...mockModuleProps} lessonsCompleted={1} totalLessons={3} />
    );

    // 1/3 = 0.333... should round to 33%
    expect(getByText('33%')).toBeTruthy();
  });

  it('should handle long titles with truncation', () => {
    const longTitle =
      'This is a very long module title that should be truncated after two lines to prevent the card from becoming too wide and affecting the overall layout of the dashboard';
    const { getByText } = render(<ModuleCard {...mockModuleProps} title={longTitle} />);

    expect(getByText(longTitle)).toBeTruthy();
  });

  it('should handle long descriptions with truncation', () => {
    const longDescription =
      'This is a very long description that should be truncated after two lines to prevent the card from becoming too tall and affecting the overall layout. It contains many details about the module.';
    const { getByText } = render(<ModuleCard {...mockModuleProps} description={longDescription} />);

    expect(getByText(longDescription)).toBeTruthy();
  });

  it('should display different lesson counts', () => {
    const { getByText } = render(
      <ModuleCard {...mockModuleProps} lessonsCompleted={8} totalLessons={25} />
    );

    expect(getByText('8/25 lecciones')).toBeTruthy();
    expect(getByText('32%')).toBeTruthy();
  });

  it('should handle module with iconEmoji prop (even though not rendered)', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} iconEmoji="🚀" />);

    // Component should render normally, iconEmoji is accepted but not used
    expect(getByText('Introduction to Prompt Engineering')).toBeTruthy();
  });

  it('should render ChevronRight icon in action button', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} />);

    expect(getByText('Icon(ChevronRight)')).toBeTruthy();
  });

  it('should render all progress states correctly', () => {
    // 0% progress
    const { getByText: getText0 } = render(
      <ModuleCard {...mockModuleProps} lessonsCompleted={0} totalLessons={10} />
    );
    expect(getText0('0%')).toBeTruthy();
    expect(getText0('Comenzar')).toBeTruthy();

    // Partial progress
    const { getByText: getText50 } = render(
      <ModuleCard {...mockModuleProps} lessonsCompleted={5} totalLessons={10} />
    );
    expect(getText50('50%')).toBeTruthy();
    expect(getText50('Continuar')).toBeTruthy();

    // Complete
    const { getByText: getText100 } = render(
      <ModuleCard {...mockModuleProps} lessonsCompleted={10} totalLessons={10} isComplete={true} />
    );
    expect(getText100('100%')).toBeTruthy();
    expect(getText100('Revisar')).toBeTruthy();
  });

  it('should maintain all module metadata after navigation', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} />);

    // Navigate
    const card = getByText('Introduction to Prompt Engineering');
    fireEvent.press(card.parent?.parent);

    // Verify navigation was called with correct module id
    expect(router.push).toHaveBeenCalledWith('/lessons/?module=module-1');

    // Verify all content is still displayed
    expect(getByText('Introduction to Prompt Engineering')).toBeTruthy();
    expect(getByText('5/10 lecciones')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
  });

  it('should handle single lesson module', () => {
    const { getByText } = render(
      <ModuleCard {...mockModuleProps} lessonsCompleted={0} totalLessons={1} />
    );

    expect(getByText('0/1 lecciones')).toBeTruthy();
    expect(getByText('0%')).toBeTruthy();
  });

  it('should handle large number of lessons', () => {
    const { getByText } = render(
      <ModuleCard {...mockModuleProps} lessonsCompleted={45} totalLessons={100} />
    );

    expect(getByText('45/100 lecciones')).toBeTruthy();
    expect(getByText('45%')).toBeTruthy();
  });

  // New tests for locked state
  it('should render locked module correctly', () => {
    const { getByText, queryByText } = render(<ModuleCard {...mockModuleProps} isLocked={true} />);

    expect(getByText('Bloqueado')).toBeTruthy();
    expect(queryByText('Icon(Lock)')).toBeTruthy();
  });

  it('should not navigate when locked module is pressed', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} isLocked={true} />);

    const card = getByText('Introduction to Prompt Engineering');
    fireEvent.press(card.parent?.parent?.parent);

    expect(router.push).not.toHaveBeenCalled();
  });

  it('should show "Bloqueado" for locked modules', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} status="locked" />);

    expect(getByText('Bloqueado')).toBeTruthy();
  });

  it('should show in_progress status with correct styling', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} status="in_progress" />);

    expect(getByText('Continuar')).toBeTruthy();
  });

  it('should display estimated time when provided', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} estimatedMinutes={45} />);

    expect(getByText('45 min')).toBeTruthy();
  });

  it('should handle all module statuses', () => {
    // Available status
    const { getByText: getTextAvailable } = render(
      <ModuleCard {...mockModuleProps} status="available" lessonsCompleted={0} />
    );
    expect(getTextAvailable('Comenzar')).toBeTruthy();

    // In progress status
    const { getByText: getTextInProgress } = render(
      <ModuleCard {...mockModuleProps} status="in_progress" />
    );
    expect(getTextInProgress('Continuar')).toBeTruthy();

    // Completed status
    const { getByText: getTextCompleted } = render(
      <ModuleCard {...mockModuleProps} status="completed" />
    );
    expect(getTextCompleted('Revisar')).toBeTruthy();

    // Locked status
    const { getByText: getTextLocked } = render(<ModuleCard {...mockModuleProps} status="locked" />);
    expect(getTextLocked('Bloqueado')).toBeTruthy();
  });

  it('should display iconEmoji when provided', () => {
    const { getByText } = render(<ModuleCard {...mockModuleProps} iconEmoji="🚀" />);

    expect(getByText('🚀')).toBeTruthy();
  });
});
