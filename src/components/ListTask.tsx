import { useAppSelector } from '../store/hooks'
import Task from './Task'

// Component: ListTask
// Reads todos + filter from the Redux store, applies the active filter, then renders <Task /> for each visible todo.
export default function ListTask() {
  // Select data from the Redux store:
  const todos = useAppSelector((s) => s.todo.todos)
  const filter = useAppSelector((s) => s.todo.filter)

  // Decide which todos should be visible based on the active filter.
  const visible = todos.filter((t) => {
    if (filter === 'done') return t.isDone
    if (filter === 'notDone') return !t.isDone
    return true
  })

  return (
    <>
      <ul className="todo-list" aria-live="polite">
        {visible.map((task) => (
          // key helps React track list items efficiently
          <Task key={task.id} task={task} />
        ))}
      </ul>
      <p className="empty-state" hidden={visible.length > 0}>
        No tasks yet. Add one above.
      </p>
    </>
  )
}
