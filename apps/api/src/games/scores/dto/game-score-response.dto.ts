import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GameScoreResponseDto {
  @ApiProperty({
    example: 'cuid123',
    description: 'Score ID',
  })
  id: string;

  @ApiProperty({
    example: 'user123',
    description: 'User ID',
  })
  userId: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User display name',
  })
  displayName: string;

  @ApiProperty({
    example: 'embedding-match',
    description: 'Game type',
  })
  gameType: string;

  @ApiProperty({
    example: 850,
    description: 'Score achieved',
  })
  score: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Level number',
  })
  level?: number;

  @ApiPropertyOptional({
    example: { timeRemaining: 45, matches: 8 },
    description: 'Additional metadata',
  })
  metadata?: Record<string, unknown>;

  @ApiProperty({
    example: '2025-12-13T10:30:00.000Z',
    description: 'Timestamp when score was created',
  })
  createdAt: Date;
}

export class LeaderboardScoreDto {
  @ApiProperty({
    example: 1,
    description: 'Rank on leaderboard',
  })
  rank: number;

  @ApiProperty({
    example: 'user123',
    description: 'User ID',
  })
  userId: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User display name',
  })
  displayName: string;

  @ApiProperty({
    example: 850,
    description: 'Score achieved',
  })
  score: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Level number',
  })
  level?: number;

  @ApiProperty({
    example: '2025-12-13T10:30:00.000Z',
    description: 'Timestamp when score was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: false,
    description: 'Whether this is the current user',
  })
  isCurrentUser: boolean;
}

export class GameLeaderboardResponseDto {
  @ApiProperty({
    example: 'embedding-match',
    description: 'Game type',
  })
  gameType: string;

  @ApiProperty({
    type: [LeaderboardScoreDto],
    description: 'Top scores for this game',
  })
  scores: LeaderboardScoreDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of scores',
  })
  total: number;

  @ApiProperty({
    example: 0,
    description: 'Offset for pagination',
  })
  offset: number;

  @ApiProperty({
    example: 50,
    description: 'Limit for pagination',
  })
  limit: number;
}

export class PersonalBestDto {
  @ApiProperty({
    example: 'embedding-match',
    description: 'Game type',
  })
  gameType: string;

  @ApiProperty({
    example: 850,
    description: 'Best score achieved',
  })
  bestScore: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Level for best score',
  })
  level?: number;

  @ApiProperty({
    example: '2025-12-13T10:30:00.000Z',
    description: 'When best score was achieved',
  })
  achievedAt: Date;

  @ApiProperty({
    example: 15,
    description: 'Total number of attempts',
  })
  totalAttempts: number;
}

export class UserPersonalBestsResponseDto {
  @ApiProperty({
    type: [PersonalBestDto],
    description: 'Personal best scores for each game type',
  })
  personalBests: PersonalBestDto[];
}
