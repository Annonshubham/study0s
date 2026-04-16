# StudyOS — Architecture Guide

This document describes the modular architecture of StudyOS and how components interact.

---

## 📐 Layer Diagram

```
┌─────────────────────────────────────────────────┐
│          HTML (index.html)                      │
│     (View Layer - DOM structure)                │
└─────────────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────────────┐
│      app.js (Orchestrator)                      │
│  - Coordinates all modules                      │
│  - Exposes window functions for HTML            │
│  - Handles initialization & listeners           │
└─────────────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────────────┐
│           Feature Modules                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  tasks   │ │  notes   │ │ leetcode │  ...   │
│  └──────────┘ └──────────┘ └──────────┘        │
│        ↓↑          ↓↑           ↓↑              │
└─────────────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────────────┐
│         Shared Services                         │
│  ┌────────────┐ ┌──────────┐ ┌──────────┐      │
│  │   state    │ │   ui     │ │  toast   │      │
│  └────────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────────────┐
│      Constants & Utilities                      │
│  ┌────────────┐ ┌──────────┐                   │
│  │ constants  │ │   tabs   │                   │
│  └────────────┘ └──────────┘                   │
└─────────────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────────────┐
│      Browser APIs                               │
│  - localStorage                                 │
│  - DOM                                          │
│  - Events                                       │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Adding a Task (Example)

```
1. User types in input field
   ↓
2. HTML calls window.addTask('dsa') via onclick
   ↓
3. app.js → tasks.js addTask()
   ↓
4. tasks.js modifies S (state)
   ↓
5. tasks.js calls save() → state.js
   ↓
6. save() writes to localStorage & calls updateAll()
   ↓
7. updateAll() calls ui.js renderAreaPanel()
   ↓
8. UI updates DOM with new task
   ↓
9. User sees new task in the UI
```

---

## 📦 Module Responsibilities

### `constants.js`
**Purpose:** Global constants  
**Exports:**
- `AREAS` — Study area definitions
- `TAB_ORDER` — Tab navigation order
- `STORAGE_KEY` — localStorage key
- `LC_COLORS` — LeetCode difficulty colors

### `state.js`
**Purpose:** State management & persistence  
**Exports:**
- `S` — Global state object
- `loadState()` — Load from localStorage
- `defaultState()` — Initial state shape
- `save()` — Persist to localStorage
- `reloadState()` — Reload from storage

### `tasks.js`
**Purpose:** Task CRUD operations  
**Exports:**
- `addTask(areaId)` — Create new task
- `toggleTask(areaId, id)` — Mark done/pending
- `deleteTask(areaId, id)` — Remove task

### `notes.js`
**Purpose:** Note management  
**Exports:**
- `addNote(areaId)` — Create note
- `deleteNote(areaId, id)` — Remove note

### `leetcode.js`
**Purpose:** LeetCode counter logic  
**Exports:**
- `lcChange(type, delta)` — Increment/decrement difficulty counter

### `streak.js`
**Purpose:** Streak tracking  
**Exports:**
- `toggleStreak(day)` — Mark day active/inactive
- `calcStreak()` — Calculate current streak count

### `tabs.js`
**Purpose:** Tab navigation  
**Exports:**
- `switchTab(id)` — Switch active panel
- `currentTab` — Current active tab

### `ui.js` (Rendering)
**Purpose:** DOM rendering functions  
**Exports:**
- `renderAreaPanel(areaId)` — Render study area
- `renderOverview()` — Render dashboard
- `renderStreak()` — Render activity calendar
- `updateStats()` — Update stats display
- `updateAll()` — Full app re-render

### `toast.js`
**Purpose:** Notifications  
**Exports:**
- `toast(msg)` — Show temporary notification

### `app.js`
**Purpose:** Application orchestration  
**Responsibilities:**
- Import and coordinate all modules
- Expose functions to window for HTML
- Initialize app on load
- Handle lifecycle events

---

## 🔗 Module Dependencies

```
app.js
  ├── constants.js
  ├── state.js
  ├── tasks.js
  │   ├── state.js
  │   └── ui.js
  ├── notes.js
  │   ├── state.js
  │   └── ui.js
  ├── leetcode.js
  │   ├── state.js
  │   └── ui.js
  ├── streak.js
  │   ├── state.js
  │   └── ui.js
  ├── toast.js
  ├── tabs.js
  └── ui.js
      ├── constants.js
      ├── state.js
      ├── streak.js
      ├── tasks.js
      ├── notes.js
      └── leetcode.js

Key Principle: Modules only import what they need
```

---

## 🔌 Adding New Features

### Example: Add a "Focus Timer" Feature

1. **Create module:**
```javascript
// js/modules/timer.js
import { S, save } from './state.js';
import { toast } from './toast.js';

export function startTimer(minutes) {
  S.timerActive = true;
  S.timerEnd = Date.now() + minutes * 60000;
  save();
  toast(`Timer started for ${minutes} minutes`);
}

export function stopTimer() {
  S.timerActive = false;
  save();
  toast('Timer stopped');
}
```

2. **Update state shape:**
```javascript
// In state.js defaultState()
return {
  tasks: { /* ... */ },
  lc: { /* ... */ },
  streak: [],
  notes: { /* ... */ },
  timerActive: false,  // NEW
  timerEnd: null       // NEW
};
```

3. **Add to app.js:**
```javascript
import { startTimer, stopTimer } from './modules/timer.js';

window.startTimer = startTimer;
window.stopTimer = stopTimer;
```

4. **Use in HTML:**
```html
<button onclick="window.startTimer(25)">Start Pomodoro</button>
```

---

## 🧪 Testing Module in Isolation

Open browser console and test:

```javascript
// Test state
S
localStorage.getItem('studyos_v1')

// Test constants
AREAS

// Test functions
addTask('apt')
toggleTask('apt', 1234)
```

---

## 🚀 Performance Considerations

1. **Batched Updates** — Multiple changes → single `save()` call
2. **Efficient Rendering** — Only affected area re-renders
3. **No Heavy Loops** — O(n) operations acceptable
4. **localStorage Size** — Typical: <50KB (plenty of room)

---

## 🔒 Security Notes

- ⚠️ No authentication (browser-local only)
- ⚠️ localStorage data isn't encrypted
- ✅ No server calls = no external data exposure
- ✅ No sensitive data stored (only study tracking)

---

## 📈 Scaling Options

If StudyOS grows:

1. **Module Bundling** — Webpack/Parcel for JS splitting
2. **Component Framework** — Migrate to React/Vue
3. **Backend** — Node.js API for cloud sync
4. **Database** — Firebase/MongoDB for persistence
5. **Offline-first** — Service Workers + IndexedDB

Current state: Simple, maintainable, no build step needed ✨
