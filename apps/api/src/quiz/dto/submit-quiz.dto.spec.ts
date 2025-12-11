import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SubmitQuizDto, QuizAnswerDto } from './submit-quiz.dto';

describe('SubmitQuizDto', () => {
  describe('QuizAnswerDto', () => {
    it('should validate a valid quiz answer', async () => {
      const dto = plainToInstance(QuizAnswerDto, {
        questionId: 'q1',
        selectedAnswer: 'opt1',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.questionId).toBe('q1');
      expect(dto.selectedAnswer).toBe('opt1');
    });

    it('should fail validation when questionId is missing', async () => {
      const dto = plainToInstance(QuizAnswerDto, {
        selectedAnswer: 'opt1',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('questionId');
    });

    it('should fail validation when selectedAnswer is missing', async () => {
      const dto = plainToInstance(QuizAnswerDto, {
        questionId: 'q1',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('selectedAnswer');
    });

    it('should fail validation when questionId is not a string', async () => {
      const dto = plainToInstance(QuizAnswerDto, {
        questionId: 123,
        selectedAnswer: 'opt1',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('questionId');
    });

    it('should fail validation when selectedAnswer is not a string', async () => {
      const dto = plainToInstance(QuizAnswerDto, {
        questionId: 'q1',
        selectedAnswer: 123,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('selectedAnswer');
    });
  });

  describe('SubmitQuizDto', () => {
    it('should validate a valid submit quiz dto', async () => {
      const dto = plainToInstance(SubmitQuizDto, {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
          { questionId: 'q2', selectedAnswer: 'opt2' },
        ],
      });

      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true
      });
      expect(errors).toHaveLength(0);
      expect(dto.answers).toHaveLength(2);
      expect(dto.answers[0].questionId).toBe('q1');
    });

    it('should fail validation when answers is not an array', async () => {
      const dto = plainToInstance(SubmitQuizDto, {
        answers: 'not-an-array',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('answers');
    });

    it('should fail validation when answers array is empty', async () => {
      const dto = plainToInstance(SubmitQuizDto, {
        answers: [],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('answers');
    });

    it('should fail validation when answers array has invalid items', async () => {
      const dto = plainToInstance(SubmitQuizDto, {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
          { questionId: 'q2' }, // missing selectedAnswer
        ],
      });

      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation when answers is missing', async () => {
      const dto = plainToInstance(SubmitQuizDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('answers');
    });

    it('should accept single answer in array', async () => {
      const dto = plainToInstance(SubmitQuizDto, {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
        ],
      });

      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true
      });
      expect(errors).toHaveLength(0);
      expect(dto.answers).toHaveLength(1);
    });

    it('should accept multiple answers', async () => {
      const dto = plainToInstance(SubmitQuizDto, {
        answers: [
          { questionId: 'q1', selectedAnswer: 'opt1' },
          { questionId: 'q2', selectedAnswer: 'opt2' },
          { questionId: 'q3', selectedAnswer: 'true' },
          { questionId: 'q4', selectedAnswer: 'opt1' },
          { questionId: 'q5', selectedAnswer: 'opt2' },
        ],
      });

      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true
      });
      expect(errors).toHaveLength(0);
      expect(dto.answers).toHaveLength(5);
    });
  });
});
