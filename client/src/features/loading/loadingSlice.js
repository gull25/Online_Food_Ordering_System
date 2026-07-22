import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  globalLoading: false,
  loadingTasks: 0,
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loadingTasks++;
      state.globalLoading = true;
    },
    stopLoading: (state) => {
      if (state.loadingTasks > 0) {
        state.loadingTasks--;
      }
      if (state.loadingTasks === 0) {
        state.globalLoading = false;
      }
    }
  },
});

export const { startLoading, stopLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
