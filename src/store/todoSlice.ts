import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'

// A "Todo" is one item in our list.
// Think of this as the shape of a single task object in the Redux store.
interface Todo {
  id: string
  description: string
  isDone: boolean
  createdAt: number
}

// This is the shape of the slice of state managed by this file.
interface TodoState {
  todos: Todo[]
  filter: 'all' | 'done' | 'notDone'
}

// The starting values for Redux when the app first loads.
const initialState: TodoState = {
  todos: [],
  filter: 'all'
}

// A "slice" is Redux Toolkit's way to bundle:
// - state (initialState)
// - reducers (functions that update that state)
// - generated action creators (addTodo, toggleTodo, ...)
//
// This file is the single source of truth for how todos are added/updated/removed.
const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    // Add a new todo at the top of the list.
    // Payload is just the text/description for the new todo.
    addTodo: (state, action: PayloadAction<string>) => {
      state.todos.unshift({
        // nanoid() creates a unique string id (safe for browsers).
        id: nanoid(),
        description: action.payload,
        isDone: false,
        createdAt: Date.now()
      })
    },
    // Flip a todo between done and not done (true/false).
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find(t => t.id === action.payload)
      if (todo) todo.isDone = !todo.isDone
    },
    // Update the description text of an existing todo.
    editTodo: (state, action: PayloadAction<{ id: string; description: string }>) => {
      const todo = state.todos.find(t => t.id === action.payload.id)
      if (todo) todo.description = action.payload.description
    },
    // Remove a todo from the list entirely.
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter(t => t.id !== action.payload)
    },
    // Change which todos we show (all / done / notDone).
    setFilter: (state, action: PayloadAction<'all' | 'done' | 'notDone'>) => {
      state.filter = action.payload
    },
    // Remove all todos that are currently done.
    clearCompleted: (state) => {
      state.todos = state.todos.filter(t => !t.isDone)
    }
  }
})

// Redux Toolkit automatically generates action creators from our reducers above.
export const { addTodo, toggleTodo, editTodo, deleteTodo, setFilter, clearCompleted } = todoSlice.actions
// The slice reducer is what gets plugged into the Redux store.
export default todoSlice.reducer
