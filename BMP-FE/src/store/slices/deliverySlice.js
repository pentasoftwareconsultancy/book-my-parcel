import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../core/services/api.service';
import { showError, showSuccess } from '../../core/utils/toast.util';

// Initial state
const initialState = {
  currentDelivery: null,
  locationUpdates: [],
  loadingVerifyPickup: false,
  loadingVerifyDrop: false,
  loadingUpdateLocation: false,
  error: null
};

// Async thunks
export const verifyPickupOTP = createAsyncThunk(
  'deliveries/verifyPickupOTP',
  async (data, { rejectWithValue }) => {
    try {
      const response = await ApiService.verifyPickupOTP(data);
      showSuccess('Pickup verified successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify pickup.';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

export const verifyDropOTP = createAsyncThunk(
  'deliveries/verifyDropOTP',
  async (data, { rejectWithValue }) => {
    try {
      const response = await ApiService.verifyDropOTP(data);
      showSuccess('Drop verified successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify drop.';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

export const updateLocation = createAsyncThunk(
  'deliveries/updateLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      const response = await ApiService.updateLocation(locationData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update location.';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

// Delivery slice
const deliverySlice = createSlice({
  name: 'deliveries',
  initialState,
  reducers: {
    clearDeliveryErrors: (state) => {
      state.error = null;
    },
    addLocationUpdate: (state, action) => {
      state.locationUpdates.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyPickupOTP.pending, (state) => {
        state.loadingVerifyPickup = true;
        state.error = null;
      })
      .addCase(verifyPickupOTP.fulfilled, (state, action) => {
        state.loadingVerifyPickup = false;
        state.currentDelivery = action.payload.delivery;
      })
      .addCase(verifyPickupOTP.rejected, (state, action) => {
        state.loadingVerifyPickup = false;
        state.error = action.payload;
      })
      .addCase(verifyDropOTP.pending, (state) => {
        state.loadingVerifyDrop = true;
        state.error = null;
      })
      .addCase(verifyDropOTP.fulfilled, (state, action) => {
        state.loadingVerifyDrop = false;
        state.currentDelivery = action.payload.delivery;
      })
      .addCase(verifyDropOTP.rejected, (state, action) => {
        state.loadingVerifyDrop = false;
        state.error = action.payload;
      })
      .addCase(updateLocation.pending, (state) => {
        state.loadingUpdateLocation = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loadingUpdateLocation = false;
        state.locationUpdates.push(action.payload.location);
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loadingUpdateLocation = false;
        state.error = action.payload;
      });
  }
});

export const { clearDeliveryErrors, addLocationUpdate } = deliverySlice.actions;

export default deliverySlice.reducer;