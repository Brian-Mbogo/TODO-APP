import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'

interface Todo {
  id: string
  description: string
  isDone: boolean
  createdAt: number
}

interface TodoState {
  todos: Todo[]
  filter: 'all' | 'done' | 'notDone'
}

const initialState: TodoState = {
  todos: [],
  filter: 'all'
}

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<string>) => {
      state.todos.unshift({
        id: nanoid(),
        description: action.payload,
        isDone: false,
        createdAt: Date.now()
      })
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find(t => t.id === action.payload)
      if (todo) todo.isDone = !todo.isDone
    },
    editTodo: (state, action: PayloadAction<{id: string, description: string}>) => {
      const todo = state.todos.find(t => t.id === action.payload.id)
      if (todo) todo.description = action.payload.description
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter(t => t.id !== action.payload)
    },
    setFilter: (state, action: PayloadAction<'all' | 'done' | 'notDone'>) => {
      state.filter = action.payload
    },
    clearCompleted: (state) => {
      state.todos = state.todos.filter(t => !t.isDone)
    }
  }
})

export const { addTodo, toggleTodo, editTodo, deleteTodo, setFilter, clearCompleted } = todoSlice.actions
export default todoSlice.reducer
