import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressCard } from '../ProgressCard';

describe('ProgressCard', () => {
  it('should render correctly with basic props', () => {
    const { getByText } = render(
      <ProgressCard totalXp={1500} level={3} lessonsCompleted={15} currentStreak={5} />
    );

    expect(getByText('3')).toBeTruthy();
    expect(getByText('Token Tinkerer')).toBeTruthy();
    expect(getByText('1,500 XP')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
    expect(getByText('Lecciones')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('Racha')).toBeTruthy();
  });

  it('should show loading state', () => {
    const { queryByText } = render(
      <ProgressCard totalXp={0} level={1} lessonsCompleted={0} isLoading={true} />
    );

    expect(queryByText('Prompt Curious')).toBeNull();
  });

  it('should calculate progress to next level correctly', () => {
    const { getByText } = render(<ProgressCard totalXp={250} level={1} lessonsCompleted={5} />);

    expect(getByText('250 / 500 XP para nivel 2')).toBeTruthy();
  });

  it('should handle XP at level boundary', () => {
    const { getByText } = render(<ProgressCard totalXp={1000} level={2} lessonsCompleted={10} />);

    expect(getByText('0 / 500 XP para nivel 3')).toBeTruthy();
  });

  it('should format large XP numbers with commas', () => {
    const { getByText } = render(
      <ProgressCard totalXp={15750} level={31} lessonsCompleted={150} />
    );

    expect(getByText('15,750 XP')).toBeTruthy();
  });

  it('should display correct stats', () => {
    const { getByText } = render(
      <ProgressCard totalXp={5000} level={10} lessonsCompleted={50} currentStreak={12} />
    );

    expect(getByText('50')).toBeTruthy();
    expect(getByText('Lecciones')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
    expect(getByText('Racha')).toBeTruthy();
    expect(getByText('5,000')).toBeTruthy();
    expect(getByText('XP Total')).toBeTruthy();
  });

  it('should handle zero values', () => {
    const { getByText, getAllByText } = render(
      <ProgressCard totalXp={0} level={1} lessonsCompleted={0} />
    );

    expect(getByText('0 XP')).toBeTruthy();
    const zeroElements = getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it('should show correct progress for XP within level', () => {
    const { getByText } = render(<ProgressCard totalXp={1250} level={2} lessonsCompleted={12} />);

    expect(getByText('250 / 500 XP para nivel 3')).toBeTruthy();
  });

  it('should display level badge', () => {
    const { getByText } = render(<ProgressCard totalXp={500} level={5} lessonsCompleted={25} />);

    expect(getByText('5')).toBeTruthy();
  });

  it('should handle single lesson completed', () => {
    const { getByText, getAllByText } = render(
      <ProgressCard totalXp={100} level={1} lessonsCompleted={1} />
    );

    const oneElements = getAllByText('1');
    expect(oneElements.length).toBeGreaterThan(0);
    expect(getByText('Lecciones')).toBeTruthy();
  });

  it('should calculate XP for next level based on current level', () => {
    const { getByText: getByTextLevel1 } = render(
      <ProgressCard totalXp={100} level={1} lessonsCompleted={1} />
    );
    expect(getByTextLevel1('100 / 500 XP para nivel 2')).toBeTruthy();

    const { getByText: getByTextLevel5 } = render(
      <ProgressCard totalXp={2100} level={5} lessonsCompleted={20} />
    );
    expect(getByTextLevel5('100 / 500 XP para nivel 6')).toBeTruthy();
  });

  it('should use correct level titles from shared constants', () => {
    const { getByText: getByText1 } = render(
      <ProgressCard totalXp={0} level={1} lessonsCompleted={0} />
    );
    expect(getByText1('Prompt Curious')).toBeTruthy();

    const { getByText: getByText5 } = render(
      <ProgressCard totalXp={2000} level={5} lessonsCompleted={10} />
    );
    expect(getByText5('Embedding Explorer')).toBeTruthy();

    const { getByText: getByText10 } = render(
      <ProgressCard totalXp={4500} level={10} lessonsCompleted={40} />
    );
    expect(getByText10('LLM Engineer')).toBeTruthy();
  });

  it('should display current streak when provided', () => {
    const { getByText } = render(
      <ProgressCard totalXp={1000} level={2} lessonsCompleted={10} currentStreak={15} />
    );

    expect(getByText('15')).toBeTruthy();
    expect(getByText('Racha')).toBeTruthy();
  });

  it('should show streak as 0 when not provided', () => {
    const { getAllByText } = render(<ProgressCard totalXp={500} level={1} lessonsCompleted={5} />);

    const zeroElements = getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it('should show LLM Master for levels above 10', () => {
    const { getByText } = render(<ProgressCard totalXp={6000} level={12} lessonsCompleted={60} />);

    expect(getByText('LLM Master')).toBeTruthy();
  });
});
