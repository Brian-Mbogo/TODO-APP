import { useState } from 'react'
import { useAppDispatch } from '../store/hooks'
import { addTodo } from '../store/todoSlice'

// Component: Addtask
// Lets the user type a description and dispatches addTodo() on submit.
export default function Addtask() {
  const dispatch = useAppDispatch()
  // Local UI state for the input field (this is NOT stored in Redux).
  const [description, setDescription] = useState('')

  return (
    <form
      className="todo-form"
      onSubmit={(event) => {
        event.preventDefault()
        const next = description.trim()
        if (!next) return
        // Send an action to Redux to add a todo.
        dispatch(addTodo(next))
        setDescription('')
      }}
    >
      <label htmlFor="todoInput" className="sr-only">
        Task
      </label>
      <input
        id="todoInput"
        name="task"
        type="text"
        maxLength={120}
        placeholder="Write a task and hit Enter"
        autoComplete="off"
        required
        value={description}
        // Keep the input controlled by React state.
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  )
}
