import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import connectionReducer from './connectionSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    connections: connectionReducer,
  },
});
