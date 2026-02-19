# Todo App (HTML/CSS/JS)

A framework-free Todo app built for AI-assisted iteration.

## View Live Demo

[View Live Demo on Vercel](https://app-six-phi-84.vercel.app)

## Features

- Add tasks
- Mark tasks completed
- Delete tasks
- Persist tasks with Local Storage
- Filter by All / Active / Completed
- Clear all completed tasks
- Dark mode toggle with saved preference
- Keyboard shortcut: press `Delete` on a focused task card
- Responsive layout for mobile and desktop

## Files

- `index.html`: structure and UI sections
- `style.css`: sticky-note styling, responsive design, theme variables
- `script.js`: state handling, rendering, storage, filters, interactions

## Prompt Iteration Workflow (ChatGPT + Replit)

1. Start with this base prompt:
   - "I want to build a simple Todo List web app using only HTML, CSS, and JavaScript (no frameworks). It should let users add tasks, mark them as completed, delete them, and store them in local storage."
2. Copy generated code into Replit files.
3. Run, test, and capture issues.
4. Iterate with targeted prompts:
   - "This delete button is not working. Here is my JS. Debug and fix it."
   - "Add All/Active/Completed filters."
   - "Add a clear completed button."
   - "Make the task cards look like sticky notes with a soft shadow and slight rotation."

## Local Test Checklist

- Add multiple tasks
- Toggle completed state
- Delete one task
- Use each filter tab
- Click `Clear Completed`
- Refresh browser and confirm tasks persist
- Toggle theme and refresh to confirm theme persistence
- Test mobile viewport

## Replit Setup

1. Create a new Repl with `HTML, CSS, JS` template.
2. Paste each file into:
   - `index.html`
   - `style.css`
   - `script.js`
3. Click **Run**.
4. Use **Share** to generate a live URL.

## Deployment Options

### Replit Share Link

- Fastest option: click **Share** and copy the live preview URL.

### GitHub Pages

1. Create a GitHub repository.
2. Push these files.
3. In GitHub repo settings, enable **Pages** from the main branch root.
4. Open the generated URL.

## Next Enhancements

- Inline task editing
- Drag-and-drop ordering
- Due dates and priority labels
- Search bar
