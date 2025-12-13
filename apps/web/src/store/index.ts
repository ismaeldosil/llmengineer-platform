import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from '@/services/api';
import authReducer, { setCredentials } from './slices/authSlice';
import progressReducer from './slices/progressSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    progress: progressReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(apiSlice.middleware, (storeAPI) => (next) => (action) => {
      // Update auth state when profile is updated
      if (apiSlice.endpoints.updateProfile.matchFulfilled(action)) {
        const state = storeAPI.getState() as RootState;
        const currentToken = state.auth.token;
        if (currentToken) {
          storeAPI.dispatch(
            setCredentials({
              user: action.payload,
              token: currentToken,
            })
          );
        }
      }
      return next(action);
    }),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
