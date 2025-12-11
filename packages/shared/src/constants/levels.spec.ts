import {
  LEVEL_TITLES,
  XP_PER_LEVEL,
  calculateLevel,
  getLevelTitle,
  getXpForNextLevel,
  getXpProgressInLevel,
  getXpProgressPercent,
} from './levels';

describe('levels', () => {
  describe('LEVEL_TITLES', () => {
    it('should have titles for levels 1-10', () => {
      expect(LEVEL_TITLES[1]).toBe('Prompt Curious');
      expect(LEVEL_TITLES[2]).toBe('Prompt Apprentice');
      expect(LEVEL_TITLES[3]).toBe('Token Tinkerer');
      expect(LEVEL_TITLES[4]).toBe('Context Crafter');
      expect(LEVEL_TITLES[5]).toBe('Embedding Explorer');
      expect(LEVEL_TITLES[6]).toBe('RAG Rookie');
      expect(LEVEL_TITLES[7]).toBe('Vector Voyager');
      expect(LEVEL_TITLES[8]).toBe('Pipeline Pioneer');
      expect(LEVEL_TITLES[9]).toBe('Agent Architect');
      expect(LEVEL_TITLES[10]).toBe('LLM Engineer');
    });
  });

  describe('XP_PER_LEVEL', () => {
    it('should be 500', () => {
      expect(XP_PER_LEVEL).toBe(500);
    });
  });

  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('should return level 1 for 1-499 XP', () => {
      expect(calculateLevel(1)).toBe(1);
      expect(calculateLevel(100)).toBe(1);
      expect(calculateLevel(499)).toBe(1);
    });

    it('should return level 2 for 500-999 XP', () => {
      expect(calculateLevel(500)).toBe(2);
      expect(calculateLevel(750)).toBe(2);
      expect(calculateLevel(999)).toBe(2);
    });

    it('should return level 3 for 1000-1499 XP', () => {
      expect(calculateLevel(1000)).toBe(3);
      expect(calculateLevel(1250)).toBe(3);
      expect(calculateLevel(1499)).toBe(3);
    });

    it('should return level 4 for 1500-1999 XP', () => {
      expect(calculateLevel(1500)).toBe(4);
      expect(calculateLevel(1750)).toBe(4);
      expect(calculateLevel(1999)).toBe(4);
    });

    it('should return level 5 for 2000-2499 XP', () => {
      expect(calculateLevel(2000)).toBe(5);
      expect(calculateLevel(2250)).toBe(5);
      expect(calculateLevel(2499)).toBe(5);
    });

    it('should return level 6 for 2500-2999 XP', () => {
      expect(calculateLevel(2500)).toBe(6);
      expect(calculateLevel(2750)).toBe(6);
      expect(calculateLevel(2999)).toBe(6);
    });

    it('should return level 7 for 3000-3499 XP', () => {
      expect(calculateLevel(3000)).toBe(7);
      expect(calculateLevel(3250)).toBe(7);
      expect(calculateLevel(3499)).toBe(7);
    });

    it('should return level 8 for 3500-3999 XP', () => {
      expect(calculateLevel(3500)).toBe(8);
      expect(calculateLevel(3750)).toBe(8);
      expect(calculateLevel(3999)).toBe(8);
    });

    it('should return level 9 for 4000-4499 XP', () => {
      expect(calculateLevel(4000)).toBe(9);
      expect(calculateLevel(4250)).toBe(9);
      expect(calculateLevel(4499)).toBe(9);
    });

    it('should return level 10 for 4500-4999 XP', () => {
      expect(calculateLevel(4500)).toBe(10);
      expect(calculateLevel(4750)).toBe(10);
      expect(calculateLevel(4999)).toBe(10);
    });

    it('should continue beyond level 10', () => {
      expect(calculateLevel(5000)).toBe(11);
      expect(calculateLevel(10000)).toBe(21);
      expect(calculateLevel(50000)).toBe(101);
    });
  });

  describe('getLevelTitle', () => {
    it('should return correct title for level 1', () => {
      expect(getLevelTitle(1)).toBe('Prompt Curious');
    });

    it('should return correct title for level 2', () => {
      expect(getLevelTitle(2)).toBe('Prompt Apprentice');
    });

    it('should return correct title for level 3', () => {
      expect(getLevelTitle(3)).toBe('Token Tinkerer');
    });

    it('should return correct title for level 4', () => {
      expect(getLevelTitle(4)).toBe('Context Crafter');
    });

    it('should return correct title for level 5', () => {
      expect(getLevelTitle(5)).toBe('Embedding Explorer');
    });

    it('should return correct title for level 6', () => {
      expect(getLevelTitle(6)).toBe('RAG Rookie');
    });

    it('should return correct title for level 7', () => {
      expect(getLevelTitle(7)).toBe('Vector Voyager');
    });

    it('should return correct title for level 8', () => {
      expect(getLevelTitle(8)).toBe('Pipeline Pioneer');
    });

    it('should return correct title for level 9', () => {
      expect(getLevelTitle(9)).toBe('Agent Architect');
    });

    it('should return correct title for level 10', () => {
      expect(getLevelTitle(10)).toBe('LLM Engineer');
    });

    it('should return "LLM Master" for levels beyond 10', () => {
      expect(getLevelTitle(11)).toBe('LLM Master');
      expect(getLevelTitle(20)).toBe('LLM Master');
      expect(getLevelTitle(100)).toBe('LLM Master');
    });
  });

  describe('getXpForNextLevel', () => {
    it('should return 500 XP for level 1', () => {
      expect(getXpForNextLevel(1)).toBe(500);
    });

    it('should return 1000 XP for level 2', () => {
      expect(getXpForNextLevel(2)).toBe(1000);
    });

    it('should return 1500 XP for level 3', () => {
      expect(getXpForNextLevel(3)).toBe(1500);
    });

    it('should return 2000 XP for level 4', () => {
      expect(getXpForNextLevel(4)).toBe(2000);
    });

    it('should return 5000 XP for level 10', () => {
      expect(getXpForNextLevel(10)).toBe(5000);
    });

    it('should scale linearly with level', () => {
      expect(getXpForNextLevel(15)).toBe(7500);
      expect(getXpForNextLevel(20)).toBe(10000);
    });
  });

  describe('getXpProgressInLevel', () => {
    it('should return 0 at the start of a level', () => {
      expect(getXpProgressInLevel(0)).toBe(0);
      expect(getXpProgressInLevel(500)).toBe(0);
      expect(getXpProgressInLevel(1000)).toBe(0);
      expect(getXpProgressInLevel(1500)).toBe(0);
    });

    it('should return progress within level 1', () => {
      expect(getXpProgressInLevel(100)).toBe(100);
      expect(getXpProgressInLevel(250)).toBe(250);
      expect(getXpProgressInLevel(499)).toBe(499);
    });

    it('should return progress within level 2', () => {
      expect(getXpProgressInLevel(600)).toBe(100);
      expect(getXpProgressInLevel(750)).toBe(250);
      expect(getXpProgressInLevel(999)).toBe(499);
    });

    it('should return progress within level 3', () => {
      expect(getXpProgressInLevel(1100)).toBe(100);
      expect(getXpProgressInLevel(1250)).toBe(250);
      expect(getXpProgressInLevel(1499)).toBe(499);
    });

    it('should work for high levels', () => {
      expect(getXpProgressInLevel(5100)).toBe(100);
      expect(getXpProgressInLevel(10250)).toBe(250);
    });
  });

  describe('getXpProgressPercent', () => {
    it('should return 0% at the start of a level', () => {
      expect(getXpProgressPercent(0)).toBe(0);
      expect(getXpProgressPercent(500)).toBe(0);
      expect(getXpProgressPercent(1000)).toBe(0);
      expect(getXpProgressPercent(1500)).toBe(0);
    });

    it('should return 50% at the middle of a level', () => {
      expect(getXpProgressPercent(250)).toBe(50);
      expect(getXpProgressPercent(750)).toBe(50);
      expect(getXpProgressPercent(1250)).toBe(50);
    });

    it('should return 100% near the end of a level (rounds up)', () => {
      // 499 / 500 = 0.998 = 99.8% -> rounds to 100%
      expect(getXpProgressPercent(499)).toBe(100);
      expect(getXpProgressPercent(999)).toBe(100);
    });

    it('should return 20% for 100 XP in a level', () => {
      expect(getXpProgressPercent(100)).toBe(20);
      expect(getXpProgressPercent(600)).toBe(20);
      expect(getXpProgressPercent(1100)).toBe(20);
    });

    it('should return 40% for 200 XP in a level', () => {
      expect(getXpProgressPercent(200)).toBe(40);
      expect(getXpProgressPercent(700)).toBe(40);
    });

    it('should return 60% for 300 XP in a level', () => {
      expect(getXpProgressPercent(300)).toBe(60);
      expect(getXpProgressPercent(800)).toBe(60);
    });

    it('should return 80% for 400 XP in a level', () => {
      expect(getXpProgressPercent(400)).toBe(80);
      expect(getXpProgressPercent(900)).toBe(80);
    });

    it('should round to nearest integer', () => {
      // 125 / 500 = 0.25 = 25%
      expect(getXpProgressPercent(125)).toBe(25);
      // 375 / 500 = 0.75 = 75%
      expect(getXpProgressPercent(375)).toBe(75);
      // 1 / 500 = 0.002 = 0.2% -> rounds to 0%
      expect(getXpProgressPercent(1)).toBe(0);
    });
  });

  describe('integration tests', () => {
    it('should correctly calculate level progression from 0 to 10', () => {
      const progressions = [
        { xp: 0, level: 1, title: 'Prompt Curious', nextLevel: 500 },
        { xp: 500, level: 2, title: 'Prompt Apprentice', nextLevel: 1000 },
        { xp: 1000, level: 3, title: 'Token Tinkerer', nextLevel: 1500 },
        { xp: 1500, level: 4, title: 'Context Crafter', nextLevel: 2000 },
        { xp: 2000, level: 5, title: 'Embedding Explorer', nextLevel: 2500 },
        { xp: 2500, level: 6, title: 'RAG Rookie', nextLevel: 3000 },
        { xp: 3000, level: 7, title: 'Vector Voyager', nextLevel: 3500 },
        { xp: 3500, level: 8, title: 'Pipeline Pioneer', nextLevel: 4000 },
        { xp: 4000, level: 9, title: 'Agent Architect', nextLevel: 4500 },
        { xp: 4500, level: 10, title: 'LLM Engineer', nextLevel: 5000 },
      ];

      progressions.forEach(({ xp, level, title, nextLevel }) => {
        expect(calculateLevel(xp)).toBe(level);
        expect(getLevelTitle(level)).toBe(title);
        expect(getXpForNextLevel(level)).toBe(nextLevel);
        expect(getXpProgressInLevel(xp)).toBe(0);
        expect(getXpProgressPercent(xp)).toBe(0);
      });
    });

    it('should correctly calculate progress in the middle of levels', () => {
      // Level 1, 50% progress (250 XP)
      expect(calculateLevel(250)).toBe(1);
      expect(getXpProgressInLevel(250)).toBe(250);
      expect(getXpProgressPercent(250)).toBe(50);

      // Level 5, 80% progress (2400 XP = 2000 + 400)
      expect(calculateLevel(2400)).toBe(5);
      expect(getXpProgressInLevel(2400)).toBe(400);
      expect(getXpProgressPercent(2400)).toBe(80);

      // Level 9, 20% progress (4100 XP = 4000 + 100)
      expect(calculateLevel(4100)).toBe(9);
      expect(getXpProgressInLevel(4100)).toBe(100);
      expect(getXpProgressPercent(4100)).toBe(20);
    });
  });
});
