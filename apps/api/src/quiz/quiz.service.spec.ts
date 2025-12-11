import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service';
import { Quiz } from '@llmengineer/shared';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

describe('QuizService', () => {
  let service: QuizService;
  let _prismaService: PrismaService;

  const mockQuiz: Quiz = {
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: '�Qu� es un prompt?',
        options: [
          { id: 'opt1', text: 'Una instrucci�n para la IA' },
          { id: 'opt2', text: 'Un lenguaje de programaci�n' },
          { id: 'opt3', text: 'Un tipo de dato' },
        ],
        correctAnswer: 'opt1',
        explanation: 'Un prompt es una instrucci�n que le das a la IA',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: '�Qu� hace la ingenier�a de prompts?',
        options: [
          { id: 'opt1', text: 'Optimiza las respuestas de IA' },
          { id: 'opt2', text: 'Crea bases de datos' },
        ],
        correctAnswer: 'opt1',
        explanation: 'La ingenier�a de prompts optimiza las respuestas',
      },
      {
        id: 'q3',
        type: 'true-false',
        question: '�Los prompts pueden ser complejos?',
        correctAnswer: 'true',
        explanation: 'S�, los prompts pueden ser muy complejos',
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: '�Cu�l es la mejor pr�ctica?',
        options: [
          { id: 'opt1', text: 'Ser espec�fico' },
          { id: 'opt2', text: 'Ser vago' },
        ],
        correctAnswer: 'opt1',
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: '�Qu� es el contexto?',
        options: [
          { id: 'opt1', text: 'Informaci�n de fondo' },
          { id: 'opt2', text: 'Un error' },
        ],
        correctAnswer: 'opt1',
      },
    ],
    passingScore: 70,
  };

  const mockLesson = {
    id: 'lesson-1',
    slug: 'intro-to-prompts',
    title: 'Introducci�n a Prompts',
    description: 'Aprende sobre prompts',
    week: 1,
    order: 1,
    difficulty: 'beginner' as const,
    xpReward: 100,
    estimatedMinutes: 15,
    contentUrl: 'https://example.com',
    sections: [],
    quiz: mockQuiz,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    lesson: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitQuiz', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should throw NotFoundException if lesson does not exist', async () => {
      mockPrismaService.lesson.findUnique.mockResolvedValue(null);

      const dto: SubmitQuizDto = {
        answers: [{ questionId: 'q1', selectedAnswer: 'opt1' }],
      };

      await expect(service.submitQuiz('non-existent-id', 'user-1', dto)).rejects.toThrow(
        NotFoundException
      );

      expect(mockPrismaService.lesson.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });

    it('should throw BadRequestException if lesson has no quiz', async () => {
      const lessonWithoutQuiz = { ...mockLesson, quiz: null };
      mockPrismaService.lesson.findUnique.mockResolvedValue(lessonWithoutQuiz);

      const dto: SubmitQuizDto = {
        answers: [{ questionId: 'q1', selectedAnswer: 'opt1' }],
      };

      await expect(service.submitQuiz('lesson-1', 'user-1', dto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.submitQuiz('lesson-1', 'user-1', dto)).rejects.toThrow(
        'Esta lecci�n no tiene un quiz'
      );
    });

    it('should throw BadRequestException if quiz has no questions', async () => {
      const lessonWithEmptyQuiz = {
        ...mockLesson,
        quiz: { questions: [], passingScore: 70 },
      };
      mockPrismaService.lesson.findUnique.mockResolvedValue(lessonWithEmptyQuiz);

      const dto: SubmitQuizDto = {
        answers: [],
      };

      await expect(service.submitQuiz('lesson-1', 'user-1', dto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.submitQuiz('lesson-1', 'user-1', dto)).rejects.toThrow(
        'El quiz no tiene preguntas'
      );
    });

    it('should throw BadRequestException if not all questions are answered', async () => {
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);

      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
          { questionId: 'q2', selectedAnswer: 'opt1' },
        ],
      };

      await expect(service.submitQuiz('lesson-1', 'user-1', dto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.submitQuiz('lesson-1', 'user-1', dto)).rejects.toThrow(
        'Debes responder todas las preguntas'
      );
    });

    it('should throw BadRequestException if answer contains invalid question ID', async () => {
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);

      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
          { questionId: 'q2', selectedAnswer: 'opt1' },
          { questionId: 'q3', selectedAnswer: 'true' },
          { questionId: 'q4', selectedAnswer: 'opt1' },
          { questionId: 'invalid-id', selectedAnswer: 'opt1' },
        ],
      };

      await expect(service.submitQuiz('lesson-1', 'user-1', dto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.submitQuiz('lesson-1', 'user-1', dto)).rejects.toThrow(
        'Pregunta no encontrada: invalid-id'
      );
    });

    it('should return correct result for perfect score (100%)', async () => {
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);

      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
          { questionId: 'q2', selectedAnswer: 'opt1' },
          { questionId: 'q3', selectedAnswer: 'true' },
          { questionId: 'q4', selectedAnswer: 'opt1' },
          { questionId: 'q5', selectedAnswer: 'opt1' },
        ],
      };

      const result = await service.submitQuiz('lesson-1', 'user-1', dto);

      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.totalQuestions).toBe(5);
      expect(result.correctAnswers).toBe(5);
      expect(result.xpBonus).toBe(50); // QUIZ_BONUSES.PERFECT
      expect(result.results).toHaveLength(5);
      expect(result.results[0].isCorrect).toBe(true);
      expect(result.results[0].questionId).toBe('q1');
      expect(result.results[0].selectedAnswer).toBe('opt1');
      expect(result.results[0].correctAnswer).toBe('opt1');
      expect(result.results[0].explanation).toBe('Un prompt es una instrucci�n que le das a la IA');
    });

    it('should return correct result for excellent score (90%)', async () => {
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);

      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q2', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q3', selectedAnswer: 'true' }, // correct
          { questionId: 'q4', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q5', selectedAnswer: 'opt2' }, // incorrect
        ],
      };

      const result = await service.submitQuiz('lesson-1', 'user-1', dto);

      expect(result.score).toBe(80); // 4/5 = 80%
      expect(result.passed).toBe(true);
      expect(result.totalQuestions).toBe(5);
      expect(result.correctAnswers).toBe(4);
      expect(result.xpBonus).toBe(10); // QUIZ_BONUSES.GOOD (70-89%)
      expect(result.results[4].isCorrect).toBe(false);
      expect(result.results[4].selectedAnswer).toBe('opt2');
      expect(result.results[4].correctAnswer).toBe('opt1');
    });

    it('should return correct result for good score (70%)', async () => {
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);

      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q2', selectedAnswer: 'opt2' }, // incorrect
          { questionId: 'q3', selectedAnswer: 'true' }, // correct
          { questionId: 'q4', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q5', selectedAnswer: 'opt2' }, // incorrect
        ],
      };

      const result = await service.submitQuiz('lesson-1', 'user-1', dto);

      expect(result.score).toBe(60); // 3/5 = 60%
      expect(result.passed).toBe(false);
      expect(result.totalQuestions).toBe(5);
      expect(result.correctAnswers).toBe(3);
      expect(result.xpBonus).toBe(0); // No bonus for failing

      const correctResults = result.results.filter((r) => r.isCorrect);
      const incorrectResults = result.results.filter((r) => !r.isCorrect);
      expect(correctResults).toHaveLength(3);
      expect(incorrectResults).toHaveLength(2);
    });

    it('should return correct result for passing score at 70%', async () => {
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);

      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q2', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q3', selectedAnswer: 'true' }, // correct
          { questionId: 'q4', selectedAnswer: 'opt2' }, // incorrect
          { questionId: 'q5', selectedAnswer: 'opt2' }, // incorrect
        ],
      };

      const result = await service.submitQuiz('lesson-1', 'user-1', dto);

      expect(result.score).toBe(60); // 3/5 = 60%
      expect(result.passed).toBe(false); // 60% < 70%
      expect(result.xpBonus).toBe(0);
    });

    it('should return correct result for exactly 70% score', async () => {
      const quizWith10Questions: Quiz = {
        questions: [
          ...mockQuiz.questions,
          {
            id: 'q6',
            type: 'multiple-choice',
            question: 'Q6?',
            correctAnswer: 'opt1',
            options: [{ id: 'opt1', text: 'A' }],
          },
          {
            id: 'q7',
            type: 'multiple-choice',
            question: 'Q7?',
            correctAnswer: 'opt1',
            options: [{ id: 'opt1', text: 'A' }],
          },
          {
            id: 'q8',
            type: 'multiple-choice',
            question: 'Q8?',
            correctAnswer: 'opt1',
            options: [{ id: 'opt1', text: 'A' }],
          },
          {
            id: 'q9',
            type: 'multiple-choice',
            question: 'Q9?',
            correctAnswer: 'opt1',
            options: [{ id: 'opt1', text: 'A' }],
          },
          {
            id: 'q10',
            type: 'multiple-choice',
            question: 'Q10?',
            correctAnswer: 'opt1',
            options: [{ id: 'opt1', text: 'A' }],
          },
        ],
        passingScore: 70,
      };

      const lessonWith10Questions = { ...mockLesson, quiz: quizWith10Questions };
      mockPrismaService.lesson.findUnique.mockResolvedValue(lessonWith10Questions);

      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q2', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q3', selectedAnswer: 'true' }, // correct
          { questionId: 'q4', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q5', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q6', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q7', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q8', selectedAnswer: 'opt2' }, // incorrect
          { questionId: 'q9', selectedAnswer: 'opt2' }, // incorrect
          { questionId: 'q10', selectedAnswer: 'opt2' }, // incorrect
        ],
      };

      const result = await service.submitQuiz('lesson-1', 'user-1', dto);

      expect(result.score).toBe(70); // 7/10 = 70%
      expect(result.passed).toBe(true); // 70% >= 70%
      expect(result.xpBonus).toBe(10); // QUIZ_BONUSES.GOOD
    });

    it('should return correct result for failing score (<70%)', async () => {
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);

      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt2' }, // incorrect
          { questionId: 'q2', selectedAnswer: 'opt2' }, // incorrect
          { questionId: 'q3', selectedAnswer: 'false' }, // incorrect
          { questionId: 'q4', selectedAnswer: 'opt2' }, // incorrect
          { questionId: 'q5', selectedAnswer: 'opt2' }, // incorrect
        ],
      };

      const result = await service.submitQuiz('lesson-1', 'user-1', dto);

      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
      expect(result.totalQuestions).toBe(5);
      expect(result.correctAnswers).toBe(0);
      expect(result.xpBonus).toBe(0);

      result.results.forEach((questionResult) => {
        expect(questionResult.isCorrect).toBe(false);
      });
    });

    it('should handle quiz with custom passing score', async () => {
      const customQuiz: Quiz = {
        ...mockQuiz,
        passingScore: 80,
      };

      const lessonWithCustomScore = { ...mockLesson, quiz: customQuiz };
      mockPrismaService.lesson.findUnique.mockResolvedValue(lessonWithCustomScore);

      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q2', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q3', selectedAnswer: 'true' }, // correct
          { questionId: 'q4', selectedAnswer: 'opt2' }, // incorrect
          { questionId: 'q5', selectedAnswer: 'opt2' }, // incorrect
        ],
      };

      const result = await service.submitQuiz('lesson-1', 'user-1', dto);

      expect(result.score).toBe(60); // 3/5 = 60%
      expect(result.passed).toBe(false); // 60% < 80%
      expect(result.xpBonus).toBe(0);
    });

    it('should return 25 XP bonus for 90% score', async () => {
      const quizWith10Questions: Quiz = {
        questions: [
          ...mockQuiz.questions,
          {
            id: 'q6',
            type: 'multiple-choice',
            question: 'Q6?',
            correctAnswer: 'opt1',
            options: [{ id: 'opt1', text: 'A' }],
          },
          {
            id: 'q7',
            type: 'multiple-choice',
            question: 'Q7?',
            correctAnswer: 'opt1',
            options: [{ id: 'opt1', text: 'A' }],
          },
          {
            id: 'q8',
            type: 'multiple-choice',
            question: 'Q8?',
            correctAnswer: 'opt1',
            options: [{ id: 'opt1', text: 'A' }],
          },
          {
            id: 'q9',
            type: 'multiple-choice',
            question: 'Q9?',
            correctAnswer: 'opt1',
            options: [{ id: 'opt1', text: 'A' }],
          },
          {
            id: 'q10',
            type: 'multiple-choice',
            question: 'Q10?',
            correctAnswer: 'opt1',
            options: [{ id: 'opt1', text: 'A' }],
          },
        ],
        passingScore: 70,
      };

      const lessonWith10Questions = { ...mockLesson, quiz: quizWith10Questions };
      mockPrismaService.lesson.findUnique.mockResolvedValue(lessonWith10Questions);

      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q2', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q3', selectedAnswer: 'true' }, // correct
          { questionId: 'q4', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q5', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q6', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q7', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q8', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q9', selectedAnswer: 'opt1' }, // correct
          { questionId: 'q10', selectedAnswer: 'opt2' }, // incorrect
        ],
      };

      const result = await service.submitQuiz('lesson-1', 'user-1', dto);

      expect(result.score).toBe(90); // 9/10 = 90%
      expect(result.passed).toBe(true);
      expect(result.xpBonus).toBe(25); // QUIZ_BONUSES.EXCELLENT
    });

    it('should include explanation in results when available', async () => {
      mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);

      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
          { questionId: 'q2', selectedAnswer: 'opt1' },
          { questionId: 'q3', selectedAnswer: 'true' },
          { questionId: 'q4', selectedAnswer: 'opt1' },
          { questionId: 'q5', selectedAnswer: 'opt1' },
        ],
      };

      const result = await service.submitQuiz('lesson-1', 'user-1', dto);

      expect(result.results[0].explanation).toBeDefined();
      expect(result.results[0].explanation).toBe('Un prompt es una instrucci�n que le das a la IA');
      expect(result.results[3].explanation).toBeUndefined(); // q4 has no explanation
    });
  });
});
