import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserProgress, Badge } from '@llmengineer/shared';

export interface ProgressState {
  totalXp: number;
  level: number;
  levelTitle: string;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  badges: Badge[];
  isLoading: boolean;
}

const initialState: ProgressState = {
  totalXp: 0,
  level: 1,
  levelTitle: 'Prompt Curious',
  currentStreak: 0,
  longestStreak: 0,
  lessonsCompleted: 0,
  badges: [],
  isLoading: true,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setProgress: (state, action: PayloadAction<UserProgress>) => {
      state.totalXp = action.payload.totalXp;
      state.level = action.payload.level;
      state.levelTitle = action.payload.levelTitle;
      state.currentStreak = action.payload.currentStreak;
      state.longestStreak = action.payload.longestStreak;
      state.lessonsCompleted = action.payload.lessonsCompleted;
      state.badges = action.payload.badges;
      state.isLoading = false;
    },
    addXp: (state, action: PayloadAction<{ xp: number; newLevel?: number; newTitle?: string }>) => {
      state.totalXp += action.payload.xp;
      if (action.payload.newLevel) {
        state.level = action.payload.newLevel;
      }
      if (action.payload.newTitle) {
        state.levelTitle = action.payload.newTitle;
      }
    },
    incrementStreak: (state) => {
      state.currentStreak += 1;
      if (state.currentStreak > state.longestStreak) {
        state.longestStreak = state.currentStreak;
      }
    },
    addBadge: (state, action: PayloadAction<Badge>) => {
      state.badges.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setProgress, addXp, incrementStreak, addBadge, setLoading } = progressSlice.actions;
export default progressSlice.reducer;
