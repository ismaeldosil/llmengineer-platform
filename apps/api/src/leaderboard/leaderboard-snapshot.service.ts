import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeaderboardService } from './leaderboard.service';

@Injectable()
export class LeaderboardSnapshotService {
  private readonly logger = new Logger(LeaderboardSnapshotService.name);

  constructor(private leaderboardService: LeaderboardService) {}

  /**
   * Create daily snapshots at midnight (00:00)
   * This runs every day at 00:00:00
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailySnapshot() {
    this.logger.log('Running daily leaderboard snapshot job...');

    try {
      await this.leaderboardService.createDailySnapshots();
      this.logger.log('Daily leaderboard snapshot completed successfully');
    } catch (error) {
      this.logger.error('Failed to create daily leaderboard snapshot', error);
    }
  }

  /**
   * Manual trigger for creating snapshots (useful for testing or manual runs)
   */
  async triggerSnapshot(): Promise<void> {
    this.logger.log('Manual snapshot trigger initiated');
    await this.leaderboardService.createDailySnapshots();
  }
}
