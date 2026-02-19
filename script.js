const STORAGE_KEY = "sticky_todo.tasks.v1";
const THEME_KEY = "sticky_todo.theme";
const HISTORY_KEY = "sticky_todo.history.v1";
const HISTORY_LIMIT = 80;

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

let todos = loadTodos();
let historyEntries = loadHistory();
let currentFilter = "all";

if (
  todoForm &&
  todoInput &&
  todoList &&
  emptyState &&
  itemsLeft &&
  filterContainer &&
  clearCompletedBtn &&
  themeToggle &&
  historyList &&
  historyEmpty &&
  clearHistoryBtn
) {
  initTheme();
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

  filterContainer.addEventListener("click", (event) => {
    const target = event.target.closest("[data-filter]");
    if (!target) return;

    currentFilter = target.dataset.filter;
    render();
  });

  clearCompletedBtn.addEventListener("click", () => {
    const removedCount = todos.filter((todo) => todo.completed).length;
    if (!removedCount) return;

    todos = todos.filter((todo) => !todo.completed);
    addHistory(`Cleared ${removedCount} completed task${removedCount === 1 ? "" : "s"}`);
    saveTodos();
    render();
  });

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

  todoList.addEventListener("keydown", (event) => {
    if (event.key !== "Delete") return;

    const card = event.target.closest(".todo-card");
    if (!card) return;

    removeTodo(card.dataset.id);
  });

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });

  clearHistoryBtn.addEventListener("click", () => {
    historyEntries = [];
    saveHistory();
    render();
  });
} else {
  console.error("Todo app failed to initialize: missing required DOM nodes.");
}

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

function removeTodo(id) {
  const removed = todos.find((todo) => todo.id === id);
  if (!removed) return;

  todos = todos.filter((todo) => todo.id !== id);
  addHistory(`Deleted "${removed.text}"`);
  saveTodos();
  render();
}

function render() {
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

  [...filterContainer.querySelectorAll(".filter-btn")].forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });

  renderHistory();
}

function renderHistory() {
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

function loadTodos() {
  try {
    const raw = safeGet(STORAGE_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  safeSet(STORAGE_KEY, JSON.stringify(todos));
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

function saveHistory() {
  safeSet(HISTORY_KEY, JSON.stringify(historyEntries));
}

function addHistory(message) {
  historyEntries.unshift({
    id: generateId(),
    message,
    timestamp: Date.now()
  });

  historyEntries = historyEntries.slice(0, HISTORY_LIMIT);
  saveHistory();
}

function hashId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initTheme() {
  const stored = safeGet(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    setTheme(stored);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  safeSet(THEME_KEY, theme);
}

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
