import { configureStore } from '@reduxjs/toolkit'
import todoReducer from './todoSlice'

// The Redux store holds ALL global state for the app.
// We register reducers here (each reducer manages its own slice of state).
export const store = configureStore({
  reducer: {
    // This creates state.todo managed by todoReducer.
    todo: todoReducer
  }
})

// Helpful TypeScript types used by our typed hooks (useAppSelector/useAppDispatch).
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
