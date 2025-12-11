import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import type { RootState } from '@/store';
import { setCredentials, logout as logoutAction, setLoading } from '@/store/slices/authSlice';
import { apiSlice } from '@/services/api';
import { storage } from '@/utils/storage';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const restoreSession = async () => {
    try {
      dispatch(setLoading(true));
      const token = await storage.getToken();
      const user = await storage.getUser();

      if (token && user) {
        dispatch(setCredentials({ token, user }));
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    try {
      await storage.clearAuth();
      dispatch(logoutAction());
      dispatch(apiSlice.util.resetApiState());
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    ...auth,
    restoreSession,
    logout,
  };
};
