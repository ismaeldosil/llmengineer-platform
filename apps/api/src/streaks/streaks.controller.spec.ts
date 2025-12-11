import { Test, TestingModule } from '@nestjs/testing';
import { StreaksController } from './streaks.controller';
import { StreaksService } from './streaks.service';

describe('StreaksController', () => {
  let controller: StreaksController;
  let service: StreaksService;

  const mockStreaksService = {
    checkin: jest.fn(),
  };

  const mockUser = { id: 'user-123' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreaksController],
      providers: [
        {
          provide: StreaksService,
          useValue: mockStreaksService,
        },
      ],
    }).compile();

    controller = module.get<StreaksController>(StreaksController);
    service = module.get<StreaksService>(StreaksService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /streaks/checkin', () => {
    it('should call service.checkin with user id', async () => {
      const expectedResult = {
        currentStreak: 5,
        streakBonusXp: 10,
        alreadyCheckedIn: false,
      };

      mockStreaksService.checkin.mockResolvedValue(expectedResult);

      const result = await controller.checkin(mockUser);

      expect(result).toEqual(expectedResult);
      expect(service.checkin).toHaveBeenCalledWith('user-123');
      expect(service.checkin).toHaveBeenCalledTimes(1);
    });

    it('should return alreadyCheckedIn true when user already checked in', async () => {
      const expectedResult = {
        currentStreak: 3,
        streakBonusXp: 0,
        alreadyCheckedIn: true,
      };

      mockStreaksService.checkin.mockResolvedValue(expectedResult);

      const result = await controller.checkin(mockUser);

      expect(result).toEqual(expectedResult);
      expect(result.alreadyCheckedIn).toBe(true);
      expect(result.streakBonusXp).toBe(0);
    });

    it('should return correct streak bonus for new checkin', async () => {
      const expectedResult = {
        currentStreak: 1,
        streakBonusXp: 5,
        alreadyCheckedIn: false,
      };

      mockStreaksService.checkin.mockResolvedValue(expectedResult);

      const result = await controller.checkin(mockUser);

      expect(result.currentStreak).toBe(1);
      expect(result.streakBonusXp).toBe(5);
      expect(result.alreadyCheckedIn).toBe(false);
    });

    it('should handle long streaks correctly', async () => {
      const expectedResult = {
        currentStreak: 30,
        streakBonusXp: 100,
        alreadyCheckedIn: false,
      };

      mockStreaksService.checkin.mockResolvedValue(expectedResult);

      const result = await controller.checkin(mockUser);

      expect(result.currentStreak).toBe(30);
      expect(result.streakBonusXp).toBe(100);
    });

    it('should propagate service errors', async () => {
      mockStreaksService.checkin.mockRejectedValue(new Error('Database error'));

      await expect(controller.checkin(mockUser)).rejects.toThrow('Database error');
      expect(service.checkin).toHaveBeenCalledWith('user-123');
    });

    it('should handle different user ids correctly', async () => {
      const user1 = { id: 'user-1' };
      const user2 = { id: 'user-2' };

      mockStreaksService.checkin.mockResolvedValueOnce({
        currentStreak: 5,
        streakBonusXp: 10,
        alreadyCheckedIn: false,
      });

      mockStreaksService.checkin.mockResolvedValueOnce({
        currentStreak: 10,
        streakBonusXp: 25,
        alreadyCheckedIn: false,
      });

      await controller.checkin(user1);
      await controller.checkin(user2);

      expect(service.checkin).toHaveBeenCalledWith('user-1');
      expect(service.checkin).toHaveBeenCalledWith('user-2');
      expect(service.checkin).toHaveBeenCalledTimes(2);
    });
  });
});
