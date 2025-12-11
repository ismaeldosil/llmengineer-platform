import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard with jwt strategy', () => {
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });

  describe('canActivate', () => {
    it('should call super.canActivate with the execution context', async () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {
              authorization: 'Bearer valid-token',
            },
          }),
        }),
        getClass: jest.fn(),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      // Mock the parent class canActivate method
      const superCanActivate = jest.fn().mockResolvedValue(true);
      jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate').mockImplementation(superCanActivate);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return false when authentication fails', async () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
          }),
        }),
        getClass: jest.fn(),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      // Mock the parent class canActivate method to return false
      const superCanActivate = jest.fn().mockResolvedValue(false);
      jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate').mockImplementation(superCanActivate);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should throw error when token is invalid', async () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {
              authorization: 'Bearer invalid-token',
            },
          }),
        }),
        getClass: jest.fn(),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      // Mock the parent class canActivate method to throw
      const superCanActivate = jest.fn().mockRejectedValue(new Error('Unauthorized'));
      jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate').mockImplementation(superCanActivate);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Unauthorized');
    });
  });
});
