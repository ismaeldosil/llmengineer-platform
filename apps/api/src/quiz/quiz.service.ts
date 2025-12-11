import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Quiz, QuizQuestionResult, QuizResult, QUIZ_BONUSES } from '@llmengineer/shared';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async submitQuiz(lessonId: string, userId: string, dto: SubmitQuizDto): Promise<QuizResult> {
    // Obtener la lecci�n
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lecci�n no encontrada');
    }

    // Verificar que la lecci�n tiene un quiz
    if (!lesson.quiz) {
      throw new BadRequestException('Esta lecci�n no tiene un quiz');
    }

    // Parsear el quiz desde JSON
    const quiz = lesson.quiz as Quiz;

    if (!quiz.questions || quiz.questions.length === 0) {
      throw new BadRequestException('El quiz no tiene preguntas');
    }

    // Validar que todas las preguntas fueron respondidas
    const questionIds = new Set(quiz.questions.map((q) => q.id));
    const answeredIds = new Set(dto.answers.map((a) => a.questionId));

    if (questionIds.size !== answeredIds.size) {
      throw new BadRequestException('Debes responder todas las preguntas');
    }

    // Verificar que todas las preguntas respondidas existen
    for (const answer of dto.answers) {
      if (!questionIds.has(answer.questionId)) {
        throw new BadRequestException(`Pregunta no encontrada: ${answer.questionId}`);
      }
    }

    // Calcular el puntaje
    const results: QuizQuestionResult[] = [];
    let correctAnswers = 0;

    for (const answer of dto.answers) {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      if (isCorrect) {
        correctAnswers++;
      }

      results.push({
        questionId: question.id,
        isCorrect,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      });
    }

    // Calcular el porcentaje
    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Determinar si pas� (70% o m�s)
    const passingScore = quiz.passingScore || 70;
    const passed = score >= passingScore;

    // Calcular bonus de XP si pas�
    let xpBonus = 0;
    if (passed) {
      if (score === 100) {
        xpBonus = QUIZ_BONUSES.PERFECT; // 50 XP
      } else if (score >= 90) {
        xpBonus = QUIZ_BONUSES.EXCELLENT; // 25 XP
      } else if (score >= 70) {
        xpBonus = QUIZ_BONUSES.GOOD; // 10 XP
      }
    }

    return {
      score,
      passed,
      totalQuestions,
      correctAnswers,
      xpBonus,
      results,
    };
  }
}
