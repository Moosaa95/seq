import { configureStore } from '@reduxjs/toolkit';
import propertiesReducer from './slices/propertiesSlice';
import bookingsReducer from './slices/bookingsSlice';
import inquiriesReducer from './slices/inquiriesSlice';
import paymentsReducer from './slices/paymentsSlice';
import authReducer from './slices/authSlice';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    properties: propertiesReducer,
    bookings: bookingsReducer,
    inquiries: inquiriesReducer,
    payments: paymentsReducer,
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types if needed
        ignoredActions: [],
      },
    }).concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
