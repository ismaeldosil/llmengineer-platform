import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsInt, Min, Max } from 'class-validator';

export class SubmitScoreDto {
  @ApiProperty({
    example: 1,
    description: 'Level number',
  })
  @IsInt()
  @Min(1)
  @Max(3)
  level: number;

  @ApiProperty({
    example: 850,
    description: 'Final score',
  })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({
    example: 45,
    description: 'Time remaining in seconds',
  })
  @IsNumber()
  @Min(0)
  timeRemaining: number;
}
