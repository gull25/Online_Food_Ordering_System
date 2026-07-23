import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { loginSuccess } from '../auth/authSlice';

export const updateProfileThunk = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put('/users/profile', profileData);
      const updatedUser = response.data.data;
      
      // Update local storage so on refresh it stays updated
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      // Sync the auth state so the Navbar updates instantly
      dispatch(loginSuccess(updatedUser));
      
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const initialState = {
  profile: null,
  addresses: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setAddresses: (state, action) => {
      state.addresses = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setProfile, setAddresses, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;
