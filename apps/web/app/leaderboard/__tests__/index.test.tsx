/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ActivityIndicator, FlatList } from 'react-native';
import LeaderboardScreen from '../index';
import { useGetLeaderboardQuery } from '@/services/api';

jest.mock('@/services/api');
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
}));

const mockUseGetLeaderboardQuery = useGetLeaderboardQuery as jest.MockedFunction<
  typeof useGetLeaderboardQuery
>;

describe('LeaderboardScreen', () => {
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
        isCurrentUser: true,
      },
    ],
    userRank: 3,
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

    const { UNSAFE_queryByType } = render(<LeaderboardScreen />);
    const activityIndicator = UNSAFE_queryByType(ActivityIndicator);
    expect(activityIndicator).toBeTruthy();
  });

  it('should render error state', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Failed to fetch' },
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardScreen />);
    expect(getByText('Error al cargar ranking')).toBeTruthy();
  });

  it('should render leaderboard with entries', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardScreen />);

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Charlie')).toBeTruthy();
    expect(getByText('5,000')).toBeTruthy();
    expect(getByText('4,500')).toBeTruthy();
    expect(getByText('4,000')).toBeTruthy();
  });

  it('should display rank badges with correct emojis for top 3', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardScreen />);

    expect(getByText('🥇')).toBeTruthy();
    expect(getByText('🥈')).toBeTruthy();
    expect(getByText('🥉')).toBeTruthy();
  });

  it('should highlight current user entry', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByTestId } = render(<LeaderboardScreen />);
    const charlieEntry = getByTestId('leaderboard-entry-user3');
    expect(charlieEntry.props.style).toContainEqual(
      expect.objectContaining({
        borderColor: '#3B82F6',
      })
    );
  });

  it('should show user rank footer when user is not in top 50', () => {
    const dataWithHighRank = {
      entries: mockLeaderboardData.entries.map((entry) => ({
        ...entry,
        isCurrentUser: false,
      })),
      userRank: 75,
    };

    mockUseGetLeaderboardQuery.mockReturnValue({
      data: dataWithHighRank,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardScreen />);
    expect(getByText('#75')).toBeTruthy();
    expect(getByText('Tu posición')).toBeTruthy();
  });

  it('should not show user rank footer when user is in top 50', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { queryByText } = render(<LeaderboardScreen />);
    expect(queryByText('Tu posición')).toBeNull();
  });

  it('should toggle between Global and Weekly tabs', () => {
    const refetchMock = jest.fn();
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: refetchMock,
    } as any);

    const { getByText } = render(<LeaderboardScreen />);

    const weeklyTab = getByText('Semanal');
    fireEvent.press(weeklyTab);

    expect(mockUseGetLeaderboardQuery).toHaveBeenCalledWith({
      type: 'weekly',
      limit: 50,
    });
  });

  it('should handle pull-to-refresh', async () => {
    const refetchMock = jest.fn().mockResolvedValue({});
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: refetchMock,
    } as any);

    const { UNSAFE_getByType } = render(<LeaderboardScreen />);
    const flatList = UNSAFE_getByType(FlatList);

    const refreshControl = flatList.props.refreshControl;
    await refreshControl.props.onRefresh();

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  it('should display level information for each entry', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardScreen />);

    expect(getByText('Nivel 10')).toBeTruthy();
    expect(getByText('Nivel 9')).toBeTruthy();
    expect(getByText('Nivel 8')).toBeTruthy();
  });

  it('should display XP label for each entry', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getAllByText } = render(<LeaderboardScreen />);
    const xpLabels = getAllByText('XP');
    expect(xpLabels.length).toBe(3);
  });

  it('should use correct key extractor for FlatList', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { UNSAFE_getByType } = render(<LeaderboardScreen />);
    const flatList = UNSAFE_getByType(FlatList);

    const keyExtractor = flatList.props.keyExtractor;
    const item = mockLeaderboardData.entries[0]!;
    expect(keyExtractor(item)).toBe(`${item.userId}-${item.rank}`);
  });

  it('should display avatar placeholder with first letter', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardScreen />);

    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    expect(getByText('C')).toBeTruthy();
  });

  it('should handle empty leaderboard data', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: { entries: [], userRank: 0 },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { UNSAFE_getByType } = render(<LeaderboardScreen />);
    const flatList = UNSAFE_getByType(FlatList);
    expect(flatList.props.data).toEqual([]);
  });

  it('should format large XP numbers with locale string', () => {
    const dataWithLargeXp = {
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
      data: dataWithLargeXp,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardScreen />);
    expect(getByText('123,456')).toBeTruthy();
  });

  it('should display FlatList when data is available even during refresh', () => {
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { UNSAFE_queryByType } = render(<LeaderboardScreen />);

    const flatList = UNSAFE_queryByType(FlatList);

    expect(flatList).toBeTruthy();
  });

  it('should handle refresh error gracefully', async () => {
    const refetchMock = jest.fn().mockRejectedValue(new Error('Network error'));
    mockUseGetLeaderboardQuery.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: undefined,
      refetch: refetchMock,
    } as any);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { UNSAFE_getByType } = render(<LeaderboardScreen />);
    const flatList = UNSAFE_getByType(FlatList);

    const refreshControl = flatList.props.refreshControl;
    await refreshControl.props.onRefresh();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Refresh failed:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should display rank number for ranks beyond top 3', () => {
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
      ],
      userRank: 4,
    };

    mockUseGetLeaderboardQuery.mockReturnValue({
      data: dataWithMoreEntries,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(<LeaderboardScreen />);
    expect(getByText('4')).toBeTruthy();
  });
});
