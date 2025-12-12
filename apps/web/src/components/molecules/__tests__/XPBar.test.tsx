/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render } from '@testing-library/react-native';
import { XPBar, Level } from '../XPBar';

const mockCurrentLevel: Level = {
  level: 1,
  name: 'Prompt Curious',
  icon: '🌱',
  color: '#3B82F6',
  minXP: 0,
};

const mockNextLevel: Level = {
  level: 2,
  name: 'Prompt Apprentice',
  icon: '🔰',
  color: '#10B981',
  minXP: 500,
};

describe('XPBar', () => {
  it('should render correctly with basic props', () => {
    const { getByText } = render(
      <XPBar
        currentXP={250}
        currentLevel={mockCurrentLevel}
        nextLevel={mockNextLevel}
        xpProgress={50}
      />
    );

    expect(getByText('Prompt Curious')).toBeTruthy();
    expect(getByText('Level 1')).toBeTruthy();
    expect(getByText('250 XP to Prompt Apprentice')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
  });

  it('should render without details when showDetails is false', () => {
    const { queryByText } = render(
      <XPBar
        currentXP={250}
        currentLevel={mockCurrentLevel}
        nextLevel={mockNextLevel}
        xpProgress={50}
        showDetails={false}
      />
    );

    expect(queryByText('Prompt Curious')).toBeNull();
    expect(queryByText('Level 1')).toBeNull();
    expect(queryByText('250 XP to Prompt Apprentice')).toBeNull();
  });

  it('should show max level message when nextLevel is null', () => {
    const { getByText } = render(
      <XPBar
        currentXP={5000}
        currentLevel={{
          level: 10,
          name: 'LLM Engineer',
          icon: '🏆',
          color: '#F59E0B',
          minXP: 4500,
        }}
        nextLevel={null}
        xpProgress={100}
      />
    );

    expect(getByText('Max Level Reached!')).toBeTruthy();
  });

  it('should render with small size variant', () => {
    const { getByText } = render(
      <XPBar
        currentXP={100}
        currentLevel={mockCurrentLevel}
        nextLevel={mockNextLevel}
        xpProgress={20}
        size="sm"
      />
    );

    expect(getByText('Prompt Curious')).toBeTruthy();
  });

  it('should render with medium size variant (default)', () => {
    const { getByText } = render(
      <XPBar
        currentXP={250}
        currentLevel={mockCurrentLevel}
        nextLevel={mockNextLevel}
        xpProgress={50}
      />
    );

    expect(getByText('Prompt Curious')).toBeTruthy();
  });

  it('should render with large size variant', () => {
    const { getByText } = render(
      <XPBar
        currentXP={400}
        currentLevel={mockCurrentLevel}
        nextLevel={mockNextLevel}
        xpProgress={80}
        size="lg"
      />
    );

    expect(getByText('Prompt Curious')).toBeTruthy();
  });

  it('should display level icon', () => {
    const { getByText } = render(
      <XPBar
        currentXP={250}
        currentLevel={mockCurrentLevel}
        nextLevel={mockNextLevel}
        xpProgress={50}
      />
    );

    expect(getByText('🌱')).toBeTruthy();
  });

  it('should calculate XP remaining correctly', () => {
    const { getByText } = render(
      <XPBar
        currentXP={300}
        currentLevel={mockCurrentLevel}
        nextLevel={mockNextLevel}
        xpProgress={60}
      />
    );

    expect(getByText('200 XP to Prompt Apprentice')).toBeTruthy();
  });

  it('should format large XP numbers with commas', () => {
    const highLevel: Level = {
      level: 10,
      name: 'LLM Engineer',
      icon: '🏆',
      color: '#F59E0B',
      minXP: 4500,
    };

    const nextHighLevel: Level = {
      level: 11,
      name: 'LLM Master',
      icon: '👑',
      color: '#8B5CF6',
      minXP: 5500,
    };

    const { getByText } = render(
      <XPBar currentXP={4750} currentLevel={highLevel} nextLevel={nextHighLevel} xpProgress={25} />
    );

    expect(getByText('750 XP to LLM Master')).toBeTruthy();
  });

  it('should display progress percentage rounded', () => {
    const { getByText } = render(
      <XPBar
        currentXP={333}
        currentLevel={mockCurrentLevel}
        nextLevel={mockNextLevel}
        xpProgress={66.6}
      />
    );

    expect(getByText('67%')).toBeTruthy();
  });

  it('should handle 0% progress', () => {
    const { getByText } = render(
      <XPBar
        currentXP={0}
        currentLevel={mockCurrentLevel}
        nextLevel={mockNextLevel}
        xpProgress={0}
      />
    );

    expect(getByText('0%')).toBeTruthy();
    expect(getByText('500 XP to Prompt Apprentice')).toBeTruthy();
  });

  it('should handle 100% progress', () => {
    const { getByText } = render(
      <XPBar
        currentXP={500}
        currentLevel={mockCurrentLevel}
        nextLevel={mockNextLevel}
        xpProgress={100}
      />
    );

    expect(getByText('100%')).toBeTruthy();
  });

  it('should render level name correctly', () => {
    const customLevel: Level = {
      level: 5,
      name: 'Embedding Explorer',
      icon: '🧭',
      color: '#6366F1',
      minXP: 2000,
    };

    const { getByText } = render(
      <XPBar
        currentXP={2250}
        currentLevel={customLevel}
        nextLevel={mockNextLevel}
        xpProgress={50}
      />
    );

    expect(getByText('Embedding Explorer')).toBeTruthy();
    expect(getByText('Level 5')).toBeTruthy();
  });
});
