import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyMatchDto {
  @ApiProperty({
    example: 'card-1',
    description: 'First card ID',
  })
  @IsString()
  cardId1: string;

  @ApiProperty({
    example: 'card-2',
    description: 'Second card ID',
  })
  @IsString()
  cardId2: string;
}

export class VerifyMatchResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether the cards match',
  })
  isMatch: boolean;

  @ApiProperty({
    example: 0.85,
    description: 'Semantic similarity score (optional)',
    required: false,
  })
  similarity?: number;
}
