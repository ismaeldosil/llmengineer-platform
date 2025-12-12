export type LeaderboardType = 'global' | 'weekly';
export type RankChangeDirection = 'up' | 'down' | 'same' | 'new';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalXp: number;
  level: number;
  isCurrentUser?: boolean;
  rankChange?: number;
  rankChangeDirection?: RankChangeDirection;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank: number;
}

export interface LeaderboardRequest {
  type: LeaderboardType;
  limit?: number;
}
