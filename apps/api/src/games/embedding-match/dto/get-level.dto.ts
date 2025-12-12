import { ApiProperty } from '@nestjs/swagger';

export class CardDto {
  @ApiProperty({
    example: 'card-1',
    description: 'Unique card ID',
  })
  id: string;

  @ApiProperty({
    example: 'machine learning',
    description: 'Card text to display',
  })
  text: string;

  @ApiProperty({
    example: 'pair-1',
    description: 'ID of the matching pair',
  })
  pairId: string;
}

export class GetLevelResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Level number',
  })
  level: number;

  @ApiProperty({
    example: 60,
    description: 'Time limit in seconds',
  })
  timeLimit: number;

  @ApiProperty({
    type: [CardDto],
    description: 'Shuffled array of cards',
  })
  cards: CardDto[];
}
