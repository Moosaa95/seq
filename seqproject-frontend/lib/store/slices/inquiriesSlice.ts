import { createSlice } from '@reduxjs/toolkit';

interface InquiriesState {
  loading: boolean;
  error: string | null;
  success: boolean;
  successMessage: string | null;
}

const initialState: InquiriesState = {
  loading: false,
  error: null,
  success: false,
  successMessage: null,
};

const inquiriesSlice = createSlice({
  name: 'inquiries',
  initialState,
  reducers: {
    clearInquiryState: (state) => {
      state.success = false;
      state.error = null;
      state.successMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearInquiryState, clearError } = inquiriesSlice.actions;
export default inquiriesSlice.reducer;
