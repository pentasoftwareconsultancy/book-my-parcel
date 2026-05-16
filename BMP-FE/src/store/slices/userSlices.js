// store/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../core/services/api.service';
import ServerUrl from '../../core/constants/serverUrl.constant';
import { showError } from '../../core/utils/toast.util';
// Thunks using your ServerUrl constants
export const fetchDashboardStats = createAsyncThunk(
  'user/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.apiget(ServerUrl.API_USER_DASHBOARD_STATS);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

export const fetchDashboardOrders = createAsyncThunk(
  'user/fetchDashboardOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.apiget(ServerUrl.API_USER_DASHBOARD_ORDERS);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

export const createParcelRequest = createAsyncThunk(
  'user/createParcelRequest',
  async (parcelData, { rejectWithValue }) => {
    try {
      const response = await ApiService.apipost(ServerUrl.API_CREATE_REQUEST, parcelData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

export const searchRequests = createAsyncThunk(
  'user/searchRequests',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await ApiService.apiget(ServerUrl.API_SEARCH_REQUESTS, { params: searchParams });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

// Fetch active travellers (for parcel booking Step 2)

export const fetchActiveTravellers = createAsyncThunk(
  'traveller/fetchActiveTravellers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getActiveTravellers();
      return response.data.data; // array of routes with travellerProfile + user
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch travellers.';
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// GET User Profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getProfile();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// UPDATE User Profile
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await ApiService.updateProfile(profileData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);



const userSlice = createSlice({
  name: 'user',
  initialState: {
    stats: null,
    orders: [],
    travellers:[],
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDashboardOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboardOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchDashboardOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ✅ Active Travellers
      .addCase(fetchActiveTravellers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchActiveTravellers.fulfilled, (state, action) => {
        state.loading = false;
        state.travellers = action.payload; // ✅ stored in state.travellers
      })
      .addCase(fetchActiveTravellers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // User Profile
      .addCase(fetchUserProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserProfile.pending, (state) => { state.loading = true; })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default userSlice.reducer;