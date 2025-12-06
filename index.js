// Improved Task Manager with edit, filters, counts, persistence
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const clearCompletedBtn = document.getElementById('clear-completed');
const clearAllBtn = document.getElementById('clear-all');
const counts = document.getElementById('counts');
const tmpl = document.getElementById('task-template');

const fAll = document.getElementById('filter-all');
const fActive = document.getElementById('filter-active');
const fCompleted = document.getElementById('filter-completed');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let filter = 'all'; // all | active | completed

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function formatDate(ts){
  const d = new Date(ts);
  return d.toLocaleString();
}

function updateCounts(){
  const total = tasks.length;
  const done = tasks.filter(t=>t.done).length;
  counts.textContent = `${total} task${total!==1 ? 's' : ''} · ${done} completed`;
}

function createTaskElement(task, idx){
  const node = tmpl.content.firstElementChild.cloneNode(true);
  const checkbox = node.querySelector('.task-checkbox');
  const textEl = node.querySelector('.task-text');
  const meta = node.querySelector('.task-meta');
  const editBtn = node.querySelector('.edit-btn');
  const delBtn = node.querySelector('.delete-btn');

  checkbox.checked = !!task.done;
  textEl.textContent = task.text;
  if(task.done) textEl.classList.add('completed'); else textEl.classList.remove('completed');
  meta.textContent = `Added: ${formatDate(task.created)}`;

  checkbox.addEventListener('change', () => {
    tasks[idx].done = checkbox.checked;
    save(); render();
  });

  delBtn.addEventListener('click', () => {
    if(!confirm('Delete this task?')) return;
    tasks.splice(idx,1);
    save(); render();
  });

  editBtn.addEventListener('click', () => {
    // Replace text with input for inline edit
    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.className = 'edit-input';
    inputEl.value = task.text;
    const main = node.querySelector('.task-main');
    main.replaceChild(inputEl, textEl);
    inputEl.focus();

    const finish = (saveEdit) => {
      if(saveEdit){
        const val = inputEl.value.trim();
        if(val) tasks[idx].text = val;
      }
      main.replaceChild(textEl, inputEl);
      save(); render();
    };

    inputEl.addEventListener('blur', () => finish(true));
    inputEl.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') finish(true);
      if(e.key === 'Escape') finish(false);
    });
  });

  return node;
}

function render(){
  list.innerHTML = '';
  let filtered = tasks;
  if(filter === 'active') filtered = tasks.filter(t=>!t.done);
  if(filter === 'completed') filtered = tasks.filter(t=>t.done);

  if(filtered.length === 0){
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = '<div style="color:#6b7280">No tasks here.</div>';
    list.appendChild(li);
  } else {
    filtered.forEach((t, idxFiltered) => {
      // idxFiltered is index in filtered; we need index in tasks:
      const idx = tasks.indexOf(t);
      const el = createTaskElement(t, idx);
      list.appendChild(el);
    });
  }
  updateCounts();
  // update filter button active state
  [fAll, fActive, fCompleted].forEach(btn => btn.classList.remove('active'));
  if(filter === 'all') fAll.classList.add('active');
  if(filter === 'active') fActive.classList.add('active');
  if(filter === 'completed') fCompleted.classList.add('active');
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const val = input.value.trim();
  if(!val) return;
  tasks.unshift({ text: val, done:false, created: Date.now() });
  input.value = '';
  save(); render();
});

clearCompletedBtn.addEventListener('click', () => {
  if(!confirm('Remove all completed tasks?')) return;
  tasks = tasks.filter(t=>!t.done);
  save(); render();
});

clearAllBtn.addEventListener('click', () => {
  if(!confirm('Clear ALL tasks?')) return;
  tasks = [];
  save(); render();
});

fAll.addEventListener('click', () => { filter='all'; render(); });
fActive.addEventListener('click', () => { filter='active'; render(); });
fCompleted.addEventListener('click', () => { filter='completed'; render(); });

// initial render
render();
