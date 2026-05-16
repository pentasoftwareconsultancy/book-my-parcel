import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../core/services/api.service';
import { showError, showSuccess } from '../../core/utils/toast.util';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getProfile();
      // Backend wraps response as { success, message, data: { user, roles, kycStatus } }
      return response.data.data ?? response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch profile';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await ApiService.updateProfile(profileData);
      showSuccess('Profile updated successfully!');
      return response.data.data ?? response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    loadingFetch: false,
    loadingUpdate: false,
    error: null,
  },
  reducers: {
    clearProfileErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loadingFetch = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loadingFetch = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loadingFetch = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loadingUpdate = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loadingUpdate = false;
        state.data = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loadingUpdate = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileErrors } = profileSlice.actions;
export default profileSlice.reducer;
