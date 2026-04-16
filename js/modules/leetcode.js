import { S, save } from './state.js';
import { renderAreaPanel } from './ui.js';

// ── LEETCODE MANAGEMENT ─────────────────────────────────────
export function lcChange(type, delta) {
  S.lc[type] = Math.max(0, S.lc[type] + delta);
  save();
  renderAreaPanel('dsa');
}
