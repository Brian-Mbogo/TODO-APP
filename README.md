# Todo App (Redux Toolkit + React + TypeScript)

A simple Todo application built with **Vite + React + Redux Toolkit**. Global state (todos + filter) is managed in Redux.

## Features

- Add a new todo
- Mark todo done / not done
- Filter todos by **All / Not Done / Done**
- Edit a todo (inline)
- Delete a todo
- Clear all completed todos

## Data model

Each todo has:

- `id: string`
- `description: string`
- `isDone: boolean`

Internally we also store:

- `createdAt: number` (timestamp)

## Redux state

- Store: `src/store/store.ts`
- Slice: `src/store/todoSlice.ts`

State shape:

```ts
{
  todo: {
    todos: Array<{ id; description; isDone; createdAt }>,
    filter: "all" | "done" | "notDone"
  }
}
```

Actions:

- `addTodo(description)`
- `toggleTodo(id)`
- `editTodo({ id, description })`
- `deleteTodo(id)`
- `setFilter("all" | "done" | "notDone")`
- `clearCompleted()`

## Components

- `src/components/AddTask.tsx` (component name: `Addtask`)  
  Input + submit → dispatches `addTodo`.
- `src/components/ListTask.tsx`  
  Reads `todos` + `filter` from Redux and renders the visible list.
- `src/components/Task.tsx`  
  Single task row with toggle, edit, delete.

Main UI composition lives in `src/App.tsx`.

## Styling

The UI styles are in `style.css` (imported by `src/main.tsx`).

## Getting started

Install deps:

```bash
npm install
```

If you get permission errors writing to the default npm cache, use:

```bash
npm install --cache .npm-cache
```

Run dev server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

