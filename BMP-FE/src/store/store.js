import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import requestReducer from './slices/requestSlice';
import travelerReducer from './slices/travelerSlice';
import deliveryReducer from './slices/deliverySlice';
import adminReducer from './slices/adminSlice';
import userReducer from "./slices/userSlices";
import profileReducer from "./slices/profileSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    requests: requestReducer,
    traveler: travelerReducer,
    deliveries: deliveryReducer,
    admin: adminReducer,
    user: userReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
});