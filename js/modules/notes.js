import { S, save } from './state.js';
import { renderAreaPanel } from './ui.js';

// ── NOTES MANAGEMENT ────────────────────────────────────────
export function addNote(areaId) {
  const inp = document.getElementById('note-inp-' + areaId);
  const v = inp.value.trim();
  if (!v) return;
  
  S.notes[areaId].push({
    id: Date.now(),
    text: v
  });
  
  inp.value = '';
  save();
  renderAreaPanel(areaId);
}

export function deleteNote(areaId, id) {
  S.notes[areaId] = S.notes[areaId].filter(n => n.id !== id);
  save();
  renderAreaPanel(areaId);
}
