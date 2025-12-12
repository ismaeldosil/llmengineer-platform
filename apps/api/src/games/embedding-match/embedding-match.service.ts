import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GetLevelResponseDto, CardDto } from './dto/get-level.dto';
import { VerifyMatchResponseDto } from './dto/verify-match.dto';
import * as semanticPairsData from './data/semantic-pairs.json';

interface SemanticPair {
  pairId: string;
  text1: string;
  text2: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface LevelConfig {
  level: number;
  cardsCount: number; // Total cards (must be even)
  pairsCount: number; // Number of pairs
  timeLimit: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
}

@Injectable()
export class EmbeddingMatchService {
  private readonly semanticPairs: SemanticPair[];
  private readonly levelConfigs: LevelConfig[] = [
    {
      level: 1,
      cardsCount: 8,
      pairsCount: 4,
      timeLimit: 60,
      difficulty: 'easy',
    },
    {
      level: 2,
      cardsCount: 12,
      pairsCount: 6,
      timeLimit: 90,
      difficulty: 'medium',
    },
    {
      level: 3,
      cardsCount: 16,
      pairsCount: 8,
      timeLimit: 120,
      difficulty: 'hard',
    },
  ];

  // In-memory storage for active game sessions (card mappings)
  // In production, this should be Redis or similar
  private readonly activeSessions: Map<string, Map<string, string>> = new Map();

  constructor() {
    // Handle both default and named exports from JSON
    const data = Array.isArray(semanticPairsData)
      ? semanticPairsData
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (semanticPairsData as any).default || [];
    this.semanticPairs = data as SemanticPair[];
  }

  /**
   * Get a level with shuffled cards
   */
  getLevel(level: number): GetLevelResponseDto {
    const config = this.levelConfigs.find((c) => c.level === level);

    if (!config) {
      throw new NotFoundException(`Level ${level} not found`);
    }

    // Filter pairs by difficulty
    const availablePairs = this.semanticPairs.filter(
      (pair) => pair.difficulty === config.difficulty
    );

    if (availablePairs.length < config.pairsCount) {
      throw new BadRequestException(`Not enough pairs available for level ${level}`);
    }

    // Select random pairs
    const selectedPairs = this.selectRandomPairs(availablePairs, config.pairsCount);

    // Create cards from selected pairs
    const cards: CardDto[] = [];
    const sessionMap = new Map<string, string>();

    selectedPairs.forEach((pair, index) => {
      const cardId1 = `card-${level}-${index * 2}`;
      const cardId2 = `card-${level}-${index * 2 + 1}`;

      cards.push({
        id: cardId1,
        text: pair.text1,
        pairId: pair.pairId,
      });

      cards.push({
        id: cardId2,
        text: pair.text2,
        pairId: pair.pairId,
      });

      // Store mapping for verification
      sessionMap.set(cardId1, pair.pairId);
      sessionMap.set(cardId2, pair.pairId);
    });

    // Shuffle cards
    const shuffledCards = this.shuffleArray(cards);

    // Store session (in production, use Redis with TTL)
    const sessionId = `level-${level}-${Date.now()}`;
    this.activeSessions.set(sessionId, sessionMap);

    // Clean up old sessions (keep last 100)
    if (this.activeSessions.size > 100) {
      const firstKey = this.activeSessions.keys().next().value;
      this.activeSessions.delete(firstKey);
    }

    return {
      level: config.level,
      timeLimit: config.timeLimit,
      cards: shuffledCards,
    };
  }

  /**
   * Verify if two cards match
   */
  verifyMatch(cardId1: string, cardId2: string): VerifyMatchResponseDto {
    if (cardId1 === cardId2) {
      throw new BadRequestException('Cannot match a card with itself');
    }

    // Extract pairIds from cardIds
    const pairId1 = this.extractPairIdFromCard(cardId1);
    const pairId2 = this.extractPairIdFromCard(cardId2);

    if (!pairId1 || !pairId2) {
      throw new NotFoundException('One or both cards not found');
    }

    const isMatch = pairId1 === pairId2;

    // Calculate similarity score (mock implementation)
    // In a real implementation, you would use actual embedding similarity
    const similarity = isMatch ? this.calculateSimilarity(pairId1) : 0.3;

    return {
      isMatch,
      similarity: parseFloat(similarity.toFixed(2)),
    };
  }

  /**
   * Extract pairId from a cardId by looking up in active sessions
   */
  private extractPairIdFromCard(cardId: string): string | null {
    // Try to find the card in any active session
    for (const [, sessionMap] of this.activeSessions) {
      const pairId = sessionMap.get(cardId);
      if (pairId) {
        return pairId;
      }
    }

    // Fallback: extract from semantic pairs data directly
    // This assumes the cardId contains information about which pair it belongs to
    const pair = this.semanticPairs.find((p) => {
      // Check if this card's text matches any pair
      return cardId.includes(p.pairId);
    });

    return pair?.pairId || null;
  }

  /**
   * Calculate mock similarity score
   * In production, this would use actual embeddings
   */
  private calculateSimilarity(pairId: string): number {
    const pair = this.semanticPairs.find((p) => p.pairId === pairId);

    if (!pair) {
      return 0.5;
    }

    // Mock similarity based on difficulty
    // In reality, you'd compute cosine similarity of embeddings
    switch (pair.difficulty) {
      case 'easy':
        return 0.85 + Math.random() * 0.1; // 0.85-0.95
      case 'medium':
        return 0.75 + Math.random() * 0.1; // 0.75-0.85
      case 'hard':
        return 0.65 + Math.random() * 0.1; // 0.65-0.75
      default:
        return 0.75;
    }
  }

  /**
   * Select random pairs from available pairs
   */
  private selectRandomPairs(pairs: SemanticPair[], count: number): SemanticPair[] {
    const shuffled = this.shuffleArray([...pairs]);
    return shuffled.slice(0, count);
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get level configuration
   */
  getLevelConfig(level: number): LevelConfig | undefined {
    return this.levelConfigs.find((c) => c.level === level);
  }

  /**
   * Get all available levels
   */
  getAllLevels(): LevelConfig[] {
    return this.levelConfigs;
  }
}
