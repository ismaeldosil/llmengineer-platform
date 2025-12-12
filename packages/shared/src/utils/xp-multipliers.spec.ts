import { describe, it, expect } from '@jest/globals';
import {
  getStreakMultiplier,
  calculateXpWithMultipliers,
  MultiplierResult,
} from './xp-multipliers';

describe('XP Multipliers System', () => {
  describe('getStreakMultiplier', () => {
    it('should return 1.0 for streaks less than 7 days', () => {
      expect(getStreakMultiplier(0)).toBe(1.0);
      expect(getStreakMultiplier(1)).toBe(1.0);
      expect(getStreakMultiplier(3)).toBe(1.0);
      expect(getStreakMultiplier(6)).toBe(1.0);
    });

    it('should return 1.2 for streaks between 7 and 29 days', () => {
      expect(getStreakMultiplier(7)).toBe(1.2);
      expect(getStreakMultiplier(10)).toBe(1.2);
      expect(getStreakMultiplier(15)).toBe(1.2);
      expect(getStreakMultiplier(29)).toBe(1.2);
    });

    it('should return 1.5 for streaks of 30 days or more', () => {
      expect(getStreakMultiplier(30)).toBe(1.5);
      expect(getStreakMultiplier(45)).toBe(1.5);
      expect(getStreakMultiplier(100)).toBe(1.5);
    });
  });

  describe('calculateXpWithMultipliers', () => {
    describe('Basic calculations without bonuses', () => {
      it('should return base XP with no multiplier for streak < 7 days', () => {
        const result = calculateXpWithMultipliers(100, 5, false);

        expect(result.baseXp).toBe(100);
        expect(result.multiplier).toBe(1.0);
        expect(result.bonusXp).toBe(0);
        expect(result.totalXp).toBe(100);
        expect(result.appliedBonuses).toHaveLength(0);
      });

      it('should apply 1.2x multiplier for 7-day streak', () => {
        const result = calculateXpWithMultipliers(100, 7, false);

        expect(result.baseXp).toBe(100);
        expect(result.multiplier).toBe(1.2);
        expect(result.bonusXp).toBe(20);
        expect(result.totalXp).toBe(120);
        expect(result.appliedBonuses).toContain('7-day streak bonus (1.2x)');
        expect(result.appliedBonuses).toHaveLength(1);
      });

      it('should apply 1.5x multiplier for 30-day streak', () => {
        const result = calculateXpWithMultipliers(100, 30, false);

        expect(result.baseXp).toBe(100);
        expect(result.multiplier).toBe(1.5);
        expect(result.bonusXp).toBe(50);
        expect(result.totalXp).toBe(150);
        expect(result.appliedBonuses).toContain('30-day streak bonus (1.5x)');
        expect(result.appliedBonuses).toHaveLength(1);
      });

      it('should floor the XP result when multiplier produces decimal', () => {
        const result = calculateXpWithMultipliers(33, 7, false);

        // 33 * 1.2 = 39.6, should floor to 39
        expect(result.totalXp).toBe(39);
        expect(result.bonusXp).toBe(6);
      });
    });

    describe('First lesson bonus', () => {
      it('should add 50 XP for first lesson of the day', () => {
        const result = calculateXpWithMultipliers(100, 0, true);

        expect(result.baseXp).toBe(100);
        expect(result.multiplier).toBe(1.0);
        expect(result.bonusXp).toBe(50);
        expect(result.totalXp).toBe(150);
        expect(result.appliedBonuses).toContain('First lesson today (+50 XP)');
        expect(result.appliedBonuses).toHaveLength(1);
      });

      it('should not add first lesson bonus when isFirstLessonToday is false', () => {
        const result = calculateXpWithMultipliers(100, 0, false);

        expect(result.totalXp).toBe(100);
        expect(result.bonusXp).toBe(0);
        expect(result.appliedBonuses).not.toContain('First lesson today (+50 XP)');
      });
    });

    describe('Combined bonuses', () => {
      it('should apply both 7-day streak multiplier and first lesson bonus', () => {
        const result = calculateXpWithMultipliers(100, 7, true);

        // 100 * 1.2 = 120, + 50 first lesson = 170
        expect(result.baseXp).toBe(100);
        expect(result.multiplier).toBe(1.2);
        expect(result.bonusXp).toBe(70);
        expect(result.totalXp).toBe(170);
        expect(result.appliedBonuses).toContain('7-day streak bonus (1.2x)');
        expect(result.appliedBonuses).toContain('First lesson today (+50 XP)');
        expect(result.appliedBonuses).toHaveLength(2);
      });

      it('should apply both 30-day streak multiplier and first lesson bonus', () => {
        const result = calculateXpWithMultipliers(100, 30, true);

        // 100 * 1.5 = 150, + 50 first lesson = 200
        expect(result.baseXp).toBe(100);
        expect(result.multiplier).toBe(1.5);
        expect(result.bonusXp).toBe(100);
        expect(result.totalXp).toBe(200);
        expect(result.appliedBonuses).toContain('30-day streak bonus (1.5x)');
        expect(result.appliedBonuses).toContain('First lesson today (+50 XP)');
        expect(result.appliedBonuses).toHaveLength(2);
      });

      it('should handle complex calculation with 15-day streak and first lesson', () => {
        const result = calculateXpWithMultipliers(250, 15, true);

        // 250 * 1.2 = 300, + 50 first lesson = 350
        expect(result.baseXp).toBe(250);
        expect(result.multiplier).toBe(1.2);
        expect(result.bonusXp).toBe(100);
        expect(result.totalXp).toBe(350);
        expect(result.appliedBonuses).toHaveLength(2);
      });
    });

    describe('Edge cases', () => {
      it('should handle zero base XP', () => {
        const result = calculateXpWithMultipliers(0, 7, true);

        expect(result.baseXp).toBe(0);
        expect(result.totalXp).toBe(50); // Only first lesson bonus
        expect(result.bonusXp).toBe(50);
      });

      it('should handle negative streak (treated as 0)', () => {
        const result = calculateXpWithMultipliers(100, -5, false);

        expect(result.multiplier).toBe(1.0);
        expect(result.totalXp).toBe(100);
      });

      it('should handle very large base XP with 30-day streak', () => {
        const result = calculateXpWithMultipliers(10000, 30, true);

        // 10000 * 1.5 = 15000, + 50 = 15050
        expect(result.totalXp).toBe(15050);
        expect(result.bonusXp).toBe(5050);
      });

      it('should handle exactly 7 days streak boundary', () => {
        const resultBefore = calculateXpWithMultipliers(100, 6, false);
        const resultAt = calculateXpWithMultipliers(100, 7, false);

        expect(resultBefore.multiplier).toBe(1.0);
        expect(resultBefore.totalXp).toBe(100);

        expect(resultAt.multiplier).toBe(1.2);
        expect(resultAt.totalXp).toBe(120);
      });

      it('should handle exactly 30 days streak boundary', () => {
        const resultBefore = calculateXpWithMultipliers(100, 29, false);
        const resultAt = calculateXpWithMultipliers(100, 30, false);

        expect(resultBefore.multiplier).toBe(1.2);
        expect(resultBefore.totalXp).toBe(120);

        expect(resultAt.multiplier).toBe(1.5);
        expect(resultAt.totalXp).toBe(150);
      });
    });

    describe('Real-world scenarios', () => {
      it('should calculate XP for typical lesson completion (no streak, no first lesson)', () => {
        const result = calculateXpWithMultipliers(150, 3, false);

        expect(result.totalXp).toBe(150);
        expect(result.appliedBonuses).toHaveLength(0);
      });

      it('should calculate XP for morning learner (first lesson, no streak)', () => {
        const result = calculateXpWithMultipliers(150, 5, true);

        // Base 150 + 50 first lesson = 200
        expect(result.totalXp).toBe(200);
        expect(result.appliedBonuses).toHaveLength(1);
      });

      it('should calculate XP for dedicated learner (7-day streak, first lesson)', () => {
        const result = calculateXpWithMultipliers(150, 7, true);

        // 150 * 1.2 = 180, + 50 first lesson = 230
        expect(result.totalXp).toBe(230);
        expect(result.appliedBonuses).toHaveLength(2);
      });

      it('should calculate XP for super learner (30+ day streak, first lesson)', () => {
        const result = calculateXpWithMultipliers(150, 45, true);

        // 150 * 1.5 = 225, + 50 first lesson = 275
        expect(result.totalXp).toBe(275);
        expect(result.appliedBonuses).toHaveLength(2);
      });

      it('should calculate XP for evening learner (30-day streak, not first lesson)', () => {
        const result = calculateXpWithMultipliers(150, 30, false);

        // 150 * 1.5 = 225
        expect(result.totalXp).toBe(225);
        expect(result.appliedBonuses).toHaveLength(1);
      });
    });

    describe('Result structure validation', () => {
      it('should return all required fields in MultiplierResult', () => {
        const result = calculateXpWithMultipliers(100, 7, true);

        expect(result).toHaveProperty('baseXp');
        expect(result).toHaveProperty('multiplier');
        expect(result).toHaveProperty('bonusXp');
        expect(result).toHaveProperty('totalXp');
        expect(result).toHaveProperty('appliedBonuses');
        expect(Array.isArray(result.appliedBonuses)).toBe(true);
      });

      it('should have numeric values for all number fields', () => {
        const result = calculateXpWithMultipliers(100, 7, true);

        expect(typeof result.baseXp).toBe('number');
        expect(typeof result.multiplier).toBe('number');
        expect(typeof result.bonusXp).toBe('number');
        expect(typeof result.totalXp).toBe('number');
      });

      it('should have string array for appliedBonuses', () => {
        const result = calculateXpWithMultipliers(100, 7, true);

        expect(Array.isArray(result.appliedBonuses)).toBe(true);
        result.appliedBonuses.forEach(bonus => {
          expect(typeof bonus).toBe('string');
        });
      });
    });
  });
});
