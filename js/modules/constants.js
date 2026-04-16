// ── CONSTANTS ──────────────────────────────────────────────
export const AREAS = [
  {
    id: 'apt',
    name: 'Aptitude Prep',
    emoji: '🧠',
    color: 'var(--apt)',
    bg: 'var(--apt-bg)',
    hex: '#a78bfa'
  },
  {
    id: 'dsa',
    name: 'DSA + LeetCode',
    emoji: '⚡',
    color: 'var(--dsa)',
    bg: 'var(--dsa-bg)',
    hex: '#34d399'
  },
  {
    id: 'sem',
    name: 'Semester Studies',
    emoji: '📚',
    color: 'var(--sem)',
    bg: 'var(--sem-bg)',
    hex: '#fbbf24'
  },
  {
    id: 'dev',
    name: 'Development',
    emoji: '💻',
    color: 'var(--dev)',
    bg: 'var(--dev-bg)',
    hex: '#60a5fa'
  }
];

export const TAB_ORDER = ['overview', 'apt', 'dsa', 'sem', 'dev', 'streak'];
export const STORAGE_KEY = 'studyos_v1';
export const LC_TYPES = ['easy', 'medium', 'hard'];
export const LC_COLORS = {
  easy: '#34d399',
  medium: '#fbbf24',
  hard: '#f87171'
};
