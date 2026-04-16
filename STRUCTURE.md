# StudyOS — Project Structure at a Glance

```
study-tracker/
│
├── 📄 index.html               Main application (entry point)
├── 📄 README.md                Complete user & setup guide
├── 📄 ARCHITECTURE.md          Deep dive into module structure
├── 📄 DEVELOPMENT.md           Developer workflow guide
├── 📄 STRUCTURE.md             This file
│
├── 📁 css/                     Styling
│   ├── style.css              All CSS styles (organized with clear sections)
│   └── components/            Future: Component-specific CSS (optional)
│
├── 📁 js/                      JavaScript logic
│   ├── app.js                 APPLICATION LAYER
│   │                          ├─ Orchestrates all modules
│   │                          ├─ Initializes app
│   │                          └─ Exposes functions to window
│   │
│   └── modules/               FEATURE & SERVICE MODULES
│       ├── constants.js       Constants & configuration
│       ├── state.js           State management & persistence
│       ├── tabs.js            Tab navigation
│       ├── toast.js           Toast notifications
│       ├── tasks.js           Task CRUD operations
│       ├── notes.js           Note management
│       ├── leetcode.js        LeetCode counter
│       ├── streak.js          Streak tracking
│       └── ui.js              UI rendering (rendering logic)
│
├── 📁 assets/                 Static assets
│   └── fonts.html             Metadata for Google Fonts
│
└── 📁 data/                   Sample data & exports
    └── sample.json            Sample data structure reference
```

---

## 📊 Quick Stats

| Metric | Value |
|--------|-------|
| Main App File | app.js (~600 lines → refactored) |
| Module Files | 8 feature modules |
| Feature Modules | Tasks, Notes, LeetCode, Streak |
| Service Modules | State, UI, Toast, Tabs |
| CSS File | ~500 lines (all-in-one) |
| HTML File | ~100 lines (clean structure) |
| **Total Lines of Code** | **~1200 LOC** |
| localStorage Size | ~50KB typical |
| Dependencies | **0** (no npm packages!) |

---

## 🎯 Architecture Levels

```
┌─────────────────────────────┐
│   PRESENTATION LAYER        │ ← index.html
│   (HTML + CSS)              │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐
│   APPLICATION LAYER         │ ← app.js
│   (Orchestration)           │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐
│   FEATURE MODULES           │ ← modules/
│   (Business Logic)          │
│ - Tasks, Notes, LeetCode    │
│ - Streak, UI, State, Toast  │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐
│   DATA LAYER                │ ← localStorage
│   (Persistence)             │
└─────────────────────────────┘
```

---

## 🔄 Module Dependency Graph

```
app.js (orchestrator)
│
├─→ constants.js (never changes)
├─→ state.js (core data)
├─→ tabs.js (navigation)
├─→ toast.js (notifications)
│
├─→ tasks.js (imports: state, ui, toast)
├─→ notes.js (imports: state, ui)
├─→ leetcode.js (imports: state, ui)
├─→ streak.js (imports: state, ui)
│
└─→ ui.js (imports: constants, state, all features)
```

**Key Rule:** Lower layers don't import from upper layers (no circular deps)

---

## 🚀 Module Granularity

Each module has **single responsibility**:

| Module | Lines | Responsibility |
|--------|-------|-----------------|
| constants.js | ~15 | Define configuration |
| state.js | ~30 | Manage & persist state |
| tasks.js | ~35 | Task CRUD |
| notes.js | ~25 | Note CRUD |
| leetcode.js | ~10 | LC counter |
| streak.js | ~30 | Streak logic |
| tabs.js | ~20 | Tab switching |
| toast.js | ~10 | Notifications |
| ui.js | ~200 | Rendering |
| app.js | ~100 | Orchestration |

**Total: ~475 lines (organized & modular)**

---

## 🎨 Why This Structure?

### ✅ Problems Solved

| Problem | Solution |
|---------|----------|
| Hard to find code | Clear folder organization + comments |
| Tangled dependencies | Single top-level app.js orchestrator |
| Difficult to extend | Each feature in isolated module |
| Large files | ~30-50 lines per function |
| Unclear data flow | State → Features → UI (one direction) |
| Hard to test | Pure functions with minimal side effects |
| Poor documentation | Each module + guides + architecture doc |

---

## 📚 How to Navigate

**I want to...**

- **Add a new task feature** → Edit `modules/tasks.js`
- **Change colors** → Edit `css/style.css` `:root` variables
- **Add study area** → Edit `modules/constants.js` + `state.js`
- **Fix UI bug** → Check `modules/ui.js` render functions
- **Understand flow** → Read `ARCHITECTURE.md`
- **Start developing** → Read `DEVELOPMENT.md`
- **Check state** → Look at `modules/state.js`

---

## 🔗 File Cross-References

### When you edit...

- **constants.js**
  - Used by: app.js, ui.js
  - Side effects: None (config only)

- **state.js**
  - Used by: All feature modules, ui.js
  - Side effects: localStorage updates

- **tasks.js**
  - Uses: state.js, ui.js, toast.js
  - Called from: HTML onclick handlers
  
- **ui.js**
  - Uses: All modules for rendering
  - Called from: state.js save(), app.js init
  
- **app.js**
  - Uses: All modules
  - Exposes to: window (for HTML)

---

## 🧠 Mental Model

Think of this architecture like a **restaurant:**

```
HTML          = Orders & Plating (Customer Interface)
app.js        = Manager (Coordinates everything)
modules/      = Production Stations (Tasks, Notes, Counter)
state.js      = Inventory (What we have)
ui.js         = Plating Station (Make it look good)
localStorage  = Warehouse (Storage)
```

---

## 📦 Deployment Structure

The final project is deployment-ready:

```bash
# Everything needed is in study-tracker/
# Just upload these files:
- index.html
- css/style.css
- js/app.js
- js/modules/*.js

# These are optional (documentation):
- README.md
- ARCHITECTURE.md
- DEVELOPMENT.md
- STRUCTURE.md
- data/sample.json
- assets/
```

**Zero build step needed!** Just point your server to the folder.

---

## 🎓 Learning Path

1. **Start here** → README.md (understand what it does)
2. **Understanding** → ARCHITECTURE.md (understand how)
3. **Exploring** → Open app.js + modules/ (see code structure)
4. **Developing** → DEVELOPMENT.md (how to add features)
5. **Deep dive** → Individual module files (implementation details)

---

## ✨ Key Takeaways

- **No build tools** — Pure HTML, CSS, JavaScript
- **No dependencies** — Zero npm packages
- **Well-organized** — Clear folder structure
- **Modular** — Easy to extend features
- **Well-documented** — 4 guide files + code comments
- **Maintainable** — Clear naming + conventions
- **Optimized** — Fast load, small payload
- **Offline-first** — Works completely offline

---

**This structure scales from 1 feature to 10+ features without major refactoring!** 🚀
