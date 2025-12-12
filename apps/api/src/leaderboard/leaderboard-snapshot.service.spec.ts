import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardSnapshotService } from './leaderboard-snapshot.service';
import { LeaderboardService } from './leaderboard.service';

describe('LeaderboardSnapshotService', () => {
  let service: LeaderboardSnapshotService;
  let leaderboardService: LeaderboardService;

  const mockLeaderboardService = {
    createDailySnapshots: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardSnapshotService,
        {
          provide: LeaderboardService,
          useValue: mockLeaderboardService,
        },
      ],
    }).compile();

    service = module.get<LeaderboardSnapshotService>(LeaderboardSnapshotService);
    leaderboardService = module.get<LeaderboardService>(LeaderboardService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleDailySnapshot', () => {
    it('should call createDailySnapshots on leaderboardService', async () => {
      mockLeaderboardService.createDailySnapshots.mockResolvedValue(undefined);

      await service.handleDailySnapshot();

      expect(leaderboardService.createDailySnapshots).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockLeaderboardService.createDailySnapshots.mockRejectedValue(error);

      // Should not throw
      await expect(service.handleDailySnapshot()).resolves.toBeUndefined();
    });
  });

  describe('triggerSnapshot', () => {
    it('should call createDailySnapshots on leaderboardService', async () => {
      mockLeaderboardService.createDailySnapshots.mockResolvedValue(undefined);

      await service.triggerSnapshot();

      expect(leaderboardService.createDailySnapshots).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors', async () => {
      const error = new Error('Snapshot failed');
      mockLeaderboardService.createDailySnapshots.mockRejectedValue(error);

      await expect(service.triggerSnapshot()).rejects.toThrow('Snapshot failed');
    });
  });
});
