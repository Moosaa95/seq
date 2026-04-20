import { createSlice } from '@reduxjs/toolkit';

interface PaymentState {
  loading: boolean;
  error: string | null;
  success: boolean;
  authorizationUrl: string | null;
  accessCode: string | null;
  reference: string | null;
  paymentId: string | null;
  verifiedPayment: {
    payment_id: string;
    booking_id: string;
    amount: number;
    currency: string;
    status: string;
  } | null;
  paystackConfig: {
    publicKey: string;
    callbackUrl: string;
  } | null;
}

const initialState: PaymentState = {
  loading: false,
  error: null,
  success: false,
  authorizationUrl: null,
  accessCode: null,
  reference: null,
  paymentId: null,
  verifiedPayment: null,
  paystackConfig: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.authorizationUrl = null;
      state.accessCode = null;
      state.reference = null;
      state.paymentId = null;
      state.verifiedPayment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearPaymentState, clearError } = paymentsSlice.actions;

export default paymentsSlice.reducer;
