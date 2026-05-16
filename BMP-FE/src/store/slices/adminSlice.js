import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../core/services/api.service';
import { showError, showSuccess } from '../../core/utils/toast.util';

// Initial state
const initialState = {
  travelers: [],
  loading: false,
  error: null,
  pendingKYCs: []
};

// Async thunks
export const getAllTravelers = createAsyncThunk(
  'admin/getAllTravelers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getAllTravelers();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch travelers.';
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const approveTraveler = createAsyncThunk(
  'admin/approveTraveler',
  async (travelerId, { rejectWithValue }) => {
    try {
      const response = await ApiService.approveKYC(travelerId);
      showSuccess('Traveler approved successfully!');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to approve traveler.';
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getPendingKYCs = createAsyncThunk(
  'admin/getPendingKYCs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getPendingKYCs();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch pending KYCs.';
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin slice
export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all travelers
      .addCase(getAllTravelers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTravelers.fulfilled, (state, action) => {
        state.loading = false;
        state.travelers = action.payload.travelers || [];
      })
      .addCase(getAllTravelers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve traveler
      .addCase(approveTraveler.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveTraveler.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.travelers.findIndex(traveler => traveler._id === action.payload.traveler._id);
        if (index !== -1) {
          state.travelers[index] = action.payload.traveler;
        }
      })
      .addCase(approveTraveler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get pending KYCs
      .addCase(getPendingKYCs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingKYCs.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingKYCs = action.payload || [];
      })
      .addCase(getPendingKYCs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAdminErrors } = adminSlice.actions;

// Default export reducer
export default adminSlice.reducer;
