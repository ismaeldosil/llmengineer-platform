import { Test, TestingModule } from '@nestjs/testing';
import { ScoresService } from './scores.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ScoresService', () => {
  let service: ScoresService;

  const mockPrismaService = {
    gameScore: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoresService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ScoresService>(ScoresService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitScore', () => {
    it('should successfully submit a score', async () => {
      const userId = 'user123';
      const dto = {
        gameType: 'embedding-match',
        score: 850,
        level: 1,
        metadata: { timeRemaining: 45 },
      };

      const mockCreatedScore = {
        id: 'score123',
        userId,
        gameType: dto.gameType,
        score: dto.score,
        level: dto.level,
        metadata: dto.metadata,
        createdAt: new Date(),
        user: {
          id: userId,
          displayName: 'John Doe',
        },
      };

      mockPrismaService.gameScore.create.mockResolvedValue(mockCreatedScore);

      const result = await service.submitScore(userId, dto);

      expect(result).toEqual({
        id: mockCreatedScore.id,
        userId: mockCreatedScore.userId,
        displayName: mockCreatedScore.user.displayName,
        gameType: mockCreatedScore.gameType,
        score: mockCreatedScore.score,
        level: mockCreatedScore.level,
        metadata: mockCreatedScore.metadata,
        createdAt: mockCreatedScore.createdAt,
      });

      expect(mockPrismaService.gameScore.create).toHaveBeenCalledWith({
        data: {
          userId,
          gameType: dto.gameType,
          score: dto.score,
          level: dto.level,
          metadata: dto.metadata,
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      });
    });

    it('should submit score without optional fields', async () => {
      const userId = 'user123';
      const dto = {
        gameType: 'token-tetris',
        score: 1200,
      };

      const mockCreatedScore = {
        id: 'score456',
        userId,
        gameType: dto.gameType,
        score: dto.score,
        level: null,
        metadata: {},
        createdAt: new Date(),
        user: {
          id: userId,
          displayName: 'Jane Doe',
        },
      };

      mockPrismaService.gameScore.create.mockResolvedValue(mockCreatedScore);

      const result = await service.submitScore(userId, dto);

      expect(result.level).toBeUndefined();
      // metadata is set to undefined when not provided
      expect(result.metadata).toBeUndefined();
      expect(mockPrismaService.gameScore.create).toHaveBeenCalledWith({
        data: {
          userId,
          gameType: dto.gameType,
          score: dto.score,
          level: undefined,
          metadata: undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      });
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard with top scores', async () => {
      const gameType = 'embedding-match';
      const userId = 'user123';
      const limit = 10;
      const offset = 0;

      const mockScores = [
        {
          id: 'score1',
          userId: 'user1',
          score: 1000,
          level: 1,
          createdAt: new Date(),
          user: { id: 'user1', displayName: 'User One' },
        },
        {
          id: 'score2',
          userId: userId,
          score: 850,
          level: 1,
          createdAt: new Date(),
          user: { id: userId, displayName: 'Current User' },
        },
      ];

      mockPrismaService.gameScore.findMany.mockResolvedValue(mockScores);
      mockPrismaService.gameScore.count.mockResolvedValue(2);

      const result = await service.getLeaderboard(gameType, userId, limit, offset);

      expect(result.gameType).toBe(gameType);
      expect(result.scores).toHaveLength(2);
      expect(result.scores[0].rank).toBe(1);
      expect(result.scores[0].score).toBe(1000);
      expect(result.scores[1].rank).toBe(2);
      expect(result.scores[1].isCurrentUser).toBe(true);
      expect(result.total).toBe(2);
      expect(result.offset).toBe(offset);
      expect(result.limit).toBe(limit);
    });

    it('should filter by level when provided', async () => {
      const gameType = 'embedding-match';
      const userId = 'user123';
      const level = 2;

      mockPrismaService.gameScore.findMany.mockResolvedValue([]);
      mockPrismaService.gameScore.count.mockResolvedValue(0);

      await service.getLeaderboard(gameType, userId, 10, 0, level);

      expect(mockPrismaService.gameScore.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { gameType, level },
        })
      );
    });

    it('should handle pagination correctly', async () => {
      const gameType = 'embedding-match';
      const userId = 'user123';
      const limit = 5;
      const offset = 10;

      const mockScores = Array.from({ length: 5 }, (_, i) => ({
        id: `score${i}`,
        userId: `user${i}`,
        score: 100 - i,
        level: 1,
        createdAt: new Date(),
        user: { id: `user${i}`, displayName: `User ${i}` },
      }));

      mockPrismaService.gameScore.findMany.mockResolvedValue(mockScores);
      mockPrismaService.gameScore.count.mockResolvedValue(50);

      const result = await service.getLeaderboard(gameType, userId, limit, offset);

      expect(result.scores[0].rank).toBe(11); // offset + 1
      expect(result.scores[4].rank).toBe(15); // offset + 5
    });
  });

  describe('getLeaderboardByUniqueUsers', () => {
    it('should return best score per user', async () => {
      const gameType = 'embedding-match';
      const userId = 'user123';

      const mockRawScores = [
        {
          id: 'score1',
          user_id: 'user1',
          game_type: gameType,
          score: 1000,
          level: 1,
          metadata: {},
          created_at: new Date().toISOString(),
          display_name: 'User One',
          rn: 1,
        },
        {
          id: 'score2',
          user_id: userId,
          game_type: gameType,
          score: 850,
          level: 1,
          metadata: {},
          created_at: new Date().toISOString(),
          display_name: 'Current User',
          rn: 1,
        },
      ];

      const mockCountResult = [{ count: BigInt(2) }];

      mockPrismaService.$queryRawUnsafe
        .mockResolvedValueOnce(mockRawScores)
        .mockResolvedValueOnce(mockCountResult);

      const result = await service.getLeaderboardByUniqueUsers(gameType, userId, 10, 0);

      expect(result.scores).toHaveLength(2);
      expect(result.scores[0].rank).toBe(1);
      expect(result.scores[1].isCurrentUser).toBe(true);
      expect(result.total).toBe(2);
    });

    it('should filter by level in unique users leaderboard', async () => {
      const gameType = 'embedding-match';
      const userId = 'user123';
      const level = 2;

      mockPrismaService.$queryRawUnsafe
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: BigInt(0) }]);

      await service.getLeaderboardByUniqueUsers(gameType, userId, 10, 0, level);

      expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('AND gs.level = $2'),
        gameType,
        level,
        10,
        0
      );
    });
  });

  describe('getUserPersonalBests', () => {
    it('should return personal bests for all games', async () => {
      const userId = 'user123';

      const mockGameTypes = [{ gameType: 'embedding-match' }, { gameType: 'token-tetris' }];

      const mockBestScore1 = {
        id: 'score1',
        userId,
        gameType: 'embedding-match',
        score: 850,
        level: 1,
        metadata: {},
        createdAt: new Date(),
      };

      const mockBestScore2 = {
        id: 'score2',
        userId,
        gameType: 'token-tetris',
        score: 1200,
        level: null,
        metadata: {},
        createdAt: new Date(),
      };

      mockPrismaService.gameScore.findMany.mockResolvedValue(mockGameTypes);
      mockPrismaService.gameScore.findFirst
        .mockResolvedValueOnce(mockBestScore1)
        .mockResolvedValueOnce(mockBestScore2);
      mockPrismaService.gameScore.count.mockResolvedValueOnce(5).mockResolvedValueOnce(3);

      const result = await service.getUserPersonalBests(userId);

      expect(result.personalBests).toHaveLength(2);
      expect(result.personalBests[0].gameType).toBe('embedding-match');
      expect(result.personalBests[0].bestScore).toBe(850);
      expect(result.personalBests[0].totalAttempts).toBe(5);
      expect(result.personalBests[1].gameType).toBe('token-tetris');
      expect(result.personalBests[1].bestScore).toBe(1200);
      expect(result.personalBests[1].totalAttempts).toBe(3);
    });

    it('should return empty array if user has no scores', async () => {
      const userId = 'user123';

      mockPrismaService.gameScore.findMany.mockResolvedValue([]);

      const result = await service.getUserPersonalBests(userId);

      expect(result.personalBests).toEqual([]);
    });
  });

  describe('getUserPersonalBestForGame', () => {
    it('should return personal best for specific game', async () => {
      const userId = 'user123';
      const gameType = 'embedding-match';

      const mockBestScore = {
        id: 'score1',
        userId,
        gameType,
        score: 850,
        level: 1,
        metadata: {},
        createdAt: new Date(),
      };

      mockPrismaService.gameScore.findFirst.mockResolvedValue(mockBestScore);
      mockPrismaService.gameScore.count.mockResolvedValue(10);

      const result = await service.getUserPersonalBestForGame(userId, gameType);

      expect(result).not.toBeNull();
      expect(result?.gameType).toBe(gameType);
      expect(result?.bestScore).toBe(850);
      expect(result?.totalAttempts).toBe(10);
    });

    it('should return null if user has no scores for game', async () => {
      const userId = 'user123';
      const gameType = 'embedding-match';

      mockPrismaService.gameScore.findFirst.mockResolvedValue(null);

      const result = await service.getUserPersonalBestForGame(userId, gameType);

      expect(result).toBeNull();
    });
  });

  describe('getUserRank', () => {
    it('should return user rank based on best score', async () => {
      const userId = 'user123';
      const gameType = 'embedding-match';

      const mockUserBestScore = {
        id: 'score1',
        userId,
        gameType,
        score: 850,
        level: 1,
        metadata: {},
        createdAt: new Date(),
      };

      const mockCountResult = [{ count: BigInt(2) }];

      mockPrismaService.gameScore.findFirst.mockResolvedValue(mockUserBestScore);
      mockPrismaService.$queryRawUnsafe.mockResolvedValue(mockCountResult);

      const rank = await service.getUserRank(userId, gameType);

      expect(rank).toBe(3); // 2 better + 1
    });

    it('should return 0 if user has no scores', async () => {
      const userId = 'user123';
      const gameType = 'embedding-match';

      mockPrismaService.gameScore.findFirst.mockResolvedValue(null);

      const rank = await service.getUserRank(userId, gameType);

      expect(rank).toBe(0);
    });

    it('should filter by level when calculating rank', async () => {
      const userId = 'user123';
      const gameType = 'embedding-match';
      const level = 2;

      const mockUserBestScore = {
        id: 'score1',
        userId,
        gameType,
        score: 850,
        level,
        metadata: {},
        createdAt: new Date(),
      };

      mockPrismaService.gameScore.findFirst.mockResolvedValue(mockUserBestScore);
      mockPrismaService.$queryRawUnsafe.mockResolvedValue([{ count: BigInt(0) }]);

      await service.getUserRank(userId, gameType, level);

      expect(mockPrismaService.gameScore.findFirst).toHaveBeenCalledWith({
        where: { userId, gameType, level },
        orderBy: { score: 'desc' },
      });
    });
  });

  describe('deleteScore', () => {
    it('should successfully delete a score', async () => {
      const scoreId = 'score123';

      const mockScore = {
        id: scoreId,
        userId: 'user123',
        gameType: 'embedding-match',
        score: 850,
        level: 1,
        metadata: {},
        createdAt: new Date(),
      };

      mockPrismaService.gameScore.findUnique.mockResolvedValue(mockScore);
      mockPrismaService.gameScore.delete.mockResolvedValue(mockScore);

      await service.deleteScore(scoreId);

      expect(mockPrismaService.gameScore.delete).toHaveBeenCalledWith({
        where: { id: scoreId },
      });
    });

    it('should throw NotFoundException if score does not exist', async () => {
      const scoreId = 'nonexistent';

      mockPrismaService.gameScore.findUnique.mockResolvedValue(null);

      await expect(service.deleteScore(scoreId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.gameScore.delete).not.toHaveBeenCalled();
    });
  });
});
