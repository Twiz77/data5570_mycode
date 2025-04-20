import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Base API URL - Update with your actual IP address
export const API_URL = 'http://localhost:8000/api/';
// For web browser, use: 'http://localhost:8000/api/'
// For Android emulator, use: 'http://10.0.2.2:8000/api/'
// For iOS simulator, use: 'http://localhost:8000/api/'
// For physical device, use your computer's IP address: 'http://172.31.6.20:8000/api/'

// Auth URL - Update with your actual IP address
export const AUTH_URL = 'http://localhost:8000/api/';

// Thunks for async operations
export const fetchUsers = createAsyncThunk('user/fetchUsers', async () => {
  const response = await fetch(`${API_URL}users/`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return await response.json();
});

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { dispatch, rejectWithValue }) => {
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

      // After successful registration, automatically log in the user
      console.log('Registration successful, attempting to log in...');
      const loginResponse = await dispatch(loginUser({
        email: userData.email,
        password: userData.password,
      })).unwrap();
      
      console.log('Login successful after registration:', loginResponse);

      // Add phone number to the login response
      return {
        ...loginResponse,
        phone_number: data.phone_number
      };
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk('user/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    console.log('Sending login credentials to backend:', credentials);
    
    const response = await fetch(`${API_URL}auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (!response.ok) {
      console.error('Login failed:', data);
      return rejectWithValue(data.detail || data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return rejectWithValue(error.message || 'Network error occurred');
  }
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

export const fetchAllUsers = createAsyncThunk(
  'user/fetchAllUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;
      
      if (!token) {
        return rejectWithValue('No authentication token available');
      }
      
      console.log('Fetching all users with token:', token);
      const response = await fetch(`${API_URL}users/all/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching users:', errorData);
        return rejectWithValue(errorData.error || 'Failed to fetch users');
      }
      
      const data = await response.json();
      console.log('Users fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;
      console.log('Fetching user profile with token:', token);
      
      if (!token) {
        return rejectWithValue('No authentication token available');
      }
      
      const response = await fetch(`${API_URL}auth/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      
      const data = await response.json();
      console.log('Profile response:', data);
      
      if (!response.ok) {
        console.error('Profile fetch error:', data);
        return rejectWithValue(data.message || data.detail || 'Failed to fetch profile');
      }
      
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;
      console.log('Updating user profile with data:', profileData);
      
      if (!token) {
        return rejectWithValue('No authentication token available');
      }
      
      const response = await fetch(`${API_URL}auth/profile/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      console.log('Profile update response:', data);
      
      if (!response.ok) {
        console.error('Profile update error:', data);
        return rejectWithValue(data.error || data.message || 'Failed to update profile');
      }
      
      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial State
const initialState = {
  formDataList: [],
  currentUser: null,
  token: null,
  isAdmin: false,
  allUsers: [],
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
        state.token = action.payload.token;
        state.isAdmin = action.payload.isAdmin || false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
        state.currentUser = null;
        state.token = null;
        state.isAdmin = false;
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
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.currentUser) {
          state.currentUser = {
            ...state.currentUser,
            ...action.payload
          };
        }
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.currentUser) {
          state.currentUser = {
            ...state.currentUser,
            ...action.payload
          };
        }
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
