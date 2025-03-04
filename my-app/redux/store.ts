import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice"; // ✅ Make sure counterSlice.ts exists

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

// ✅ Type definitions for better TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
