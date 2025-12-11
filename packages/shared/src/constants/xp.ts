export const XP_REWARDS = {
  LESSON_COMPLETE_BASE: 100,
  LESSON_COMPLETE_BONUS_FAST: 25,
  QUIZ_CORRECT: 10,
  QUIZ_PERFECT: 50,
  STREAK_DAY_3: 10,
  STREAK_DAY_7: 25,
  STREAK_DAY_14: 50,
  STREAK_DAY_30: 100,
  BADGE_EARNED: 50,
  FIRST_LESSON: 100,
  WEEK_COMPLETE: 200,
} as const;

export const STREAK_BONUSES: Record<number, number> = {
  3: 10,
  7: 25,
  14: 50,
  30: 100,
};

export function calculateStreakBonus(streak: number): number {
  if (streak >= 30) return STREAK_BONUSES[30];
  if (streak >= 14) return STREAK_BONUSES[14];
  if (streak >= 7) return STREAK_BONUSES[7];
  if (streak >= 3) return STREAK_BONUSES[3];
  return 5;
}

export function calculateLessonXp(baseXp: number, timeSpentSeconds: number, estimatedMinutes: number): number {
  const estimatedSeconds = estimatedMinutes * 60;
  const timeRatio = timeSpentSeconds / estimatedSeconds;

  if (timeRatio < 0.5) {
    return Math.floor(baseXp * 0.5);
  }

  if (timeRatio <= 1.2) {
    return baseXp + XP_REWARDS.LESSON_COMPLETE_BONUS_FAST;
  }

  return baseXp;
}
