import { IsString, MinLength, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchLessonDto {
  @ApiProperty({
    example: 'tokenización',
    description: 'Término de búsqueda (mínimo 2 caracteres)',
  })
  @IsString()
  @MinLength(2)
  query: string;

  @ApiPropertyOptional({
    example: 20,
    description: 'Número máximo de resultados',
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 0,
    description: 'Offset para paginación',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}

export interface SearchResult {
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  week: number;
  matchType: 'title' | 'description' | 'section' | 'keyPoint' | 'quiz';
  sectionTitle?: string;
  sectionIndex?: number;
  questionIndex?: number;
  matchedText: string;
  contextBefore: string;
  contextAfter: string;
}
