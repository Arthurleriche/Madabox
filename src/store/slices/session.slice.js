import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  session: null,
  active: false,
  sdkReadyStore: null,
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    updateStoreSession: (state, action) => {
      const sessionTmp = action.payload;
      state.session = sessionTmp;
    },

    updateActive: (state, action) => {
      state.active = action.payload;
    },

    updateSdkReady: (state, action) => {
      state.sdkReadyStore = action.payload;
    },
  },
});

export const { updateStoreSession, updateActive, updateSdkReady } =
  sessionSlice.actions;

export default sessionSlice.reducer;
