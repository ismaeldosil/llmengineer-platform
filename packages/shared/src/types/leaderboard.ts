export type LeaderboardType = 'global' | 'weekly';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalXp: number;
  level: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank: number;
}

export interface LeaderboardRequest {
  type: LeaderboardType;
  limit?: number;
}
