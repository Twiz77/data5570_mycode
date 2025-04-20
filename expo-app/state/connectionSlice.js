import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from './userSlice';

// Use the API_URL from userSlice.js
// For web browser, use: 'http://localhost:8000/api/'
// For Android emulator, use: 'http://10.0.2.2:8000/api/'
// For iOS simulator, use: 'http://localhost:8000/api/'
// For physical device, use your computer's IP address: 'http://172.31.6.20:8000/api/'

// Async thunks for connections
export const fetchConnections = createAsyncThunk(
  'connections/fetchConnections',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}connections/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch connections');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching connections:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createConnection = createAsyncThunk(
  'connections/createConnection',
  async (otherPlayerId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}connections/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ other_player_id: otherPlayerId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create connection');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating connection:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const removeConnection = createAsyncThunk(
  'connections/removeConnection',
  async (connectionId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}connections/${connectionId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to remove connection');
      }

      return connectionId;
    } catch (error) {
      console.error('Error removing connection:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks for friend requests
export const fetchFriendRequests = createAsyncThunk(
  'connections/fetchFriendRequests',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}friend-requests/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch friend requests');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  'connections/sendFriendRequest',
  async (receiverId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}friend-requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ receiver_id: receiverId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send friend request');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'connections/acceptFriendRequest',
  async (requestId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}friend-requests/${requestId}/accept/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to accept friend request');
      }

      return requestId;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const rejectFriendRequest = createAsyncThunk(
  'connections/rejectFriendRequest',
  async (requestId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}friend-requests/${requestId}/reject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reject friend request');
      }

      return requestId;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  connections: [],
  friendRequests: [],
  loading: false,
  error: null
};

// Create the slice
const connectionSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    clearConnections: (state) => {
      state.connections = [];
      state.friendRequests = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch connections
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.connections = action.payload;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create connection
      .addCase(createConnection.fulfilled, (state, action) => {
        state.connections.push(action.payload);
      })
      
      // Remove connection
      .addCase(removeConnection.fulfilled, (state, action) => {
        state.connections = state.connections.filter(conn => conn.id !== action.payload);
      })
      
      // Fetch friend requests
      .addCase(fetchFriendRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriendRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.friendRequests = action.payload;
      })
      .addCase(fetchFriendRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Send friend request
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        // No need to update state as the receiver will see the request when they fetch
      })
      
      // Accept friend request
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        // Remove the accepted request
        state.friendRequests = state.friendRequests.filter(req => req.id !== action.payload);
        // We'll need to fetch connections again to get the new connection
      })
      
      // Reject friend request
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        // Remove the rejected request
        state.friendRequests = state.friendRequests.filter(req => req.id !== action.payload);
      });
  }
});

export const { clearConnections } = connectionSlice.actions;
export default connectionSlice.reducer; 