// ===== Storage helpers =====
const STORAGE_KEY = 'tm_tasks';

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function nextId(tasks) {
  return tasks.length === 0 ? 1 : Math.max(...tasks.map(t => t.id)) + 1;
}

// ===== State =====
let tasks = loadTasks();
let currentFilter = 'all';

// ===== DOM refs =====
const taskForm       = document.getElementById('taskForm');
const taskInput      = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const taskList       = document.getElementById('taskList');
const emptyState     = document.getElementById('emptyState');
const statsText      = document.getElementById('statsText');
const clearCompleted = document.getElementById('clearCompleted');
const filterBtns     = document.querySelectorAll('.filter-btn');

// ===== Actions =====
function createTask(title, priority) {
  const task = {
    id: nextId(tasks),
    title: title.trim(),
    priority: priority || 'medium',
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(task);
  saveTasks(tasks);
  render();
}

function toggleTask(id, completed) {
  const task = tasks.find(t => t.id === id);
  if (task) { task.completed = completed; saveTasks(tasks); render(); }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  render();
}

function clearCompleted_fn() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks(tasks);
  render();
}

// ===== Render =====
function render() {
  const visible = tasks.filter(t => {
    if (currentFilter === 'active')    return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  const total     = tasks.length;
  const done      = tasks.filter(t => t.completed).length;
  const remaining = total - done;
  statsText.textContent = `${total} task${total !== 1 ? 's' : ''} total · ${remaining} remaining · ${done} completed`;

  if (visible.length === 0) {
    taskList.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    taskList.innerHTML = '';

    visible.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item${task.completed ? ' completed' : ''}`;
      li.dataset.id = task.id;

      li.innerHTML = `
        <input
          type="checkbox"
          class="task-checkbox"
          ${task.completed ? 'checked' : ''}
          aria-label="Mark task complete"
        />
        <span class="task-title">${escapeHtml(task.title)}</span>
        <span class="priority-badge ${task.priority}">${task.priority}</span>
        <button class="delete-btn" aria-label="Delete task">&#10005;</button>
      `;

      li.querySelector('.task-checkbox').addEventListener('change', e => {
        toggleTask(task.id, e.target.checked);
      });

      li.querySelector('.delete-btn').addEventListener('click', () => {
        deleteTask(task.id);
      });

      taskList.appendChild(li);
    });
  }
}

// ===== Util =====
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== Events =====
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  createTask(title, prioritySelect.value);
  taskInput.value = '';
  taskInput.focus();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearCompleted.addEventListener('click', () => {
  if (tasks.some(t => t.completed)) clearCompleted_fn();
});

// ===== Init =====
render();
