import { createSlice } from '@reduxjs/toolkit';

interface BookingsState {
  currentBooking: any | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: BookingsState = {
  currentBooking: null,
  loading: false,
  error: null,
  success: false,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBooking: (state) => {
      state.currentBooking = null;
      state.success = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearBooking, clearError } = bookingsSlice.actions;
export default bookingsSlice.reducer;
