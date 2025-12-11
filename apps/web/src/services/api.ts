import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store';
import type {
  User,
  UserProgress,
  Lesson,
  LessonCompletion,
  Badge,
  LeaderboardEntry,
} from '@llmengineer/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Progress', 'Lessons', 'Badges', 'Leaderboard'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<{ user: User; accessToken: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<{ user: User; accessToken: string }, { email: string; password: string; displayName: string }>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

    // Progress
    getProgress: builder.query<UserProgress, void>({
      query: () => '/users/me/progress',
      providesTags: ['Progress'],
    }),

    // Lessons
    getLessons: builder.query<Lesson[], void>({
      query: () => '/lessons',
      providesTags: ['Lessons'],
    }),
    getNextLesson: builder.query<Lesson | null, void>({
      query: () => '/lessons/next',
      providesTags: ['Lessons'],
    }),
    getLesson: builder.query<Lesson, string>({
      query: (id) => `/lessons/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Lessons', id }],
    }),
    completeLesson: builder.mutation<LessonCompletion, { lessonId: string; timeSpentSeconds: number }>({
      query: ({ lessonId, ...body }) => ({
        url: `/lessons/${lessonId}/complete`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Progress', 'Lessons', 'Badges'],
    }),

    // Badges
    getBadges: builder.query<{ earned: Badge[]; locked: Badge[] }, void>({
      query: () => '/badges',
      providesTags: ['Badges'],
    }),

    // Leaderboard
    getLeaderboard: builder.query<{ entries: LeaderboardEntry[]; userRank: number }, { type: 'global' | 'weekly'; limit?: number }>({
      query: ({ type, limit = 10 }) => `/leaderboard?type=${type}&limit=${limit}`,
      providesTags: ['Leaderboard'],
    }),

    // Streaks
    checkin: builder.mutation<{ currentStreak: number; streakBonusXp: number }, void>({
      query: () => ({
        url: '/streaks/checkin',
        method: 'POST',
      }),
      invalidatesTags: ['Progress'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useGetProgressQuery,
  useGetLessonsQuery,
  useGetNextLessonQuery,
  useGetLessonQuery,
  useCompleteLessonMutation,
  useGetBadgesQuery,
  useGetLeaderboardQuery,
  useCheckinMutation,
} = apiSlice;
