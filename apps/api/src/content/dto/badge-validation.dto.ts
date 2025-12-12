import { IsString, IsIn, IsNumber, IsInt, Min } from 'class-validator';

export class BadgeValidationDto {
  @IsString({ message: 'slug debe ser una cadena de texto' })
  slug!: string;

  @IsString({ message: 'name debe ser una cadena de texto' })
  name!: string;

  @IsString({ message: 'description debe ser una cadena de texto' })
  description!: string;

  @IsString({ message: 'icon debe ser una cadena de texto' })
  icon!: string;

  @IsString({ message: 'category debe ser una cadena de texto' })
  @IsIn(['lessons', 'streaks', 'xp', 'quizzes', 'special'], {
    message: 'category debe ser lessons, streaks, xp, quizzes o special',
  })
  category!: 'lessons' | 'streaks' | 'xp' | 'quizzes' | 'special';

  @IsNumber({}, { message: 'requirement debe ser un número' })
  @IsInt({ message: 'requirement debe ser un número entero' })
  @Min(1, { message: 'requirement debe ser al menos 1' })
  requirement!: number;
}
