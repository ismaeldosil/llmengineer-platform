import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgesService } from '../badges/badges.service';

@Injectable()
export class StreaksService {
  constructor(
    private prisma: PrismaService,
    private badgesService: BadgesService,
  ) {}

  async checkin(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCheckin = await this.prisma.streakLog.findUnique({
      where: {
        userId_date: { userId, date: today },
      },
    });

    if (existingCheckin) {
      const progress = await this.prisma.userProgress.findUnique({
        where: { userId },
      });
      return {
        currentStreak: progress?.currentStreak || 0,
        streakBonusXp: 0,
        alreadyCheckedIn: true,
      };
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayCheckin = await this.prisma.streakLog.findUnique({
      where: {
        userId_date: { userId, date: yesterday },
      },
    });

    const progress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });

    let newStreak: number;
    if (yesterdayCheckin) {
      newStreak = (progress?.currentStreak || 0) + 1;
    } else {
      newStreak = 1;
    }

    const streakBonusXp = this.calculateStreakBonus(newStreak);

    await this.prisma.streakLog.create({
      data: {
        userId,
        date: today,
        bonusXp: streakBonusXp,
      },
    });

    const updatedProgress = await this.prisma.userProgress.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(progress?.longestStreak || 0, newStreak),
        totalXp: { increment: streakBonusXp },
        lastActiveAt: new Date(),
      },
    });

    await this.badgesService.checkAndAwardBadges(userId);

    return {
      currentStreak: updatedProgress.currentStreak,
      streakBonusXp,
      alreadyCheckedIn: false,
    };
  }

  private calculateStreakBonus(streak: number): number {
    if (streak >= 30) return 100;
    if (streak >= 14) return 50;
    if (streak >= 7) return 25;
    if (streak >= 3) return 10;
    return 5;
  }
}
