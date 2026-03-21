import { useState } from 'react'
import { useAppDispatch } from '../store/hooks'
import { addTodo } from '../store/todoSlice'

export default function Addtask() {
  const dispatch = useAppDispatch()
  const [description, setDescription] = useState('')

  return (
    <form
      className="todo-form"
      onSubmit={(event) => {
        event.preventDefault()
        const next = description.trim()
        if (!next) return
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
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  )
}

