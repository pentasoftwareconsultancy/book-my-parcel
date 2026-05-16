import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../core/services/api.service';
import StorageService from '../../core/services/storage.service';
import { showError, showSuccess } from '../../core/utils/toast.util';

const storedToken = StorageService.getData('token');
const storedUser  = StorageService.getData('user');

const initialState = {
  user:            storedUser,
  token:           storedToken,
  isAuthenticated: !!(storedToken && storedUser), // ✅ both must exist
  loading:         false,
  error:           null
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const requestOTP = createAsyncThunk(
  'auth/requestOTP',
  async (phone, { rejectWithValue }) => {
    try {
      try {
        const checkResponse = await ApiService.checkUserExists({ phone });
        if (!checkResponse.data.exists) {
          const errorMessage = 'User not registered. Please register first.';
          showError(errorMessage);
          return rejectWithValue(errorMessage);
        }
      } catch (error) {
        console.warn('User existence check failed, proceeding with OTP request');
      }

      const response = await ApiService.requestOTP(phone);
      showSuccess('OTP sent successfully! Please check your phone.');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const requestOTPForRegistration = createAsyncThunk(
  'auth/requestOTPForRegistration',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await ApiService.requestOTP(phone);
      showSuccess('OTP sent successfully! Please check your phone.');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp, role }, { rejectWithValue }) => {
    try {
      const response = await ApiService.verifyOTP(phone, otp, role);
      // OTP login always uses localStorage (no rememberMe concept in OTP flow)
      StorageService.setData('token', response.data.token);
      StorageService.setData('user', response.data.user);
      showSuccess('Authentication successful!');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginWithEmailAndPassword = createAsyncThunk(
  'auth/loginWithEmailAndPassword',
  async ({ email, password, loginRole }, { rejectWithValue }) => {
    try {
      const response = await ApiService.loginWithEmailAndPassword(email, password, loginRole);
      const { user, token, roles, activeRole } = response.data;
      
      const userWithRoles = {
        ...user,
        roles:      roles      || user.roles || [],
        activeRole: activeRole || loginRole  || roles?.[0],
      };
      
      // This thunk is called without a rememberMe flag — default to localStorage.
      // Login.jsx handles the rememberMe case directly via StorageService.
      StorageService.setData('token', token);
      StorageService.setData('user', userWithRoles);
      showSuccess('Login successful!');
      return { user: userWithRoles, token };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials.';
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ─── Logout Thunk ────────────────────────────────────────────────────────────
export const logoutThunk = () => (dispatch) => {
  // removeData clears both localStorage and sessionStorage for each key
  StorageService.removeData('token');
  StorageService.removeData('user');
  dispatch(authSlice.actions.logout());
  showSuccess('You have been logged out successfully.');
};

// ─── Slice ───────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

    // Pure reducer — localStorage is handled in the thunks (verifyOTP, loginWithEmailAndPassword, logoutThunk)
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },

    clearAuthErrors: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      // Request OTP
      .addCase(requestOTP.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(requestOTP.fulfilled, (state) => { state.loading = false; })
      .addCase(requestOTP.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Request OTP for Registration
      .addCase(requestOTPForRegistration.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(requestOTPForRegistration.fulfilled, (state) => { state.loading = false; })
      .addCase(requestOTPForRegistration.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Login with email and password
      .addCase(loginWithEmailAndPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithEmailAndPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginWithEmailAndPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

// ✅ setAuth is now exported — Login.jsx can import and use it
export const { setAuth, logout, clearAuthErrors } = authSlice.actions;

export default authSlice.reducer;