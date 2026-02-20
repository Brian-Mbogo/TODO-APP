// Local storage keys for todos, theme preference, and action history.
const STORAGE_KEY = "sticky_todo.tasks.v1";
const THEME_KEY = "sticky_todo.theme";
const HISTORY_KEY = "sticky_todo.history.v1";
const HISTORY_LIMIT = 80;

/*
App architecture:
1) Load state from localStorage into memory.
2) Listen for user events.
3) Mutate state.
4) Persist state.
5) Re-render UI from the latest state.
*/

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

// In-memory state mirrored to localStorage.
let todos = loadTodos();
let historyEntries = loadHistory();
let currentFilter = "all";

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
  // Theme is initialized first so first paint matches user preference.
  initTheme();
  // Initial UI render from persisted state.
  render();

  // Add with Enter or button submit.
  todoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = todoInput.value.trim();
    if (!text) return;

    todos.unshift({
      id: generateId(),
      text,
      completed: false,
      createdAt: Date.now()
    });
    addHistory(`Added "${text}"`);

    todoInput.value = "";
    saveTodos();
    render();
    todoInput.focus();
  });

  // Switch between All/Active/Completed views.
  filterContainer.addEventListener("click", (event) => {
    const target = event.target.closest("[data-filter]");
    if (!target) return;

    currentFilter = target.dataset.filter;
    render();
  });

  // Remove all completed tasks in one action.
  clearCompletedBtn.addEventListener("click", () => {
    const removedCount = todos.filter((todo) => todo.completed).length;
    if (!removedCount) return;

    todos = todos.filter((todo) => !todo.completed);
    addHistory(`Cleared ${removedCount} completed task${removedCount === 1 ? "" : "s"}`);
    saveTodos();
    render();
  });

  // Event delegation for card actions (checkbox/delete).
  todoList.addEventListener("click", (event) => {
    const card = event.target.closest(".todo-card");
    if (!card) return;

    const id = card.dataset.id;

    if (event.target.classList.contains("delete-btn")) {
      removeTodo(id);
      return;
    }

    if (event.target.classList.contains("todo-check")) {
      toggleTodo(id);
    }
  });

  // Keyboard delete support for focused cards.
  todoList.addEventListener("keydown", (event) => {
    if (event.key !== "Delete") return;

    const card = event.target.closest(".todo-card");
    if (!card) return;

    removeTodo(card.dataset.id);
  });

  // Switch theme from the light/dark segmented control.
  themeToggle.addEventListener("click", (event) => {
    const target = event.target.closest("[data-theme-option]");
    if (!target) return;
    setTheme(target.dataset.themeOption);
  });

  // Remove all history records.
  if (hasHistoryUI) {
    clearHistoryBtn.addEventListener("click", () => {
      historyEntries = [];
      saveHistory();
      render();
    });
  }
} else {
  console.error("Todo app failed to initialize: missing required DOM nodes.");
}

// Toggle a task between active and completed states.
function toggleTodo(id) {
  const target = todos.find((todo) => todo.id === id);
  if (!target) return;
  const nextCompleted = !target.completed;

  todos = todos.map((todo) => {
    if (todo.id !== id) return todo;
    return { ...todo, completed: nextCompleted };
  });

  addHistory(`${nextCompleted ? "Completed" : "Reopened"} "${target.text}"`);
  saveTodos();
  render();
}

// Remove a task and log the action.
function removeTodo(id) {
  const removed = todos.find((todo) => todo.id === id);
  if (!removed) return;

  todos = todos.filter((todo) => todo.id !== id);
  addHistory(`Deleted "${removed.text}"`);
  saveTodos();
  render();
}

// Re-render tasks, counts, filters, and history.
function render() {
  // Visible list depends on selected filter tab.
  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  todoList.innerHTML = "";

  visibleTodos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = `todo-card${todo.completed ? " completed" : ""}`;
    item.dataset.id = todo.id;
    item.tabIndex = 0;

    // Keep tilt deterministic so cards do not jump while rerendering.
    const tilt = ((hashId(todo.id) % 7) - 3) * 0.7;
    item.style.setProperty("--tilt", `${tilt.toFixed(1)}deg`);

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "todo-check";
    check.checked = todo.completed;
    check.setAttribute("aria-label", `Mark ${todo.text} as completed`);

    const text = document.createElement("p");
    text.className = "todo-text";
    text.textContent = todo.text;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.textContent = "Delete";
    del.setAttribute("aria-label", `Delete task ${todo.text}`);

    item.append(check, text, del);
    todoList.append(item);
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  itemsLeft.textContent = `${activeCount} item${activeCount === 1 ? "" : "s"} left`;
  clearCompletedBtn.disabled = completedCount === 0;
  emptyState.hidden = visibleTodos.length > 0;

  // Keep active tab styling in sync with currentFilter.
  [...filterContainer.querySelectorAll(".filter-btn")].forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });

  // History is rendered separately for clarity.
  renderHistory();
}

// Render persisted action history entries.
function renderHistory() {
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

// Load/sync todos from storage.
function loadTodos() {
  try {
    const raw = safeGet(STORAGE_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Persist the latest todo list state.
function saveTodos() {
  safeSet(STORAGE_KEY, JSON.stringify(todos));
}

// Load/sync history entries from storage.
function loadHistory() {
  try {
    const raw = safeGet(HISTORY_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Persist the latest history list state.
function saveHistory() {
  safeSet(HISTORY_KEY, JSON.stringify(historyEntries));
}

// Add a new history record and keep the list bounded.
function addHistory(message) {
  // Newest events appear first.
  historyEntries.unshift({
    id: generateId(),
    message,
    timestamp: Date.now()
  });

  // Prevent unbounded growth in localStorage.
  historyEntries = historyEntries.slice(0, HISTORY_LIMIT);
  saveHistory();
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

// Initialize theme from storage or system preference.
function initTheme() {
  const stored = safeGet(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    // Respect explicit user choice when available.
    setTheme(stored);
    return;
  }

  // Fallback to OS/browser preference for first-time users.
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

// Apply the active theme and persist it.
function setTheme(theme) {
  document.body.dataset.theme = theme;
  // Keep the segmented toggle in sync with active theme.
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

// Storage wrappers prevent crashes when storage access is blocked.
function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Safely write values to storage without throwing in restricted modes.
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (private mode / policy restrictions).
  }
}

// Fallback ID generator for environments without crypto.randomUUID().
function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
