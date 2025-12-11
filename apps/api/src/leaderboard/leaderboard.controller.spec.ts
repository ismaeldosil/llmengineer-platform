import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import {
  LeaderboardQueryDto,
  LeaderboardType,
  LeaderboardResponseDto,
} from './dto';

describe('LeaderboardController', () => {
  let controller: LeaderboardController;
  let service: LeaderboardService;

  const mockLeaderboardService = {
    getLeaderboard: jest.fn(),
  };

  const mockUser = { id: 'test-user-id' };

  const mockLeaderboardResponse: LeaderboardResponseDto = {
    entries: [
      {
        rank: 1,
        userId: 'user-1',
        displayName: 'Top User',
        avatarUrl: null,
        totalXp: 2000,
        level: 6,
        isCurrentUser: false,
      },
      {
        rank: 2,
        userId: 'test-user-id',
        displayName: 'Test User',
        avatarUrl: null,
        totalXp: 1500,
        level: 5,
        isCurrentUser: true,
      },
    ],
    currentUserRank: 2,
    currentUserEntry: null,
    total: 2,
    offset: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderboardController],
      providers: [
        {
          provide: LeaderboardService,
          useValue: mockLeaderboardService,
        },
      ],
    }).compile();

    controller = module.get<LeaderboardController>(LeaderboardController);
    service = module.get<LeaderboardService>(LeaderboardService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLeaderboard', () => {
    it('should return global leaderboard with default parameters', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        mockLeaderboardResponse,
      );

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 0,
      };

      const result = await controller.getLeaderboard(query, mockUser);

      expect(service.getLeaderboard).toHaveBeenCalledWith(
        'test-user-id',
        LeaderboardType.GLOBAL,
        50,
        0,
      );
      expect(result).toEqual(mockLeaderboardResponse);
    });

    it('should return weekly leaderboard when type is weekly', async () => {
      const weeklyResponse: LeaderboardResponseDto = {
        ...mockLeaderboardResponse,
        entries: [
          {
            rank: 1,
            userId: 'user-1',
            displayName: 'Weekly Top User',
            avatarUrl: null,
            totalXp: 500,
            level: 6,
            isCurrentUser: false,
          },
        ],
        total: 1,
      };

      mockLeaderboardService.getLeaderboard.mockResolvedValue(weeklyResponse);

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.WEEKLY,
        limit: 50,
        offset: 0,
      };

      const result = await controller.getLeaderboard(query, mockUser);

      expect(service.getLeaderboard).toHaveBeenCalledWith(
        'test-user-id',
        LeaderboardType.WEEKLY,
        50,
        0,
      );
      expect(result).toEqual(weeklyResponse);
    });

    it('should handle custom limit', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        mockLeaderboardResponse,
      );

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 25,
        offset: 0,
      };

      await controller.getLeaderboard(query, mockUser);

      expect(service.getLeaderboard).toHaveBeenCalledWith(
        'test-user-id',
        LeaderboardType.GLOBAL,
        25,
        0,
      );
    });

    it('should handle custom offset for pagination', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue({
        ...mockLeaderboardResponse,
        offset: 50,
      });

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 50,
      };

      await controller.getLeaderboard(query, mockUser);

      expect(service.getLeaderboard).toHaveBeenCalledWith(
        'test-user-id',
        LeaderboardType.GLOBAL,
        50,
        50,
      );
    });

    it('should use default values when query parameters are undefined', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        mockLeaderboardResponse,
      );

      const query: LeaderboardQueryDto = {
        type: undefined as any,
        limit: undefined as any,
        offset: undefined as any,
      };

      await controller.getLeaderboard(query, mockUser);

      expect(service.getLeaderboard).toHaveBeenCalledWith(
        'test-user-id',
        LeaderboardType.GLOBAL,
        50,
        0,
      );
    });

    it('should handle maximum limit of 100', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        mockLeaderboardResponse,
      );

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 100,
        offset: 0,
      };

      await controller.getLeaderboard(query, mockUser);

      expect(service.getLeaderboard).toHaveBeenCalledWith(
        'test-user-id',
        LeaderboardType.GLOBAL,
        100,
        0,
      );
    });

    it('should handle minimum limit of 1', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue({
        ...mockLeaderboardResponse,
        entries: [mockLeaderboardResponse.entries[0]],
        total: 1,
      });

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 1,
        offset: 0,
      };

      await controller.getLeaderboard(query, mockUser);

      expect(service.getLeaderboard).toHaveBeenCalledWith(
        'test-user-id',
        LeaderboardType.GLOBAL,
        1,
        0,
      );
    });

    it('should return user rank when user is not in top list', async () => {
      const responseWithUserOutsideTop: LeaderboardResponseDto = {
        entries: [
          {
            rank: 1,
            userId: 'user-1',
            displayName: 'Top User',
            avatarUrl: null,
            totalXp: 2000,
            level: 6,
            isCurrentUser: false,
          },
        ],
        currentUserRank: 50,
        currentUserEntry: {
          rank: 50,
          userId: 'test-user-id',
          displayName: 'Test User',
          avatarUrl: null,
          totalXp: 500,
          level: 2,
          isCurrentUser: true,
        },
        total: 1,
        offset: 0,
      };

      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        responseWithUserOutsideTop,
      );

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 0,
      };

      const result = await controller.getLeaderboard(query, mockUser);

      expect(result.currentUserRank).toBe(50);
      expect(result.currentUserEntry).toBeDefined();
      expect(result.currentUserEntry?.isCurrentUser).toBe(true);
    });

    it('should handle empty leaderboard', async () => {
      const emptyResponse: LeaderboardResponseDto = {
        entries: [],
        currentUserRank: 0,
        currentUserEntry: null,
        total: 0,
        offset: 0,
      };

      mockLeaderboardService.getLeaderboard.mockResolvedValue(emptyResponse);

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 0,
      };

      const result = await controller.getLeaderboard(query, mockUser);

      expect(result.entries).toHaveLength(0);
      expect(result.currentUserRank).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should extract user id from current user decorator', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        mockLeaderboardResponse,
      );

      const differentUser = { id: 'different-user-id' };
      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 0,
      };

      await controller.getLeaderboard(query, differentUser);

      expect(service.getLeaderboard).toHaveBeenCalledWith(
        'different-user-id',
        LeaderboardType.GLOBAL,
        50,
        0,
      );
    });

    it('should handle large offset for pagination', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue({
        ...mockLeaderboardResponse,
        entries: [],
        total: 0,
        offset: 500,
      });

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 500,
      };

      const result = await controller.getLeaderboard(query, mockUser);

      expect(service.getLeaderboard).toHaveBeenCalledWith(
        'test-user-id',
        LeaderboardType.GLOBAL,
        50,
        500,
      );
      expect(result.offset).toBe(500);
    });

    it('should handle weekly leaderboard with offset', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue({
        ...mockLeaderboardResponse,
        offset: 10,
      });

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.WEEKLY,
        limit: 20,
        offset: 10,
      };

      await controller.getLeaderboard(query, mockUser);

      expect(service.getLeaderboard).toHaveBeenCalledWith(
        'test-user-id',
        LeaderboardType.WEEKLY,
        20,
        10,
      );
    });

    it('should properly type the response as LeaderboardResponseDto', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        mockLeaderboardResponse,
      );

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 0,
      };

      const result = await controller.getLeaderboard(query, mockUser);

      // TypeScript type check - result should have LeaderboardResponseDto properties
      expect(result).toHaveProperty('entries');
      expect(result).toHaveProperty('currentUserRank');
      expect(result).toHaveProperty('currentUserEntry');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('offset');
    });

    it('should call service exactly once per request', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        mockLeaderboardResponse,
      );

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 0,
      };

      await controller.getLeaderboard(query, mockUser);

      expect(service.getLeaderboard).toHaveBeenCalledTimes(1);
    });
  });

  describe('query validation', () => {
    it('should accept valid global type', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        mockLeaderboardResponse,
      );

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 0,
      };

      await expect(
        controller.getLeaderboard(query, mockUser),
      ).resolves.toBeDefined();
    });

    it('should accept valid weekly type', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        mockLeaderboardResponse,
      );

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.WEEKLY,
        limit: 50,
        offset: 0,
      };

      await expect(
        controller.getLeaderboard(query, mockUser),
      ).resolves.toBeDefined();
    });
  });

  describe('response structure', () => {
    it('should return entries array', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        mockLeaderboardResponse,
      );

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 0,
      };

      const result = await controller.getLeaderboard(query, mockUser);

      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries.length).toBeGreaterThan(0);
    });

    it('should return entries with correct structure', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        mockLeaderboardResponse,
      );

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 0,
      };

      const result = await controller.getLeaderboard(query, mockUser);

      const entry = result.entries[0];
      expect(entry).toHaveProperty('rank');
      expect(entry).toHaveProperty('userId');
      expect(entry).toHaveProperty('displayName');
      expect(entry).toHaveProperty('avatarUrl');
      expect(entry).toHaveProperty('totalXp');
      expect(entry).toHaveProperty('level');
      expect(entry).toHaveProperty('isCurrentUser');
    });

    it('should return numeric currentUserRank', async () => {
      mockLeaderboardService.getLeaderboard.mockResolvedValue(
        mockLeaderboardResponse,
      );

      const query: LeaderboardQueryDto = {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 0,
      };

      const result = await controller.getLeaderboard(query, mockUser);

      expect(typeof result.currentUserRank).toBe('number');
      expect(result.currentUserRank).toBeGreaterThanOrEqual(0);
    });
  });
});
