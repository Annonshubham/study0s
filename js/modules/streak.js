import { S, save } from './state.js';
import { renderStreak } from './ui.js';

// ── STREAK MANAGEMENT ───────────────────────────────────────
export function toggleStreak(day) {
  const idx = S.streak.indexOf(day);
  if (idx > -1) {
    S.streak.splice(idx, 1);
  } else {
    S.streak.push(day);
  }
  save();
  renderStreak();
}

export function calcStreak() {
  let count = 0;
  const d = new Date();
  
  while (true) {
    const s = d.toISOString().slice(0, 10);
    if (S.streak.includes(s)) {
      count++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  
  return count;
}
