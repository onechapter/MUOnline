import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import characterReducer from './characterSlice';
import gameReducer from './gameSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    character: characterReducer,
    game: gameReducer,
  },
});