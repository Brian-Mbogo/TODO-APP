import { useAppSelector } from '../store/hooks'
import Task from './Task'

export default function ListTask() {
  const todos = useAppSelector((s) => s.todo.todos)
  const filter = useAppSelector((s) => s.todo.filter)

  const visible = todos.filter((t) => {
    if (filter === 'done') return t.isDone
    if (filter === 'notDone') return !t.isDone
    return true
  })

  return (
    <>
      <ul className="todo-list" aria-live="polite">
        {visible.map((task) => (
          <Task key={task.id} task={task} />
        ))}
      </ul>
      <p className="empty-state" hidden={visible.length > 0}>
        No tasks yet. Add one above.
      </p>
    </>
  )
}

