# Redux Todo App Refactor Plan

## Status: In Progress

### Step 1: Project Setup ✅
- Create `package.json` with Vite + React + Redux Toolkit deps
- Create `vite.config.ts`
- Create `src/main.tsx`, `src/App.tsx`
- Update `index.html` (add Vite client script)
- `npm install`

### Step 2: Redux Store ✅
- `src/store/store.ts`
- `src/store/todoSlice.ts` (add, toggle, edit, delete, filter)

### Step 3: Migrate Components [PENDING]
- `src/components/AddTask.tsx`
- `src/components/Task.tsx`
- `src/components/ListTask.tsx`
- `src/components/Filters.tsx`

### Step 4: Integrate & Style [PENDING]
- Migrate CSS to `src/index.css`
- App.tsx layout with all components
- LocalStorage persistence

### Step 5: Test & Complete [PENDING]
- `npm run dev`
- Test all features
- Update README.md
