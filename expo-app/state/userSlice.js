import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Base API URL - Update with your actual IP address
const API_URL = 'http://10.0.2.2:8000/api/';

// Thunks for async operations
export const fetchUsers = createAsyncThunk('user/fetchUsers', async () => {
  const response = await fetch(`${API_URL}users/`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return await response.json();
});

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Creating user with data:', userData);
      const response = await fetch(`${API_URL}auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_number: userData.phone_number,
          email: userData.email,
          password: userData.password,
        }),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        console.error('Registration error:', data);
        return rejectWithValue(data.message || data.detail || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk('user/loginUser', async (credentials) => {
  console.log('Sending login credentials to backend:', credentials);
  
  // Special case for dev login
  if (credentials.email === 'dev@example.com') {
    console.log('Dev login detected, returning mock user');
    const mockUser = {
      id: 1,
      first_name: 'Dev',
      last_name: 'User',
      email: 'dev@example.com',
      phone: '123-456-7890',
      rating: 3.5,
      location: 'Seattle, WA',
      availability: ['Weekdays', 'Weekends', 'Evenings', 'Flexible'],
      preferredPlay: 'Both',
      notifications: true,
      emailNotifications: true,
      pushNotifications: true,
      isAdmin: true,
      token: 'dev-token-123'
    };
    console.log('Mock user data:', mockUser);
    return mockUser;
  }
  
  const response = await fetch(`${API_URL}auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Login failed:', errorData);
    throw new Error(errorData.message || 'Login failed');
  }
  const data = await response.json();
  console.log('Login response data:', data);
  return data;
});

export const updateUser = createAsyncThunk('user/updateUser', async ({ id, updatedData }) => {
  const response = await fetch(`${API_URL}${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  if (!response.ok) throw new Error('Failed to update user');
  return await response.json();
});

export const deleteUser = createAsyncThunk('user/deleteUser', async (id) => {
  const response = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete user');
  return id;
});

export const fetchAllUsers = createAsyncThunk('user/fetchAllUsers', async () => {
  console.log('Fetching all users from backend');
  console.log('API URL:', `${API_URL}users/all/`);
  try {
    const response = await fetch(`${API_URL}users/all/`);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status} ${responseText}`);
    }
    
    const data = JSON.parse(responseText);
    console.log('Parsed users data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
});

// Initial State
const initialState = {
  formDataList: [],
  currentUser: null,
  token: null,
  isAdmin: false,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Redux Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload.currentUser;
      state.token = action.payload.token;
      state.isAdmin = action.payload.isAdmin;
      state.error = null;
    },
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isAdmin = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.formDataList = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.formDataList.push(action.payload);
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentUser = action.payload;
        state.token = action.payload.token || 'dev-token-123';
        state.isAdmin = action.payload.isAdmin || false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.formDataList.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.formDataList[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.formDataList = state.formDataList.filter((user) => user.id !== action.payload);
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allUsers = action.payload;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
