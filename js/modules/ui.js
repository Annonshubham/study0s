import { AREAS, TAB_ORDER, LC_COLORS, LC_TYPES } from './constants.js';
import { S, save } from './state.js';
import { calcStreak } from './streak.js';
import { addTask, toggleTask, deleteTask } from './tasks.js';
import { addNote, deleteNote } from './notes.js';
import { lcChange } from './leetcode.js';

// ── UI RENDERING ────────────────────────────────────────────

export function renderAreaPanel(areaId) {
  const area = AREAS.find(a => a.id === areaId);
  const tasks = S.tasks[areaId];
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round(done / total * 100) : 0;
  const notes = S.notes[areaId];

  // LeetCode block (DSA only)
  let lcHtml = '';
  if (areaId === 'dsa') {
    const lcTotal = S.lc.easy + S.lc.medium + S.lc.hard;
    lcHtml = `
      <div class="lc-section">
        <div class="lc-title">LeetCode Problems Solved</div>
        <div class="lc-counters">
          ${LC_TYPES.map(type => `
            <div class="lc-group">
              <div class="lc-label" style="color:${LC_COLORS[type]}">${type}</div>
              <div class="lc-row">
                <button class="lc-btn" onclick="window.lcChange('${type}',-1)">−</button>
                <div class="lc-num" style="color:${LC_COLORS[type]}" id="lc-${type}">${S.lc[type]}</div>
                <button class="lc-btn" onclick="window.lcChange('${type}',1)">+</button>
              </div>
            </div>`).join('')}
          <div class="lc-total">
            <div class="lc-total-num" style="color:var(--dsa)">${lcTotal}</div>
            <div class="lc-total-label">total solved</div>
          </div>
        </div>
      </div>`;
  }

  // Task list
  const taskHtml = tasks.length === 0
    ? `<div class="empty-msg">No tasks yet. Add your first task above ↑</div>`
    : tasks.map(t => `
        <div class="task-item ${t.done ? 'done' : ''}">
          <div class="checkbox ${t.done ? 'checked' : ''}"
            style="${t.done ? `background:${area.hex};border-color:${area.hex}` : ''}"
            onclick="window.toggleTask('${areaId}',${t.id})"></div>
          <span class="task-text ${t.done ? 'done' : ''}">${t.text}</span>
          <span class="task-time">${t.ts || ''}</span>
          <button class="task-del" onclick="window.deleteTask('${areaId}',${t.id})">×</button>
        </div>`).join('');

  // Notes
  const notesHtml = notes.length === 0
    ? `<span style="font-size:12px;color:var(--text3)">No notes yet</span>`
    : notes.map(n => `
        <div class="note-chip">
          <span>${n.text}</span>
          <span class="note-x" onclick="window.deleteNote('${areaId}',${n.id})">×</span>
        </div>`).join('');

  document.getElementById('panel-' + areaId).innerHTML = `
    <div class="section-card">
      <div class="card-header">
        <div class="card-title">
          <div class="area-icon" style="background:${area.bg};color:${area.hex}">${area.emoji}</div>
          <div class="card-name">${area.name}</div>
        </div>
        <div class="progress-pill">${done}/${total} done · ${pct}%</div>
      </div>
      <div class="pbar-wrap">
        <div class="pbar" style="width:${pct}%;background:${area.hex}"></div>
      </div>
      ${lcHtml}
      <div class="task-input-row">
        <input class="task-input" id="inp-${areaId}"
          placeholder="Add a task… (press Enter)"
          onkeydown="if(event.key==='Enter') window.addTask('${areaId}')">
        <button class="add-btn" onclick="window.addTask('${areaId}')">+ Add</button>
      </div>
      <div class="task-list">${taskHtml}</div>
      <div class="notes-section">
        <div class="notes-label">Quick Notes</div>
        <div class="note-input-row">
          <input class="note-input" id="note-inp-${areaId}"
            placeholder="Jot a note…"
            onkeydown="if(event.key==='Enter') window.addNote('${areaId}')">
          <button class="note-save" onclick="window.addNote('${areaId}')">Save</button>
        </div>
        <div class="notes-chips">${notesHtml}</div>
      </div>
    </div>`;
}

export function renderOverview() {
  // Area progress bars
  document.getElementById('ov-areas').innerHTML = AREAS.map(a => {
    const tasks = S.tasks[a.id];
    const done = tasks.filter(t => t.done).length;
    const pct = tasks.length > 0 ? Math.round(done / tasks.length * 100) : 0;
    return `
      <div class="ov-task-row">
        <div class="ov-area-dot" style="background:${a.hex}"></div>
        <div class="ov-area-name">${a.emoji} ${a.name}</div>
        <div class="ov-pbar-wrap">
          <div class="ov-pbar" style="width:${pct}%;background:${a.hex}"></div>
        </div>
        <div class="ov-pct">${pct}%</div>
      </div>`;
  }).join('');

  // LeetCode stats
  const lc = S.lc;
  const lcTotal = lc.easy + lc.medium + lc.hard;
  document.getElementById('ov-lc').innerHTML = `
    <div style="display:flex;gap:16px;margin-bottom:14px;align-items:center">
      <div style="text-align:center">
        <div style="font-size:24px;font-weight:800;color:var(--dsa)">${lc.easy}</div>
        <div style="font-size:11px;color:var(--text3)">Easy</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:24px;font-weight:800;color:var(--sem)">${lc.medium}</div>
        <div style="font-size:11px;color:var(--text3)">Medium</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:24px;font-weight:800;color:var(--red)">${lc.hard}</div>
        <div style="font-size:11px;color:var(--text3)">Hard</div>
      </div>
      <div style="text-align:center;margin-left:auto">
        <div style="font-size:28px;font-weight:800;color:var(--text)">${lcTotal}</div>
        <div style="font-size:11px;color:var(--text3)">Total</div>
      </div>
    </div>
    <div style="height:4px;background:var(--bg4);border-radius:4px;overflow:hidden">
      ${lcTotal > 0 ? `
        <div style="display:flex;height:100%">
          <div style="flex:${lc.easy};background:var(--dsa);transition:flex 0.4s"></div>
          <div style="flex:${lc.medium};background:var(--sem);transition:flex 0.4s"></div>
          <div style="flex:${lc.hard};background:var(--red);transition:flex 0.4s"></div>
        </div>` : ''}
    </div>`;

  // Pending tasks
  const pending = [];
  AREAS.forEach(a => {
    S.tasks[a.id].filter(t => !t.done).slice(0, 3).forEach(t => {
      pending.push({ ...t, area: a });
    });
  });

  document.getElementById('ov-pending').innerHTML = pending.length === 0
    ? `<div class="empty-msg" style="color:var(--dsa)">🎉 All caught up! Great work.</div>`
    : pending.map(t => `
        <div class="task-item" style="margin-bottom:7px">
          <div class="area-icon" style="width:24px;height:24px;border-radius:5px;font-size:12px;background:${t.area.bg};color:${t.area.hex}">${t.area.emoji}</div>
          <span class="task-text">${t.text}</span>
          <span style="font-size:11px;color:${t.area.hex};font-family:'JetBrains Mono',monospace">${t.area.name}</span>
        </div>`).join('');
}

export function renderStreak() {
  const todayStr = new Date().toISOString().slice(0, 10);
  document.getElementById('streak-count').textContent = calcStreak();

  const DAYS = 84; // 12 weeks
  const cells = [];
  let prevMonth = '';

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const month = d.toLocaleDateString('en-IN', { month: 'short' });
    const isFirst = prevMonth !== month;
    cells.push({
      ds,
      isToday: ds === todayStr,
      isOn: S.streak.includes(ds),
      dayNum: d.getDate(),
      month,
      isFirst
    });
    prevMonth = month;
  }

  // Build week columns
  let html = '<div style="display:flex;gap:5px;overflow-x:auto">';
  let week = [];

  cells.forEach((c, i) => {
    week.push(c);
    if (week.length === 7 || i === cells.length - 1) {
      const showLabel = week.some(w => w.isFirst);
      html += `<div style="display:flex;flex-direction:column;gap:5px">`;
      html += `<div class="month-label" style="opacity:${showLabel ? 1 : 0}">${week[0].month}</div>`;
      week.forEach(c => {
        html += `<div class="streak-cell ${c.isOn ? 'on' : ''} ${c.isToday ? 'today' : ''}"
          onclick="window.toggleStreak('${c.ds}')" title="${c.ds}">${c.dayNum}</div>`;
      });
      html += '</div>';
      week = [];
    }
  });

  html += '</div>';
  document.getElementById('streak-calendar').innerHTML = html;
}

export function updateStats() {
  let done = 0, total = 0;
  AREAS.forEach(a => {
    S.tasks[a.id].forEach(t => {
      total++;
      if (t.done) done++;
    });
  });

  const lc = S.lc.easy + S.lc.medium + S.lc.hard;
  document.getElementById('s-done').textContent = done;
  document.getElementById('s-lc').textContent = lc;
  document.getElementById('s-total').textContent = total;
  document.getElementById('s-pct').textContent = total > 0 ? Math.round(done / total * 100) + '%' : '0%';
  document.getElementById('streak-count').textContent = calcStreak();
}

export function updateAll() {
  updateStats();
  AREAS.forEach(a => renderAreaPanel(a.id));
  renderOverview();
  renderStreak();
}
