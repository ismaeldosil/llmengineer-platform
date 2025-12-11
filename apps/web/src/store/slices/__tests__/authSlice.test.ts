import authReducer, { setCredentials, logout, setLoading } from '../authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setCredentials', () => {
    it('should set user and token', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
      };
      const token = 'test-token-123';

      const actual = authReducer(
        initialState,
        setCredentials({ user: user as any, token })
      );

      expect(actual.user).toEqual(user);
      expect(actual.token).toBe(token);
      expect(actual.isAuthenticated).toBe(true);
      expect(actual.isLoading).toBe(false);
    });

    it('should update existing state with new credentials', () => {
      const oldState = {
        user: {
          id: '1',
          email: 'old@example.com',
          displayName: 'Old User',
        } as any,
        token: 'old-token',
        isAuthenticated: true,
        isLoading: false,
      };

      const newUser = {
        id: '2',
        email: 'new@example.com',
        displayName: 'New User',
      };
      const newToken = 'new-token-456';

      const actual = authReducer(
        oldState,
        setCredentials({ user: newUser as any, token: newToken })
      );

      expect(actual.user).toEqual(newUser);
      expect(actual.token).toBe(newToken);
      expect(actual.isAuthenticated).toBe(true);
      expect(actual.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user and token', () => {
      const authenticatedState = {
        user: {
          id: '1',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        token: 'test-token-123',
        isAuthenticated: true,
        isLoading: false,
      };

      const actual = authReducer(authenticatedState, logout());

      expect(actual.user).toBeNull();
      expect(actual.token).toBeNull();
      expect(actual.isAuthenticated).toBe(false);
      expect(actual.isLoading).toBe(false);
    });

    it('should handle logout when already logged out', () => {
      const actual = authReducer(initialState, logout());

      expect(actual.user).toBeNull();
      expect(actual.token).toBeNull();
      expect(actual.isAuthenticated).toBe(false);
      expect(actual.isLoading).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const actual = authReducer(initialState, setLoading(true));

      expect(actual.isLoading).toBe(true);
    });

    it('should set loading to false', () => {
      const loadingState = {
        ...initialState,
        isLoading: true,
      };

      const actual = authReducer(loadingState, setLoading(false));

      expect(actual.isLoading).toBe(false);
    });

    it('should not affect other state properties', () => {
      const authenticatedState = {
        user: {
          id: '1',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        token: 'test-token-123',
        isAuthenticated: true,
        isLoading: false,
      };

      const actual = authReducer(authenticatedState, setLoading(true));

      expect(actual.user).toEqual(authenticatedState.user);
      expect(actual.token).toBe(authenticatedState.token);
      expect(actual.isAuthenticated).toBe(true);
      expect(actual.isLoading).toBe(true);
    });
  });
});
