// Friendly Task Manager — patched: Add button uses click handler to prevent reload
console.log('app.js loaded');

const $ = sel => document.querySelector(sel);
const form = $('#task-form');
const input = $('#task-input');
const addBtn = $('#add-btn');
const list = $('#task-list');
const clearCompletedBtn = $('#clear-completed');
const clearAllBtn = $('#clear-all');
const counts = $('#counts');
const template = document.getElementById('task-template');
const searchEl = $('#search');
const sortEl = $('#sort');

const filters = document.querySelectorAll('.filter');
const totalCountEl = $('#totalCount');
const doneCountEl = $('#doneCount');
const streakEl = $('#streak');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let filter = 'all';
let sortBy = 'new';

const tips = [
  "Break a big task into a 10-minute chunk today.",
  "Take a 3-minute breathing break between tasks.",
  "Celebrate small wins — mark one done now.",
  "Write one short journal sentence after task completion."
];

function toast(msg){
  const t = $('#toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 2200);
}

function save(){ localStorage.setItem('tasks', JSON.stringify(tasks)); updateStats(); }

function formatDate(ts){
  const d = new Date(ts);
  return d.toLocaleString();
}

function updateStats(){
  const total = tasks.length;
  const done = tasks.filter(t=>t.done).length;
  if(counts) counts.textContent = `${total} task${total!==1 ? 's' : ''} • ${done} completed`;
  if(totalCountEl) totalCountEl.textContent = total;
  if(doneCountEl) doneCountEl.textContent = done;
  const today = new Date().toDateString();
  const doneToday = tasks.some(t => t.done && new Date(t.completedAt || t.updatedAt || t.created).toDateString() === today);
  if(streakEl) streakEl.textContent = doneToday ? 1 : 0;
}

function createTaskElement(task, idx){
  const node = template.content.firstElementChild.cloneNode(true);
  const chk = node.querySelector('.task-checkbox');
  const title = node.querySelector('.task-title');
  const meta = node.querySelector('.task-meta');
  const editBtn = node.querySelector('.edit-btn');
  const delBtn = node.querySelector('.delete-btn');

  chk.checked = !!task.done;
  title.textContent = task.text;
  if(task.done) title.classList.add('completed'); else title.classList.remove('completed');
  meta.textContent = `Added: ${formatDate(task.created)}`;

  chk.addEventListener('change', () => {
    tasks[idx].done = chk.checked;
    tasks[idx].updatedAt = Date.now();
    if(chk.checked) tasks[idx].completedAt = Date.now();
    save(); render();
    toast(chk.checked ? 'Nice — marked complete' : 'Marked as not done');
  });

  delBtn.addEventListener('click', () => {
    if(!confirm('Delete this task?')) return;
    tasks.splice(idx,1); save(); render(); toast('Task deleted');
  });

  editBtn.addEventListener('click', () => {
    const inputEl = document.createElement('input');
    inputEl.className = 'edit-input';
    inputEl.value = task.text;
    const main = node.querySelector('.task-main');
    main.replaceChild(inputEl, title);
    inputEl.focus();

    const finish = (saveEdit) => {
      if(saveEdit){
        const v = inputEl.value.trim();
        if(v) tasks[idx].text = v;
      }
      main.replaceChild(title, inputEl);
      save(); render(); if(saveEdit) toast('Saved');
    };

    inputEl.addEventListener('blur', () => finish(true));
    inputEl.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') finish(true);
      if(e.key === 'Escape') finish(false);
    });
  });

  return node;
}

function applySort(listArr){
  if(sortBy === 'new') return listArr.sort((a,b)=>b.created - a.created);
  if(sortBy === 'old') return listArr.sort((a,b)=>a.created - b.created);
  if(sortBy === 'alpha') return listArr.sort((a,b)=>a.text.localeCompare(b.text));
  return listArr;
}

function render(){
  if(!list) return;
  list.innerHTML = '';
  let filtered = tasks.slice();
  if(filter === 'active') filtered = filtered.filter(t=>!t.done);
  if(filter === 'completed') filtered = filtered.filter(t=>t.done);

  const q = (searchEl && searchEl.value || '').trim().toLowerCase();
  if(q) filtered = filtered.filter(t => t.text.toLowerCase().includes(q));

  filtered = applySort(filtered);

  if(filtered.length === 0){
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `<div style="color:var(--muted)">No tasks found.</div>`;
    list.appendChild(li);
  } else {
    filtered.forEach((t) => {
      const idx = tasks.indexOf(t);
      const el = createTaskElement(t, idx);
      list.appendChild(el);
    });
  }
  updateStats();
  document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
  const activeBtn = document.querySelector(`.filter[data-filter="${filter}"]`);
  if(activeBtn) activeBtn.classList.add('active');
}

// --- EVENT HANDLERS ---

addBtn && addBtn.addEventListener('click', (e) => {
  const v = input.value.trim();
  if(!v) { toast('Type something to add'); return; }
  tasks.unshift({ text: v, done:false, created: Date.now() });
  input.value = '';
  save(); render(); toast('Task added');
});

document.addEventListener('click', (e) => {
  if(e.target.matches('.filter')) {
    filter = e.target.getAttribute('data-filter'); render();
  }
});

searchEl && searchEl.addEventListener('input', () => render());
sortEl && sortEl.addEventListener('change', (e)=> { sortBy = e.target.value; render(); });

clearCompletedBtn && clearCompletedBtn.addEventListener('click', () => {
  if(!confirm('Remove all completed tasks?')) return;
  tasks = tasks.filter(t => !t.done); save(); render(); toast('Completed cleared');
});
clearAllBtn && clearAllBtn.addEventListener('click', () => {
  if(!confirm('Clear ALL tasks?')) return;
  tasks = []; save(); render(); toast('All cleared');
});

// rotate tip
setInterval(()=> {
  const t = tips[Math.floor(Math.random()*tips.length)];
  const tipEl = document.getElementById('tip');
  if(tipEl) tipEl.textContent = t;
}, 5000);

// initial render
render();
