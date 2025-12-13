import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetLeaderboardQueryDto {
  @ApiPropertyOptional({
    example: 50,
    description: 'Maximum number of scores to return',
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of scores to skip for pagination',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by level number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  level?: number;
}
