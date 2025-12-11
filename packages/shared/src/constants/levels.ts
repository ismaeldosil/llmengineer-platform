export const LEVEL_TITLES: Record<number, string> = {
  1: 'Prompt Curious',
  2: 'Prompt Apprentice',
  3: 'Token Tinkerer',
  4: 'Context Crafter',
  5: 'Embedding Explorer',
  6: 'RAG Rookie',
  7: 'Vector Voyager',
  8: 'Pipeline Pioneer',
  9: 'Agent Architect',
  10: 'LLM Engineer',
};

export const XP_PER_LEVEL = 500;

export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

export function getLevelTitle(level: number): string {
  if (level > 10) {
    return 'LLM Master';
  }
  return LEVEL_TITLES[level] || 'LLM Master';
}

export function getXpForNextLevel(level: number): number {
  return level * XP_PER_LEVEL;
}

export function getXpProgressInLevel(totalXp: number): number {
  return totalXp % XP_PER_LEVEL;
}

export function getXpProgressPercent(currentXp: number): number {
  const xpInCurrentLevel = getXpProgressInLevel(currentXp);
  return Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100);
}
