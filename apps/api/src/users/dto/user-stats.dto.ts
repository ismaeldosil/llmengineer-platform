import { ApiProperty } from '@nestjs/swagger';

export class LessonsPerWeekDto {
  @ApiProperty({
    example: 1,
    description: 'Week number',
  })
  week: number;

  @ApiProperty({
    example: 5,
    description: 'Number of lessons completed in this week',
  })
  count: number;
}

export class XpHistoryDto {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Date in YYYY-MM-DD format',
  })
  date: string;

  @ApiProperty({
    example: 150,
    description: 'XP earned on this date',
  })
  xp: number;
}

export class StreakHistoryDto {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Date in YYYY-MM-DD format',
  })
  date: string;

  @ApiProperty({
    example: 7,
    description: 'Streak count on this date',
  })
  streak: number;
}

export class UserStatsDto {
  @ApiProperty({
    example: 120,
    description: 'Total study time in minutes',
  })
  totalStudyTime: number;

  @ApiProperty({
    type: [LessonsPerWeekDto],
    description: 'Number of lessons completed per week',
  })
  lessonsPerWeek: LessonsPerWeekDto[];

  @ApiProperty({
    example: 85.5,
    description: 'Average quiz score as percentage',
  })
  quizAverage: number;

  @ApiProperty({
    type: [XpHistoryDto],
    description: 'XP earned history by date',
  })
  xpHistory: XpHistoryDto[];

  @ApiProperty({
    type: [StreakHistoryDto],
    description: 'Streak history by date',
  })
  streakHistory: StreakHistoryDto[];

  @ApiProperty({
    example: 15,
    description: 'Total number of lessons completed',
  })
  totalLessonsCompleted: number;

  @ApiProperty({
    example: 12,
    description: 'Total number of quizzes taken',
  })
  totalQuizzesTaken: number;

  @ApiProperty({
    example: 3,
    description: 'Number of perfect quiz scores (100%)',
  })
  perfectQuizzes: number;

  @ApiProperty({
    example: 4,
    description: 'Current user level',
  })
  currentLevel: number;

  @ApiProperty({
    example: 1750,
    description: 'Current total XP',
  })
  currentXp: number;

  @ApiProperty({
    example: 250,
    description: 'XP needed to reach next level',
  })
  xpToNextLevel: number;
}
