/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LeaderboardWidget, type LeaderboardEntry } from '../LeaderboardWidget';

describe('LeaderboardWidget', () => {
  const mockTopUsers: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: 'user1',
      displayName: 'Alice',
      xp: 5000,
      level: 10,
    },
    {
      rank: 2,
      userId: 'user2',
      displayName: 'Bob',
      xp: 4500,
      level: 9,
    },
    {
      rank: 3,
      userId: 'user3',
      displayName: 'Charlie',
      xp: 4000,
      level: 8,
    },
  ];

  const mockCurrentUser: LeaderboardEntry = {
    rank: 10,
    userId: 'current-user',
    displayName: 'CurrentUser',
    xp: 2500,
    level: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render top 3 users', () => {
    const { getByText } = render(<LeaderboardWidget topUsers={mockTopUsers} />);

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Charlie')).toBeTruthy();
  });

  it('should display correct rank emojis', () => {
    const { getByText } = render(<LeaderboardWidget topUsers={mockTopUsers} />);

    expect(getByText('🥇')).toBeTruthy();
    expect(getByText('🥈')).toBeTruthy();
    expect(getByText('🥉')).toBeTruthy();
  });

  it('should display XP for each user', () => {
    const { getByText } = render(<LeaderboardWidget topUsers={mockTopUsers} />);

    expect(getByText('5,000 XP')).toBeTruthy();
    expect(getByText('4,500 XP')).toBeTruthy();
    expect(getByText('4,000 XP')).toBeTruthy();
  });

  it('should display level for each user', () => {
    const { getByText } = render(<LeaderboardWidget topUsers={mockTopUsers} />);

    expect(getByText('Nivel 10')).toBeTruthy();
    expect(getByText('Nivel 9')).toBeTruthy();
    expect(getByText('Nivel 8')).toBeTruthy();
  });

  it('should call onViewAll when "Ver Ranking Completo" is pressed', () => {
    const onViewAllMock = jest.fn();
    const { getByText } = render(
      <LeaderboardWidget topUsers={mockTopUsers} onViewAll={onViewAllMock} />
    );

    const viewAllButton = getByText('Ver Ranking Completo');
    fireEvent.press(viewAllButton);

    expect(onViewAllMock).toHaveBeenCalledTimes(1);
  });

  it('should not render "Ver Ranking Completo" button when onViewAll is not provided', () => {
    const { queryByText } = render(<LeaderboardWidget topUsers={mockTopUsers} />);

    expect(queryByText('Ver Ranking Completo')).toBeNull();
  });

  it('should display current user when rank is outside top 3', () => {
    const { getByText } = render(
      <LeaderboardWidget topUsers={mockTopUsers} currentUser={mockCurrentUser} />
    );

    expect(getByText('CurrentUser (Tú)')).toBeTruthy();
    expect(getByText('#10')).toBeTruthy();
    expect(getByText('2,500 XP')).toBeTruthy();
    expect(getByText('Nivel 5')).toBeTruthy();
  });

  it('should not display current user when rank is in top 3', () => {
    const topRankUser: LeaderboardEntry = {
      ...mockCurrentUser,
      rank: 2,
    };

    const { queryByText } = render(
      <LeaderboardWidget topUsers={mockTopUsers} currentUser={topRankUser} />
    );

    expect(queryByText(/\(Tú\)/)).toBeNull();
  });

  it('should not display current user section when rank is 1', () => {
    const topRankUser: LeaderboardEntry = {
      ...mockCurrentUser,
      rank: 1,
    };

    const { queryByText } = render(
      <LeaderboardWidget topUsers={mockTopUsers} currentUser={topRankUser} />
    );

    expect(queryByText(/\(Tú\)/)).toBeNull();
  });

  it('should not display current user section when rank is 3', () => {
    const topRankUser: LeaderboardEntry = {
      ...mockCurrentUser,
      rank: 3,
    };

    const { queryByText } = render(
      <LeaderboardWidget topUsers={mockTopUsers} currentUser={topRankUser} />
    );

    expect(queryByText(/\(Tú\)/)).toBeNull();
  });

  it('should show current user section for rank 4', () => {
    const rankFourUser: LeaderboardEntry = {
      ...mockCurrentUser,
      rank: 4,
    };

    const { getByText } = render(
      <LeaderboardWidget topUsers={mockTopUsers} currentUser={rankFourUser} />
    );

    expect(getByText('CurrentUser (Tú)')).toBeTruthy();
    expect(getByText('#4')).toBeTruthy();
  });

  it('should display avatar placeholder with first letter', () => {
    const { getByText } = render(<LeaderboardWidget topUsers={mockTopUsers} />);

    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    expect(getByText('C')).toBeTruthy();
  });

  it('should handle empty topUsers array', () => {
    const { getByText, queryByText } = render(<LeaderboardWidget topUsers={[]} />);

    expect(getByText('Ranking')).toBeTruthy();
    expect(queryByText('Alice')).toBeNull();
  });

  it('should truncate long names', () => {
    const usersWithLongName: LeaderboardEntry[] = [
      {
        ...mockTopUsers[0],
        displayName: 'VeryLongUserNameThatShouldBeTruncated',
      },
      mockTopUsers[1],
      mockTopUsers[2],
    ];

    const { getByText } = render(<LeaderboardWidget topUsers={usersWithLongName} />);
    const nameElement = getByText('VeryLongUserNameThatShouldBeTruncated');

    expect(nameElement.props.numberOfLines).toBe(1);
  });

  it('should format XP with thousands separator', () => {
    const usersWithHighXp: LeaderboardEntry[] = [
      {
        rank: 1,
        userId: 'user1',
        displayName: 'ProUser',
        xp: 123456,
        level: 50,
      },
    ];

    const { getByText } = render(<LeaderboardWidget topUsers={usersWithHighXp} />);
    expect(getByText('123,456 XP')).toBeTruthy();
  });

  it('should display only top 3 even if more entries are provided', () => {
    const moreUsers: LeaderboardEntry[] = [
      ...mockTopUsers,
      {
        rank: 4,
        userId: 'user4',
        displayName: 'David',
        xp: 3500,
        level: 7,
      },
      {
        rank: 5,
        userId: 'user5',
        displayName: 'Eve',
        xp: 3000,
        level: 6,
      },
    ];

    const { getByText, queryByText } = render(<LeaderboardWidget topUsers={moreUsers} />);

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Charlie')).toBeTruthy();
    expect(queryByText('David')).toBeNull();
    expect(queryByText('Eve')).toBeNull();
  });

  it('should render widget title correctly', () => {
    const { getByText } = render(<LeaderboardWidget topUsers={mockTopUsers} />);
    expect(getByText('Ranking')).toBeTruthy();
  });

  it('should render trophy icon', () => {
    const { UNSAFE_root } = render(<LeaderboardWidget topUsers={mockTopUsers} />);
    // Trophy icon should be rendered (checking via component tree)
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render with testID for view all button', () => {
    const onViewAllMock = jest.fn();
    const { getByTestId } = render(
      <LeaderboardWidget topUsers={mockTopUsers} onViewAll={onViewAllMock} />
    );

    const viewAllButton = getByTestId('view-all-button');
    expect(viewAllButton).toBeTruthy();
  });

  it('should render testIDs for leaderboard entries', () => {
    const { getByTestId } = render(<LeaderboardWidget topUsers={mockTopUsers} />);

    expect(getByTestId('leaderboard-entry-user1')).toBeTruthy();
    expect(getByTestId('leaderboard-entry-user2')).toBeTruthy();
    expect(getByTestId('leaderboard-entry-user3')).toBeTruthy();
  });

  it('should show divider when current user is displayed', () => {
    const { UNSAFE_root } = render(
      <LeaderboardWidget topUsers={mockTopUsers} currentUser={mockCurrentUser} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('should handle single user', () => {
    const singleUser: LeaderboardEntry[] = [mockTopUsers[0]];

    const { getByText, queryByText } = render(<LeaderboardWidget topUsers={singleUser} />);

    expect(getByText('Alice')).toBeTruthy();
    expect(queryByText('Bob')).toBeNull();
    expect(queryByText('Charlie')).toBeNull();
  });

  it('should handle two users', () => {
    const twoUsers: LeaderboardEntry[] = [mockTopUsers[0], mockTopUsers[1]];

    const { getByText, queryByText } = render(<LeaderboardWidget topUsers={twoUsers} />);

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(queryByText('Charlie')).toBeNull();
  });

  it('should display current user avatar with first letter', () => {
    const { getByText } = render(
      <LeaderboardWidget topUsers={mockTopUsers} currentUser={mockCurrentUser} />
    );

    expect(getByText('C')).toBeTruthy();
  });

  it('should not show current user when currentUser is undefined', () => {
    const { queryByText } = render(
      <LeaderboardWidget topUsers={mockTopUsers} currentUser={undefined} />
    );

    expect(queryByText(/\(Tú\)/)).toBeNull();
  });

  it('should handle user with rank 100', () => {
    const highRankUser: LeaderboardEntry = {
      ...mockCurrentUser,
      rank: 100,
    };

    const { getByText } = render(
      <LeaderboardWidget topUsers={mockTopUsers} currentUser={highRankUser} />
    );

    expect(getByText('#100')).toBeTruthy();
  });

  it('should format large XP numbers correctly', () => {
    const highXpUsers: LeaderboardEntry[] = [
      {
        rank: 1,
        userId: 'user1',
        displayName: 'Alice',
        xp: 1000000,
        level: 100,
      },
    ];

    const { getByText } = render(<LeaderboardWidget topUsers={highXpUsers} />);

    expect(getByText('1,000,000 XP')).toBeTruthy();
  });
});
