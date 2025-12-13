import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  SubmitGameScoreDto,
  GameScoreResponseDto,
  GameLeaderboardResponseDto,
  LeaderboardScoreDto,
  UserPersonalBestsResponseDto,
  PersonalBestDto,
} from './dto';

@Injectable()
export class ScoresService {
  private readonly logger = new Logger(ScoresService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Submit a new game score
   */
  async submitScore(userId: string, dto: SubmitGameScoreDto): Promise<GameScoreResponseDto> {
    this.logger.log(
      `Submitting score for user ${userId}, game ${dto.gameType}, score ${dto.score}`
    );

    const gameScore = await this.prisma.gameScore.create({
      data: {
        userId,
        gameType: dto.gameType,
        score: dto.score,
        level: dto.level,
        metadata: dto.metadata ? (dto.metadata as Prisma.InputJsonValue) : undefined,
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

    const metadata = gameScore.metadata as Record<string, unknown>;
    const hasMetadata = metadata && Object.keys(metadata).length > 0;

    return {
      id: gameScore.id,
      userId: gameScore.userId,
      displayName: gameScore.user.displayName,
      gameType: gameScore.gameType,
      score: gameScore.score,
      level: gameScore.level || undefined,
      metadata: hasMetadata ? metadata : undefined,
      createdAt: gameScore.createdAt,
    };
  }

  /**
   * Get top scores for a specific game type (leaderboard)
   */
  async getLeaderboard(
    gameType: string,
    userId: string,
    limit: number = 50,
    offset: number = 0,
    level?: number
  ): Promise<GameLeaderboardResponseDto> {
    this.logger.log(`Getting leaderboard for game ${gameType}, level ${level || 'all'}`);

    // Build where clause
    const where: { gameType: string; level?: number } = { gameType };
    if (level) {
      where.level = level;
    }

    // Get top scores with user information
    const topScores = await this.prisma.gameScore.findMany({
      where,
      orderBy: { score: 'desc' },
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    // Get total count
    const total = await this.prisma.gameScore.count({ where });

    // Format scores with ranking
    const scores: LeaderboardScoreDto[] = topScores.map((score, index) => ({
      rank: offset + index + 1,
      userId: score.user.id,
      displayName: score.user.displayName,
      score: score.score,
      level: score.level || undefined,
      createdAt: score.createdAt,
      isCurrentUser: score.user.id === userId,
    }));

    return {
      gameType,
      scores,
      total,
      offset,
      limit,
    };
  }

  /**
   * Get top scores by unique users (best score per user)
   */
  async getLeaderboardByUniqueUsers(
    gameType: string,
    userId: string,
    limit: number = 50,
    offset: number = 0,
    level?: number
  ): Promise<GameLeaderboardResponseDto> {
    this.logger.log(
      `Getting unique user leaderboard for game ${gameType}, level ${level || 'all'}`
    );

    // Build where clause
    const where: { gameType: string; level?: number } = { gameType };
    if (level) {
      where.level = level;
    }

    // Get best score per user using raw query for better performance
    const query = `
      WITH ranked_scores AS (
        SELECT
          gs.*,
          u.display_name,
          ROW_NUMBER() OVER (PARTITION BY gs.user_id ORDER BY gs.score DESC) as rn
        FROM game_scores gs
        JOIN users u ON gs.user_id = u.id
        WHERE gs.game_type = $1
        ${level ? 'AND gs.level = $2' : ''}
      )
      SELECT * FROM ranked_scores
      WHERE rn = 1
      ORDER BY score DESC
      LIMIT $${level ? '3' : '2'} OFFSET $${level ? '4' : '3'}
    `;

    const params = level ? [gameType, level, limit, offset] : [gameType, limit, offset];

    interface RawScore {
      id: string;
      user_id: string;
      game_type: string;
      score: number;
      level: number | null;
      metadata: unknown;
      created_at: string;
      display_name: string;
      rn: number;
    }

    const topScores = await this.prisma.$queryRawUnsafe<RawScore[]>(query, ...params);

    // Get total unique users for this game
    const countQuery = `
      SELECT COUNT(DISTINCT user_id) as count
      FROM game_scores
      WHERE game_type = $1
      ${level ? 'AND level = $2' : ''}
    `;
    const countParams = level ? [gameType, level] : [gameType];
    const countResult = await this.prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      countQuery,
      ...countParams
    );
    const total = Number(countResult[0]?.count || 0);

    // Format scores with ranking
    const scores: LeaderboardScoreDto[] = topScores.map((score, index) => ({
      rank: offset + index + 1,
      userId: score.user_id,
      displayName: score.display_name,
      score: score.score,
      level: score.level || undefined,
      createdAt: new Date(score.created_at),
      isCurrentUser: score.user_id === userId,
    }));

    return {
      gameType,
      scores,
      total,
      offset,
      limit,
    };
  }

  /**
   * Get user's personal best scores for all games
   */
  async getUserPersonalBests(userId: string): Promise<UserPersonalBestsResponseDto> {
    this.logger.log(`Getting personal bests for user ${userId}`);

    // Get all game types the user has played
    const gameTypes = await this.prisma.gameScore.findMany({
      where: { userId },
      select: { gameType: true },
      distinct: ['gameType'],
    });

    const personalBests: PersonalBestDto[] = [];

    for (const { gameType } of gameTypes) {
      // Get best score for this game type
      const bestScore = await this.prisma.gameScore.findFirst({
        where: { userId, gameType },
        orderBy: { score: 'desc' },
      });

      // Get total attempts
      const totalAttempts = await this.prisma.gameScore.count({
        where: { userId, gameType },
      });

      if (bestScore) {
        personalBests.push({
          gameType,
          bestScore: bestScore.score,
          level: bestScore.level || undefined,
          achievedAt: bestScore.createdAt,
          totalAttempts,
        });
      }
    }

    return {
      personalBests,
    };
  }

  /**
   * Get user's personal best for a specific game
   */
  async getUserPersonalBestForGame(
    userId: string,
    gameType: string
  ): Promise<PersonalBestDto | null> {
    this.logger.log(`Getting personal best for user ${userId}, game ${gameType}`);

    const bestScore = await this.prisma.gameScore.findFirst({
      where: { userId, gameType },
      orderBy: { score: 'desc' },
    });

    if (!bestScore) {
      return null;
    }

    const totalAttempts = await this.prisma.gameScore.count({
      where: { userId, gameType },
    });

    return {
      gameType,
      bestScore: bestScore.score,
      level: bestScore.level || undefined,
      achievedAt: bestScore.createdAt,
      totalAttempts,
    };
  }

  /**
   * Get user's rank for a specific game
   */
  async getUserRank(userId: string, gameType: string, level?: number): Promise<number> {
    const where: { gameType: string; level?: number } = { gameType };
    if (level) {
      where.level = level;
    }

    // Get user's best score
    const userBestScore = await this.prisma.gameScore.findFirst({
      where: { userId, ...where },
      orderBy: { score: 'desc' },
    });

    if (!userBestScore) {
      return 0;
    }

    // Count how many unique users have a better score
    const betterScoresQuery = `
      SELECT COUNT(DISTINCT user_id) as count
      FROM (
        SELECT user_id, MAX(score) as max_score
        FROM game_scores
        WHERE game_type = $1
        ${level ? 'AND level = $2' : ''}
        GROUP BY user_id
      ) as best_scores
      WHERE max_score > $${level ? '3' : '2'}
    `;

    const params = level ? [gameType, level, userBestScore.score] : [gameType, userBestScore.score];

    const result = await this.prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      betterScoresQuery,
      ...params
    );
    const betterCount = Number(result[0]?.count || 0);

    return betterCount + 1;
  }

  /**
   * Delete a score (admin only, or for testing)
   */
  async deleteScore(scoreId: string): Promise<void> {
    const score = await this.prisma.gameScore.findUnique({
      where: { id: scoreId },
    });

    if (!score) {
      throw new NotFoundException(`Score with ID ${scoreId} not found`);
    }

    await this.prisma.gameScore.delete({
      where: { id: scoreId },
    });

    this.logger.log(`Deleted score ${scoreId}`);
  }
}
