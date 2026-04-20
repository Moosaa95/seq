import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Property } from '@/lib/data';

interface PropertiesState {
  properties: Property[];
  loading: boolean;
  error: string | null;
  filters: any;
  currentProperty: Property | null;
  totalCount: number;
}

const initialState: PropertiesState = {
  properties: [],
  loading: false,
  error: null,
  filters: {},
  currentProperty: null,
  totalCount: 0,
};

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
    },
  },
});

export const { setFilters, clearFilters, clearError, clearCurrentProperty } = propertiesSlice.actions;
export default propertiesSlice.reducer;
