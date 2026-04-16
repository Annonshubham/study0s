import { STORAGE_KEY } from './constants.js';

// ── STATE MANAGEMENT ────────────────────────────────────────
export let S = loadState();

export function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();
  } catch {
    return defaultState();
  }
}

export function defaultState() {
  return {
    tasks: { apt: [], dsa: [], sem: [], dev: [] },
    lc: { easy: 0, medium: 0, hard: 0 },
    streak: [],
    notes: { apt: [], dsa: [], sem: [], dev: [] }
  };
}

export function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
}

export function reloadState() {
  S = loadState();
}
