import { TAB_ORDER } from './constants.js';

// ── TAB NAVIGATION ──────────────────────────────────────────

export let currentTab = 'overview';

export function switchTab(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  
  document.getElementById('panel-' + id).classList.add('active');
  
  const idx = TAB_ORDER.indexOf(id);
  if (idx >= 0) {
    document.querySelectorAll('.nav-tab')[idx].classList.add('active');
  }
  
  currentTab = id;
}
