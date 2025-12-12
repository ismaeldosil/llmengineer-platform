import {
  IsString,
  IsNumber,
  IsIn,
  IsOptional,
  MaxLength,
  Min,
  Max,
  IsInt,
  IsPositive,
} from 'class-validator';

export class LessonValidationDto {
  @IsString({ message: 'slug debe ser una cadena de texto' })
  slug!: string;

  @IsString({ message: 'title debe ser una cadena de texto' })
  @MaxLength(200, { message: 'title no puede exceder 200 caracteres' })
  title!: string;

  @IsString({ message: 'description debe ser una cadena de texto' })
  description!: string;

  @IsNumber({}, { message: 'week debe ser un número' })
  @IsInt({ message: 'week debe ser un número entero' })
  @Min(1, { message: 'week debe ser al menos 1' })
  @Max(12, { message: 'week no puede ser mayor a 12' })
  week!: number;

  @IsNumber({}, { message: 'order debe ser un número' })
  @IsInt({ message: 'order debe ser un número entero' })
  @IsPositive({ message: 'order debe ser un número positivo' })
  order!: number;

  @IsString({ message: 'difficulty debe ser una cadena de texto' })
  @IsIn(['beginner', 'intermediate', 'advanced'], {
    message: 'difficulty debe ser beginner, intermediate o advanced',
  })
  difficulty!: 'beginner' | 'intermediate' | 'advanced';

  @IsNumber({}, { message: 'xpReward debe ser un número' })
  @IsInt({ message: 'xpReward debe ser un número entero' })
  @Min(50, { message: 'xpReward debe ser al menos 50' })
  @Max(500, { message: 'xpReward no puede ser mayor a 500' })
  xpReward!: number;

  @IsNumber({}, { message: 'estimatedMinutes debe ser un número' })
  @IsInt({ message: 'estimatedMinutes debe ser un número entero' })
  @Min(5, { message: 'estimatedMinutes debe ser al menos 5' })
  @Max(120, { message: 'estimatedMinutes no puede ser mayor a 120' })
  estimatedMinutes!: number;
}
