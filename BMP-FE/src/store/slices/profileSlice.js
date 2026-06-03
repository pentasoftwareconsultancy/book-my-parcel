import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../core/services/api.service';
import ServerUrl from '../../core/constants/serverUrl.constant';
import { showError, showSuccess } from '../../core/utils/toast.util';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getProfile();
      return response.data.data ?? response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch profile';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'profile/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.apiget(ServerUrl.API_USER_DASHBOARD_STATS);
      return response.data.data?.stats ?? response.data.data ?? response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
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
    liveStats: null,
    loadingStats: false,
    loadingFetch: false,
    loadingUpdate: false,
    error: null,
  },
  reducers: {
    clearProfileErrors: (state) => {
      state.error = null;
    },
    setLiveStats: (state, action) => {
      state.liveStats = action.payload;
      state.loadingStats = false;
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
      .addCase(fetchUserStats.pending, (state) => {
        state.loadingStats = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loadingStats = false;
        state.liveStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state) => {
        state.loadingStats = false;
        state.liveStats = null;
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
