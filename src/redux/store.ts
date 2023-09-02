import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cart.slice';
import posReducer from './slices/pos.slice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    pos: posReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
