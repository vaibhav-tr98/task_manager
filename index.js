// Simple Task Manager using localStorage
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const clearCompletedBtn = document.getElementById('clear-completed');
const clearAllBtn = document.getElementById('clear-all');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function render() {
  list.innerHTML = '';
  if (tasks.length === 0) {
    list.innerHTML = '<li class="note">No tasks yet — add one above.</li>';
    return;
  }
  tasks.forEach((t, idx) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    const left = document.createElement('div');
    left.className = 'task-left';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = t.done;
    checkbox.addEventListener('change', () => {
      tasks[idx].done = checkbox.checked;
      save(); render();
    });
    const span = document.createElement('span');
    span.className = 'task-text' + (t.done ? ' completed' : '');
    span.textContent = t.text;
    left.appendChild(checkbox);
    left.appendChild(span);

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    const del = document.createElement('button');
    del.innerHTML = '🗑️';
    del.title = 'Delete';
    del.addEventListener('click', () => {
      tasks.splice(idx,1); save(); render();
    });
    actions.appendChild(del);

    li.appendChild(left);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const val = input.value.trim();
  if (!val) return;
  tasks.unshift({ text: val, done:false, created: Date.now() });
  input.value = '';
  save(); render();
});

clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  save(); render();
});
clearAllBtn.addEventListener('click', () => {
  if (!confirm('Clear all tasks?')) return;
  tasks = []; save(); render();
});

render();
