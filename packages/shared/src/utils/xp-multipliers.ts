/**
 * XP Multipliers System
 *
 * This module provides utilities for calculating XP with multipliers
 * based on streaks and daily bonuses for GAME-010.
 *
 * Requirements:
 * - 7+ day streak: 1.2x multiplier
 * - 30+ day streak: 1.5x multiplier
 * - First lesson of the day: +50 XP flat bonus
 */

export interface MultiplierResult {
  baseXp: number;
  multiplier: number;
  bonusXp: number;
  totalXp: number;
  appliedBonuses: string[];
}

/**
 * Get the streak multiplier based on consecutive days (GAME-010 requirements)
 * @param streak - Number of consecutive days
 * @returns Multiplier value (1.0 = no bonus, 1.2 = 20% bonus, 1.5 = 50% bonus)
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 1.5; // 50% bonus for 30+ days
  if (streak >= 7) return 1.2;  // 20% bonus for 7+ days
  return 1.0; // No multiplier for streaks < 7 days
}

/**
 * Calculate XP with all applicable multipliers and bonuses
 * @param baseXp - Base XP amount before multipliers (already includes speed/quiz bonuses)
 * @param streak - Current consecutive days streak
 * @param isFirstLessonToday - Whether this is the first lesson completed today
 * @returns Complete breakdown of XP calculation with applied bonuses
 */
export function calculateXpWithMultipliers(
  baseXp: number,
  streak: number,
  isFirstLessonToday: boolean
): MultiplierResult {
  const appliedBonuses: string[] = [];

  // Get streak multiplier (7+ days: 1.2x, 30+ days: 1.5x)
  const streakMultiplier = getStreakMultiplier(streak);

  if (streakMultiplier > 1.0) {
    if (streak >= 30) {
      appliedBonuses.push('30-day streak bonus (1.5x)');
    } else if (streak >= 7) {
      appliedBonuses.push('7-day streak bonus (1.2x)');
    }
  }

  // Apply streak multiplier to base XP
  let totalXp = Math.floor(baseXp * streakMultiplier);
  let bonusXp = totalXp - baseXp;

  // Add first lesson of the day bonus (flat +50 XP)
  if (isFirstLessonToday) {
    const firstLessonBonus = 50;
    totalXp += firstLessonBonus;
    bonusXp += firstLessonBonus;
    appliedBonuses.push('First lesson today (+50 XP)');
  }

  return {
    baseXp,
    multiplier: streakMultiplier,
    bonusXp,
    totalXp,
    appliedBonuses,
  };
}
