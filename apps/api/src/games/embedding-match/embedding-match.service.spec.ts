import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EmbeddingMatchService } from './embedding-match.service';

describe('EmbeddingMatchService', () => {
  let service: EmbeddingMatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmbeddingMatchService],
    }).compile();

    service = module.get<EmbeddingMatchService>(EmbeddingMatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLevel', () => {
    it('should return level 1 with 8 cards (4 pairs)', () => {
      const result = service.getLevel(1);

      expect(result.level).toBe(1);
      expect(result.timeLimit).toBe(60);
      expect(result.cards).toHaveLength(8);

      // Check that we have 4 unique pairIds
      const pairIds = new Set(result.cards.map((card) => card.pairId));
      expect(pairIds.size).toBe(4);

      // Check that each pair appears exactly twice
      pairIds.forEach((pairId) => {
        const cardsWithPairId = result.cards.filter((card) => card.pairId === pairId);
        expect(cardsWithPairId).toHaveLength(2);
      });
    });

    it('should return level 2 with 12 cards (6 pairs)', () => {
      const result = service.getLevel(2);

      expect(result.level).toBe(2);
      expect(result.timeLimit).toBe(90);
      expect(result.cards).toHaveLength(12);

      const pairIds = new Set(result.cards.map((card) => card.pairId));
      expect(pairIds.size).toBe(6);
    });

    it('should return level 3 with 16 cards (8 pairs)', () => {
      const result = service.getLevel(3);

      expect(result.level).toBe(3);
      expect(result.timeLimit).toBe(120);
      expect(result.cards).toHaveLength(16);

      const pairIds = new Set(result.cards.map((card) => card.pairId));
      expect(pairIds.size).toBe(8);
    });

    it('should throw NotFoundException for invalid level', () => {
      expect(() => service.getLevel(4)).toThrow(NotFoundException);
      expect(() => service.getLevel(0)).toThrow(NotFoundException);
      expect(() => service.getLevel(-1)).toThrow(NotFoundException);
    });

    it('should return shuffled cards (not in original order)', () => {
      const result1 = service.getLevel(1);
      const result2 = service.getLevel(1);

      // The cards should be different between calls (very unlikely to be the same)
      // We check if at least one card is in a different position
      let isDifferent = false;
      for (let i = 0; i < result1.cards.length; i++) {
        if (result1.cards[i].id !== result2.cards[i].id) {
          isDifferent = true;
          break;
        }
      }

      // While it's possible they could be the same by chance,
      // it's extremely unlikely with 8 cards (1/40320 chance)
      expect(isDifferent).toBe(true);
    });

    it('should have unique card IDs', () => {
      const result = service.getLevel(1);
      const cardIds = result.cards.map((card) => card.id);
      const uniqueCardIds = new Set(cardIds);

      expect(uniqueCardIds.size).toBe(cardIds.length);
    });

    it('should have non-empty text for all cards', () => {
      const result = service.getLevel(1);

      result.cards.forEach((card) => {
        expect(card.text).toBeDefined();
        expect(card.text.length).toBeGreaterThan(0);
      });
    });
  });

  describe('verifyMatch', () => {
    it('should return isMatch: true for matching cards', () => {
      // Get a level to have valid card IDs
      const level = service.getLevel(1);

      // Find two cards with the same pairId
      const firstPairId = level.cards[0].pairId;
      const matchingCards = level.cards.filter((card) => card.pairId === firstPairId);

      expect(matchingCards).toHaveLength(2);

      const result = service.verifyMatch(matchingCards[0].id, matchingCards[1].id);

      expect(result.isMatch).toBe(true);
      expect(result.similarity).toBeGreaterThan(0.6);
      expect(result.similarity).toBeLessThanOrEqual(1.0);
    });

    it('should return isMatch: false for non-matching cards', () => {
      const level = service.getLevel(1);

      // Find two cards with different pairIds
      const pairIds = [...new Set(level.cards.map((card) => card.pairId))];
      const card1 = level.cards.find((card) => card.pairId === pairIds[0]);
      const card2 = level.cards.find((card) => card.pairId === pairIds[1]);

      expect(card1).toBeDefined();
      expect(card2).toBeDefined();

      const result = service.verifyMatch(card1!.id, card2!.id);

      expect(result.isMatch).toBe(false);
      expect(result.similarity).toBeDefined();
    });

    it('should throw BadRequestException when matching card with itself', () => {
      const level = service.getLevel(1);
      const cardId = level.cards[0].id;

      expect(() => service.verifyMatch(cardId, cardId)).toThrow(BadRequestException);
    });

    it('should return similarity score', () => {
      const level = service.getLevel(1);
      const card1 = level.cards[0];
      const card2 = level.cards[1];

      const result = service.verifyMatch(card1.id, card2.id);

      expect(result.similarity).toBeDefined();
      expect(typeof result.similarity).toBe('number');
      expect(result.similarity).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeLessThanOrEqual(1.0);
    });

    it('should return higher similarity for matching cards', () => {
      const level = service.getLevel(1);

      // Find matching cards
      const firstPairId = level.cards[0].pairId;
      const matchingCards = level.cards.filter((card) => card.pairId === firstPairId);

      // Find non-matching cards
      const pairIds = [...new Set(level.cards.map((card) => card.pairId))];
      const nonMatchCard1 = level.cards.find((card) => card.pairId === pairIds[0]);
      const nonMatchCard2 = level.cards.find((card) => card.pairId === pairIds[1]);

      const matchResult = service.verifyMatch(matchingCards[0].id, matchingCards[1].id);
      const nonMatchResult = service.verifyMatch(nonMatchCard1!.id, nonMatchCard2!.id);

      expect(matchResult.similarity).toBeGreaterThan(nonMatchResult.similarity!);
    });
  });

  describe('getLevelConfig', () => {
    it('should return config for valid level', () => {
      const config = service.getLevelConfig(1);

      expect(config).toBeDefined();
      expect(config?.level).toBe(1);
      expect(config?.cardsCount).toBe(8);
      expect(config?.pairsCount).toBe(4);
      expect(config?.timeLimit).toBe(60);
      expect(config?.difficulty).toBe('easy');
    });

    it('should return undefined for invalid level', () => {
      const config = service.getLevelConfig(999);

      expect(config).toBeUndefined();
    });
  });

  describe('getAllLevels', () => {
    it('should return all level configurations', () => {
      const levels = service.getAllLevels();

      expect(levels).toBeDefined();
      expect(levels).toHaveLength(3);
      expect(levels[0].level).toBe(1);
      expect(levels[1].level).toBe(2);
      expect(levels[2].level).toBe(3);
    });
  });

  describe('level difficulty', () => {
    it('should use easy difficulty pairs for level 1', () => {
      const level = service.getLevel(1);
      const config = service.getLevelConfig(1);

      expect(config?.difficulty).toBe('easy');
      expect(level.cards).toHaveLength(8);
    });

    it('should use medium difficulty pairs for level 2', () => {
      const level = service.getLevel(2);
      const config = service.getLevelConfig(2);

      expect(config?.difficulty).toBe('medium');
      expect(level.cards).toHaveLength(12);
    });

    it('should use hard difficulty pairs for level 3', () => {
      const level = service.getLevel(3);
      const config = service.getLevelConfig(3);

      expect(config?.difficulty).toBe('hard');
      expect(level.cards).toHaveLength(16);
    });
  });
});
