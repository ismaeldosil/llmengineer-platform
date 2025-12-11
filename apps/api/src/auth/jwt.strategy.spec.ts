import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let authService: AuthService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret-key'),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user when valid payload is provided', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
      };

      const mockUser = {
        id: payload.sub,
        email: payload.email,
        displayName: 'Test User',
        createdAt: new Date(),
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate(payload);

      expect(authService.validateUser).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const payload = {
        sub: 'invalid-user-id',
        email: 'invalid@example.com',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      expect(authService.validateUser).toHaveBeenCalledWith(payload.sub);
    });

    it('should call validateUser with correct user id from payload', async () => {
      const payload = {
        sub: 'specific-user-id',
        email: 'user@example.com',
      };

      const mockUser = {
        id: payload.sub,
        email: payload.email,
        displayName: 'Specific User',
        createdAt: new Date(),
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);

      await jwtStrategy.validate(payload);

      expect(authService.validateUser).toHaveBeenCalledTimes(1);
      expect(authService.validateUser).toHaveBeenCalledWith('specific-user-id');
    });
  });
});
