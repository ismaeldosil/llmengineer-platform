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

export const STREAK_MULTIPLIERS: Record<number, number> = {
  3: 1.1,
  7: 1.2,
  14: 1.3,
  30: 1.5,
};

export const QUIZ_BONUSES = {
  PERFECT: 50,  // 100% correcto
  EXCELLENT: 25, // 90%+ correcto
  GOOD: 10,      // 70%+ correcto
};

export function calculateStreakBonus(streak: number): number {
  if (streak >= 30) return STREAK_BONUSES[30] ?? 100;
  if (streak >= 14) return STREAK_BONUSES[14] ?? 50;
  if (streak >= 7) return STREAK_BONUSES[7] ?? 25;
  if (streak >= 3) return STREAK_BONUSES[3] ?? 10;
  return 5;
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return STREAK_MULTIPLIERS[30] ?? 1.5;
  if (streak >= 14) return STREAK_MULTIPLIERS[14] ?? 1.3;
  if (streak >= 7) return STREAK_MULTIPLIERS[7] ?? 1.2;
  if (streak >= 3) return STREAK_MULTIPLIERS[3] ?? 1.1;
  return 1.0;
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

interface LessonXpParams {
  baseXp: number;
  timeSpentSeconds: number;
  estimatedMinutes: number;
  quizScore?: number; // Porcentaje 0-100
  currentStreak?: number; // Días de racha actual
}

export function calculateLessonXpWithBonuses(params: LessonXpParams): {
  totalXp: number;
  breakdown: {
    base: number;
    speedBonus: number;
    quizBonus: number;
    baseWithBonuses: number;
    streakMultiplier: number;
  };
} {
  const { baseXp, timeSpentSeconds, estimatedMinutes, quizScore = 0, currentStreak = 0 } = params;

  // XP Base
  let xp = baseXp;

  // Bonus Velocidad: Si tiempo < 80% estimado: +25 XP
  const estimatedSeconds = estimatedMinutes * 60;
  const timeRatio = timeSpentSeconds / estimatedSeconds;
  const speedBonus = timeRatio < 0.8 ? 25 : 0;

  // Bonus Quiz
  let quizBonus = 0;
  if (quizScore >= 100) {
    quizBonus = QUIZ_BONUSES.PERFECT; // +50 XP
  } else if (quizScore >= 90) {
    quizBonus = QUIZ_BONUSES.EXCELLENT; // +25 XP
  } else if (quizScore >= 70) {
    quizBonus = QUIZ_BONUSES.GOOD; // +10 XP
  }

  // Sumar bonuses antes de aplicar multiplicador
  const baseWithBonuses = xp + speedBonus + quizBonus;

  // Multiplicador Racha: 3+días: x1.1, 7+días: x1.2, 14+días: x1.3, 30+días: x1.5
  const streakMultiplier = getStreakMultiplier(currentStreak);

  // Aplicar multiplicador y redondear
  const totalXp = Math.floor(baseWithBonuses * streakMultiplier);

  return {
    totalXp,
    breakdown: {
      base: baseXp,
      speedBonus,
      quizBonus,
      baseWithBonuses,
      streakMultiplier,
    },
  };
}
