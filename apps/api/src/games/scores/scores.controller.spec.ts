import { Test, TestingModule } from '@nestjs/testing';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import {
  GameScoreResponseDto,
  GameLeaderboardResponseDto,
  UserPersonalBestsResponseDto,
} from './dto';

describe('ScoresController', () => {
  let controller: ScoresController;

  const mockScoresService = {
    submitScore: jest.fn(),
    getLeaderboardByUniqueUsers: jest.fn(),
    getUserPersonalBests: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScoresController],
      providers: [
        {
          provide: ScoresService,
          useValue: mockScoresService,
        },
      ],
    }).compile();

    controller = module.get<ScoresController>(ScoresController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submitScore', () => {
    it('should submit a score successfully', async () => {
      const user = { userId: 'user123' };
      const dto = {
        gameType: 'embedding-match',
        score: 850,
        level: 1,
        metadata: { timeRemaining: 45 },
      };

      const expectedResult: GameScoreResponseDto = {
        id: 'score123',
        userId: user.userId,
        displayName: 'John Doe',
        gameType: dto.gameType,
        score: dto.score,
        level: dto.level,
        metadata: dto.metadata,
        createdAt: new Date(),
      };

      mockScoresService.submitScore.mockResolvedValue(expectedResult);

      const result = await controller.submitScore(user, dto);

      expect(result).toEqual(expectedResult);
      expect(mockScoresService.submitScore).toHaveBeenCalledWith(user.userId, dto);
      expect(mockScoresService.submitScore).toHaveBeenCalledTimes(1);
    });

    it('should submit score without optional fields', async () => {
      const user = { userId: 'user456' };
      const dto = {
        gameType: 'token-tetris',
        score: 1200,
      };

      const expectedResult: GameScoreResponseDto = {
        id: 'score456',
        userId: user.userId,
        displayName: 'Jane Doe',
        gameType: dto.gameType,
        score: dto.score,
        createdAt: new Date(),
      };

      mockScoresService.submitScore.mockResolvedValue(expectedResult);

      const result = await controller.submitScore(user, dto);

      expect(result).toEqual(expectedResult);
      expect(mockScoresService.submitScore).toHaveBeenCalledWith(user.userId, dto);
    });

    it('should handle multiple score submissions', async () => {
      const user = { userId: 'user123' };
      const dto1 = { gameType: 'embedding-match', score: 850 };
      const dto2 = { gameType: 'embedding-match', score: 900 };

      const result1: GameScoreResponseDto = {
        id: 'score1',
        userId: user.userId,
        displayName: 'John Doe',
        gameType: dto1.gameType,
        score: dto1.score,
        createdAt: new Date(),
      };

      const result2: GameScoreResponseDto = {
        id: 'score2',
        userId: user.userId,
        displayName: 'John Doe',
        gameType: dto2.gameType,
        score: dto2.score,
        createdAt: new Date(),
      };

      mockScoresService.submitScore.mockResolvedValueOnce(result1).mockResolvedValueOnce(result2);

      const firstSubmit = await controller.submitScore(user, dto1);
      const secondSubmit = await controller.submitScore(user, dto2);

      expect(firstSubmit.score).toBe(850);
      expect(secondSubmit.score).toBe(900);
      expect(mockScoresService.submitScore).toHaveBeenCalledTimes(2);
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard for a game type', async () => {
      const user = { userId: 'user123' };
      const gameType = 'embedding-match';
      const query = { limit: 50, offset: 0 };

      const expectedResult: GameLeaderboardResponseDto = {
        gameType,
        scores: [
          {
            rank: 1,
            userId: 'user1',
            displayName: 'User One',
            score: 1000,
            level: 1,
            createdAt: new Date(),
            isCurrentUser: false,
          },
          {
            rank: 2,
            userId: user.userId,
            displayName: 'Current User',
            score: 850,
            level: 1,
            createdAt: new Date(),
            isCurrentUser: true,
          },
        ],
        total: 2,
        offset: 0,
        limit: 50,
      };

      mockScoresService.getLeaderboardByUniqueUsers.mockResolvedValue(expectedResult);

      const result = await controller.getLeaderboard(gameType, user, query);

      expect(result).toEqual(expectedResult);
      expect(mockScoresService.getLeaderboardByUniqueUsers).toHaveBeenCalledWith(
        gameType,
        user.userId,
        query.limit,
        query.offset,
        undefined
      );
    });

    it('should filter leaderboard by level', async () => {
      const user = { userId: 'user123' };
      const gameType = 'embedding-match';
      const query = { limit: 50, offset: 0, level: 2 };

      const expectedResult: GameLeaderboardResponseDto = {
        gameType,
        scores: [
          {
            rank: 1,
            userId: 'user1',
            displayName: 'User One',
            score: 950,
            level: 2,
            createdAt: new Date(),
            isCurrentUser: false,
          },
        ],
        total: 1,
        offset: 0,
        limit: 50,
      };

      mockScoresService.getLeaderboardByUniqueUsers.mockResolvedValue(expectedResult);

      const result = await controller.getLeaderboard(gameType, user, query);

      expect(result).toEqual(expectedResult);
      expect(mockScoresService.getLeaderboardByUniqueUsers).toHaveBeenCalledWith(
        gameType,
        user.userId,
        query.limit,
        query.offset,
        query.level
      );
    });

    it('should handle pagination parameters', async () => {
      const user = { userId: 'user123' };
      const gameType = 'embedding-match';
      const query = { limit: 10, offset: 20 };

      const expectedResult: GameLeaderboardResponseDto = {
        gameType,
        scores: [],
        total: 100,
        offset: 20,
        limit: 10,
      };

      mockScoresService.getLeaderboardByUniqueUsers.mockResolvedValue(expectedResult);

      const result = await controller.getLeaderboard(gameType, user, query);

      expect(result.offset).toBe(20);
      expect(result.limit).toBe(10);
      expect(mockScoresService.getLeaderboardByUniqueUsers).toHaveBeenCalledWith(
        gameType,
        user.userId,
        10,
        20,
        undefined
      );
    });

    it('should handle different game types', async () => {
      const user = { userId: 'user123' };
      const gameTypes = ['embedding-match', 'token-tetris', 'prompt-golf'];
      const query = { limit: 50, offset: 0 };

      for (const gameType of gameTypes) {
        const expectedResult: GameLeaderboardResponseDto = {
          gameType,
          scores: [],
          total: 0,
          offset: 0,
          limit: 50,
        };

        mockScoresService.getLeaderboardByUniqueUsers.mockResolvedValue(expectedResult);

        const result = await controller.getLeaderboard(gameType, user, query);

        expect(result.gameType).toBe(gameType);
        expect(mockScoresService.getLeaderboardByUniqueUsers).toHaveBeenCalledWith(
          gameType,
          user.userId,
          query.limit,
          query.offset,
          undefined
        );
      }
    });

    it('should mark current user correctly', async () => {
      const user = { userId: 'user123' };
      const gameType = 'embedding-match';
      const query = { limit: 50, offset: 0 };

      const expectedResult: GameLeaderboardResponseDto = {
        gameType,
        scores: [
          {
            rank: 1,
            userId: 'other-user',
            displayName: 'Other User',
            score: 1000,
            createdAt: new Date(),
            isCurrentUser: false,
          },
          {
            rank: 2,
            userId: user.userId,
            displayName: 'Current User',
            score: 850,
            createdAt: new Date(),
            isCurrentUser: true,
          },
        ],
        total: 2,
        offset: 0,
        limit: 50,
      };

      mockScoresService.getLeaderboardByUniqueUsers.mockResolvedValue(expectedResult);

      const result = await controller.getLeaderboard(gameType, user, query);

      expect(result.scores[0].isCurrentUser).toBe(false);
      expect(result.scores[1].isCurrentUser).toBe(true);
    });
  });

  describe('getPersonalBests', () => {
    it('should return personal bests for all games', async () => {
      const user = { userId: 'user123' };

      const expectedResult: UserPersonalBestsResponseDto = {
        personalBests: [
          {
            gameType: 'embedding-match',
            bestScore: 850,
            level: 1,
            achievedAt: new Date(),
            totalAttempts: 10,
          },
          {
            gameType: 'token-tetris',
            bestScore: 1200,
            achievedAt: new Date(),
            totalAttempts: 5,
          },
        ],
      };

      mockScoresService.getUserPersonalBests.mockResolvedValue(expectedResult);

      const result = await controller.getPersonalBests(user);

      expect(result).toEqual(expectedResult);
      expect(result.personalBests).toHaveLength(2);
      expect(mockScoresService.getUserPersonalBests).toHaveBeenCalledWith(user.userId);
    });

    it('should return empty array if user has no scores', async () => {
      const user = { userId: 'user123' };

      const expectedResult: UserPersonalBestsResponseDto = {
        personalBests: [],
      };

      mockScoresService.getUserPersonalBests.mockResolvedValue(expectedResult);

      const result = await controller.getPersonalBests(user);

      expect(result.personalBests).toEqual([]);
      expect(mockScoresService.getUserPersonalBests).toHaveBeenCalledWith(user.userId);
    });

    it('should include all game statistics', async () => {
      const user = { userId: 'user123' };

      const expectedResult: UserPersonalBestsResponseDto = {
        personalBests: [
          {
            gameType: 'embedding-match',
            bestScore: 950,
            level: 3,
            achievedAt: new Date('2025-12-01'),
            totalAttempts: 25,
          },
        ],
      };

      mockScoresService.getUserPersonalBests.mockResolvedValue(expectedResult);

      const result = await controller.getPersonalBests(user);

      expect(result.personalBests[0].bestScore).toBe(950);
      expect(result.personalBests[0].level).toBe(3);
      expect(result.personalBests[0].totalAttempts).toBe(25);
      expect(result.personalBests[0].achievedAt).toEqual(new Date('2025-12-01'));
    });

    it('should handle multiple games with varying data', async () => {
      const user = { userId: 'user123' };

      const expectedResult: UserPersonalBestsResponseDto = {
        personalBests: [
          {
            gameType: 'embedding-match',
            bestScore: 850,
            level: 1,
            achievedAt: new Date(),
            totalAttempts: 10,
          },
          {
            gameType: 'token-tetris',
            bestScore: 1200,
            achievedAt: new Date(),
            totalAttempts: 5,
          },
          {
            gameType: 'prompt-golf',
            bestScore: 42,
            level: 5,
            achievedAt: new Date(),
            totalAttempts: 15,
          },
        ],
      };

      mockScoresService.getUserPersonalBests.mockResolvedValue(expectedResult);

      const result = await controller.getPersonalBests(user);

      expect(result.personalBests).toHaveLength(3);
      expect(result.personalBests.every((pb) => pb.bestScore > 0)).toBe(true);
      expect(result.personalBests.every((pb) => pb.totalAttempts > 0)).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete user game flow', async () => {
      const user = { userId: 'user123' };
      const gameType = 'embedding-match';

      // 1. Submit first score
      const submitDto1 = { gameType, score: 750, level: 1 };
      const scoreResult1: GameScoreResponseDto = {
        id: 'score1',
        userId: user.userId,
        displayName: 'John Doe',
        gameType,
        score: 750,
        level: 1,
        createdAt: new Date(),
      };
      mockScoresService.submitScore.mockResolvedValueOnce(scoreResult1);

      // 2. Submit improved score
      const submitDto2 = { gameType, score: 900, level: 1 };
      const scoreResult2: GameScoreResponseDto = {
        id: 'score2',
        userId: user.userId,
        displayName: 'John Doe',
        gameType,
        score: 900,
        level: 1,
        createdAt: new Date(),
      };
      mockScoresService.submitScore.mockResolvedValueOnce(scoreResult2);

      // 3. Check personal bests
      const personalBestsResult: UserPersonalBestsResponseDto = {
        personalBests: [
          {
            gameType,
            bestScore: 900,
            level: 1,
            achievedAt: new Date(),
            totalAttempts: 2,
          },
        ],
      };
      mockScoresService.getUserPersonalBests.mockResolvedValue(personalBestsResult);

      // 4. Check leaderboard
      const leaderboardResult: GameLeaderboardResponseDto = {
        gameType,
        scores: [
          {
            rank: 1,
            userId: user.userId,
            displayName: 'John Doe',
            score: 900,
            level: 1,
            createdAt: new Date(),
            isCurrentUser: true,
          },
        ],
        total: 1,
        offset: 0,
        limit: 50,
      };
      mockScoresService.getLeaderboardByUniqueUsers.mockResolvedValue(leaderboardResult);

      await controller.submitScore(user, submitDto1);
      await controller.submitScore(user, submitDto2);
      const personalBests = await controller.getPersonalBests(user);
      const leaderboard = await controller.getLeaderboard(gameType, user, {
        limit: 50,
        offset: 0,
      });

      expect(personalBests.personalBests[0].bestScore).toBe(900);
      expect(leaderboard.scores[0].score).toBe(900);
    });
  });
});
