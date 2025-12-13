import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = 'sidebar-collapsed';

export function useSidebarCollapsed() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial state from localStorage (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          setIsCollapsed(stored === 'true');
        }
      } catch {
        // localStorage not available
      }
    }
    setIsLoaded(true);
  }, []);

  // Persist state to localStorage
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, String(newValue));
        } catch {
          // localStorage not available
        }
      }
      return newValue;
    });
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setIsCollapsed(value);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, String(value));
      } catch {
        // localStorage not available
      }
    }
  }, []);

  return {
    isCollapsed,
    isLoaded,
    toggleCollapsed,
    setCollapsed,
  };
}
