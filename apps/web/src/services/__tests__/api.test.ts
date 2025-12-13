import { apiSlice } from '../api';
import {
  useSubmitGameScoreMutation,
  useGetGameLeaderboardQuery,
  useGetUserGameScoresQuery,
} from '../api';

describe('apiSlice - Games Endpoints', () => {
  describe('submitGameScore', () => {
    it('should have submitGameScore endpoint', () => {
      expect(apiSlice.endpoints.submitGameScore).toBeDefined();
    });

    it('should configure submitGameScore as mutation', () => {
      const endpoint = apiSlice.endpoints.submitGameScore;
      expect(endpoint.initiate).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });
  });

  describe('getGameLeaderboard', () => {
    it('should have getGameLeaderboard endpoint', () => {
      expect(apiSlice.endpoints.getGameLeaderboard).toBeDefined();
    });

    it('should configure getGameLeaderboard as query', () => {
      const endpoint = apiSlice.endpoints.getGameLeaderboard;
      expect(endpoint.initiate).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });
  });

  describe('getUserGameScores', () => {
    it('should have getUserGameScores endpoint', () => {
      expect(apiSlice.endpoints.getUserGameScores).toBeDefined();
    });

    it('should configure getUserGameScores as query', () => {
      const endpoint = apiSlice.endpoints.getUserGameScores;
      expect(endpoint.initiate).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });
  });

  describe('API hooks', () => {
    it('should export useSubmitGameScoreMutation', () => {
      expect(useSubmitGameScoreMutation).toBeDefined();
    });

    it('should export useGetGameLeaderboardQuery', () => {
      expect(useGetGameLeaderboardQuery).toBeDefined();
    });

    it('should export useGetUserGameScoresQuery', () => {
      expect(useGetUserGameScoresQuery).toBeDefined();
    });
  });
});
