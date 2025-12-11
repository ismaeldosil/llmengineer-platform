import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardService } from './leaderboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardType } from './dto';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let prisma: PrismaService;

  const mockPrismaService = {
    userProgress: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    lessonCompletion: {
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getLeaderboard', () => {
    it('should call getGlobalLeaderboard when type is global', async () => {
      const spy = jest
        .spyOn(service as any, 'getGlobalLeaderboard')
        .mockResolvedValue({
          entries: [],
          currentUserRank: 0,
          currentUserEntry: null,
          total: 0,
          offset: 0,
        });

      await service.getLeaderboard('user-1', LeaderboardType.GLOBAL, 50, 0);

      expect(spy).toHaveBeenCalledWith('user-1', 50, 0);
    });

    it('should call getWeeklyLeaderboard when type is weekly', async () => {
      const spy = jest
        .spyOn(service as any, 'getWeeklyLeaderboard')
        .mockResolvedValue({
          entries: [],
          currentUserRank: 0,
          currentUserEntry: null,
          total: 0,
          offset: 0,
        });

      await service.getLeaderboard('user-1', LeaderboardType.WEEKLY, 50, 0);

      expect(spy).toHaveBeenCalledWith('user-1', 50, 0);
    });
  });

  describe('getGlobalLeaderboard', () => {
    const mockUsers = [
      {
        id: 'progress-1',
        userId: 'user-1',
        totalXp: 1500,
        level: 5,
        user: { id: 'user-1', displayName: 'User One' },
      },
      {
        id: 'progress-2',
        userId: 'user-2',
        totalXp: 1200,
        level: 4,
        user: { id: 'user-2', displayName: 'User Two' },
      },
      {
        id: 'progress-3',
        userId: 'user-3',
        totalXp: 1000,
        level: 3,
        user: { id: 'user-3', displayName: 'User Three' },
      },
    ];

    it('should return global leaderboard with top users', async () => {
      mockPrismaService.userProgress.findMany.mockResolvedValue(mockUsers);

      const result = await service.getLeaderboard(
        'user-4',
        LeaderboardType.GLOBAL,
        50,
        0,
      );

      expect(prisma.userProgress.findMany).toHaveBeenCalledWith({
        orderBy: { totalXp: 'desc' },
        skip: 0,
        take: 50,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      });

      expect(result.entries).toHaveLength(3);
      expect(result.entries[0]).toMatchObject({
        rank: 1,
        userId: 'user-1',
        displayName: 'User One',
        totalXp: 1500,
        level: 5,
        isCurrentUser: false,
      });
      expect(result.total).toBe(3);
      expect(result.offset).toBe(0);
    });

    it('should mark current user in the list', async () => {
      mockPrismaService.userProgress.findMany.mockResolvedValue(mockUsers);

      const result = await service.getLeaderboard(
        'user-2',
        LeaderboardType.GLOBAL,
        50,
        0,
      );

      expect(result.entries[1].isCurrentUser).toBe(true);
      expect(result.currentUserRank).toBe(2);
      expect(result.currentUserEntry).toBeNull();
    });

    it('should handle pagination with offset', async () => {
      const paginatedUsers = [mockUsers[2]];
      mockPrismaService.userProgress.findMany.mockResolvedValue(paginatedUsers);

      const result = await service.getLeaderboard(
        'user-4',
        LeaderboardType.GLOBAL,
        50,
        2,
      );

      expect(prisma.userProgress.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 2,
          take: 50,
        }),
      );

      expect(result.entries[0].rank).toBe(3); // offset 2 + index 0 + 1
      expect(result.offset).toBe(2);
    });

    it('should get current user rank when not in the list', async () => {
      mockPrismaService.userProgress.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.userProgress.findUnique.mockResolvedValue({
        id: 'progress-4',
        userId: 'user-4',
        totalXp: 500,
        level: 2,
        user: { id: 'user-4', displayName: 'User Four' },
      });
      mockPrismaService.userProgress.count.mockResolvedValue(3);

      const result = await service.getLeaderboard(
        'user-4',
        LeaderboardType.GLOBAL,
        50,
        0,
      );

      expect(result.currentUserRank).toBe(4);
      expect(result.currentUserEntry).toMatchObject({
        rank: 4,
        userId: 'user-4',
        displayName: 'User Four',
        totalXp: 500,
        level: 2,
        isCurrentUser: true,
      });
    });

    it('should handle user with no progress', async () => {
      mockPrismaService.userProgress.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.userProgress.findUnique.mockResolvedValue(null);

      const result = await service.getLeaderboard(
        'new-user',
        LeaderboardType.GLOBAL,
        50,
        0,
      );

      expect(result.currentUserRank).toBe(0);
      expect(result.currentUserEntry).toBeNull();
    });

    it('should handle empty leaderboard', async () => {
      mockPrismaService.userProgress.findMany.mockResolvedValue([]);
      mockPrismaService.userProgress.findUnique.mockResolvedValue(null);

      const result = await service.getLeaderboard(
        'user-1',
        LeaderboardType.GLOBAL,
        50,
        0,
      );

      expect(result.entries).toHaveLength(0);
      expect(result.currentUserRank).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should handle ties in ranking correctly', async () => {
      const usersWithTies = [
        {
          id: 'progress-1',
          userId: 'user-1',
          totalXp: 1500,
          level: 5,
          user: { id: 'user-1', displayName: 'User One' },
        },
        {
          id: 'progress-2',
          userId: 'user-2',
          totalXp: 1500,
          level: 5,
          user: { id: 'user-2', displayName: 'User Two' },
        },
      ];

      mockPrismaService.userProgress.findMany.mockResolvedValue(usersWithTies);

      const result = await service.getLeaderboard(
        'user-3',
        LeaderboardType.GLOBAL,
        50,
        0,
      );

      expect(result.entries[0].rank).toBe(1);
      expect(result.entries[1].rank).toBe(2);
    });
  });

  describe('getWeeklyLeaderboard', () => {
    const mockWeeklyXp = [
      { userId: 'user-1', _sum: { xpEarned: 500 } },
      { userId: 'user-2', _sum: { xpEarned: 400 } },
      { userId: 'user-3', _sum: { xpEarned: 300 } },
    ];

    const mockUsers = [
      {
        id: 'user-1',
        displayName: 'User One',
        progress: { level: 5 },
      },
      {
        id: 'user-2',
        displayName: 'User Two',
        progress: { level: 4 },
      },
      {
        id: 'user-3',
        displayName: 'User Three',
        progress: { level: 3 },
      },
    ];

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-12-11T10:00:00Z')); // Thursday
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return weekly leaderboard with top users', async () => {
      mockPrismaService.lessonCompletion.groupBy.mockResolvedValue(
        mockWeeklyXp,
      );
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.lessonCompletion.aggregate.mockResolvedValue({
        _sum: { xpEarned: 0 },
      });

      const result = await service.getLeaderboard(
        'user-4',
        LeaderboardType.WEEKLY,
        50,
        0,
      );

      expect(prisma.lessonCompletion.groupBy).toHaveBeenCalledWith({
        by: ['userId'],
        _sum: { xpEarned: true },
        where: {
          completedAt: { gte: expect.any(Date) },
        },
        orderBy: {
          _sum: { xpEarned: 'desc' },
        },
      });

      expect(result.entries).toHaveLength(3);
      expect(result.entries[0]).toMatchObject({
        rank: 1,
        userId: 'user-1',
        displayName: 'User One',
        totalXp: 500,
        level: 5,
        isCurrentUser: false,
      });
    });

    it('should mark current user in weekly list', async () => {
      mockPrismaService.lessonCompletion.groupBy.mockResolvedValue(
        mockWeeklyXp,
      );
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getLeaderboard(
        'user-2',
        LeaderboardType.WEEKLY,
        50,
        0,
      );

      expect(result.entries[1].isCurrentUser).toBe(true);
      expect(result.currentUserRank).toBe(2);
    });

    it('should handle pagination in weekly leaderboard', async () => {
      mockPrismaService.lessonCompletion.groupBy.mockResolvedValue(
        mockWeeklyXp,
      );
      mockPrismaService.user.findMany.mockResolvedValue([mockUsers[2]]);
      mockPrismaService.lessonCompletion.aggregate.mockResolvedValue({
        _sum: { xpEarned: 0 },
      });

      const result = await service.getLeaderboard(
        'user-4',
        LeaderboardType.WEEKLY,
        50,
        2,
      );

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].rank).toBe(3);
      expect(result.offset).toBe(2);
    });

    it('should get current user weekly rank when not in the list', async () => {
      // Include user-4 in the full weeklyXp data but exclude from paginated results
      const extendedWeeklyXp = [
        ...mockWeeklyXp,
        { userId: 'user-4', _sum: { xpEarned: 200 } },
      ];

      mockPrismaService.lessonCompletion.groupBy.mockResolvedValue(
        extendedWeeklyXp,
      );
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.lessonCompletion.aggregate.mockResolvedValue({
        _sum: { xpEarned: 200 },
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-4',
        displayName: 'User Four',
        progress: { level: 2 },
      });

      const result = await service.getLeaderboard(
        'user-4',
        LeaderboardType.WEEKLY,
        3,
        0,
      );

      expect(result.currentUserRank).toBe(4);
      expect(result.currentUserEntry).toMatchObject({
        rank: 4,
        userId: 'user-4',
        displayName: 'User Four',
        totalXp: 200,
        level: 2,
        isCurrentUser: true,
      });
    });

    it('should handle user with no weekly XP', async () => {
      mockPrismaService.lessonCompletion.groupBy.mockResolvedValue(
        mockWeeklyXp,
      );
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.lessonCompletion.aggregate.mockResolvedValue({
        _sum: { xpEarned: 0 },
      });

      const result = await service.getLeaderboard(
        'user-5',
        LeaderboardType.WEEKLY,
        50,
        0,
      );

      expect(result.currentUserRank).toBe(0);
      expect(result.currentUserEntry).toBeNull();
    });

    it('should handle empty weekly leaderboard', async () => {
      mockPrismaService.lessonCompletion.groupBy.mockResolvedValue([]);
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.lessonCompletion.aggregate.mockResolvedValue({
        _sum: { xpEarned: 0 },
      });

      const result = await service.getLeaderboard(
        'user-1',
        LeaderboardType.WEEKLY,
        50,
        0,
      );

      expect(result.entries).toHaveLength(0);
      expect(result.currentUserRank).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should handle null weekly XP sum', async () => {
      const mockWeeklyXpWithNull = [
        { userId: 'user-1', _sum: { xpEarned: null } },
      ];

      mockPrismaService.lessonCompletion.groupBy.mockResolvedValue(
        mockWeeklyXpWithNull,
      );
      mockPrismaService.user.findMany.mockResolvedValue([mockUsers[0]]);

      const result = await service.getLeaderboard(
        'user-2',
        LeaderboardType.WEEKLY,
        50,
        0,
      );

      expect(result.entries[0].totalXp).toBe(0);
    });

    it('should handle missing user data gracefully', async () => {
      mockPrismaService.lessonCompletion.groupBy.mockResolvedValue(
        mockWeeklyXp,
      );
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getLeaderboard(
        'user-4',
        LeaderboardType.WEEKLY,
        50,
        0,
      );

      expect(result.entries[0].displayName).toBe('Unknown');
      expect(result.entries[0].userId).toBe('');
    });
  });

  describe('getStartOfWeek', () => {
    it('should return start of week (Sunday at 00:00:00)', () => {
      jest.useFakeTimers();
      // Thursday, Dec 11, 2025 at 15:30:45
      jest.setSystemTime(new Date('2025-12-11T15:30:45Z'));

      const startOfWeek = (service as any).getStartOfWeek();

      // Verify it's a Sunday
      expect(startOfWeek.getDay()).toBe(0); // 0 = Sunday
      // Verify time is set to 00:00:00.000
      expect(startOfWeek.getHours()).toBe(0);
      expect(startOfWeek.getMinutes()).toBe(0);
      expect(startOfWeek.getSeconds()).toBe(0);
      expect(startOfWeek.getMilliseconds()).toBe(0);

      jest.useRealTimers();
    });

    it('should handle Sunday correctly', () => {
      jest.useFakeTimers();
      // Sunday, Dec 7, 2025 at 10:00:00
      jest.setSystemTime(new Date('2025-12-07T10:00:00Z'));

      const startOfWeek = (service as any).getStartOfWeek();

      // Should be the same Sunday at 00:00:00
      expect(startOfWeek.getDay()).toBe(0);
      expect(startOfWeek.getHours()).toBe(0);
      expect(startOfWeek.getMinutes()).toBe(0);
      expect(startOfWeek.getSeconds()).toBe(0);

      jest.useRealTimers();
    });

    it('should handle Saturday correctly', () => {
      jest.useFakeTimers();
      // Saturday, Dec 13, 2025 at 23:59:59
      jest.setSystemTime(new Date('2025-12-13T23:59:59Z'));

      const startOfWeek = (service as any).getStartOfWeek();

      // Should be Sunday (day before Saturday in the same week)
      expect(startOfWeek.getDay()).toBe(0);
      expect(startOfWeek.getHours()).toBe(0);
      expect(startOfWeek.getMinutes()).toBe(0);
      expect(startOfWeek.getSeconds()).toBe(0);

      jest.useRealTimers();
    });
  });

  describe('edge cases', () => {
    it('should handle very large limit', async () => {
      mockPrismaService.userProgress.findMany.mockResolvedValue([]);

      await service.getLeaderboard('user-1', LeaderboardType.GLOBAL, 100, 0);

      expect(prisma.userProgress.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      );
    });

    it('should handle very large offset', async () => {
      mockPrismaService.userProgress.findMany.mockResolvedValue([]);

      await service.getLeaderboard('user-1', LeaderboardType.GLOBAL, 50, 1000);

      expect(prisma.userProgress.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1000,
        }),
      );
    });

    it('should set avatarUrl to null', async () => {
      const mockUsers = [
        {
          id: 'progress-1',
          userId: 'user-1',
          totalXp: 1500,
          level: 5,
          user: { id: 'user-1', displayName: 'User One' },
        },
      ];

      mockPrismaService.userProgress.findMany.mockResolvedValue(mockUsers);

      const result = await service.getLeaderboard(
        'user-1',
        LeaderboardType.GLOBAL,
        50,
        0,
      );

      expect(result.entries[0].avatarUrl).toBeNull();
    });
  });
});
