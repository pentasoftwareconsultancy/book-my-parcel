// store/slices/travelerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../core/services/api.service';
import ServerUrl from '../../core/constants/serverUrl.constant';
import { showError } from '../../core/utils/toast.util';
import { fetchActiveTravellers } from './userSlices';

// fetchActiveTravellers lives in userSlices.js — import it from there so there
// is only ONE action type ('traveller/fetchActiveTravellers') across the store.
// Having two definitions caused namespace collisions and state sync confusion.
export { fetchActiveTravellers } from './userSlices';

export const fetchTravelerFeed = createAsyncThunk(
  'traveler/fetchFeed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.apiget(ServerUrl.API_TRAVELER_FEED);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch feed';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchTravelerStats = createAsyncThunk(
  'traveler/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.apiget(ServerUrl.API_TRAVELER_DASHBOARD_STATS, {
        _t: Date.now(),
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch stats';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

export const acceptParcel = createAsyncThunk(
  'traveler/acceptParcel',
  async (parcelId, { rejectWithValue }) => {
    try {
      const response = await ApiService.apipost(ServerUrl.API_TRAVELER_ACCEPT, { parcelId });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to accept parcel';
      showError(message);
      return rejectWithValue(message);
    }
  }
);




export const fetchTravelerDashboard = createAsyncThunk(
  'traveler/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const [requestsRes, deliveriesRes, statsRes] = await Promise.allSettled([
        ApiService.apiget(ServerUrl.API_TRAVELER_DASHBOARD_REQUESTS, { status: 'SENT,INTERESTED,ACCEPTED,SELECTED,NOT_SELECTED', _t: Date.now() }),
        ApiService.apiget(ServerUrl.API_TRAVELER_DASHBOARD_DELIVERIES, { status: 'CONFIRMED,PICKUP,IN_TRANSIT', _t: Date.now() }),
        ApiService.apiget(ServerUrl.API_TRAVELER_DASHBOARD_STATS, { _t: Date.now() }),
      ]);

      return {
        parcelRequests: requestsRes.status === 'fulfilled' && requestsRes.value?.data?.success
          ? requestsRes.value.data.data?.requests || []
          : [],
        deliveries: deliveriesRes.status === 'fulfilled' && deliveriesRes.value?.data?.success
          ? deliveriesRes.value.data.data?.deliveries || []
          : [],
        stats: statsRes.status === 'fulfilled' && statsRes.value?.data?.success
          ? statsRes.value.data.data?.stats || statsRes.value.data.data || {}
          : {},
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load dashboard';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

const travelerSlice = createSlice({
  name: 'traveler',
  initialState: {
    travellers: [],
    parcelRequests: [],
    deliveries: [],
    stats: {},
    loadingDashboard: false,
    loading: false,
    error: null,
  },
  reducers: {
    updateParcelRequestStatus: (state, action) => {
      const { id, status } = action.payload;
      const req = state.parcelRequests.find(r => r.id === id);
      if (req) req.status = status;
    },
    removeParcelRequest: (state, action) => {
      state.parcelRequests = state.parcelRequests.filter(r => r.id !== action.payload);
    },
    updateDeliveryStatus: (state, action) => {
      const { id, status } = action.payload;
      const del = state.deliveries.find(d => d.id === id);
      if (del) del.status = status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveTravellers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchActiveTravellers.fulfilled, (state, action) => {
        state.loading = false;
        state.travellers = action.payload;
      })
      .addCase(fetchActiveTravellers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTravelerDashboard.pending, (state) => { state.loadingDashboard = true; state.error = null; })
      .addCase(fetchTravelerDashboard.fulfilled, (state, action) => {
        state.loadingDashboard = false;
        state.parcelRequests = action.payload.parcelRequests;
        state.deliveries = action.payload.deliveries;
        state.stats = action.payload.stats;
      })
      .addCase(fetchTravelerDashboard.rejected, (state, action) => {
        state.loadingDashboard = false;
        state.error = action.payload;
      });
  }
});


export const { updateParcelRequestStatus, removeParcelRequest, updateDeliveryStatus } = travelerSlice.actions;
export default travelerSlice.reducer;