import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch } from '../store/hooks'
import { deleteTodo, editTodo, toggleTodo } from '../store/todoSlice'

export type TaskModel = {
  id: string
  description: string
  isDone: boolean
}

type Props = {
  task: TaskModel
}

export default function Task({ task }: Props) {
  const dispatch = useAppDispatch()
  const [isEditing, setIsEditing] = useState(false)

  const initialDraft = useMemo(() => task.description, [task.description])
  const [draft, setDraft] = useState(initialDraft)

  useEffect(() => {
    if (!isEditing) setDraft(task.description)
  }, [isEditing, task.description])

  const save = () => {
    const next = draft.trim()
    if (!next) return
    if (next !== task.description) dispatch(editTodo({ id: task.id, description: next }))
    setIsEditing(false)
  }

  return (
    <li className={`todo-card${task.isDone ? ' completed' : ''}`} tabIndex={0} data-id={task.id}>
      <input
        type="checkbox"
        className="todo-check"
        checked={task.isDone}
        disabled={isEditing}
        onChange={() => dispatch(toggleTodo(task.id))}
        aria-label={`Mark ${task.description} as done`}
      />

      {isEditing ? (
        <input
          className="todo-edit"
          value={draft}
          maxLength={120}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              save()
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              setIsEditing(false)
              setDraft(task.description)
            }
          }}
          aria-label={`Edit task ${task.description}`}
          autoFocus
        />
      ) : (
        <p
          className="todo-text"
          title="Click to edit"
          onClick={() => setIsEditing(true)}
        >
          {task.description}
        </p>
      )}

      <div className="todo-actions">
        {isEditing ? (
          <>
            <button type="button" className="save-btn" onClick={save}>
              Save
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false)
                setDraft(task.description)
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        )}

        <button type="button" className="delete-btn" onClick={() => dispatch(deleteTodo(task.id))}>
          Delete
        </button>
      </div>
    </li>
  )
}

