// Export store
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Export StoreProvider
export { StoreProvider } from './StoreProvider';

// Export hooks
export { useAppDispatch, useAppSelector, useAppStore } from './hooks';

// Export actions
export { setFilters, clearFilters, clearError, clearCurrentProperty } from './slices/propertiesSlice';
export { clearBooking } from './slices/bookingsSlice';
export { clearInquiryState } from './slices/inquiriesSlice';
export { clearPaymentState } from './slices/paymentsSlice';
