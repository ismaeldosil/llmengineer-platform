import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteLessonDto {
  @ApiProperty({ example: 300, description: 'Tiempo dedicado en segundos' })
  @IsInt()
  @Min(0)
  timeSpentSeconds: number;
}
