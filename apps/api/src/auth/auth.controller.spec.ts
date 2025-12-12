import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        user: {
          id: 'user-id',
          email: loginDto.email,
          displayName: 'Test User',
        },
        accessToken: 'jwt-token',
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });

    it('should return user and accessToken on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'securePassword',
      };

      const mockResponse = {
        user: {
          id: 'test-id',
          email: loginDto.email,
          displayName: 'Test User',
        },
        accessToken: 'mock-jwt-token',
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe(loginDto.email);
    });
  });

  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'password123',
        displayName: 'New User',
      };

      const expectedResult = {
        user: {
          id: 'new-user-id',
          email: registerDto.email,
          displayName: registerDto.displayName,
        },
        accessToken: 'jwt-token',
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });

    it('should return user and accessToken on successful registration', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'password123',
        displayName: 'New User',
      };

      const mockResponse = {
        user: {
          id: 'new-id',
          email: registerDto.email,
          displayName: registerDto.displayName,
        },
        accessToken: 'mock-jwt-token',
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.displayName).toBe(registerDto.displayName);
    });
  });

  describe('getMe', () => {
    it('should return the current user from @CurrentUser decorator', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        level: 1,
        totalXP: 0,
      };

      const result = await controller.getMe(mockUser);

      expect(result).toEqual(mockUser);
      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
    });

    it('should return user with all properties', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'complete@example.com',
        displayName: 'Complete User',
        level: 5,
        totalXP: 5000,
        streakDays: 10,
        createdAt: new Date('2024-01-01'),
      } as {
        id: string;
        email: string;
        displayName: string;
        level: number;
        totalXP: number;
        streakDays: number;
        createdAt: Date;
      };

      const result = await controller.getMe(
        mockUser as { id: string; email: string; displayName: string }
      );

      expect(result).toEqual(mockUser);
      expect((result as typeof mockUser).level).toBe(5);
      expect((result as typeof mockUser).totalXP).toBe(5000);
      expect((result as typeof mockUser).streakDays).toBe(10);
    });
  });
});
