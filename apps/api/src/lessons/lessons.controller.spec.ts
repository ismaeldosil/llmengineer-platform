import { Test, TestingModule } from '@nestjs/testing';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompleteLessonDto } from './dto/complete-lesson.dto';

describe('LessonsController', () => {
  let controller: LessonsController;
  let service: LessonsService;

  const mockUser = { id: 'user-123' };

  const mockLesson = {
    id: 'lesson-1',
    slug: 'intro-to-prompts',
    title: 'Introduction to Prompts',
    description: 'Learn the basics',
    week: 1,
    order: 1,
    difficulty: 'beginner',
    xpReward: 100,
    estimatedMinutes: 15,
    contentUrl: 'https://example.com',
    sections: [],
    quiz: null,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLessonsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    complete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        {
          provide: LessonsService,
          useValue: mockLessonsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LessonsController>(LessonsController);
    service = module.get<LessonsService>(LessonsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should return all lessons for user', async () => {
      const mockLessons = [mockLesson, { ...mockLesson, id: 'lesson-2' }];
      mockLessonsService.findAll.mockResolvedValue(mockLessons);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual(mockLessons);
      expect(service.findAll).toHaveBeenCalledWith('user-123');
    });

    it('should return empty array when no lessons', async () => {
      mockLessonsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith('user-123');
    });
  });

  describe('findOne', () => {
    it('should return a single lesson', async () => {
      mockLessonsService.findOne.mockResolvedValue(mockLesson);

      const result = await controller.findOne('lesson-1', mockUser);

      expect(result).toEqual(mockLesson);
      expect(service.findOne).toHaveBeenCalledWith('lesson-1', 'user-123');
    });

    it('should call service with correct parameters', async () => {
      mockLessonsService.findOne.mockResolvedValue(mockLesson);

      await controller.findOne('lesson-abc', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('lesson-abc', 'user-123');
    });
  });

  describe('complete', () => {
    it('should mark lesson as complete', async () => {
      const dto: CompleteLessonDto = { timeSpentSeconds: 300 };
      const mockResult = {
        lesson: mockLesson,
        xpEarned: 100,
        newLevel: 2,
      };
      mockLessonsService.complete.mockResolvedValue(mockResult);

      const result = await controller.complete('lesson-1', dto, mockUser);

      expect(result).toEqual(mockResult);
      expect(service.complete).toHaveBeenCalledWith('lesson-1', 'user-123', 300);
    });

    it('should pass timeSpentSeconds to service', async () => {
      const dto: CompleteLessonDto = { timeSpentSeconds: 600 };
      mockLessonsService.complete.mockResolvedValue({});

      await controller.complete('lesson-1', dto, mockUser);

      expect(service.complete).toHaveBeenCalledWith('lesson-1', 'user-123', 600);
    });

    it('should handle completion with zero time spent', async () => {
      const dto: CompleteLessonDto = { timeSpentSeconds: 0 };
      mockLessonsService.complete.mockResolvedValue({});

      await controller.complete('lesson-1', dto, mockUser);

      expect(service.complete).toHaveBeenCalledWith('lesson-1', 'user-123', 0);
    });
  });
});
