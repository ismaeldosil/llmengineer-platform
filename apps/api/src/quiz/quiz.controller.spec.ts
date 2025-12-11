import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizResult } from '@llmengineer/shared/types/quiz';

describe('QuizController', () => {
  let controller: QuizController;
  let quizService: QuizService;

  const mockQuizService = {
    submitQuiz: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: mockQuizService,
        },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
    quizService = module.get<QuizService>(QuizService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submitQuiz', () => {
    it('should call quizService.submitQuiz with correct parameters', async () => {
      const lessonId = 'lesson-1';
      const userId = 'user-1';
      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
          { questionId: 'q2', selectedAnswer: 'opt2' },
        ],
      };

      const expectedResult: QuizResult = {
        score: 100,
        passed: true,
        totalQuestions: 2,
        correctAnswers: 2,
        xpBonus: 50,
        results: [
          {
            questionId: 'q1',
            isCorrect: true,
            selectedAnswer: 'opt1',
            correctAnswer: 'opt1',
          },
          {
            questionId: 'q2',
            isCorrect: true,
            selectedAnswer: 'opt2',
            correctAnswer: 'opt2',
          },
        ],
      };

      mockQuizService.submitQuiz.mockResolvedValue(expectedResult);

      const result = await controller.submitQuiz(lessonId, dto, { id: userId });

      expect(quizService.submitQuiz).toHaveBeenCalledWith(lessonId, userId, dto);
      expect(quizService.submitQuiz).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should return quiz result with perfect score', async () => {
      const lessonId = 'lesson-1';
      const userId = 'user-1';
      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
          { questionId: 'q2', selectedAnswer: 'opt1' },
          { questionId: 'q3', selectedAnswer: 'true' },
        ],
      };

      const expectedResult: QuizResult = {
        score: 100,
        passed: true,
        totalQuestions: 3,
        correctAnswers: 3,
        xpBonus: 50,
        results: [
          {
            questionId: 'q1',
            isCorrect: true,
            selectedAnswer: 'opt1',
            correctAnswer: 'opt1',
            explanation: 'Explanation 1',
          },
          {
            questionId: 'q2',
            isCorrect: true,
            selectedAnswer: 'opt1',
            correctAnswer: 'opt1',
            explanation: 'Explanation 2',
          },
          {
            questionId: 'q3',
            isCorrect: true,
            selectedAnswer: 'true',
            correctAnswer: 'true',
            explanation: 'Explanation 3',
          },
        ],
      };

      mockQuizService.submitQuiz.mockResolvedValue(expectedResult);

      const result = await controller.submitQuiz(lessonId, dto, { id: userId });

      expect(result).toEqual(expectedResult);
      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.xpBonus).toBe(50);
    });

    it('should return quiz result with passing score', async () => {
      const lessonId = 'lesson-2';
      const userId = 'user-2';
      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
          { questionId: 'q2', selectedAnswer: 'opt2' },
          { questionId: 'q3', selectedAnswer: 'true' },
          { questionId: 'q4', selectedAnswer: 'opt1' },
        ],
      };

      const expectedResult: QuizResult = {
        score: 75,
        passed: true,
        totalQuestions: 4,
        correctAnswers: 3,
        xpBonus: 10,
        results: [
          {
            questionId: 'q1',
            isCorrect: true,
            selectedAnswer: 'opt1',
            correctAnswer: 'opt1',
          },
          {
            questionId: 'q2',
            isCorrect: false,
            selectedAnswer: 'opt2',
            correctAnswer: 'opt1',
          },
          {
            questionId: 'q3',
            isCorrect: true,
            selectedAnswer: 'true',
            correctAnswer: 'true',
          },
          {
            questionId: 'q4',
            isCorrect: true,
            selectedAnswer: 'opt1',
            correctAnswer: 'opt1',
          },
        ],
      };

      mockQuizService.submitQuiz.mockResolvedValue(expectedResult);

      const result = await controller.submitQuiz(lessonId, dto, { id: userId });

      expect(result).toEqual(expectedResult);
      expect(result.score).toBe(75);
      expect(result.passed).toBe(true);
      expect(result.xpBonus).toBe(10);
      expect(result.correctAnswers).toBe(3);
    });

    it('should return quiz result with failing score', async () => {
      const lessonId = 'lesson-3';
      const userId = 'user-3';
      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt2' },
          { questionId: 'q2', selectedAnswer: 'opt2' },
        ],
      };

      const expectedResult: QuizResult = {
        score: 0,
        passed: false,
        totalQuestions: 2,
        correctAnswers: 0,
        xpBonus: 0,
        results: [
          {
            questionId: 'q1',
            isCorrect: false,
            selectedAnswer: 'opt2',
            correctAnswer: 'opt1',
          },
          {
            questionId: 'q2',
            isCorrect: false,
            selectedAnswer: 'opt2',
            correctAnswer: 'opt1',
          },
        ],
      };

      mockQuizService.submitQuiz.mockResolvedValue(expectedResult);

      const result = await controller.submitQuiz(lessonId, dto, { id: userId });

      expect(result).toEqual(expectedResult);
      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
      expect(result.xpBonus).toBe(0);
    });

    it('should handle exceptions from quiz service', async () => {
      const lessonId = 'lesson-4';
      const userId = 'user-4';
      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
        ],
      };

      const error = new Error('Quiz service error');
      mockQuizService.submitQuiz.mockRejectedValue(error);

      await expect(
        controller.submitQuiz(lessonId, dto, { id: userId })
      ).rejects.toThrow('Quiz service error');

      expect(quizService.submitQuiz).toHaveBeenCalledWith(lessonId, userId, dto);
    });

    it('should pass user ID from CurrentUser decorator', async () => {
      const lessonId = 'lesson-5';
      const userId = 'user-12345';
      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
        ],
      };

      const expectedResult: QuizResult = {
        score: 100,
        passed: true,
        totalQuestions: 1,
        correctAnswers: 1,
        xpBonus: 50,
        results: [
          {
            questionId: 'q1',
            isCorrect: true,
            selectedAnswer: 'opt1',
            correctAnswer: 'opt1',
          },
        ],
      };

      mockQuizService.submitQuiz.mockResolvedValue(expectedResult);

      await controller.submitQuiz(lessonId, dto, { id: userId });

      expect(quizService.submitQuiz).toHaveBeenCalledWith(
        lessonId,
        userId,
        dto
      );
    });

    it('should handle empty answers array', async () => {
      const lessonId = 'lesson-6';
      const userId = 'user-6';
      const dto: SubmitQuizDto = {
        answers: [],
      };

      const error = new Error('Debes responder todas las preguntas');
      mockQuizService.submitQuiz.mockRejectedValue(error);

      await expect(
        controller.submitQuiz(lessonId, dto, { id: userId })
      ).rejects.toThrow('Debes responder todas las preguntas');
    });

    it('should return results with explanations', async () => {
      const lessonId = 'lesson-7';
      const userId = 'user-7';
      const dto: SubmitQuizDto = {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
          { questionId: 'q2', selectedAnswer: 'opt2' },
        ],
      };

      const expectedResult: QuizResult = {
        score: 50,
        passed: false,
        totalQuestions: 2,
        correctAnswers: 1,
        xpBonus: 0,
        results: [
          {
            questionId: 'q1',
            isCorrect: true,
            selectedAnswer: 'opt1',
            correctAnswer: 'opt1',
            explanation: 'This is the correct answer because...',
          },
          {
            questionId: 'q2',
            isCorrect: false,
            selectedAnswer: 'opt2',
            correctAnswer: 'opt1',
            explanation: 'The correct answer is opt1 because...',
          },
        ],
      };

      mockQuizService.submitQuiz.mockResolvedValue(expectedResult);

      const result = await controller.submitQuiz(lessonId, dto, { id: userId });

      expect(result.results[0].explanation).toBeDefined();
      expect(result.results[1].explanation).toBeDefined();
      expect(result.results[0].explanation).toBe('This is the correct answer because...');
    });
  });
});
