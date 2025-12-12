import { IsString, IsIn, IsOptional, IsArray, ValidateIf, ArrayMinSize } from 'class-validator';

export class QuizValidationDto {
  @IsString({ message: 'type debe ser una cadena de texto' })
  @IsIn(['multiple_choice', 'true_false', 'code_completion'], {
    message: 'type debe ser multiple_choice, true_false o code_completion',
  })
  type!: 'multiple_choice' | 'true_false' | 'code_completion';

  @IsString({ message: 'question debe ser una cadena de texto' })
  question!: string;

  @ValidateIf((o) => o.type === 'multiple_choice')
  @IsArray({ message: 'options debe ser un arreglo' })
  @ArrayMinSize(2, { message: 'options debe tener al menos 2 opciones' })
  @IsString({ each: true, message: 'cada opción debe ser una cadena de texto' })
  options?: string[];

  @IsOptional()
  @IsString({ message: 'explanation debe ser una cadena de texto' })
  explanation?: string;

  // correctAnswer can be number (for multiple_choice), boolean (for true_false), or string (for code_completion)
  // We'll validate this in the service layer since class-validator doesn't easily support union types
  correctAnswer!: number | boolean | string;
}
