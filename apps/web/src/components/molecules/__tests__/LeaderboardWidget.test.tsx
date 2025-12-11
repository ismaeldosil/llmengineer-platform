/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LeaderboardWidget } from '../LeaderboardWidget';
import { useGetLeaderboardQuery } from '@/services/api';

jest.mock('@/services/api');

const mockUseGetLeaderboardQuery = useGetLeaderboardQuery as jest.MockedFunction<
  typeof useGetLeaderboardQuery
>;

describe('LeaderboardWidget', () => {
  const mockLeaderboardData = {
    entries: [
      {
        rank: 1,
        userId: 'user1',
        displayName: 'Alice',
        totalXp: 5000,
        level: 10,
        isCurrentUser: false,
      },
      {
        rank: 2,
        userId: 'user2',
        displayName: 'Bob',
        totalXp: 4500,
        level: 9,
        isCurrentUser: false,
      },
      {
        rank: 3,
        userId: 'user3',
        displayName: 'Charlie',
        totalXp: 4000,
        level: 8,
        isCurrentUser: false,
      },
    ],
    userRank: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText, UNSAFE_queryByType } = render(<LeaderboardWidget />);

    expect(getByText('Ranking Global')).toBeTruthy();
    const activityIndicator = UNSAFE_queryByType(require('react-native').ActivityIndicator);
    expect(activityIndicator).toBeTruthy();
  });

  it('should render error state', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Failed to fetch' },
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardWidget />);

    expect(getByText('Ranking Global')).toBeTruthy();
    expect(getByText('Error al cargar ranking')).toBeTruthy();
  });

  it('should render top 3 users', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardWidget />);

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Charlie')).toBeTruthy();
  });

  it('should display correct rank emojis', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardWidget />);

    expect(getByText('🥇')).toBeTruthy();
    expect(getByText('🥈')).toBeTruthy();
    expect(getByText('🥉')).toBeTruthy();
  });

  it('should display XP for each user', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardWidget />);

    expect(getByText('5,000 XP')).toBeTruthy();
    expect(getByText('4,500 XP')).toBeTruthy();
    expect(getByText('4,000 XP')).toBeTruthy();
  });

  it('should call onViewMore when "Ver más" is pressed', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const onViewMoreMock = jest.fn();
    const { getByText } = render(<LeaderboardWidget onViewMore={onViewMoreMock} />);

    const viewMoreButton = getByText('Ver más');
    fireEvent.press(viewMoreButton);

    expect(onViewMoreMock).toHaveBeenCalledTimes(1);
  });

  it('should not render "Ver más" button when onViewMore is not provided', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { queryByText } = render(<LeaderboardWidget />);

    expect(queryByText('Ver más')).toBeNull();
  });

  it('should display user rank when outside top 3', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardWidget />);

    expect(getByText('Tu posición: #10')).toBeTruthy();
  });

  it('should not display user rank when user is in top 3', () => {
    const dataWithTopRank = {
      ...mockLeaderboardData,
      userRank: 2,
    };

    mockUseGetLeaderboardQuery.mockReturnValue({
      data: dataWithTopRank,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { queryByText } = render(<LeaderboardWidget />);

    expect(queryByText(/Tu posición/)).toBeNull();
  });

  it('should highlight current user entry', () => {
    const dataWithCurrentUser = {
      entries: [
        mockLeaderboardData.entries[0],
        { ...mockLeaderboardData.entries[1], isCurrentUser: true },
        mockLeaderboardData.entries[2],
      ],
      userRank: 2,
    };

    mockUseGetLeaderboardQuery.mockReturnValue({
      data: dataWithCurrentUser,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByTestId } = render(<LeaderboardWidget />);

    const bobEntry = getByTestId('leaderboard-entry-user2');
    expect(bobEntry.props.style).toContainEqual(
      expect.objectContaining({
        borderColor: '#3B82F6',
      })
    );
  });

  it('should display avatar placeholder with first letter', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardWidget />);

    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    expect(getByText('C')).toBeTruthy();
  });

  it('should request only top 3 from API', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    render(<LeaderboardWidget />);

    expect(mockUseGetLeaderboardQuery).toHaveBeenCalledWith({
      type: 'global',
      limit: 3,
    });
  });

  it('should handle empty entries array', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: { entries: [], userRank: 0 },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText, queryByText } = render(<LeaderboardWidget />);

    expect(getByText('Ranking Global')).toBeTruthy();
    expect(queryByText('Alice')).toBeNull();
  });

  it('should handle undefined data gracefully', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText, queryByText } = render(<LeaderboardWidget />);

    expect(getByText('Ranking Global')).toBeTruthy();
    expect(queryByText('Alice')).toBeNull();
  });

  it('should truncate long names', () => {
    const dataWithLongName = {
      entries: [
        {
          ...mockLeaderboardData.entries[0],
          displayName: 'VeryLongUserNameThatShouldBeTruncated',
        },
        mockLeaderboardData.entries[1],
        mockLeaderboardData.entries[2],
      ],
      userRank: 10,
    };

    mockUseGetLeaderboardQuery.mockReturnValue({
      data: dataWithLongName,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardWidget />);
    const nameElement = getByText('VeryLongUserNameThatShouldBeTruncated');

    expect(nameElement.props.numberOfLines).toBe(1);
  });

  it('should format XP with thousands separator', () => {
    const dataWithHighXp = {
      entries: [
        {
          rank: 1,
          userId: 'user1',
          displayName: 'ProUser',
          totalXp: 123456,
          level: 50,
          isCurrentUser: false,
        },
      ],
      userRank: 1,
    };

    mockUseGetLeaderboardQuery.mockReturnValue({
      data: dataWithHighXp,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardWidget />);
    expect(getByText('123,456 XP')).toBeTruthy();
  });

  it('should display only top 3 even if more entries are returned', () => {
    const dataWithMoreEntries = {
      entries: [
        ...mockLeaderboardData.entries,
        {
          rank: 4,
          userId: 'user4',
          displayName: 'David',
          totalXp: 3500,
          level: 7,
          isCurrentUser: false,
        },
        {
          rank: 5,
          userId: 'user5',
          displayName: 'Eve',
          totalXp: 3000,
          level: 6,
          isCurrentUser: false,
        },
      ],
      userRank: 10,
    };

    mockUseGetLeaderboardQuery.mockReturnValue({
      data: dataWithMoreEntries,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText, queryByText } = render(<LeaderboardWidget />);

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Charlie')).toBeTruthy();
    expect(queryByText('David')).toBeNull();
    expect(queryByText('Eve')).toBeNull();
  });

  it('should render widget title correctly', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardWidget />);
    expect(getByText('Ranking Global')).toBeTruthy();
  });

  it('should handle user rank of 1', () => {
    const dataWithRankOne = {
      ...mockLeaderboardData,
      userRank: 1,
    };

    mockUseGetLeaderboardQuery.mockReturnValue({
      data: dataWithRankOne,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { queryByText } = render(<LeaderboardWidget />);
    expect(queryByText(/Tu posición/)).toBeNull();
  });

  it('should handle user rank of 3', () => {
    const dataWithRankThree = {
      ...mockLeaderboardData,
      userRank: 3,
    };

    mockUseGetLeaderboardQuery.mockReturnValue({
      data: dataWithRankThree,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { queryByText } = render(<LeaderboardWidget />);
    expect(queryByText(/Tu posición/)).toBeNull();
  });

  it('should show user rank badge for rank 4', () => {
    const dataWithRankFour = {
      ...mockLeaderboardData,
      userRank: 4,
    };

    mockUseGetLeaderboardQuery.mockReturnValue({
      data: dataWithRankFour,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardWidget />);
    expect(getByText('Tu posición: #4')).toBeTruthy();
  });
});
