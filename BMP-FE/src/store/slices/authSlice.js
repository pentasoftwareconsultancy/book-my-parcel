import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../core/services/api.service';
import StorageService from '../../core/services/storage.service';
import { APPLICATION_CONSTANTS } from '../../core/constants/app.constant';
import { showError, showSuccess } from '../../core/utils/toast.util';

// Safe storage read — if localStorage is blocked (sandboxed iframe, private
// browsing restrictions) this returns null instead of crashing the store.
function safeRead(key) {
  try {
    return StorageService.getData(key);
  } catch {
    return null;
  }
}

// Use constants for storage keys — never raw string literals
const TOKEN_KEY = APPLICATION_CONSTANTS.STORAGE.TOKEN;
const USER_KEY  = APPLICATION_CONSTANTS.STORAGE.USER_DETAILS;

const storedToken = safeRead(TOKEN_KEY);
const storedUser  = safeRead(USER_KEY);

const initialState = {
  user:            storedUser,
  token:           storedToken,
  isAuthenticated: !!(storedToken && storedUser),
  loading:         false,
  error:           null,
};

// ─── Helper: normalize user object to always have activeRole ─────────────────
function normalizeUser(user, fallbackRole) {
  return {
    ...user,
    roles:      user.roles      || [],
    activeRole: user.activeRole || fallbackRole || user.roles?.[0] || null,
  };
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────

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
      } catch {
        // User existence check failed — proceed with OTP request anyway
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
      // Backend wraps response as { success, message, data: { token, user, ... } }
      const { user, token, roles, activeRole } = response.data.data;

      const userWithRoles = normalizeUser(
        { ...user, roles: roles || user?.roles || [] },
        activeRole || role
      );

      StorageService.setData(TOKEN_KEY, token);
      StorageService.setData(USER_KEY, userWithRoles);
      showSuccess('Authentication successful!');
      return { user: userWithRoles, token };
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
      // Backend wraps response as { success, message, data: { token, user, ... } }
      const { user, token, roles, activeRole } = response.data.data;

      const userWithRoles = normalizeUser(
        { ...user, roles: roles || user?.roles || [] },
        activeRole || loginRole
      );

      StorageService.setData(TOKEN_KEY, token);
      StorageService.setData(USER_KEY, userWithRoles);
      showSuccess('Login successful!');
      return { user: userWithRoles, token };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials.';
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ─── Logout Thunk ─────────────────────────────────────────────────────────────
// FIX: Now calls the backend /auth/logout endpoint to blacklist the JWT in Redis
// before clearing local state. This prevents a stolen token from remaining valid
// until natural expiry.
export const logoutThunk = () => async (dispatch, getState) => {
  const { token } = getState().auth;

  // Call backend to blacklist the token — best-effort, non-blocking
  if (token) {
    try {
      await ApiService.logout();
    } catch {
      // Non-fatal: even if the backend call fails, clear local state.
      // The token will expire naturally via JWT expiry.
    }
  }

  StorageService.removeData(TOKEN_KEY);
  StorageService.removeData(USER_KEY);
  dispatch(authSlice.actions.logout());
  showSuccess('You have been logged out successfully.');
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user           = action.payload.user;
      state.token          = action.payload.token;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
    },

    clearAuthErrors: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // requestOTP
      .addCase(requestOTP.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(requestOTP.fulfilled, (state) => { state.loading = false; })
      .addCase(requestOTP.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      // requestOTPForRegistration
      .addCase(requestOTPForRegistration.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(requestOTPForRegistration.fulfilled, (state) => { state.loading = false; })
      .addCase(requestOTPForRegistration.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      // verifyOTP
      .addCase(verifyOTP.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading         = false;
        state.user            = action.payload.user;
        state.token           = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // loginWithEmailAndPassword
      .addCase(loginWithEmailAndPassword.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(loginWithEmailAndPassword.fulfilled, (state, action) => {
        state.loading         = false;
        state.user            = action.payload.user;
        state.token           = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginWithEmailAndPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { setAuth, logout, clearAuthErrors } = authSlice.actions;
export default authSlice.reducer;
