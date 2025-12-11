import {
  XP_REWARDS,
  STREAK_BONUSES,
  STREAK_MULTIPLIERS,
  QUIZ_BONUSES,
  calculateStreakBonus,
  getStreakMultiplier,
  calculateLessonXp,
  calculateLessonXpWithBonuses,
} from './xp';

describe('xp', () => {
  describe('constants', () => {
    it('should have correct XP_REWARDS', () => {
      expect(XP_REWARDS.LESSON_COMPLETE_BASE).toBe(100);
      expect(XP_REWARDS.LESSON_COMPLETE_BONUS_FAST).toBe(25);
      expect(XP_REWARDS.QUIZ_CORRECT).toBe(10);
      expect(XP_REWARDS.QUIZ_PERFECT).toBe(50);
      expect(XP_REWARDS.STREAK_DAY_3).toBe(10);
      expect(XP_REWARDS.STREAK_DAY_7).toBe(25);
      expect(XP_REWARDS.STREAK_DAY_14).toBe(50);
      expect(XP_REWARDS.STREAK_DAY_30).toBe(100);
      expect(XP_REWARDS.BADGE_EARNED).toBe(50);
      expect(XP_REWARDS.FIRST_LESSON).toBe(100);
      expect(XP_REWARDS.WEEK_COMPLETE).toBe(200);
    });

    it('should have correct STREAK_BONUSES', () => {
      expect(STREAK_BONUSES[3]).toBe(10);
      expect(STREAK_BONUSES[7]).toBe(25);
      expect(STREAK_BONUSES[14]).toBe(50);
      expect(STREAK_BONUSES[30]).toBe(100);
    });

    it('should have correct STREAK_MULTIPLIERS', () => {
      expect(STREAK_MULTIPLIERS[3]).toBe(1.1);
      expect(STREAK_MULTIPLIERS[7]).toBe(1.2);
      expect(STREAK_MULTIPLIERS[14]).toBe(1.3);
      expect(STREAK_MULTIPLIERS[30]).toBe(1.5);
    });

    it('should have correct QUIZ_BONUSES', () => {
      expect(QUIZ_BONUSES.PERFECT).toBe(50);
      expect(QUIZ_BONUSES.EXCELLENT).toBe(25);
      expect(QUIZ_BONUSES.GOOD).toBe(10);
    });
  });

  describe('calculateStreakBonus', () => {
    it('should return 5 for streak < 3', () => {
      expect(calculateStreakBonus(0)).toBe(5);
      expect(calculateStreakBonus(1)).toBe(5);
      expect(calculateStreakBonus(2)).toBe(5);
    });

    it('should return 10 for streak 3-6', () => {
      expect(calculateStreakBonus(3)).toBe(10);
      expect(calculateStreakBonus(4)).toBe(10);
      expect(calculateStreakBonus(5)).toBe(10);
      expect(calculateStreakBonus(6)).toBe(10);
    });

    it('should return 25 for streak 7-13', () => {
      expect(calculateStreakBonus(7)).toBe(25);
      expect(calculateStreakBonus(10)).toBe(25);
      expect(calculateStreakBonus(13)).toBe(25);
    });

    it('should return 50 for streak 14-29', () => {
      expect(calculateStreakBonus(14)).toBe(50);
      expect(calculateStreakBonus(20)).toBe(50);
      expect(calculateStreakBonus(29)).toBe(50);
    });

    it('should return 100 for streak >= 30', () => {
      expect(calculateStreakBonus(30)).toBe(100);
      expect(calculateStreakBonus(50)).toBe(100);
      expect(calculateStreakBonus(100)).toBe(100);
    });
  });

  describe('getStreakMultiplier', () => {
    it('should return 1.0 for streak < 3', () => {
      expect(getStreakMultiplier(0)).toBe(1.0);
      expect(getStreakMultiplier(1)).toBe(1.0);
      expect(getStreakMultiplier(2)).toBe(1.0);
    });

    it('should return 1.1 for streak 3-6', () => {
      expect(getStreakMultiplier(3)).toBe(1.1);
      expect(getStreakMultiplier(4)).toBe(1.1);
      expect(getStreakMultiplier(5)).toBe(1.1);
      expect(getStreakMultiplier(6)).toBe(1.1);
    });

    it('should return 1.2 for streak 7-13', () => {
      expect(getStreakMultiplier(7)).toBe(1.2);
      expect(getStreakMultiplier(10)).toBe(1.2);
      expect(getStreakMultiplier(13)).toBe(1.2);
    });

    it('should return 1.3 for streak 14-29', () => {
      expect(getStreakMultiplier(14)).toBe(1.3);
      expect(getStreakMultiplier(20)).toBe(1.3);
      expect(getStreakMultiplier(29)).toBe(1.3);
    });

    it('should return 1.5 for streak >= 30', () => {
      expect(getStreakMultiplier(30)).toBe(1.5);
      expect(getStreakMultiplier(50)).toBe(1.5);
      expect(getStreakMultiplier(100)).toBe(1.5);
    });
  });

  describe('calculateLessonXp (legacy)', () => {
    it('should return half XP if completed too quickly (< 50% of estimated time)', () => {
      const baseXp = 100;
      const estimatedMinutes = 10;
      const timeSpentSeconds = 60; // 1 minute (10% of estimated)

      const result = calculateLessonXp(baseXp, timeSpentSeconds, estimatedMinutes);

      expect(result).toBe(50); // 100 * 0.5
    });

    it('should return base XP + bonus if completed fast (< 120% of estimated time)', () => {
      const baseXp = 100;
      const estimatedMinutes = 10;
      const timeSpentSeconds = 600; // 10 minutes (100% of estimated)

      const result = calculateLessonXp(baseXp, timeSpentSeconds, estimatedMinutes);

      expect(result).toBe(125); // 100 + 25
    });

    it('should return base XP if completed normally (> 120% of estimated time)', () => {
      const baseXp = 100;
      const estimatedMinutes = 10;
      const timeSpentSeconds = 800; // 13.3 minutes (133% of estimated)

      const result = calculateLessonXp(baseXp, timeSpentSeconds, estimatedMinutes);

      expect(result).toBe(100);
    });
  });

  describe('calculateLessonXpWithBonuses', () => {
    describe('base case - no bonuses', () => {
      it('should return base XP with no bonuses', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 600, // 10 minutes (100% of estimated)
          estimatedMinutes: 10,
        });

        expect(result.totalXp).toBe(100);
        expect(result.breakdown.base).toBe(100);
        expect(result.breakdown.speedBonus).toBe(0);
        expect(result.breakdown.quizBonus).toBe(0);
        expect(result.breakdown.streakMultiplier).toBe(1.0);
      });
    });

    describe('speed bonus', () => {
      it('should add 25 XP bonus if completed in < 80% of estimated time', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 400, // 6.67 minutes (66.7% of estimated)
          estimatedMinutes: 10,
        });

        expect(result.breakdown.speedBonus).toBe(25);
        expect(result.breakdown.baseWithBonuses).toBe(125);
        expect(result.totalXp).toBe(125);
      });

      it('should not add speed bonus if at exactly 80% of estimated time', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 480, // 8 minutes (80% of estimated)
          estimatedMinutes: 10,
        });

        expect(result.breakdown.speedBonus).toBe(0);
        expect(result.totalXp).toBe(100);
      });

      it('should not add speed bonus if > 80% of estimated time', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 540, // 9 minutes (90% of estimated)
          estimatedMinutes: 10,
        });

        expect(result.breakdown.speedBonus).toBe(0);
        expect(result.totalXp).toBe(100);
      });
    });

    describe('quiz bonuses', () => {
      it('should add 50 XP for 100% quiz score', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 600,
          estimatedMinutes: 10,
          quizScore: 100,
        });

        expect(result.breakdown.quizBonus).toBe(50);
        expect(result.breakdown.baseWithBonuses).toBe(150);
        expect(result.totalXp).toBe(150);
      });

      it('should add 25 XP for 90-99% quiz score', () => {
        const result90 = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 600,
          estimatedMinutes: 10,
          quizScore: 90,
        });

        const result95 = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 600,
          estimatedMinutes: 10,
          quizScore: 95,
        });

        expect(result90.breakdown.quizBonus).toBe(25);
        expect(result95.breakdown.quizBonus).toBe(25);
      });

      it('should add 10 XP for 70-89% quiz score', () => {
        const result70 = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 600,
          estimatedMinutes: 10,
          quizScore: 70,
        });

        const result80 = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 600,
          estimatedMinutes: 10,
          quizScore: 80,
        });

        expect(result70.breakdown.quizBonus).toBe(10);
        expect(result80.breakdown.quizBonus).toBe(10);
      });

      it('should add 0 XP for < 70% quiz score', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 600,
          estimatedMinutes: 10,
          quizScore: 69,
        });

        expect(result.breakdown.quizBonus).toBe(0);
        expect(result.totalXp).toBe(100);
      });
    });

    describe('streak multipliers', () => {
      it('should apply 1.1x multiplier for 3-6 day streak', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 600,
          estimatedMinutes: 10,
          currentStreak: 3,
        });

        // 100 * 1.1 = 110
        expect(result.breakdown.streakMultiplier).toBe(1.1);
        expect(result.totalXp).toBe(110);
      });

      it('should apply 1.2x multiplier for 7-13 day streak', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 600,
          estimatedMinutes: 10,
          currentStreak: 7,
        });

        // 100 * 1.2 = 120
        expect(result.breakdown.streakMultiplier).toBe(1.2);
        expect(result.totalXp).toBe(120);
      });

      it('should apply 1.3x multiplier for 14-29 day streak', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 600,
          estimatedMinutes: 10,
          currentStreak: 14,
        });

        // 100 * 1.3 = 130
        expect(result.breakdown.streakMultiplier).toBe(1.3);
        expect(result.totalXp).toBe(130);
      });

      it('should apply 1.5x multiplier for 30+ day streak', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 600,
          estimatedMinutes: 10,
          currentStreak: 30,
        });

        // 100 * 1.5 = 150
        expect(result.breakdown.streakMultiplier).toBe(1.5);
        expect(result.totalXp).toBe(150);
      });
    });

    describe('combined bonuses', () => {
      it('should combine speed + quiz bonuses before applying streak multiplier', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 400, // < 80% time
          estimatedMinutes: 10,
          quizScore: 100, // Perfect score
          currentStreak: 0,
        });

        // Base: 100
        // Speed bonus: +25
        // Quiz bonus: +50
        // Total before multiplier: 175
        // Streak multiplier: 1.0
        // Final: 175
        expect(result.breakdown.base).toBe(100);
        expect(result.breakdown.speedBonus).toBe(25);
        expect(result.breakdown.quizBonus).toBe(50);
        expect(result.breakdown.baseWithBonuses).toBe(175);
        expect(result.totalXp).toBe(175);
      });

      it('should apply streak multiplier to (base + bonuses)', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 400, // < 80% time
          estimatedMinutes: 10,
          quizScore: 100, // Perfect score
          currentStreak: 7, // 1.2x multiplier
        });

        // Base: 100
        // Speed bonus: +25
        // Quiz bonus: +50
        // Total before multiplier: 175
        // Streak multiplier: 1.2
        // Final: 175 * 1.2 = 210
        expect(result.breakdown.base).toBe(100);
        expect(result.breakdown.speedBonus).toBe(25);
        expect(result.breakdown.quizBonus).toBe(50);
        expect(result.breakdown.baseWithBonuses).toBe(175);
        expect(result.breakdown.streakMultiplier).toBe(1.2);
        expect(result.totalXp).toBe(210);
      });

      it('should handle maximum possible XP', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 200, // Max base XP for a lesson
          timeSpentSeconds: 300, // Very fast (< 80%)
          estimatedMinutes: 15,
          quizScore: 100, // Perfect
          currentStreak: 30, // 1.5x multiplier
        });

        // Base: 200
        // Speed bonus: +25
        // Quiz bonus: +50
        // Total before multiplier: 275
        // Streak multiplier: 1.5
        // Final: 275 * 1.5 = 412.5 -> 412 (floored)
        expect(result.breakdown.base).toBe(200);
        expect(result.breakdown.speedBonus).toBe(25);
        expect(result.breakdown.quizBonus).toBe(50);
        expect(result.breakdown.baseWithBonuses).toBe(275);
        expect(result.breakdown.streakMultiplier).toBe(1.5);
        expect(result.totalXp).toBe(412); // Floor of 412.5
      });
    });

    describe('edge cases', () => {
      it('should handle 0 base XP', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 0,
          timeSpentSeconds: 400,
          estimatedMinutes: 10,
          quizScore: 100,
          currentStreak: 7,
        });

        // Base: 0
        // Speed bonus: +25
        // Quiz bonus: +50
        // Total before multiplier: 75
        // Streak multiplier: 1.2
        // Final: 75 * 1.2 = 90
        expect(result.totalXp).toBe(90);
      });

      it('should handle very long estimated time', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 1800, // 30 minutes
          estimatedMinutes: 60, // 60 minutes estimated
        });

        // 1800 / 3600 = 0.5 = 50% of estimated time
        // Speed bonus applies
        expect(result.breakdown.speedBonus).toBe(25);
        expect(result.totalXp).toBe(125);
      });

      it('should floor the final XP result', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 600,
          estimatedMinutes: 10,
          currentStreak: 3, // 1.1x multiplier
        });

        // 100 * 1.1 = 110 (exactly)
        expect(result.totalXp).toBe(110);
      });

      it('should handle fractional XP from multiplier', () => {
        const result = calculateLessonXpWithBonuses({
          baseXp: 155,
          timeSpentSeconds: 600,
          estimatedMinutes: 10,
          currentStreak: 3, // 1.1x multiplier
        });

        // 155 * 1.1 = 170.5 -> floor to 170
        expect(result.totalXp).toBe(170);
      });
    });

    describe('real-world scenarios', () => {
      it('should calculate XP for a beginner completing a quick lesson perfectly', () => {
        // Scenario: Beginner lesson, completed fast with perfect quiz, no streak
        const result = calculateLessonXpWithBonuses({
          baseXp: 100,
          timeSpentSeconds: 480, // 8 minutes (80% of 10 min)
          estimatedMinutes: 10,
          quizScore: 100,
          currentStreak: 0,
        });

        // No speed bonus (not < 80%)
        // Quiz bonus: +50
        // Total: 150
        expect(result.totalXp).toBe(150);
      });

      it('should calculate XP for an engaged user with streak', () => {
        // Scenario: Regular lesson, good completion, 7-day streak
        const result = calculateLessonXpWithBonuses({
          baseXp: 150,
          timeSpentSeconds: 720, // 12 minutes (80% of 15 min)
          estimatedMinutes: 15,
          quizScore: 85,
          currentStreak: 7,
        });

        // Speed bonus: 0 (exactly 80%)
        // Quiz bonus: +10 (70-89%)
        // Base with bonuses: 160
        // Streak multiplier: 1.2
        // Total: 192
        expect(result.totalXp).toBe(192);
      });

      it('should calculate XP for a power user on a long streak', () => {
        // Scenario: Advanced lesson, completed perfectly and fast, 30+ day streak
        const result = calculateLessonXpWithBonuses({
          baseXp: 200,
          timeSpentSeconds: 600, // 10 minutes (66% of 15 min)
          estimatedMinutes: 15,
          quizScore: 100,
          currentStreak: 45,
        });

        // Speed bonus: +25
        // Quiz bonus: +50
        // Base with bonuses: 275
        // Streak multiplier: 1.5
        // Total: 412
        expect(result.totalXp).toBe(412);
      });
    });
  });
});
