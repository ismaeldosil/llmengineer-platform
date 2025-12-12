import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class XpHistoryQueryDto {
  @ApiProperty({
    example: 30,
    description: 'Number of days to retrieve (max 90)',
    required: false,
    default: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Days must be an integer' })
  @Min(1, { message: 'Days must be at least 1' })
  @Max(90, { message: 'Days cannot exceed 90' })
  days?: number = 30;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Start date in YYYY-MM-DD format (optional)',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate?: string;

  @ApiProperty({
    example: '2024-01-31',
    description: 'End date in YYYY-MM-DD format (optional)',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate?: string;
}

export class XpHistoryDetailDto {
  @ApiProperty({
    example: 'lesson',
    description: 'Source of XP earning',
    enum: ['lesson', 'quiz', 'streak', 'badge', 'game'],
  })
  source: string;

  @ApiProperty({
    example: 100,
    description: 'XP earned from this source',
  })
  xp: number;

  @ApiProperty({
    example: 'Completed lesson: Introduction to Prompts',
    description: 'Description of how XP was earned',
    required: false,
  })
  description?: string;
}

export class XpHistoryItemDto {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Date in YYYY-MM-DD format',
  })
  date: string;

  @ApiProperty({
    example: 250,
    description: 'Total XP earned on this date',
  })
  xp: number;

  @ApiProperty({
    type: [String],
    example: ['lesson', 'quiz', 'streak'],
    description: 'Sources of XP on this date',
  })
  sources: string[];

  @ApiProperty({
    type: [XpHistoryDetailDto],
    description: 'Detailed breakdown of XP sources',
    required: false,
  })
  details?: XpHistoryDetailDto[];
}

export class BestDayDto {
  @ApiProperty({
    example: '2024-01-20',
    description: 'Date of best XP day',
  })
  date: string;

  @ApiProperty({
    example: 350,
    description: 'XP earned on best day',
  })
  xp: number;
}

export class XpHistoryResponseDto {
  @ApiProperty({
    type: [XpHistoryItemDto],
    description: 'XP history by date',
  })
  history: XpHistoryItemDto[];

  @ApiProperty({
    example: 750,
    description: 'Total XP earned this week',
  })
  totalThisWeek: number;

  @ApiProperty({
    example: 2100,
    description: 'Total XP earned this month',
  })
  totalThisMonth: number;

  @ApiProperty({
    example: 85.5,
    description: 'Average XP earned per day',
  })
  averagePerDay: number;

  @ApiProperty({
    type: BestDayDto,
    description: 'Best XP earning day',
  })
  bestDay: BestDayDto;
}
