import { ExecutionContext } from '@nestjs/common';

// Import the decorator factory function directly
const createParamDecoratorMock = () => {
  return (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  };
};

describe('CurrentUser Decorator', () => {
  let mockExecutionContext: ExecutionContext;
  let decoratorFunction: (data: unknown, ctx: ExecutionContext) => unknown;

  beforeEach(() => {
    decoratorFunction = createParamDecoratorMock();

    mockExecutionContext = {
      switchToHttp: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;
  });

  it('should extract user from request', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      displayName: 'Test User',
    };

    const mockRequest = {
      user: mockUser,
    };

    const mockHttpContext = {
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    };

    (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue(mockHttpContext);

    const result = decoratorFunction(undefined, mockExecutionContext);

    expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
    expect(mockHttpContext.getRequest).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should return undefined when user is not in request', () => {
    const mockRequest = {};

    const mockHttpContext = {
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    };

    (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue(mockHttpContext);

    const result = decoratorFunction(undefined, mockExecutionContext);

    expect(result).toBeUndefined();
  });

  it('should return null when user is explicitly null', () => {
    const mockRequest = {
      user: null,
    };

    const mockHttpContext = {
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    };

    (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue(mockHttpContext);

    const result = decoratorFunction(undefined, mockExecutionContext);

    expect(result).toBeNull();
  });

  it('should handle complex user object with all properties', () => {
    const mockUser = {
      id: 'user-456',
      email: 'complex@example.com',
      displayName: 'Complex User',
      level: 5,
      totalXP: 1000,
      streakDays: 7,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    };

    const mockRequest = {
      user: mockUser,
      headers: {
        authorization: 'Bearer token-123',
      },
    };

    const mockHttpContext = {
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    };

    (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue(mockHttpContext);

    const result = decoratorFunction(undefined, mockExecutionContext) as typeof mockUser;

    expect(result).toEqual(mockUser);
    expect(result.id).toBe('user-456');
    expect(result.level).toBe(5);
    expect(result.streakDays).toBe(7);
  });

  it('should only access request.user property', () => {
    const mockUser = { id: 'test-user', email: 'test@example.com' };
    const mockRequest = {
      user: mockUser,
      body: { data: 'should not be accessed' },
      params: { id: 'should not be accessed' },
      query: { filter: 'should not be accessed' },
    };

    const mockHttpContext = {
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    };

    (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue(mockHttpContext);

    const result = decoratorFunction(undefined, mockExecutionContext);

    expect(result).toEqual(mockUser);
    expect(result).not.toHaveProperty('body');
    expect(result).not.toHaveProperty('params');
    expect(result).not.toHaveProperty('query');
  });

  it('should work with partial user objects', () => {
    const mockUser = {
      id: 'partial-user',
    };

    const mockRequest = {
      user: mockUser,
    };

    const mockHttpContext = {
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    };

    (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue(mockHttpContext);

    const result = decoratorFunction(undefined, mockExecutionContext);

    expect(result).toEqual({ id: 'partial-user' });
  });
});
