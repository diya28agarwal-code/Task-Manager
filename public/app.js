// ===== State =====
let tasks = [];
let currentFilter = 'all';

// ===== DOM refs =====
const taskForm      = document.getElementById('taskForm');
const taskInput     = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const taskList      = document.getElementById('taskList');
const emptyState    = document.getElementById('emptyState');
const statsText     = document.getElementById('statsText');
const clearCompleted = document.getElementById('clearCompleted');
const filterBtns    = document.querySelectorAll('.filter-btn');

// ===== API helpers =====
async function fetchTasks() {
  const res = await fetch('/api/tasks');
  tasks = await res.json();
  render();
}

async function createTask(title, priority) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority })
  });
  if (!res.ok) return;
  tasks = await fetch('/api/tasks').then(r => r.json());
  render();
}

async function toggleTask(id, completed) {
  await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  });
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) tasks[idx].completed = completed;
  render();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  tasks = tasks.filter(t => t.id !== id);
  render();
}

async function clearCompleted_fn() {
  await fetch('/api/tasks/completed/all', { method: 'DELETE' });
  tasks = tasks.filter(t => !t.completed);
  render();
}

// ===== Render =====
function render() {
  // Filter tasks
  const visible = tasks.filter(t => {
    if (currentFilter === 'active')    return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  // Update stats
  const total     = tasks.length;
  const done      = tasks.filter(t => t.completed).length;
  const remaining = total - done;
  statsText.textContent = `${total} task${total !== 1 ? 's' : ''} total · ${remaining} remaining · ${done} completed`;

  // Show/hide empty state
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

      // Checkbox toggle
      li.querySelector('.task-checkbox').addEventListener('change', e => {
        toggleTask(task.id, e.target.checked);
      });

      // Delete
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
fetchTasks();
