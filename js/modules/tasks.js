import { S, save } from './state.js';
import { toast } from './toast.js';
import { renderAreaPanel } from './ui.js';

// ── TASK MANAGEMENT ─────────────────────────────────────────
export function addTask(areaId) {
  const inp = document.getElementById('inp-' + areaId);
  const v = inp.value.trim();
  if (!v) return;
  
  S.tasks[areaId].push({
    id: Date.now(),
    text: v,
    done: false,
    ts: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  });
  
  inp.value = '';
  save();
  renderAreaPanel(areaId);
  toast('Task added!');
}

export function toggleTask(areaId, id) {
  const t = S.tasks[areaId].find(t => t.id === id);
  if (t) {
    t.done = !t.done;
    save();
    renderAreaPanel(areaId);
  }
}

export function deleteTask(areaId, id) {
  S.tasks[areaId] = S.tasks[areaId].filter(t => t.id !== id);
  save();
  renderAreaPanel(areaId);
  toast('Task removed');
}
