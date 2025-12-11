import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LeaderboardQueryDto, LeaderboardType } from './leaderboard-query.dto';

describe('LeaderboardQueryDto', () => {
  describe('validation', () => {
    it('should accept valid global type', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: LeaderboardType.GLOBAL,
        limit: 50,
        offset: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid weekly type', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: LeaderboardType.WEEKLY,
        limit: 50,
        offset: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should use default values when not provided', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {});

      expect(dto.type).toBe(LeaderboardType.GLOBAL);
      expect(dto.limit).toBe(50);
      expect(dto.offset).toBe(0);

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid type', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('type');
    });

    it('should reject limit less than 1', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: LeaderboardType.GLOBAL,
        limit: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
    });

    it('should reject limit greater than 100', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: LeaderboardType.GLOBAL,
        limit: 101,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
    });

    it('should accept limit of 1', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: LeaderboardType.GLOBAL,
        limit: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept limit of 100', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: LeaderboardType.GLOBAL,
        limit: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject negative offset', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: LeaderboardType.GLOBAL,
        offset: -1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('offset');
    });

    it('should accept offset of 0', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: LeaderboardType.GLOBAL,
        offset: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept large offset', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: LeaderboardType.GLOBAL,
        offset: 1000,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject non-integer limit', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: LeaderboardType.GLOBAL,
        limit: '50.5',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
    });

    it('should reject non-integer offset', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: LeaderboardType.GLOBAL,
        offset: '10.5',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('offset');
    });

    it('should convert string numbers to integers', async () => {
      const dto = plainToInstance(LeaderboardQueryDto, {
        type: LeaderboardType.GLOBAL,
        limit: '25',
        offset: '10',
      });

      expect(dto.limit).toBe(25);
      expect(dto.offset).toBe(10);

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('LeaderboardType enum', () => {
    it('should have GLOBAL value', () => {
      expect(LeaderboardType.GLOBAL).toBe('global');
    });

    it('should have WEEKLY value', () => {
      expect(LeaderboardType.WEEKLY).toBe('weekly');
    });
  });
});
