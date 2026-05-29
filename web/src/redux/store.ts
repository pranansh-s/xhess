import { configureStore } from '@reduxjs/toolkit';

import boardReducer from '@/redux/features/boardSlice';
import chatReducer from '@/redux/features/chatSlice';
import gameReducer from '@/redux/features/gameSlice';
import modalReducer from '@/redux/features/modalSlice';
import userReducer from '@/redux/features/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    board: boardReducer,
    gameState: gameReducer,
    chatState: chatReducer,
    modals: modalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
