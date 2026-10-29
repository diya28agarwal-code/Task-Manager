const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory task store
let tasks = [];
let nextId = 1;

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// POST create a new task
app.post('/api/tasks', (req, res) => {
  const { title, priority } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = {
    id: nextId++,
    title: title.trim(),
    priority: priority || 'medium',
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(task);
  res.status(201).json(task);
});

// PATCH toggle complete / update a task
app.patch('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (typeof req.body.completed !== 'undefined') {
    task.completed = req.body.completed;
  }
  if (req.body.title && req.body.title.trim()) {
    task.title = req.body.title.trim();
  }
  if (req.body.priority) {
    task.priority = req.body.priority;
  }
  res.json(task);
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  tasks.splice(index, 1);
  res.status(204).end();
});

// DELETE all completed tasks
app.delete('/api/tasks/completed/all', (req, res) => {
  tasks = tasks.filter(t => !t.completed);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Task Manager running at http://localhost:${PORT}`);
});
