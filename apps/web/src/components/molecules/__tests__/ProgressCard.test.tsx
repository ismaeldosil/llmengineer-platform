import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressCard } from '../ProgressCard';

describe('ProgressCard', () => {
  it('should render correctly with basic props', () => {
    const { getByText } = render(
      <ProgressCard
        totalXp={1500}
        level={3}
        levelTitle="Prompt Apprentice"
        lessonsCompleted={15}
      />
    );

    expect(getByText('3')).toBeTruthy();
    expect(getByText('Prompt Apprentice')).toBeTruthy();
    expect(getByText('1,500 XP')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
    expect(getByText('Lecciones')).toBeTruthy();
  });

  it('should show loading state', () => {
    const { queryByText } = render(
      <ProgressCard
        totalXp={0}
        level={1}
        levelTitle="Prompt Curious"
        lessonsCompleted={0}
        isLoading={true}
      />
    );

    expect(queryByText('Prompt Curious')).toBeNull();
  });

  it('should calculate progress to next level correctly', () => {
    const { getByText } = render(
      <ProgressCard
        totalXp={250}
        level={1}
        levelTitle="Prompt Curious"
        lessonsCompleted={5}
      />
    );

    expect(getByText('250 / 500 XP para nivel 2')).toBeTruthy();
  });

  it('should handle XP at level boundary', () => {
    const { getByText } = render(
      <ProgressCard
        totalXp={1000}
        level={2}
        levelTitle="Prompt Apprentice"
        lessonsCompleted={10}
      />
    );

    expect(getByText('0 / 500 XP para nivel 3')).toBeTruthy();
  });

  it('should format large XP numbers with commas', () => {
    const { getByText } = render(
      <ProgressCard
        totalXp={15750}
        level={31}
        levelTitle="Prompt Master"
        lessonsCompleted={150}
      />
    );

    expect(getByText('15,750 XP')).toBeTruthy();
  });

  it('should display correct stats', () => {
    const { getByText } = render(
      <ProgressCard
        totalXp={5000}
        level={10}
        levelTitle="Prompt Expert"
        lessonsCompleted={50}
      />
    );

    expect(getByText('50')).toBeTruthy();
    expect(getByText('Lecciones')).toBeTruthy();
    expect(getByText('5,000')).toBeTruthy();
    expect(getByText('XP Total')).toBeTruthy();
  });

  it('should handle zero values', () => {
    const { getByText, getAllByText } = render(
      <ProgressCard
        totalXp={0}
        level={1}
        levelTitle="Prompt Curious"
        lessonsCompleted={0}
      />
    );

    expect(getByText('0 XP')).toBeTruthy();
    const zeroElements = getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it('should show correct progress for XP within level', () => {
    const { getByText } = render(
      <ProgressCard
        totalXp={1250}
        level={2}
        levelTitle="Prompt Apprentice"
        lessonsCompleted={12}
      />
    );

    expect(getByText('250 / 500 XP para nivel 3')).toBeTruthy();
  });

  it('should display level badge', () => {
    const { getByText } = render(
      <ProgressCard
        totalXp={500}
        level={5}
        levelTitle="Prompt Enthusiast"
        lessonsCompleted={25}
      />
    );

    expect(getByText('5')).toBeTruthy();
  });

  it('should handle single lesson completed', () => {
    const { getByText, getAllByText } = render(
      <ProgressCard
        totalXp={100}
        level={1}
        levelTitle="Prompt Curious"
        lessonsCompleted={1}
      />
    );

    const oneElements = getAllByText('1');
    expect(oneElements.length).toBeGreaterThan(0);
    expect(getByText('Lecciones')).toBeTruthy();
  });

  it('should calculate XP for next level based on current level', () => {
    const { getByText: getByTextLevel1 } = render(
      <ProgressCard
        totalXp={100}
        level={1}
        levelTitle="Prompt Curious"
        lessonsCompleted={1}
      />
    );
    expect(getByTextLevel1('100 / 500 XP para nivel 2')).toBeTruthy();

    const { getByText: getByTextLevel5 } = render(
      <ProgressCard
        totalXp={2100}
        level={5}
        levelTitle="Prompt Enthusiast"
        lessonsCompleted={20}
      />
    );
    expect(getByTextLevel5('100 / 500 XP para nivel 6')).toBeTruthy();
  });
});
