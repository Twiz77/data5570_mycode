import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Define the Customer type
type Customer = {
  id: number;
  name: string;
  email: string;
};

// Define the slice state shape
interface CustomerState {
  list: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  list: [],
  loading: false,
  error: null,
};

// GET customers from backend
export const fetchCustomers = createAsyncThunk("customers/fetchCustomers", async () => {
  const res = await fetch("http://127.0.0.1:8000/customers/");
  const data = await res.json();
  return data;
});

// POST customer to backend
export const postCustomer = createAsyncThunk(
  "customers/postCustomer",
  async (newCustomer: { name: string; email: string }) => {
    const res = await fetch("http://127.0.0.1:8000/customers/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCustomer),
    });

    if (!res.ok) {
      throw new Error("Failed to create customer");
    }

    return await res.json(); // Return the created customer
  }
);

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      })
      .addCase(postCustomer.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});

export default customerSlice.reducer;
