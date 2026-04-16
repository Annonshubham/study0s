# StudyOS — Development Guide

Quick reference for developers working on the StudyOS codebase.

---

## 🛠️ Setup

No build step or dependencies needed — just open in browser!

```bash
# Option 1: Direct
open index.html

# Option 2: With Live Server (VS Code)
# Install: ritwickdey.LiveServer
# Right-click index.html → "Open with Live Server"

# Option 3: With Python
python -m http.server 8000
# Visit: http://localhost:8000
```

---

## 📝 Code Style Guidelines

### JavaScript
- Use `camelCase` for functions and variables
- Use `UPPER_CASE` for constants
- Comment major sections with `// ── SECTION NAME ──`
- Keep functions under 50 lines when possible
- Prefer `const`, avoid `var`

### Naming Conventions
```javascript
// Functions
addTask()           // Action verbs
renderPanel()       // Render functions
calcStreak()        // Calculate functions
toggleTask()        // Toggle state

// Variables
const areaId        // Single value
const tasks         // Array/collection
const S             // Global state
const AREAS         // Constants
```

### CSS
- Use CSS variables from `:root`
- Class names: `kebab-case`
- BEM-ish for complex components
- Mobile-first media queries (if needed)

---

## 🔧 Common Tasks

### Add a New Task Function

```javascript
// In js/modules/tasks.js

export function myNewTask(areaId) {
  // 1. Get user input or parameters
  const input = getInput();
  
  // 2. Validate
  if (!input) return;
  
  // 3. Modify state
  S.tasks[areaId].push({
    id: Date.now(),
    text: input,
    done: false
  });
  
  // 4. Persist
  save();
  
  // 5. Update UI
  renderAreaPanel(areaId);
  
  // 6. Notify user
  toast('Task added!');
}
```

### Add New State Property

1. **Update `defaultState()` in `state.js`:**
   ```javascript
   function defaultState() {
     return {
       // ... existing
       myNewFeature: null  // ADD HERE
     };
   }
   ```

2. **Access in modules:**
   ```javascript
   import { S, save } from './state.js';
   
   S.myNewFeature = value;
   save();
   ```

### Add UI Component

```javascript
// In js/modules/ui.js

export function renderMyComponent() {
  const html = `
    <div class="my-component">
      <h3>My Component</h3>
      <p>${S.myData}</p>
    </div>
  `;
  document.getElementById('my-container').innerHTML = html;
}
```

Then call from `updateAll()`:
```javascript
export function updateAll() {
  updateStats();
  renderMyComponent();  // ADD THIS
  // ... rest
}
```

---

## 🐛 Debugging Tips

### In Browser Console

```javascript
// View state
S

// Check localStorage
localStorage.getItem('studyos_v1')

// Clear all data
localStorage.clear()
location.reload()

// Export data as JSON
JSON.stringify(S)

// Test a function
addTask('apt')
```

### Common Issues

**Issue:** Changes not persisting
- **Solution:** Check `save()` is called after state change
- **Check:** `localStorage.getItem('studyos_v1')`

**Issue:** UI not updating
- **Solution:** Call `updateAll()` or specific `renderX()` function
- **Check:** Element IDs in HTML match render functions

**Issue:** Function not found
- **Solution:** Check exported from module
- **Check:** Exposed to `window` in `app.js`
- **Check:** Called correctly: `window.functionName()` or `functionName()`

---

## 📂 File Organization Checklist

```
When adding a new feature, ensure:

☐ Module created in js/modules/featureName.js
☐ Exports documented with JSDoc comments
☐ Imports only use absolute paths (modules/)
☐ State integrated in state.js defaultState()
☐ Functions exposed to window in app.js
☐ HTML has corresponding ID elements
☐ UI updates added to updateAll()
☐ Error handling for edge cases
☐ toast() called for user feedback
☐ save() called after state changes
```

---

## 🧪 Testing Your Changes

### Manual Testing Flow

```
1. Open index.html in browser
2. Open DevTools (F12)
3. Go to Console tab
4. Test function: functionName(param)
5. Check State: S (should reflect changes)
6. Check localStorage
7. Hard refresh (Ctrl+Shift+R)
8. Verify data persisted
```

### Smoke Test Checklist

- [ ] Add task → appears in list
- [ ] Complete task → visual feedback  
- [ ] Delete task → removed from list
- [ ] Add note → appears in notes
- [ ] Toggle streak → calendar updates
- [ ] Switch tabs → correct panel shows
- [ ] Refresh page → data persists
- [ ] Open in different tab → syncs on focus

---

## 📋 Commit Message Guidelines

```
feat: add pomodoro timer functionality
fix: correct streak calculation logic
refactor: split tasks.js into subtasks
docs: improve README with examples
style: format code consistency
test: add unit tests for state
chore: update dependencies
```

---

## 🚀 Performance Optimization Tips

1. **Avoid multiple saves:**
   ```javascript
   // ❌ Bad
   S.data.push(item); save();
   S.data[0].done = true; save();
   
   // ✅ Good
   S.data.push(item);
   S.data[0].done = true;
   save();  // Single save
   ```

2. **Cache DOM references:**
   ```javascript
   // ❌ Bad
   document.getElementById('panel-dsa').innerHTML = html;
   document.getElementById('panel-dsa').style.display = 'block';
   
   // ✅ Good
   const panel = document.getElementById('panel-dsa');
   panel.innerHTML = html;
   panel.style.display = 'block';
   ```

3. **Avoid DOM queries in loops:**
   ```javascript
   // ❌ Bad
   tasks.forEach(t => {
     const panel = document.getElementById('panel');
     panel.innerHTML += renderTask(t);
   });
   
   // ✅ Good
   const html = tasks.map(t => renderTask(t)).join('');
   document.getElementById('panel').innerHTML = html;
   ```

---

## 📚 Resources

- [ES6 Features Used](https://javascript.info/) — arrow functions, destructuring, template strings
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/var()) — Custom properties
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [JSON Stringify/Parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)

---

## 🎯 Next Steps for Contributors

1. **Pick a feature** from ARCHITECTURE.md future enhancements
2. **Create module** following examples above
3. **Update state** for new data
4. **Test thoroughly** in console
5. **Document** with comments
6. **Submit changes**

Happy coding! 🚀
