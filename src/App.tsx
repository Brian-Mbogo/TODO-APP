import { useEffect, useMemo, useState } from 'react'
import Addtask from './components/AddTask'
import ListTask from './components/ListTask'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { clearCompleted, setFilter } from './store/todoSlice'

function App() {
  const dispatch = useAppDispatch()
  const todos = useAppSelector((s) => s.todo.todos)
  const filter = useAppSelector((s) => s.todo.filter)

  const notDoneCount = useMemo(() => todos.filter((t) => !t.isDone).length, [todos])
  const doneCount = todos.length - notDoneCount

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('sticky_todo.theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.body.dataset.theme = theme
    localStorage.setItem('sticky_todo.theme', theme)
  }, [theme])

  return (
    <>
      <div className="bg-shape bg-shape-a" aria-hidden="true"></div>
      <div className="bg-shape bg-shape-b" aria-hidden="true"></div>

      <main className="app">
        <header className="app-header">
          <div>
            <p className="eyebrow">Build</p>
            <h1>Sticky Todo Board</h1>
          </div>

          <div className="theme-toggle" role="group" aria-label="Theme mode">
            <button
              className={`ghost-btn theme-btn${theme === 'light' ? ' active' : ''}`}
              type="button"
              aria-pressed={theme === 'light'}
              onClick={() => setTheme('light')}
            >
              Light
            </button>
            <button
              className={`ghost-btn theme-btn${theme === 'dark' ? ' active' : ''}`}
              type="button"
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme('dark')}
            >
              Dark
            </button>
          </div>
        </header>

        <Addtask />

        <section className="controls" aria-label="Task controls">
          <div className="filters" role="group" aria-label="Filters">
            <button
              className={`filter-btn${filter === 'all' ? ' active' : ''}`}
              data-filter="all"
              type="button"
              onClick={() => dispatch(setFilter('all'))}
            >
              All
            </button>
            <button
              className={`filter-btn${filter === 'notDone' ? ' active' : ''}`}
              data-filter="notDone"
              type="button"
              onClick={() => dispatch(setFilter('notDone'))}
            >
              Not Done
            </button>
            <button
              className={`filter-btn${filter === 'done' ? ' active' : ''}`}
              data-filter="done"
              type="button"
              onClick={() => dispatch(setFilter('done'))}
            >
              Done
            </button>
          </div>
          <button
            className="ghost-btn"
            type="button"
            onClick={() => dispatch(clearCompleted())}
            disabled={doneCount === 0}
          >
            Clear Completed
          </button>
        </section>

        <ListTask />

        <footer className="app-footer">
          <p id="itemsLeft">
            {notDoneCount} item{notDoneCount === 1 ? '' : 's'} left
          </p>
          <p className="hint">Tip: click a task to edit it</p>
        </footer>
      </main>
    </>
  )
}

export default App
