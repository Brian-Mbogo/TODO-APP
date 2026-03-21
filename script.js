// NOTE:
// This file is a legacy, framework-free (vanilla JS) version of the app.
// The current Redux Toolkit + React + TypeScript app lives in /src and runs via Vite.
//
// Keeping this file is optional; it is NOT used by Vite builds.
//
// Local storage keys for tasks, theme preference, and action history.
const STORAGE_KEY = "sticky_todo.tasks.v1";
const THEME_KEY = "sticky_todo.theme";
const HISTORY_KEY = "sticky_todo.history.v1";
const HISTORY_LIMIT = 80;

// Main UI references.
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const itemsLeft = document.getElementById("itemsLeft");
const filterContainer = document.getElementById("filters");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const themeToggle = document.getElementById("themeToggle");
const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const hasHistoryUI = Boolean(historyList && historyEmpty && clearHistoryBtn);

const hasRedux = typeof Redux !== "undefined" && typeof Redux.createStore === "function";

// Only start the app when all required DOM nodes exist.
if (
  todoForm &&
  todoInput &&
  todoList &&
  emptyState &&
  itemsLeft &&
  filterContainer &&
  clearCompletedBtn &&
  themeToggle
) {
  initTheme();

  if (!hasRedux) {
    console.error("Redux failed to load. Check the Redux <script> tag in index.html.");
  } else {
    const store = createAppStore();

    Addtask(store);
    wireUIEvents(store);

    store.subscribe(() => {
      const state = store.getState();
      saveTasks(state.tasks);
      saveHistory(state.history);
      render(store);
    });

    render(store);
  }
} else {
  console.error("Todo app failed to initialize: missing required DOM nodes.");
}

function createAppStore() {
  const initialState = {
    tasks: loadTasks(),
    filter: "all",
    ui: { editingId: null },
    history: loadHistory()
  };

  return Redux.createStore(appReducer, initialState);
}

const actionTypes = {
  ADD_TASK: "tasks/add",
  TOGGLE_TASK: "tasks/toggle",
  DELETE_TASK: "tasks/delete",
  EDIT_TASK: "tasks/edit",
  CLEAR_COMPLETED: "tasks/clearCompleted",
  SET_FILTER: "filter/set",
  SET_EDITING: "ui/setEditing",
  CLEAR_HISTORY: "history/clear"
};

const actions = {
  addTask: (description) => ({ type: actionTypes.ADD_TASK, payload: { description } }),
  toggleTask: (id) => ({ type: actionTypes.TOGGLE_TASK, payload: { id } }),
  deleteTask: (id) => ({ type: actionTypes.DELETE_TASK, payload: { id } }),
  editTask: (id, description) => ({ type: actionTypes.EDIT_TASK, payload: { id, description } }),
  clearCompleted: () => ({ type: actionTypes.CLEAR_COMPLETED }),
  setFilter: (filter) => ({ type: actionTypes.SET_FILTER, payload: { filter } }),
  setEditing: (idOrNull) => ({ type: actionTypes.SET_EDITING, payload: { id: idOrNull } }),
  clearHistory: () => ({ type: actionTypes.CLEAR_HISTORY })
};

function appReducer(state, action) {
  if (!state) return state;

  switch (action.type) {
    case actionTypes.ADD_TASK: {
      const description = (action.payload?.description ?? "").trim();
      if (!description) return state;

      const next = {
        ...state,
        tasks: [{ id: generateId(), description, isDone: false }, ...state.tasks],
        ui: { ...state.ui, editingId: null }
      };
      return addHistoryEntry(next, `Added \"${description}\"`);
    }

    case actionTypes.TOGGLE_TASK: {
      const id = action.payload?.id;
      const target = state.tasks.find((task) => task.id === id);
      if (!target) return state;

      const nextIsDone = !target.isDone;
      const next = {
        ...state,
        tasks: state.tasks.map((task) => (task.id === id ? { ...task, isDone: nextIsDone } : task)),
        ui: { ...state.ui, editingId: state.ui.editingId === id ? null : state.ui.editingId }
      };
      return addHistoryEntry(next, `${nextIsDone ? "Completed" : "Reopened"} \"${target.description}\"`);
    }

    case actionTypes.DELETE_TASK: {
      const id = action.payload?.id;
      const removed = state.tasks.find((task) => task.id === id);
      if (!removed) return state;

      const next = {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== id),
        ui: { ...state.ui, editingId: state.ui.editingId === id ? null : state.ui.editingId }
      };
      return addHistoryEntry(next, `Deleted \"${removed.description}\"`);
    }

    case actionTypes.EDIT_TASK: {
      const id = action.payload?.id;
      const nextDescription = (action.payload?.description ?? "").trim();
      if (!id || !nextDescription) return state;

      const target = state.tasks.find((task) => task.id === id);
      if (!target) return state;

      const next = {
        ...state,
        tasks: state.tasks.map((task) => (task.id === id ? { ...task, description: nextDescription } : task)),
        ui: { ...state.ui, editingId: null }
      };
      return addHistoryEntry(next, `Edited \"${target.description}\"`);
    }

    case actionTypes.CLEAR_COMPLETED: {
      const removedCount = state.tasks.filter((task) => task.isDone).length;
      if (!removedCount) return state;

      const remainingTasks = state.tasks.filter((task) => !task.isDone);
      const nextEditingId =
        state.ui.editingId && remainingTasks.some((task) => task.id === state.ui.editingId)
          ? state.ui.editingId
          : null;

      const next = {
        ...state,
        tasks: remainingTasks,
        ui: { ...state.ui, editingId: nextEditingId }
      };
      return addHistoryEntry(
        next,
        `Cleared ${removedCount} completed task${removedCount === 1 ? "" : "s"}`
      );
    }

    case actionTypes.SET_FILTER: {
      const filter = action.payload?.filter;
      if (filter !== "all" && filter !== "done" && filter !== "not_done") return state;
      return { ...state, filter, ui: { ...state.ui, editingId: null } };
    }

    case actionTypes.SET_EDITING: {
      const idOrNull = action.payload?.id ?? null;
      if (idOrNull === null) return { ...state, ui: { ...state.ui, editingId: null } };
      const exists = state.tasks.some((task) => task.id === idOrNull);
      return exists ? { ...state, ui: { ...state.ui, editingId: idOrNull } } : state;
    }

    case actionTypes.CLEAR_HISTORY: {
      return { ...state, history: [] };
    }

    default:
      return state;
  }
}

// Component: Addtask
function Addtask(store) {
  todoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const description = todoInput.value.trim();
    if (!description) return;

    store.dispatch(actions.addTask(description));
    todoInput.value = "";
    todoInput.focus();
  });
}

function wireUIEvents(store) {
  filterContainer.addEventListener("click", (event) => {
    const target = event.target.closest("[data-filter]");
    if (!target) return;
    store.dispatch(actions.setFilter(target.dataset.filter));
  });

  clearCompletedBtn.addEventListener("click", () => {
    store.dispatch(actions.clearCompleted());
  });

  todoList.addEventListener("click", (event) => {
    const card = event.target.closest(".todo-card");
    if (!card) return;

    const id = card.dataset.id;

    if (event.target.classList.contains("delete-btn")) {
      store.dispatch(actions.deleteTask(id));
      return;
    }

    if (event.target.classList.contains("todo-check")) {
      store.dispatch(actions.toggleTask(id));
      return;
    }

    if (event.target.classList.contains("edit-btn") || event.target.classList.contains("todo-text")) {
      store.dispatch(actions.setEditing(id));
      return;
    }

    if (event.target.classList.contains("cancel-btn")) {
      store.dispatch(actions.setEditing(null));
      return;
    }

    if (event.target.classList.contains("save-btn")) {
      const input = card.querySelector(".todo-edit");
      const nextDescription = input ? input.value.trim() : "";
      if (nextDescription) store.dispatch(actions.editTask(id, nextDescription));
    }
  });

  todoList.addEventListener("keydown", (event) => {
    const state = store.getState();

    if (event.target instanceof HTMLInputElement && event.target.classList.contains("todo-edit")) {
      const card = event.target.closest(".todo-card");
      const id = card?.dataset.id;
      if (!id) return;

      if (event.key === "Enter") {
        event.preventDefault();
        const nextDescription = event.target.value.trim();
        if (nextDescription) store.dispatch(actions.editTask(id, nextDescription));
      }

      if (event.key === "Escape") {
        event.preventDefault();
        store.dispatch(actions.setEditing(null));
      }

      return;
    }

    if (event.key !== "Delete") return;
    if (state.ui.editingId) return;

    const card = event.target.closest(".todo-card");
    if (!card) return;
    store.dispatch(actions.deleteTask(card.dataset.id));
  });

  themeToggle.addEventListener("click", (event) => {
    const target = event.target.closest("[data-theme-option]");
    if (!target) return;
    setTheme(target.dataset.themeOption);
  });

  if (hasHistoryUI) {
    clearHistoryBtn.addEventListener("click", () => {
      store.dispatch(actions.clearHistory());
    });
  }
}

function render(store) {
  const state = store.getState();
  ListTask(state);
  renderHistory(state.history);

  if (state.ui.editingId) {
    const selector = `.todo-card[data-id=\"${escapeSelector(state.ui.editingId)}\"] .todo-edit`;
    const input = todoList.querySelector(selector);
    if (input && input instanceof HTMLInputElement) {
      input.focus();
      input.select();
    }
  }
}

// Component: ListTask
function ListTask(state) {
  const visibleTasks = selectVisibleTasks(state.tasks, state.filter);

  todoList.innerHTML = "";
  visibleTasks.forEach((task) => {
    todoList.append(Task(task, state.ui.editingId));
  });

  const notDoneCount = state.tasks.filter((task) => !task.isDone).length;
  const doneCount = state.tasks.length - notDoneCount;

  itemsLeft.textContent = `${notDoneCount} item${notDoneCount === 1 ? "" : "s"} left`;
  clearCompletedBtn.disabled = doneCount === 0;
  emptyState.hidden = visibleTasks.length > 0;

  [...filterContainer.querySelectorAll(".filter-btn")].forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.filter);
  });
}

function selectVisibleTasks(tasks, filter) {
  if (filter === "done") return tasks.filter((task) => task.isDone);
  if (filter === "not_done") return tasks.filter((task) => !task.isDone);
  return tasks;
}

// Component: Task
function Task(task, editingId) {
  const isEditing = task.id === editingId;

  const item = document.createElement("li");
  item.className = `todo-card${task.isDone ? " completed" : ""}`;
  item.tabIndex = 0;
  item.dataset.id = task.id;

  const tilt = ((hashId(task.id) % 7) - 3) * 0.7;
  item.style.setProperty("--tilt", `${tilt.toFixed(1)}deg`);

  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "todo-check";
  check.checked = task.isDone;
  check.disabled = isEditing;
  check.setAttribute("aria-label", `Mark ${task.description} as done`);

  const content = isEditing ? createEditField(task) : createText(task);
  const actionsEl = createActions(task, isEditing);

  item.append(check, content, actionsEl);
  return item;
}

function createText(task) {
  const text = document.createElement("p");
  text.className = "todo-text";
  text.textContent = task.description;
  text.title = "Click to edit";
  return text;
}

function createEditField(task) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "todo-edit";
  input.value = task.description;
  input.maxLength = 120;
  input.setAttribute("aria-label", `Edit task ${task.description}`);
  return input;
}

function createActions(task, isEditing) {
  const wrap = document.createElement("div");
  wrap.className = "todo-actions";

  if (isEditing) {
    const save = document.createElement("button");
    save.type = "button";
    save.className = "save-btn";
    save.textContent = "Save";
    save.setAttribute("aria-label", `Save edits for ${task.description}`);

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "cancel-btn";
    cancel.textContent = "Cancel";
    cancel.setAttribute("aria-label", `Cancel edit for ${task.description}`);

    wrap.append(save, cancel);
  } else {
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "edit-btn";
    edit.textContent = "Edit";
    edit.setAttribute("aria-label", `Edit task ${task.description}`);
    wrap.append(edit);
  }

  const del = document.createElement("button");
  del.type = "button";
  del.className = "delete-btn";
  del.textContent = "Delete";
  del.setAttribute("aria-label", `Delete task ${task.description}`);
  wrap.append(del);

  return wrap;
}

// Render persisted action history entries.
function renderHistory(historyEntries) {
  if (!hasHistoryUI) return;

  historyList.innerHTML = "";

  historyEntries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "history-item";
    item.textContent = `${entry.message} - ${formatHistoryTime(entry.timestamp)}`;
    historyList.append(item);
  });

  historyEmpty.hidden = historyEntries.length > 0;
  clearHistoryBtn.disabled = historyEntries.length === 0;
}

function addHistoryEntry(state, message) {
  const nextHistory = [
    { id: generateId(), message, timestamp: Date.now() },
    ...(Array.isArray(state.history) ? state.history : [])
  ].slice(0, HISTORY_LIMIT);

  return { ...state, history: nextHistory };
}

function loadTasks() {
  try {
    const raw = safeGet(STORAGE_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeTask(item))
      .filter((task) => task && typeof task.id === "string" && task.description);
  } catch {
    return [];
  }
}

function normalizeTask(item) {
  if (!item || typeof item !== "object") return null;

  // New schema: { id, description, isDone }
  if (typeof item.description === "string") {
    return {
      id: String(item.id ?? generateId()),
      description: item.description.trim(),
      isDone: Boolean(item.isDone)
    };
  }

  // Legacy schema migration: { id, text, completed }
  if (typeof item.text === "string") {
    return {
      id: String(item.id ?? generateId()),
      description: item.text.trim(),
      isDone: Boolean(item.completed)
    };
  }

  return null;
}

function saveTasks(tasks) {
  safeSet(STORAGE_KEY, JSON.stringify(Array.isArray(tasks) ? tasks : []));
}

function loadHistory() {
  try {
    const raw = safeGet(HISTORY_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(historyEntries) {
  safeSet(HISTORY_KEY, JSON.stringify(Array.isArray(historyEntries) ? historyEntries : []));
}

// Produce a stable numeric hash used for card tilt variation.
function hashId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function escapeSelector(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return String(value).replace(/[\"\\\\]/g, "\\\\$&");
}

// Initialize theme from storage or system preference.
function initTheme() {
  const stored = safeGet(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    setTheme(stored);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

// Apply the active theme and persist it.
function setTheme(theme) {
  document.body.dataset.theme = theme;
  const buttons = themeToggle.querySelectorAll("[data-theme-option]");
  buttons.forEach((button) => {
    const isActive = button.dataset.themeOption === theme;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  safeSet(THEME_KEY, theme);
}

// Convert a timestamp into a user-friendly local date/time string.
function formatHistoryTime(timestamp) {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return "time unknown";
  }
}

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (private mode / policy restrictions).
  }
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
