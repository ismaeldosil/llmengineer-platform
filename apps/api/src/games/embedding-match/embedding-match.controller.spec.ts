import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EmbeddingMatchController } from './embedding-match.controller';
import { EmbeddingMatchService } from './embedding-match.service';
import { VerifyMatchDto, SubmitScoreDto } from './dto';

describe('EmbeddingMatchController', () => {
  let controller: EmbeddingMatchController;
  let service: EmbeddingMatchService;

  const mockEmbeddingMatchService = {
    getLevel: jest.fn(),
    verifyMatch: jest.fn(),
    getLevelConfig: jest.fn(),
    getAllLevels: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmbeddingMatchController],
      providers: [
        {
          provide: EmbeddingMatchService,
          useValue: mockEmbeddingMatchService,
        },
      ],
    }).compile();

    controller = module.get<EmbeddingMatchController>(EmbeddingMatchController);
    service = module.get<EmbeddingMatchService>(EmbeddingMatchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLevel', () => {
    it('should return level configuration with cards', () => {
      const mockLevel = {
        level: 1,
        timeLimit: 60,
        cards: [
          {
            id: 'card-1-0',
            text: 'machine learning',
            pairId: '1',
          },
          {
            id: 'card-1-1',
            text: 'artificial intelligence',
            pairId: '1',
          },
          {
            id: 'card-1-2',
            text: 'vector database',
            pairId: '2',
          },
          {
            id: 'card-1-3',
            text: 'embedding storage',
            pairId: '2',
          },
        ],
      };

      mockEmbeddingMatchService.getLevel.mockReturnValue(mockLevel);

      const result = controller.getLevel(1);

      expect(result).toEqual(mockLevel);
      expect(service.getLevel).toHaveBeenCalledWith(1);
      expect(service.getLevel).toHaveBeenCalledTimes(1);
    });

    it('should call service with correct level number', () => {
      const mockLevel = {
        level: 2,
        timeLimit: 90,
        cards: [],
      };

      mockEmbeddingMatchService.getLevel.mockReturnValue(mockLevel);

      controller.getLevel(2);

      expect(service.getLevel).toHaveBeenCalledWith(2);
    });

    it('should throw NotFoundException when level does not exist', () => {
      mockEmbeddingMatchService.getLevel.mockImplementation(() => {
        throw new NotFoundException('Level 4 not found');
      });

      expect(() => controller.getLevel(4)).toThrow(NotFoundException);
    });

    it('should handle level 3', () => {
      const mockLevel = {
        level: 3,
        timeLimit: 120,
        cards: [],
      };

      mockEmbeddingMatchService.getLevel.mockReturnValue(mockLevel);

      const result = controller.getLevel(3);

      expect(result.level).toBe(3);
      expect(result.timeLimit).toBe(120);
    });
  });

  describe('verifyMatch', () => {
    it('should verify matching cards and return true', () => {
      const dto: VerifyMatchDto = {
        cardId1: 'card-1-0',
        cardId2: 'card-1-1',
      };

      const mockResponse = {
        isMatch: true,
        similarity: 0.85,
      };

      mockEmbeddingMatchService.verifyMatch.mockReturnValue(mockResponse);

      const result = controller.verifyMatch(dto);

      expect(result).toEqual(mockResponse);
      expect(service.verifyMatch).toHaveBeenCalledWith(dto.cardId1, dto.cardId2);
      expect(service.verifyMatch).toHaveBeenCalledTimes(1);
    });

    it('should verify non-matching cards and return false', () => {
      const dto: VerifyMatchDto = {
        cardId1: 'card-1-0',
        cardId2: 'card-1-2',
      };

      const mockResponse = {
        isMatch: false,
        similarity: 0.3,
      };

      mockEmbeddingMatchService.verifyMatch.mockReturnValue(mockResponse);

      const result = controller.verifyMatch(dto);

      expect(result.isMatch).toBe(false);
      expect(result.similarity).toBe(0.3);
    });

    it('should throw BadRequestException when cards are the same', () => {
      const dto: VerifyMatchDto = {
        cardId1: 'card-1-0',
        cardId2: 'card-1-0',
      };

      mockEmbeddingMatchService.verifyMatch.mockImplementation(() => {
        throw new BadRequestException('Cannot match a card with itself');
      });

      expect(() => controller.verifyMatch(dto)).toThrow(BadRequestException);
    });

    it('should throw NotFoundException for invalid card IDs', () => {
      const dto: VerifyMatchDto = {
        cardId1: 'invalid-1',
        cardId2: 'invalid-2',
      };

      mockEmbeddingMatchService.verifyMatch.mockImplementation(() => {
        throw new NotFoundException('One or both cards not found');
      });

      expect(() => controller.verifyMatch(dto)).toThrow(NotFoundException);
    });

    it('should return similarity score in response', () => {
      const dto: VerifyMatchDto = {
        cardId1: 'card-1-0',
        cardId2: 'card-1-1',
      };

      const mockResponse = {
        isMatch: true,
        similarity: 0.92,
      };

      mockEmbeddingMatchService.verifyMatch.mockReturnValue(mockResponse);

      const result = controller.verifyMatch(dto);

      expect(result.similarity).toBeDefined();
      expect(result.similarity).toBe(0.92);
    });
  });

  describe('submitScore', () => {
    it('should accept and acknowledge score submission', () => {
      const dto: SubmitScoreDto = {
        level: 1,
        score: 850,
        timeRemaining: 45,
      };

      const result = controller.submitScore(dto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.score).toBe(850);
      expect(result.level).toBe(1);
      expect(result.timeRemaining).toBe(45);
      expect(result.message).toBe('Score submitted successfully');
    });

    it('should handle level 2 score submission', () => {
      const dto: SubmitScoreDto = {
        level: 2,
        score: 1200,
        timeRemaining: 60,
      };

      const result = controller.submitScore(dto);

      expect(result.success).toBe(true);
      expect(result.level).toBe(2);
    });

    it('should handle level 3 score submission', () => {
      const dto: SubmitScoreDto = {
        level: 3,
        score: 2000,
        timeRemaining: 80,
      };

      const result = controller.submitScore(dto);

      expect(result.success).toBe(true);
      expect(result.level).toBe(3);
    });

    it('should handle zero time remaining', () => {
      const dto: SubmitScoreDto = {
        level: 1,
        score: 500,
        timeRemaining: 0,
      };

      const result = controller.submitScore(dto);

      expect(result.success).toBe(true);
      expect(result.timeRemaining).toBe(0);
    });

    it('should handle low scores', () => {
      const dto: SubmitScoreDto = {
        level: 1,
        score: 100,
        timeRemaining: 5,
      };

      const result = controller.submitScore(dto);

      expect(result.success).toBe(true);
      expect(result.score).toBe(100);
    });

    it('should handle high scores', () => {
      const dto: SubmitScoreDto = {
        level: 3,
        score: 5000,
        timeRemaining: 100,
      };

      const result = controller.submitScore(dto);

      expect(result.success).toBe(true);
      expect(result.score).toBe(5000);
    });
  });

  describe('endpoint responses', () => {
    it('getLevel should return correct structure', () => {
      const mockLevel = {
        level: 1,
        timeLimit: 60,
        cards: [
          {
            id: 'card-1-0',
            text: 'test',
            pairId: '1',
          },
        ],
      };

      mockEmbeddingMatchService.getLevel.mockReturnValue(mockLevel);

      const result = controller.getLevel(1);

      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('timeLimit');
      expect(result).toHaveProperty('cards');
      expect(Array.isArray(result.cards)).toBe(true);
    });

    it('verifyMatch should return correct structure', () => {
      const dto: VerifyMatchDto = {
        cardId1: 'card-1-0',
        cardId2: 'card-1-1',
      };

      const mockResponse = {
        isMatch: true,
        similarity: 0.85,
      };

      mockEmbeddingMatchService.verifyMatch.mockReturnValue(mockResponse);

      const result = controller.verifyMatch(dto);

      expect(result).toHaveProperty('isMatch');
      expect(result).toHaveProperty('similarity');
      expect(typeof result.isMatch).toBe('boolean');
      expect(typeof result.similarity).toBe('number');
    });

    it('submitScore should return correct structure', () => {
      const dto: SubmitScoreDto = {
        level: 1,
        score: 850,
        timeRemaining: 45,
      };

      const result = controller.submitScore(dto);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('timeRemaining');
      expect(result).toHaveProperty('message');
    });
  });
});
