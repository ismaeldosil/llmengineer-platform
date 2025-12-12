import { renderHook, act } from '@testing-library/react-native';
import { useSidebarCollapsed } from '../useSidebarCollapsed';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Platform to simulate web
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

describe('useSidebarCollapsed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Initial State', () => {
    it('should initialize with isCollapsed as false when no stored value', () => {
      const { result } = renderHook(() => useSidebarCollapsed());

      expect(result.current.isCollapsed).toBe(false);
    });

    it('should initialize with isLoaded as true after mount', async () => {
      const { result } = renderHook(() => useSidebarCollapsed());

      // Wait for useEffect to run
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoaded).toBe(true);
    });

    it('should load stored value from localStorage', async () => {
      localStorageMock.getItem.mockReturnValueOnce('true');

      const { result } = renderHook(() => useSidebarCollapsed());

      await act(async () => {
        await Promise.resolve();
      });

      expect(localStorageMock.getItem).toHaveBeenCalledWith('sidebar-collapsed');
    });
  });

  describe('toggleCollapsed', () => {
    it('should toggle isCollapsed from false to true', async () => {
      const { result } = renderHook(() => useSidebarCollapsed());

      await act(async () => {
        result.current.toggleCollapsed();
      });

      expect(result.current.isCollapsed).toBe(true);
    });

    it('should toggle isCollapsed from true to false', async () => {
      const { result } = renderHook(() => useSidebarCollapsed());

      // First toggle to true
      await act(async () => {
        result.current.toggleCollapsed();
      });

      // Then toggle back to false
      await act(async () => {
        result.current.toggleCollapsed();
      });

      expect(result.current.isCollapsed).toBe(false);
    });

    it('should persist toggled value to localStorage', async () => {
      const { result } = renderHook(() => useSidebarCollapsed());

      await act(async () => {
        result.current.toggleCollapsed();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
    });
  });

  describe('setCollapsed', () => {
    it('should set isCollapsed to true', async () => {
      const { result } = renderHook(() => useSidebarCollapsed());

      await act(async () => {
        result.current.setCollapsed(true);
      });

      expect(result.current.isCollapsed).toBe(true);
    });

    it('should set isCollapsed to false', async () => {
      const { result } = renderHook(() => useSidebarCollapsed());

      // First set to true
      await act(async () => {
        result.current.setCollapsed(true);
      });

      // Then set to false
      await act(async () => {
        result.current.setCollapsed(false);
      });

      expect(result.current.isCollapsed).toBe(false);
    });

    it('should persist value to localStorage', async () => {
      const { result } = renderHook(() => useSidebarCollapsed());

      await act(async () => {
        result.current.setCollapsed(true);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
    });
  });

  describe('localStorage errors', () => {
    it('should handle localStorage getItem error gracefully', async () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useSidebarCollapsed());

      await act(async () => {
        await Promise.resolve();
      });

      // Should still work with default value
      expect(result.current.isCollapsed).toBe(false);
      expect(result.current.isLoaded).toBe(true);
    });

    it('should handle localStorage setItem error gracefully', async () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useSidebarCollapsed());

      // Should not throw
      await act(async () => {
        result.current.toggleCollapsed();
      });

      // State should still update
      expect(result.current.isCollapsed).toBe(true);
    });
  });
});
