import { Badge } from './badge';

export interface UserProgress {
  totalXp: number;
  level: number;
  levelTitle: string;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  badges: Badge[];
}

export interface CheckinResponse {
  currentStreak: number;
  streakBonusXp: number;
  alreadyCheckedIn?: boolean;
}

export interface XpGainEvent {
  xp: number;
  newLevel?: number;
  newTitle?: string;
  newBadges?: Badge[];
}
