import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../storage';

// AsyncStorage is already mocked in jest.setup.js

describe('storage utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveToken', () => {
    it('should save token to AsyncStorage', async () => {
      const token = 'test-token-123';
      await storage.saveToken(token);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@llmengineer/auth_token', token);
    });

    it('should throw error if save fails', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(storage.saveToken('token')).rejects.toThrow('Storage error');
    });
  });

  describe('getToken', () => {
    it('should retrieve token from AsyncStorage', async () => {
      const token = 'test-token-123';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(token);

      const result = await storage.getToken();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@llmengineer/auth_token');
      expect(result).toBe(token);
    });

    it('should return null if no token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storage.getToken();

      expect(result).toBeNull();
    });

    it('should return null if retrieval fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await storage.getToken();

      expect(result).toBeNull();
    });
  });

  describe('saveUser', () => {
    it('should save user object to AsyncStorage', async () => {
      const user = { id: '1', email: 'test@example.com', displayName: 'Test User' };
      await storage.saveUser(user);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@llmengineer/user',
        JSON.stringify(user)
      );
    });

    it('should throw error if save fails', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(storage.saveUser({ id: '1' })).rejects.toThrow('Storage error');
    });
  });

  describe('getUser', () => {
    it('should retrieve and parse user from AsyncStorage', async () => {
      const user = { id: '1', email: 'test@example.com', displayName: 'Test User' };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(user));

      const result = await storage.getUser();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@llmengineer/user');
      expect(result).toEqual(user);
    });

    it('should return null if no user exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storage.getUser();

      expect(result).toBeNull();
    });

    it('should return null if retrieval fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await storage.getUser();

      expect(result).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('should remove both token and user from AsyncStorage', async () => {
      await storage.clearAuth();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@llmengineer/auth_token',
        '@llmengineer/user',
      ]);
    });

    it('should throw error if clear fails', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.multiRemove as jest.Mock).mockRejectedValue(error);

      await expect(storage.clearAuth()).rejects.toThrow('Storage error');
    });
  });

  describe('clear', () => {
    it('should clear all AsyncStorage', async () => {
      await storage.clear();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('should throw error if clear fails', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.clear as jest.Mock).mockRejectedValue(error);

      await expect(storage.clear()).rejects.toThrow('Storage error');
    });
  });
});
