import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import customerReducer from "./customerSlice"; // ✅ updated name

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    customers: customerReducer, // ✅ matches import
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
