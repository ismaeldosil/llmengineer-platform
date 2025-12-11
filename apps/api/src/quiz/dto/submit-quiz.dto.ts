import { IsArray, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QuizAnswerDto {
  @ApiProperty({
    example: 'q1',
    description: 'ID de la pregunta'
  })
  @IsString()
  questionId: string;

  @ApiProperty({
    example: 'opt1',
    description: 'Respuesta seleccionada'
  })
  @IsString()
  selectedAnswer: string;
}

export class SubmitQuizDto {
  @ApiProperty({
    type: [QuizAnswerDto],
    description: 'Array de respuestas del quiz',
    example: [
      { questionId: 'q1', selectedAnswer: 'opt1' },
      { questionId: 'q2', selectedAnswer: 'opt2' }
    ]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}
