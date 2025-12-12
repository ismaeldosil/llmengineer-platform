import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardSnapshotService } from './leaderboard-snapshot.service';
import { LeaderboardController } from './leaderboard.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, LeaderboardSnapshotService],
  exports: [LeaderboardService, LeaderboardSnapshotService],
})
export class LeaderboardModule {}
