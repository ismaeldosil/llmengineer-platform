import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LessonsModule } from './lessons/lessons.module';
import { BadgesModule } from './badges/badges.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { StreaksModule } from './streaks/streaks.module';
import { QuizModule } from './quiz/quiz.module';
import { HealthModule } from './health/health.module';
import { EmbeddingMatchModule } from './games/embedding-match/embedding-match.module';
import { ScoresModule } from './games/scores/scores.module';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute in milliseconds
        limit: 100, // 100 requests per minute (default)
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    LessonsModule,
    BadgesModule,
    LeaderboardModule,
    StreaksModule,
    QuizModule,
    HealthModule,
    EmbeddingMatchModule,
    ScoresModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
