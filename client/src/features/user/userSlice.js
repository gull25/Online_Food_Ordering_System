import { createSlice } from '@reduxjs/toolkit';

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
});

export const { setProfile, setAddresses, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;
