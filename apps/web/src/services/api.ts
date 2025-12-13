import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store';
import type {
  User,
  UserProgress,
  Lesson,
  LessonCompletion,
  Badge,
  LeaderboardEntry,
  Quiz,
  QuizResult,
  SubmitQuizRequest,
  GameType,
  SubmitGameScoreRequest,
  SubmitGameScoreResponse,
  GameLeaderboardResponse,
} from '@llmengineer/shared';

export interface SearchResult {
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  week: number;
  matchType: 'title' | 'description' | 'section' | 'keyPoint' | 'quiz';
  sectionTitle?: string;
  sectionIndex?: number;
  questionIndex?: number;
  matchedText: string;
  contextBefore: string;
  contextAfter: string;
}

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
  tagTypes: ['User', 'Progress', 'Lessons', 'Badges', 'Leaderboard', 'Quiz', 'Games'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<
      { user: User; accessToken: string },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<
      { user: User; accessToken: string },
      { email: string; password: string; displayName: string }
    >({
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
    updateProfile: builder.mutation<
      User,
      { displayName?: string; avatarUrl?: string; bio?: string }
    >({
      query: (data) => ({
        url: '/users/me',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
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
    completeLesson: builder.mutation<
      LessonCompletion,
      { lessonId: string; timeSpentSeconds: number }
    >({
      query: ({ lessonId, ...body }) => ({
        url: `/lessons/${lessonId}/complete`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Progress', 'Lessons', 'Badges'],
    }),
    searchLessons: builder.query<SearchResult[], { query: string; limit?: number }>({
      query: ({ query, limit = 20 }) =>
        `/lessons/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      providesTags: ['Lessons'],
    }),

    // Badges
    getBadges: builder.query<{ earned: Badge[]; locked: Badge[] }, void>({
      query: () => '/badges',
      providesTags: ['Badges'],
    }),

    // Leaderboard
    getLeaderboard: builder.query<
      { entries: LeaderboardEntry[]; userRank: number },
      { type: 'global' | 'weekly'; limit?: number }
    >({
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

    // Quiz
    getLessonQuiz: builder.query<Quiz, string>({
      query: (lessonId) => `/lessons/${lessonId}/quiz`,
      providesTags: (_result, _error, lessonId) => [{ type: 'Quiz', id: lessonId }],
    }),
    submitQuiz: builder.mutation<QuizResult, { lessonId: string } & SubmitQuizRequest>({
      query: ({ lessonId, ...body }) => ({
        url: `/lessons/${lessonId}/quiz/submit`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Progress', 'Lessons', 'Badges'],
    }),

    // Games
    submitGameScore: builder.mutation<
      SubmitGameScoreResponse,
      { gameType: GameType } & SubmitGameScoreRequest
    >({
      query: ({ gameType, ...body }) => ({
        url: `/games/scores`,
        method: 'POST',
        body: { gameType, ...body },
      }),
      invalidatesTags: ['Games', 'Progress', 'Badges'],
    }),
    getGameLeaderboard: builder.query<
      GameLeaderboardResponse,
      { gameType: GameType; limit?: number }
    >({
      query: ({ gameType, limit = 10 }) => `/games/scores/${gameType}?limit=${limit}`,
      providesTags: (_result, _error, { gameType }) => [{ type: 'Games', id: gameType }],
    }),
    getUserGameScores: builder.query<
      Array<{ gameType: GameType; highScore: number; rank: number; playedAt: Date }>,
      void
    >({
      query: () => '/games/scores/me',
      providesTags: ['Games'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useGetProgressQuery,
  useGetLessonsQuery,
  useGetNextLessonQuery,
  useGetLessonQuery,
  useCompleteLessonMutation,
  useSearchLessonsQuery,
  useGetBadgesQuery,
  useGetLeaderboardQuery,
  useCheckinMutation,
  useGetLessonQuizQuery,
  useSubmitQuizMutation,
  useSubmitGameScoreMutation,
  useGetGameLeaderboardQuery,
  useGetUserGameScoresQuery,
} = apiSlice;
