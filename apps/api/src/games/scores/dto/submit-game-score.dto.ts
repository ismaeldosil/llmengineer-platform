import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional, IsObject } from 'class-validator';

export class SubmitGameScoreDto {
  @ApiProperty({
    example: 'embedding-match',
    description: 'Type of game (embedding-match, token-tetris, prompt-golf)',
  })
  @IsString()
  gameType: string;

  @ApiProperty({
    example: 850,
    description: 'Score achieved in the game',
  })
  @IsInt()
  @Min(0)
  score: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Level number (optional, for games with levels)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @ApiPropertyOptional({
    example: { timeRemaining: 45, matches: 8 },
    description: 'Additional metadata (optional)',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
