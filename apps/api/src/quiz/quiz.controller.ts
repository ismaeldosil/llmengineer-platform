import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@ApiTags('quiz')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lessons')
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post(':id/quiz')
  @ApiOperation({ summary: 'Enviar respuestas del quiz de una lecci�n' })
  @ApiResponse({
    status: 200,
    description: 'Quiz evaluado correctamente',
    schema: {
      example: {
        score: 80,
        passed: true,
        totalQuestions: 5,
        correctAnswers: 4,
        xpBonus: 10,
        results: [
          {
            questionId: 'q1',
            isCorrect: true,
            selectedAnswer: 'opt1',
            correctAnswer: 'opt1',
            explanation: 'Explicaci�n de la respuesta',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lecci�n no encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'Quiz inv�lido o incompleto',
  })
  async submitQuiz(
    @Param('id') id: string,
    @Body() dto: SubmitQuizDto,
    @CurrentUser() user: { id: string }
  ) {
    return this.quizService.submitQuiz(id, user.id, dto);
  }
}
