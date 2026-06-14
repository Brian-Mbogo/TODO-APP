import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch } from '../store/hooks'
import { deleteTodo, editTodo, toggleTodo } from '../store/todoSlice'

// This is the minimum data Task needs to render one todo.
export type TaskModel = {
  id: string
  description: string
  isDone: boolean
}

type Props = {
  task: TaskModel
}

// Component: Task
// Renders one todo item.
// Uses local state for edit mode, while dispatching Redux actions to toggle/edit/delete the todo.
export default function Task({ task }: Props) {
  const dispatch = useAppDispatch()
  // Local UI state for edit mode (not stored in Redux).
  const [isEditing, setIsEditing] = useState(false)

  // initialDraft is memoized so it only changes when task.description changes.
  const initialDraft = useMemo(() => task.description, [task.description])
  // draft is what the user types while editing.
  const [draft, setDraft] = useState(initialDraft)

  useEffect(() => {
    // When exiting edit mode, reset draft to match the latest saved description.
    if (!isEditing) setDraft(task.description)
  }, [isEditing, task.description])

  const save = () => {
    const next = draft.trim()
    if (!next) return
    // Only dispatch an edit if the text actually changed.
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
        // Toggle done/not done in Redux.
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
            // Common UX: Enter saves, Escape cancels.
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
          // Click text to enter edit mode.
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
                // Cancel edit mode and revert draft text.
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

        {/* Delete removes this todo from Redux */}
        <button type="button" className="delete-btn" onClick={() => dispatch(deleteTodo(task.id))}>
          Delete
        </button>
      </div>
    </li>
  )
}
