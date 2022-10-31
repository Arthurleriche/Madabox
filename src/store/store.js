import { configureStore } from '@reduxjs/toolkit';

import sessionSlice from './slices/session.slice';

/* eslint-disable no-underscore-dangle */
export const store = configureStore({
  reducer: {
    session: sessionSlice /* preloadedState, */,
  },
});
/* eslint-enable */
