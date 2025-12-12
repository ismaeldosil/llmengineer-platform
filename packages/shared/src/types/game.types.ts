export type GameType = 'token-tetris' | 'prompt-golf' | 'embedding-match';

export interface GameMetadata {
  level?: number;
  time?: number;
  moves?: number;
  accuracy?: number;
  [key: string]: unknown;
}

export interface SubmitGameScoreRequest {
  score: number;
  metadata?: GameMetadata;
}

export interface BadgeInfo {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface SubmitGameScoreResponse {
  xpEarned: number;
  isHighScore: boolean;
  rank: number;
  newBadges: BadgeInfo[];
}

export interface GameLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  playedAt: Date;
  isCurrentUser?: boolean;
}

export interface GameLeaderboardResponse {
  entries: GameLeaderboardEntry[];
  currentUserRank?: number;
}

// XP calculation constants for games
export const GAME_XP_MULTIPLIERS: Record<GameType, number> = {
  'token-tetris': 0.01, // 1 XP per 100 points
  'prompt-golf': 0.05, // 1 XP per 20 points
  'embedding-match': 0.02, // 1 XP per 50 points
};

export const MIN_GAME_XP = 5;
export const MAX_GAME_XP = 100;
