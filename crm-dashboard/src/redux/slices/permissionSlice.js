import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching permissions
export const fetchUserPermissions = createAsyncThunk(
  'permissions/fetchUserPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_GLOBAL_AUTH_BACKEND}/api/auth/role-permission`,
        {
          withCredentials: true,
        }
      );
      
      if (response.status === 200) {
        return response.data.data[0] || {};
      }
      throw new Error('Failed to fetch permissions');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);