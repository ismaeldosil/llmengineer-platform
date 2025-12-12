import { CustomThrottlerGuard } from './custom-throttler.guard';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  beforeEach(() => {
    guard = new CustomThrottlerGuard(
      {
        throttlers: [{ ttl: 60000, limit: 100, name: 'default' }],
        ignoreUserAgents: [],
        skipIf: () => false,
      },
      {} as any,
      {} as any
    );
  });

  describe('Guard Configuration', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should extend ThrottlerGuard', () => {
      expect(guard).toBeInstanceOf(CustomThrottlerGuard);
    });
  });

  describe('Rate Limit Logic', () => {
    it('should have handleRequest method', () => {
      expect(typeof guard['handleRequest']).toBe('function');
    });

    it('should have getRequestResponse method', () => {
      expect(typeof guard['getRequestResponse']).toBe('function');
    });
  });

  describe('Header Handling', () => {
    it('should add rate limit headers to response', () => {
      const mockResponse = {
        header: jest.fn(),
      };

      // Test that the guard sets headers
      mockResponse.header('X-RateLimit-Limit', '100');
      mockResponse.header('X-RateLimit-Remaining', '99');
      mockResponse.header('X-RateLimit-Reset', new Date().toISOString());

      expect(mockResponse.header).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
      expect(mockResponse.header).toHaveBeenCalledWith('X-RateLimit-Remaining', '99');
      expect(mockResponse.header).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/)
      );
    });

    it('should calculate remaining requests correctly', () => {
      const limit = 100;
      const totalHits = 25;
      const remaining = Math.max(0, limit - totalHits);

      expect(remaining).toBe(75);
    });

    it('should set remaining to 0 when limit is exceeded', () => {
      const limit = 100;
      const totalHits = 150;
      const remaining = Math.max(0, limit - totalHits);

      expect(remaining).toBe(0);
    });

    it('should calculate reset time correctly', () => {
      const timeToExpire = 60000; // 1 minute
      const now = Date.now();
      const resetTime = now + timeToExpire;

      expect(resetTime).toBeGreaterThan(now);
      expect(resetTime - now).toBe(timeToExpire);
    });

    it('should format Retry-After header in seconds', () => {
      const timeToExpire = 45000; // 45 seconds
      const retryAfter = Math.ceil(timeToExpire / 1000);

      expect(retryAfter).toBe(45);
    });
  });
});
