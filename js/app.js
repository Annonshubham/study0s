// ═══════════════════════════════════════════════════════════
// STUDYOS — Main Application (Standalone - All Functions)
// ═══════════════════════════════════════════════════════════

// ── CONSTANTS ──────────────────────────────────────────────
const AREAS = [
  { id: 'apt', name: 'Aptitude Prep',    emoji: '🧠', color: 'var(--apt)', bg: 'var(--apt-bg)', hex: '#a78bfa' },
  { id: 'dsa', name: 'DSA Problems',     emoji: '⚡', color: 'var(--dsa)', bg: 'var(--dsa-bg)', hex: '#34d399' },
  { id: 'sem', name: 'Semester Studies', emoji: '📚', color: 'var(--sem)', bg: 'var(--sem-bg)', hex: '#fbbf24' },
  { id: 'dev', name: 'Development',      emoji: '💻', color: 'var(--dev)', bg: 'var(--dev-bg)', hex: '#60a5fa' },
];

const TAB_ORDER = ['overview', 'apt', 'dsa', 'sem', 'dev', 'timer', 'daily', 'analytics', 'search', 'settings', 'streak'];
const STORAGE_KEY = 'studyos_v1';
const todayStr = new Date().toISOString().slice(0, 10);
const LC_COLORS = { easy: '#34d399', medium: '#fbbf24', hard: '#f87171' };

// ── STATE MANAGEMENT ────────────────────────────────────────
let S = loadState();

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();
  } catch {
    return defaultState();
  }
}

function defaultState() {
  return {
    // Core Features
    tasks:  { apt: [], dsa: [], sem: [], dev: [] },
    lc:     { easy: 0, medium: 0, hard: 0 },
    streak: [],
    notes:  { apt: [], dsa: [], sem: [], dev: [] },
    
    // Topic/Chapter Management
    subtopics: { apt: [], dsa: [], sem: [], dev: [] }, // {id, name, description, questions: [], timestamp}
    
    // Questions & Solutions
    sessions: [],  // {id, date, areaId, minutes, problemsSolved, notes, timestamp}
    solutions: [], // Legacy
    questions: [], // Legacy
    
    // FEATURE 1: Daily Study Tracking
    stats: {},     // {date: {areaId: {time, problems, topics, sessionCount}, ...}}
    
    // FEATURE 2: Pomodoro Timer Sessions
    timerSessions: [], // {id, date, areaId, workMinutes, breakTotalMinutes, completedCycles, timestamp}
    timerSettings: { workMinutes: 25, breakMinutes: 5 },
    
    // FEATURE 7: Daily Timeline (sessions by time)
    timeline: {},  // {date: [{time, areaId, type, description, duration}, ...]}
    
    // FEATURE 8: Analytics & Progress
    analytics: {
      // {date: {totalTime, avgSessionTime, sessionsCompleted, questionsAdded, notesSaved}}
    },
    
    // FEATURE 9: Search & Filter History
    searchHistory: [], // [{query, timestamp, results}]
    recentSearches: [], // [query, ...]
    
    // FEATURE 10: Backup & Settings
    settings: {
      notificationsEnabled: true,
      theme: 'dark',
      autoSaveIntervalSeconds: 10
    },
    
    // NEW: MISSION SYSTEM
    missions: {
      dailyStudyHours: 5,     // Target hours per day
      dailyQuestionsTarget: 10, // Target questions per day
      enabled: true
    },
    
    // NEW: PERFORMANCE HISTORY (for feedback & comparisons)
    performanceHistory: {}, // {date: {studyHours, questionsSolved, areasWorked: []}}
    
    // NEW: MARKED FOR REVISION (hard questions)
    markedForRevision: []    // [{areaId, subtopicId, questionId, timestamp}]
  };
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
  updateAll();
}

// ── INITIALIZATION ──────────────────────────────────────────
document.getElementById('date-chip').textContent = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});

// ── TAB NAVIGATION ──────────────────────────────────────────
let currentTab = 'overview';

function switchTab(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  const idx = TAB_ORDER.indexOf(id);
  if (idx >= 0) document.querySelectorAll('.nav-tab')[idx].classList.add('active');
  currentTab = id;
}

// ── NOTIFICATIONS ───────────────────────────────────────────
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── TASK MANAGEMENT ─────────────────────────────────────────
function addTask(areaId) {
  const inp = document.getElementById('inp-' + areaId);
  const v = inp.value.trim();
  if (!v) return;
  S.tasks[areaId].push({
    id: Date.now(),
    text: v,
    done: false,
    ts: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  });
  inp.value = '';
  save();
  renderAreaPanel(areaId);
  toast('Task added!');
}

function toggleTask(areaId, id) {
  const t = S.tasks[areaId].find(t => t.id === id);
  if (t) { t.done = !t.done; save(); renderAreaPanel(areaId); }
}

function deleteTask(areaId, id) {
  S.tasks[areaId] = S.tasks[areaId].filter(t => t.id !== id);
  save();
  renderAreaPanel(areaId);
  toast('Task removed');
}

// ── NOTES MANAGEMENT ────────────────────────────────────────
function addNote(areaId) {
  const inp = document.getElementById('note-inp-' + areaId);
  const v = inp.value.trim();
  if (!v) return;
  S.notes[areaId].push({ id: Date.now(), text: v });
  inp.value = '';
  save();
  renderAreaPanel(areaId);
}

function deleteNote(areaId, id) {
  S.notes[areaId] = S.notes[areaId].filter(n => n.id !== id);
  save();
  renderAreaPanel(areaId);
}

// ── LEETCODE MANAGEMENT ─────────────────────────────────────
function lcChange(type, delta) {
  S.lc[type] = Math.max(0, S.lc[type] + delta);
  save();
  renderAreaPanel('dsa');
}

// ── STREAK MANAGEMENT ───────────────────────────────────────
function toggleStreak(day) {
  const idx = S.streak.indexOf(day);
  if (idx > -1) S.streak.splice(idx, 1);
  else S.streak.push(day);
  save();
  renderStreak();
}

function calcStreak() {
  let count = 0;
  const d = new Date();
  while (true) {
    const s = d.toISOString().slice(0, 10);
    if (S.streak.includes(s)) { count++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return count;
}

// ═══════════════════════════════════════════════════════════════════════════
// NEW: MISSION SYSTEM & PERFORMANCE TRACKING
// ═══════════════════════════════════════════════════════════════════════════

function getTodayMissionProgress() {
  const today = todayStr;
  const todayTime = getTotalTimeToday();
  const todayStats = getDailyStats(today);
  
  let totalQuestions = 0;
  AREAS.forEach(a => {
    if (todayStats[a.id] && todayStats[a.id].problems) {
      totalQuestions += todayStats[a.id].problems;
    }
  });
  
  const hoursTarget = S.missions.dailyStudyHours || 5;
  const questionsTarget = S.missions.dailyQuestionsTarget || 10;
  
  const hoursComplete = Math.min(todayTime / 60, hoursTarget); // Convert minutes to hours
  const questionsComplete = Math.min(totalQuestions, questionsTarget);
  
  return {
    hoursTarget,
    hoursComplete: Math.round(hoursComplete * 10) / 10,
    hoursPercent: Math.round((hoursComplete / hoursTarget) * 100),
    questionsTarget,
    questionsComplete,
    questionsPercent: Math.round((questionsComplete / questionsTarget) * 100),
    totalPercent: Math.round(((hoursComplete / hoursTarget) + (questionsComplete / questionsTarget)) / 2 * 100),
    hoursTargetMet: hoursComplete >= hoursTarget,
    questionsTargetMet: questionsComplete >= questionsTarget
  };
}

function calculateConsistencyScore() {
  const today = new Date();
  const weekly = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    weekly.push(ds);
  }
  
  // Count days studied this week
  let daysStudied = 0;
  let targetsMetCount = 0;
  
  weekly.forEach(date => {
    const stats = getDailyStats(date);
    let hasActivity = false;
    
    AREAS.forEach(a => {
      if (stats[a.id] && (stats[a.id].time > 0 || stats[a.id].problems > 0)) {
        hasActivity = true;
        daysStudied++;
      }
    });
    
    // Check if daily targets were met
    if (hasActivity) {
      const dayTime = Object.values(stats).reduce((sum, s) => sum + (s.time || 0), 0);
      const dayProblems = Object.values(stats).reduce((sum, s) => sum + (s.problems || 0), 0);
      
      if (dayTime >= S.missions.dailyStudyHours * 60 && dayProblems >= S.missions.dailyQuestionsTarget) {
        targetsMetCount++;
      }
    }
  });
  
  // Consistency = (days studied / 7) * 60% + (targets met / days studied) * 40%
  const daysPercent = Math.min(daysStudied / 7, 1) * 60;
  const targetsPercent = daysStudied > 0 ? (Math.min(targetsMetCount / daysStudied, 1) * 40) : 0;
  
  return Math.round(daysPercent + targetsPercent);
}

function detectWeakAreas() {
  const today = new Date();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  
  const areaStats = {};
  
  // Aggregate last 7 days
  AREAS.forEach(area => {
    areaStats[area.id] = { time: 0, problems: 0, name: area.name, emoji: area.emoji };
  });
  
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const stats = getDailyStats(ds);
    
    AREAS.forEach(a => {
      if (stats[a.id]) {
        areaStats[a.id].time += stats[a.id].time || 0;
        areaStats[a.id].problems += stats[a.id].problems || 0;
      }
    });
  }
  
  // Sort by time spent (ascending - least studied first)
  const sorted = Object.values(areaStats).sort((a, b) => a.time - b.time);
  
  return {
    weakest: sorted[0],
    secondWeakest: sorted[1],
    strongest: sorted[sorted.length - 1],
    allByActivity: sorted
  };
}

function generateWeeklyReport() {
  const today = new Date();
  const weekly = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  let totalTime = 0;
  let sessionsCount = 0;
  let bestDay = { date: '', time: 0 };
  let worstDay = { date: '', time: 24 * 60 };
  let dayBreakdown = {};
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const dayName = dayNames[d.getDay()];
    
    const stats = getDailyStats(ds);
    let dayTime = 0;
    let dayProblems = 0;
    
    AREAS.forEach(a => {
      if (stats[a.id]) {
        dayTime += stats[a.id].time || 0;
        dayProblems += stats[a.id].problems || 0;
      }
    });
    
    dayBreakdown[dayName] = dayTime;
    totalTime += dayTime;
    
    if (dayTime > bestDay.time) {
      bestDay = { date: dayName, time: dayTime };
    }
    if (dayTime > 0 && dayTime < worstDay.time) {
      worstDay = { date: dayName, time: dayTime };
    }
  }
  
  const weak = detectWeakAreas();
  const targetHours = S.missions.dailyStudyHours * 7;
  
  return {
    totalTime: Math.round(totalTime / 60 * 10) / 10,
    targetHours,
    targetMet: totalTime >= targetHours * 60,
    bestDay,
    worstDay: worstDay.time === 24 * 60 ? { date: 'None', time: 0 } : worstDay,
    strongArea: weak.strongest.name,
    weakArea: weak.weakest.name,
    dayBreakdown,
    recommendation: weak.weakest.time < 60 ? `Focus more on ${weak.weakest.name} next week` : `Keep up the good work!`
  };
}

function getNextActionRecommendation() {
  const weak = detectWeakAreas();
  const todayStats = getDailyStats(todayStr);
  
  // Find area with least recent activity
  let leastActiveArea = weak.weakest;
  
  // Suggest based on weak area
  const suggestions = {
    dsa: `Solve 1 Medium DSA Question on ${weak.weakest.name}`,
    apt: `Practice 1 Aptitude problem`,
    sem: `Review notes for ${weak.weakest.name}`,
    dev: `Work on a small ${weak.weakest.name} project`
  };
  
  return {
    action: suggestions[weak.weakest.id] || `Work on ${weak.weakest.name}`,
    area: weak.weakest.id,
    reason: `Your weakest area this week`
  };
}

function getDynamicFeedback() {
  const today = todayStr;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  
  const todayStats = getDailyStats(today);
  const yesterdayStats = getDailyStats(yesterdayStr);
  
  let todayTime = 0, yesterdayTime = 0;
  AREAS.forEach(a => {
    if (todayStats[a.id]) todayTime += todayStats[a.id].time || 0;
    if (yesterdayStats[a.id]) yesterdayTime += yesterdayStats[a.id].time || 0;
  });
  
  if (todayTime === 0) {
    return { type: 'low', message: `You haven't studied yet today. Start now! 🚀` };
  }
  
  if (todayTime > yesterdayTime * 1.2) {
    return { type: 'success', message: `Great! You studied 20% more than yesterday! 🎉` };
  }
  
  if (todayTime > yesterdayTime) {
    return { type: 'good', message: `Good job! Slightly more than yesterday. Keep it up! 👍` };
  }
  
  if (todayTime === yesterdayTime) {
    return { type: 'neutral', message: `Same as yesterday. Push harder today! 💪` };
  }
  
  if (todayTime < yesterdayTime * 0.8) {
    return { type: 'warning', message: `You're studying less than usual today. Let's increase it! ⚠️` };
  }
  
  return { type: 'neutral', message: `Keep up your study routine! 📚` };
}

function markForRevision(areaId, subtopicId, questionId) {
  S.markedForRevision.push({
    areaId,
    subtopicId,
    questionId,
    timestamp: new Date().toLocaleString()
  });
  save();
  toast('✅ Marked for revision');
}

function unmarkForRevision(areaId, subtopicId, questionId) {
  S.markedForRevision = S.markedForRevision.filter(m => 
    !(m.areaId === areaId && m.subtopicId === subtopicId && m.questionId === questionId)
  );
  save();
  toast('✅ Unmarked from revision');
}

function isMarkedForRevision(areaId, subtopicId, questionId) {
  return S.markedForRevision.some(m => 
    m.areaId === areaId && m.subtopicId === subtopicId && m.questionId === questionId
  );
}

function getMarkedForRevision() {
  const questions = [];
  
  S.markedForRevision.forEach(m => {
    const subtopic = S.subtopics[m.areaId]?.find(st => st.id === m.subtopicId);
    const question = subtopic?.questions?.find(q => q.id === m.questionId);
    
    if (question) {
      questions.push({
        ...question,
        areaId: m.areaId,
        subtopicId: m.subtopicId,
        chapterName: subtopic.name
      });
    }
  });
  
  return questions;
}

// ── NEW: SESSION TRACKING ───────────────────────────────────
function addSession(areaId, minutes, problemsSolved, notes) {
  const today = todayStr;
  S.sessions.push({
    id: Date.now(),
    date: today,
    areaId: areaId,
    minutes: parseInt(minutes) || 0,
    problemsSolved: parseInt(problemsSolved) || 0,
    notes: notes || '',
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  });
  
  // Update daily stats
  if (!S.stats[today]) S.stats[today] = { apt: {}, dsa: {}, sem: {}, dev: {} };
  if (!S.stats[today][areaId]) S.stats[today][areaId] = { time: 0, problems: 0 };
  S.stats[today][areaId].time += parseInt(minutes) || 0;
  S.stats[today][areaId].problems += parseInt(problemsSolved) || 0;
  
  // Update performance history for mission tracking
  if (!S.performanceHistory[today]) {
    S.performanceHistory[today] = {
      studyHours: 0,
      questionsSolved: 0,
      areasWorked: []
    };
  }
  S.performanceHistory[today].studyHours += parseInt(minutes) / 60;
  S.performanceHistory[today].questionsSolved += parseInt(problemsSolved) || 0;
  if (!S.performanceHistory[today].areasWorked.includes(areaId)) {
    S.performanceHistory[today].areasWorked.push(areaId);
  }
  
  save();
  toast(`✅ Session logged: ${minutes}m, ${problemsSolved} problems`);
  renderAreaPanel(areaId);
  renderDailySummary();
}

function addSessionFromUI() {
  const area = document.getElementById('session-area').value;
  const time = document.getElementById('session-time').value;
  const problems = document.getElementById('session-problems').value;
  const notes = document.getElementById('session-notes').value;
  
  if (!area) { toast('⚠️ Please select an area'); return; }
  if (!time || time <= 0) { toast('⚠️ Please enter valid time'); return; }
  
  addSession(area, time, problems, notes);
  
  // Clear form
  document.getElementById('session-area').value = '';
  document.getElementById('session-time').value = '';
  document.getElementById('session-problems').value = '';
  document.getElementById('session-notes').value = '';
}

// ── SUBTOPICS & QUESTIONS MANAGEMENT ──────────────────────
function addSubtopic(areaId, name, description) {
  if (!name) {
    toast('⚠️ Please enter subtopic name');
    return;
  }
  
  if (!S.subtopics) S.subtopics = {};
  if (!S.subtopics[areaId]) S.subtopics[areaId] = [];
  
  S.subtopics[areaId].push({
    id: Date.now(),
    name: name,
    description: description || '',
    questions: [],
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  });
  
  save();
  toast(`✅ "${name}" added`);
  renderAreaPanel(areaId);
}

function deleteSubtopic(areaId, subtopicId) {
  if (!S.subtopics || !S.subtopics[areaId]) return;
  S.subtopics[areaId] = S.subtopics[areaId].filter(s => s && s.id !== subtopicId);
  save();
  toast('Subtopic deleted');
  renderAreaPanel(areaId);
}

function addQuestionToSubtopic(areaId, subtopicId, name, difficulty, platform, link, description) {
  if (!name || !difficulty) {
    toast('⚠️ Please enter question name and difficulty');
    return;
  }
  
  if (!S.subtopics || !S.subtopics[areaId]) return;
  const subtopic = S.subtopics[areaId].find(s => s && s.id === subtopicId);
  if (!subtopic) {
    toast('⚠️ Subtopic not found');
    return;
  }
  
  if (!subtopic.questions) subtopic.questions = [];
  
  subtopic.questions.push({
    id: Date.now(),
    name: name,
    difficulty: difficulty,
    platform: platform || '',
    link: link || '',
    description: description || '',
    solutions: [],
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  });
  
  save();
  toast(`✅ Question added: ${name}`);
  renderAreaPanel(areaId);
}

function deleteQuestionFromSubtopic(areaId, subtopicId, questionId) {
  if (!S.subtopics || !S.subtopics[areaId]) return;
  const subtopic = S.subtopics[areaId].find(s => s && s.id === subtopicId);
  if (subtopic && subtopic.questions) {
    subtopic.questions = subtopic.questions.filter(q => q && q.id !== questionId);
    save();
    toast('Question deleted');
    renderAreaPanel(areaId);
  }
}

function addSolutionToSubtopic(areaId, subtopicId, questionId, approach, notes, platform) {
  if (!S.subtopics || !S.subtopics[areaId]) return;
  const subtopic = S.subtopics[areaId].find(s => s && s.id === subtopicId);
  if (!subtopic || !subtopic.questions) {
    toast('⚠️ Subtopic not found');
    return;
  }
  
  const question = subtopic.questions.find(q => q && q.id === questionId);
  if (!question) {
    toast('⚠️ Question not found');
    return;
  }
  
  if (!question.solutions) question.solutions = [];
  
  question.solutions.push({
    id: Date.now(),
    approach: approach,
    notes: notes || '',
    platform: platform || '',
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  });
  
  save();
  toast(`✅ Solution added: ${question.solutions.length}`);
  renderAreaPanel(areaId);
}

function deleteSolutionFromSubtopic(areaId, subtopicId, questionId, solutionId) {
  if (!S.subtopics || !S.subtopics[areaId]) return;
  const subtopic = S.subtopics[areaId].find(s => s && s.id === subtopicId);
  if (subtopic && subtopic.questions) {
    const question = subtopic.questions.find(q => q && q.id === questionId);
    if (question && question.solutions) {
      question.solutions = question.solutions.filter(s => s && s.id !== solutionId);
      save();
      toast('Solution deleted');
      renderAreaPanel(areaId);
    }
  }
}
function addQuestion(questionName, difficulty, platform, link, description) {
  if (!questionName || !difficulty) {
    toast('⚠️ Please enter question name and difficulty');
    return;
  }
  
  if (!S.questions) S.questions = [];
  
  S.questions.push({
    id: Date.now(),
    name: questionName,
    difficulty: difficulty,
    platform: platform || '',
    link: link || '',
    description: description || '',
    date: todayStr,
    solutions: [],
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  });
  
  save();
  toast(`✅ Question added: ${questionName}`);
  renderAreaPanel('dsa');
}

function addSolution(questionId, approach, notes, platform) {
  if (!S.questions) S.questions = [];
  const question = S.questions.find(q => q && q.id === questionId);
  if (!question) {
    toast('⚠️ Question not found');
    return;
  }
  
  if (!question.solutions) question.solutions = [];
  
  question.solutions.push({
    id: Date.now(),
    approach: approach,
    notes: notes || '',
    platform: platform || '',
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  });
  
  save();
  toast(`✅ Solution ${question.solutions.length} added to "${question.name}"`);
  renderAreaPanel('dsa');
}

function deleteQuestion(questionId) {
  if (!S.questions) S.questions = [];
  S.questions = S.questions.filter(q => q && q.id !== questionId);
  save();
  toast('Question deleted');
  renderAreaPanel('dsa');
}

function deleteSolution(questionId, solutionId) {
  if (!S.questions) S.questions = [];
  const question = S.questions.find(q => q && q.id === questionId);
  if (question && question.solutions) {
    question.solutions = question.solutions.filter(s => s && s.id !== solutionId);
    save();
    toast('Solution deleted');
    renderAreaPanel('dsa');
  }
}

function getDifficultyColor(difficulty) {
  const colors = { easy: '#34d399', medium: '#fbbf24', hard: '#f87171' };
  return colors[difficulty] || '#888';
}

function getSessionsForArea(areaId) {
  return (S.sessions || []).filter(s => s.areaId === areaId).reverse();
}

function getDailyStats(date) {
  return (S.stats && S.stats[date]) || { apt: {}, dsa: {}, sem: {}, dev: {} };
}

function getTotalTimeToday() {
  const today = todayStr;
  const stats = getDailyStats(today);
  let total = 0;
  AREAS.forEach(a => {
    if (stats[a.id] && stats[a.id].time) total += stats[a.id].time;
  });
  return total;
}

function getTodaysQuestionStats(areaId) {
  if (!S.subtopics || !S.subtopics[areaId]) return { total: 0, solved: 0, easy: 0, medium: 0, hard: 0 };
  
  let total = 0, solved = 0, easy = 0, medium = 0, hard = 0;
  S.subtopics[areaId].forEach(st => {
    if (st && st.questions) {
      st.questions.forEach(q => {
        if (q) {
          total++;
          if (q.solutions && q.solutions.length > 0) solved++;
          if (q.difficulty === 'easy') easy++;
          else if (q.difficulty === 'medium') medium++;
          else if (q.difficulty === 'hard') hard++;
        }
      });
    }
  });
  
  return { total, solved, easy, medium, hard };
}

function getTotalSolvedQuestionsByArea(areaId) {
  const stats = getTodaysQuestionStats(areaId);
  return stats.solved;
}

function getAllSolvedQuestions(areaId) {
  const solved = [];
  if (!S.subtopics || !S.subtopics[areaId]) return [];
  
  S.subtopics[areaId].forEach(st => {
    if (st && st.questions) {
      st.questions.forEach(q => {
        if (q && q.solutions && q.solutions.length > 0) {
          solved.push({
            ...q,
            chapterName: st.name,
            chapterId: st.id,
            solutionCount: q.solutions.length
          });
        }
      });
    }
  });
  
  return solved.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function buildSubtopicsHTML(areaId) {
  try {
    if (!S.subtopics || !S.subtopics[areaId]) {
      return '<div class="empty-msg" style="font-size:12px;">No chapters/topics yet. Add one to get started.</div>';
    }
    
    const subtopics = S.subtopics[areaId];
    if (subtopics.length === 0) {
      return '<div class="empty-msg" style="font-size:12px;">No chapters/topics yet. Add one to get started.</div>';
    }
    
    let html = '';
    
    // Summary stats
    let totalQuestions = 0, totalWithSolutions = 0;
    subtopics.forEach(st => {
      if (st && st.questions) {
        totalQuestions += st.questions.length;
        st.questions.forEach(q => {
          if (q && q.solutions && q.solutions.length > 0) totalWithSolutions++;
        });
      }
    });
    
    if (totalQuestions > 0) {
      const solved = Math.round(totalWithSolutions / totalQuestions * 100);
      html += '<div style="background:var(--bg2); padding:0.75rem; border-radius:0.35rem; margin-bottom:1rem; border-left:3px solid var(--dsa);">';
      html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">';
      html += '<div style="font-weight:600; color:var(--text);">📊 Chapter Progress</div>';
      html += '<div style="font-size:0.85rem; color:var(--text2);">' + totalWithSolutions + '/' + totalQuestions + ' questions with solutions (' + solved + '%)</div>';
      html += '</div>';
      html += '<div style="background:var(--bg3); height:4px; border-radius:2px; overflow:hidden;">';
      html += '<div style="background:var(--dsa); height:100%; width:' + solved + '%; transition:width 0.3s;"></div>';
      html += '</div></div>';
    }
    
    subtopics.forEach(st => {
      if (!st) return;
      const questionCount = (st.questions && st.questions.length) || 0;
      
      // Count solved questions in this chapter
      let solvedInChapter = 0;
      if (st.questions) {
        st.questions.forEach(q => {
          if (q && q.solutions && q.solutions.length > 0) solvedInChapter++;
        });
      }
      
      html += '<div style="background:var(--bg3); padding:1rem; border-radius:0.35rem; margin-bottom:1rem; border:1px solid var(--border);">';
      
      // Subtopic header (clickable to expand)
      html += '<div style="display:flex; justify-content:space-between; align-items:start; cursor:pointer;" onclick="toggleSubtopic(' + st.id + ')">';
      html += '<div style="flex:1;">';
      html += '<div style="font-weight:700; color:var(--text); font-size:0.95rem;">' + (st.name || 'Unnamed') + '</div>';
      html += '<div style="font-size:0.8rem; color:var(--text3); margin-top:0.2rem;">' + questionCount + ' question' + (questionCount !== 1 ? 's' : '') + ' • ' + solvedInChapter + ' solved • ' + (st.timestamp || '') + '</div>';
      html += '</div>';
      html += '<button onclick="deleteSubtopic(\'' + areaId + '\',' + st.id + '); event.stopPropagation();" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:1rem; padding:0;">×</button>';
      html += '</div>';
      
      // Subtopic description (short tricks/notes)
      if (st.description) {
        html += '<div style="background:var(--bg2); padding:0.75rem; border-radius:0.25rem; margin-top:0.75rem; border-left:3px solid var(--apt); font-size:0.85rem; color:var(--text2); line-height:1.5; white-space:pre-wrap; word-wrap:break-word;"><strong>📌 Short Tricks:</strong><br>' + escapeHTML(st.description) + '</div>';
      }
      
      // Questions section (collapsible)
      html += '<div id="subtopic-' + st.id + '" style="display:none; margin-top:0.75rem; border-top:1px solid var(--border); padding-top:0.75rem;">';
      
      if (questionCount === 0) {
        html += '<div style="color:var(--text2); font-size:0.85rem; margin-bottom:0.75rem;">No questions yet</div>';
      } else {
        st.questions.forEach((q, qidx) => {
          if (!q) return;
          const diffColor = getDifficultyColor(q.difficulty);
          const solCount = (q.solutions && q.solutions.length) || 0;
          const isSolved = solCount > 0;
          
          html += '<div style="background:var(--bg2); padding:0.75rem; border-radius:0.25rem; margin-bottom:0.75rem; border-left:3px solid ' + diffColor + '; opacity:' + (isSolved ? '1' : '0.8') + ';">';
          html += '<div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.5rem;">';
          html += '<div style="flex:1;">';
          html += '<div style="font-weight:600; color:var(--text); font-size:0.9rem;' + (isSolved ? 'text-decoration:line-through;color:var(--text3);' : '') + '">' + (q.name || 'Unnamed') + '</div>';
          
          if (q.platform && q.link) {
            html += '<a href="' + escapeHTML(q.link) + '" target="_blank" style="font-size:0.75rem; color:var(--dsa); text-decoration:none; display:inline-block; margin-top:0.2rem;">🔗 ' + q.platform + '</a>';
          }
          
          html += '<div style="font-size:0.75rem; color:var(--text3); margin-top:0.2rem;">' + solCount + ' solution' + (solCount !== 1 ? 's' : '') + (isSolved ? ' ✓ Done' : '') + '</div>';
          html += '</div>';
          
          html += '<div style="display:flex; gap:0.5rem; align-items:center;">';
          html += '<span style="background:' + diffColor + '; color:white; padding:0.2rem 0.5rem; border-radius:0.2rem; font-size:0.7rem; font-weight:600;">' + (q.difficulty || 'easy').toUpperCase() + '</span>';
          html += '<button onclick="event.stopPropagation(); deleteQuestionFromSubtopic(\'' + areaId + '\',' + st.id + ',' + q.id + ');" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:0.9rem; padding:0;">×</button>';
          html += '</div></div>';
          
          // Question description
          if (q.description) {
            html += '<div style="background:var(--bg3); padding:0.5rem; border-radius:0.2rem; margin-bottom:0.5rem; font-size:0.8rem; color:var(--text2); white-space:pre-wrap; word-wrap:break-word;">' + escapeHTML(q.description.substring(0, 200)) + (q.description.length > 200 ? '...' : '') + '</div>';
          }
          
          // Solutions toggle
          html += '<button onclick="event.stopPropagation(); toggleQuestionSolutions(' + st.id + ',' + q.id + ');" style="width:100%; padding:0.5rem; background:var(--dsa); color:white; border:1px solid var(--border); border-radius:0.2rem; font-size:0.8rem; cursor:pointer; font-weight:600; margin-bottom:0.5rem;">📌 Solutions (' + solCount + ')</button>';
          
          // Solutions list
          html += '<div id="q-sol-' + st.id + '-' + q.id + '" style="display:none;">';
          
          if (solCount === 0) {
            html += '<div style="color:var(--text3); font-size:0.8rem; margin-bottom:0.5rem; padding:0.5rem; background:var(--bg3); border-radius:0.2rem;">No solutions yet</div>';
          } else {
            q.solutions.forEach((sol, sidx) => {
              if (!sol) return;
              html += '<div style="background:var(--bg3); padding:0.6rem; border-radius:0.2rem; margin-bottom:0.5rem; border-left:2px solid var(--dsa);">';
              html += '<div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.3rem;">';
              html += '<div><div style="font-weight:600; color:var(--text); font-size:0.8rem;">Approach ' + (sidx + 1) + ': ' + (sol.approach || 'Unnamed') + '</div>';
              if (sol.platform) html += '<div style="font-size:0.7rem; color:var(--text3); margin-top:0.1rem;">' + sol.platform + '</div>';
              html += '</div>';
              html += '<button onclick="event.stopPropagation(); deleteSolutionFromSubtopic(\'' + areaId + '\',' + st.id + ',' + q.id + ',' + sol.id + ');" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:0.8rem; padding:0;">×</button>';
              html += '</div>';
              if (sol.notes) {
                html += '<pre style="background:var(--bg2); padding:0.5rem; border-radius:0.2rem; overflow-x:auto; border:1px solid var(--border); margin:0.3rem 0; font-family:\'JetBrains Mono\',monospace; font-size:0.7rem; color:var(--text2); white-space:pre-wrap; word-wrap:break-word;"><code>' + escapeHTML(sol.notes) + '</code></pre>';
              }
              html += '</div>';
            });
          }
          
          html += '</div>';
          
          // Add solution form
          html += '<div style="background:var(--bg3); padding:0.5rem; border-radius:0.2rem; border:1px solid var(--border);">';
          html += '<input type="text" id="stq-sol-app-' + st.id + '-' + q.id + '" placeholder="Approach…" style="width:100%; padding:0.4rem; background:var(--bg2); border:1px solid var(--border); border-radius:0.15rem; color:var(--text); font-family:\'Syne\',sans-serif; font-size:0.8rem; margin-bottom:0.3rem;">';
          html += '<textarea id="stq-sol-code-' + st.id + '-' + q.id + '" placeholder="Code…" style="width:100%; padding:0.4rem; background:var(--bg2); border:1px solid var(--border); border-radius:0.15rem; color:var(--text); font-family:\'JetBrains Mono\',monospace; font-size:0.7rem; margin-bottom:0.3rem; min-height:3rem; resize:vertical;"></textarea>';
          html += '<select id="stq-sol-plat-' + st.id + '-' + q.id + '" style="width:100%; padding:0.4rem; background:var(--bg2); border:1px solid var(--border); border-radius:0.15rem; color:var(--text); font-family:\'Syne\',sans-serif; font-size:0.8rem; margin-bottom:0.3rem;"><option value="">Platform</option><option value="LeetCode">LeetCode</option><option value="GeeksForGeeks">GeeksForGeeks</option><option value="Codeforces">Codeforces</option><option value="Offline">Offline</option></select>';
          html += '<button onclick="event.stopPropagation(); addSolToSubtopic(\'' + areaId + '\',' + st.id + ',' + q.id + ');" style="width:100%; padding:0.4rem; background:var(--dsa); color:white; border:none; border-radius:0.15rem; cursor:pointer; font-weight:600; font-size:0.8rem;">✓ Add</button>';
          html += '</div>';
          
          html += '</div>';
        });
      }
      
      html += '</div>';
      
      // Add new question form
      html += '<div style="background:var(--bg2); padding:0.75rem; border-radius:0.25rem; border:1px solid var(--border); margin-top:0.75rem;">';
      html += '<div style="font-weight:600; color:var(--text); font-size:0.85rem; margin-bottom:0.5rem;">+ Add Question</div>';
      html += '<input type="text" id="stq-name-' + st.id + '" placeholder="Question name/number…" style="width:100%; padding:0.4rem; background:var(--bg3); border:1px solid var(--border); border-radius:0.2rem; color:var(--text); font-family:\'Syne\',sans-serif; font-size:0.8rem; margin-bottom:0.4rem;">';
      html += '<select id="stq-diff-' + st.id + '" style="width:100%; padding:0.4rem; background:var(--bg3); border:1px solid var(--border); border-radius:0.2rem; color:var(--text); font-family:\'Syne\',sans-serif; font-size:0.8rem; margin-bottom:0.4rem;"><option value="">Difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>';
      html += '<input type="text" id="stq-plat-' + st.id + '" placeholder="Platform (LeetCode, GFG, etc)" style="width:100%; padding:0.4rem; background:var(--bg3); border:1px solid var(--border); border-radius:0.2rem; color:var(--text); font-family:\'Syne\',sans-serif; font-size:0.8rem; margin-bottom:0.4rem;">';
      html += '<input type="url" id="stq-link-' + st.id + '" placeholder="Link to question (optional)…" style="width:100%; padding:0.4rem; background:var(--bg3); border:1px solid var(--border); border-radius:0.2rem; color:var(--text); font-family:\'Syne\',sans-serif; font-size:0.8rem; margin-bottom:0.4rem;">';
      html += '<textarea id="stq-desc-' + st.id + '" placeholder="Problem description (optional)…" style="width:100%; padding:0.4rem; background:var(--bg3); border:1px solid var(--border); border-radius:0.2rem; color:var(--text); font-family:\'Syne\',sans-serif; font-size:0.8rem; margin-bottom:0.4rem; min-height:2.5rem; resize:vertical;"></textarea>';
      html += '<button onclick="event.stopPropagation(); addQToSubtopic(\'' + areaId + '\',' + st.id + ');" style="width:100%; padding:0.4rem; background:var(--dsa); color:white; border:none; border-radius:0.2rem; cursor:pointer; font-weight:600; font-size:0.8rem;">+ Add Question</button>';
      html += '</div>';
      
      html += '</div>';
    });
    
    return html;
  } catch (e) {
    console.error('Error building subtopics HTML:', e);
    return '<div class="empty-msg" style="font-size:12px; color:red;">Error loading topics</div>';
  }
}

// Helper function to toggle subtopic visibility
function toggleSubtopic(subtopicId) {
  const el = document.getElementById('subtopic-' + subtopicId);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }
}

// Helper function to expand all subtopics in area
function expandAllSubtopics(areaId) {
  if (!S.subtopics || !S.subtopics[areaId]) return;
  S.subtopics[areaId].forEach(st => {
    if (st) {
      const el = document.getElementById('subtopic-' + st.id);
      if (el) el.style.display = 'block';
    }
  });
}

// Helper function to collapse all subtopics in area
function collapseAllSubtopics(areaId) {
  if (!S.subtopics || !S.subtopics[areaId]) return;
  S.subtopics[areaId].forEach(st => {
    if (st) {
      const el = document.getElementById('subtopic-' + st.id);
      if (el) el.style.display = 'none';
    }
  });
}

// Helper function to toggle question solutions visibility
function toggleQuestionSolutions(subtopicId, questionId) {
  const el = document.getElementById('q-sol-' + subtopicId + '-' + questionId);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }
}

// Helper function to add solution to question in subtopic
function addSolToSubtopic(areaId, subtopicId, questionId) {
  const appEl = document.getElementById(`stq-sol-app-${subtopicId}-${questionId}`);
  const codeEl = document.getElementById(`stq-sol-code-${subtopicId}-${questionId}`);
  const platEl = document.getElementById(`stq-sol-plat-${subtopicId}-${questionId}`);
  
  if (!appEl || !codeEl) {
    toast('⚠️ Form elements not found');
    return;
  }
  
  const approach = appEl.value.trim();
  const notes = codeEl.value.trim();
  const platform = platEl ? platEl.value : '';
  
  if (!approach || !notes) {
    toast('⚠️ Enter approach and code');
    return;
  }
  
  addSolutionToSubtopic(areaId, subtopicId, questionId, approach, notes, platform);
  appEl.value = '';
  codeEl.value = '';
  if (platEl) platEl.value = '';
}

// Helper function to add question to subtopic
function addQToSubtopic(areaId, subtopicId) {
  const nameEl = document.getElementById(`stq-name-${subtopicId}`);
  const diffEl = document.getElementById(`stq-diff-${subtopicId}`);
  const platEl = document.getElementById(`stq-plat-${subtopicId}`);
  const linkEl = document.getElementById(`stq-link-${subtopicId}`);
  const descEl = document.getElementById(`stq-desc-${subtopicId}`);
  
  if (!nameEl || !diffEl) {
    toast('⚠️ Form elements not found');
    return;
  }
  
  const name = nameEl.value.trim();
  const difficulty = diffEl.value;
  const platform = platEl ? platEl.value.trim() : '';
  const link = linkEl ? linkEl.value.trim() : '';
  const description = descEl ? descEl.value.trim() : '';
  
  if (!name || !difficulty) {
    toast('⚠️ Enter question name and difficulty');
    return;
  }
  
  addQuestionToSubtopic(areaId, subtopicId, name, difficulty, platform, link, description);
  nameEl.value = '';
  diffEl.value = '';
  if (platEl) platEl.value = '';
  if (linkEl) linkEl.value = '';
  if (descEl) descEl.value = '';
}

// Quick add question function (for DSA)
function addQuickQuestion() {
  const nameEl = document.getElementById('quick-q-name');
  const diffEl = document.getElementById('quick-q-diff');
  const platEl = document.getElementById('quick-q-plat');
  const linkEl = document.getElementById('quick-q-link');
  const solEl = document.getElementById('quick-q-sol');
  
  if (!nameEl || !diffEl || !solEl) {
    toast('⚠️ Form elements not found');
    return;
  }
  
  const name = nameEl.value.trim();
  const difficulty = diffEl.value.trim();
  const platform = platEl ? platEl.value.trim() : '';
  const link = linkEl ? linkEl.value.trim() : '';
  const solution = solEl.value.trim();
  
  if (!name) {
    toast('⚠️ Enter question name');
    return;
  }
  
  if (!difficulty) {
    toast('⚠️ Select difficulty level');
    return;
  }
  
  if (!solution) {
    toast('⚠️ Enter your solution/code');
    return;
  }
  
  // Create default chapter if not exists
  if (!S.subtopics['dsa']) S.subtopics['dsa'] = [];
  
  let chapterId = null;
  
  // Check if "Solved Questions" chapter exists
  let defaultChapter = S.subtopics['dsa'].find(ch => ch.name === 'Solved Questions');
  if (!defaultChapter) {
    // Create it if not exists
    defaultChapter = {
      id: Date.now(),
      name: 'Solved Questions',
      description: 'Questions solved directly from the quick add feature',
      questions: [],
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    S.subtopics['dsa'].push(defaultChapter);
  }
  
  chapterId = defaultChapter.id;
  
  // Add question with solution
  addQuestionToSubtopic('dsa', chapterId, name, difficulty, platform, link, '');
  
  // Get the newly added question and add the solution
  const chapter = S.subtopics['dsa'].find(ch => ch.id === chapterId);
  if (chapter && chapter.questions) {
    const newQuestion = chapter.questions[chapter.questions.length - 1];
    if (newQuestion) {
      newQuestion.solutions.push({
        id: Date.now(),
        approach: platform || 'Direct Solution',
        notes: solution,
        platform: platform || '',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });
    }
  }
  
  save();
  toast(`✅ Question added with solution! Stats updated.`);
  renderAreaPanel('dsa');
  
  // Clear form
  nameEl.value = '';
  diffEl.value = '';
  if (platEl) platEl.value = '';
  if (linkEl) linkEl.value = '';
  if (solEl) solEl.value = '';
}


// ── SESSION MANAGEMENT ─────────────────────────────────────
function deleteSession(sessionId) {
  S.sessions = S.sessions.filter(s => s.id !== sessionId);
  save();
  toast('Session deleted');
}

function updateSession(sessionId, minutes, problemsSolved, notes) {
  const session = S.sessions.find(s => s.id === sessionId);
  if (session) {
    const areaId = session.areaId;
    const today = todayStr;
    
    // Update stats by subtracting old values
    if (S.stats[today] && S.stats[today][areaId]) {
      S.stats[today][areaId].time -= session.minutes;
      S.stats[today][areaId].problems -= session.problemsSolved;
    }
    
    // Update session
    session.minutes = parseInt(minutes) || 0;
    session.problemsSolved = parseInt(problemsSolved) || 0;
    session.notes = notes || '';
    
    // Update stats with new values
    if (!S.stats[today]) S.stats[today] = { apt: {}, dsa: {}, sem: {}, dev: {} };
    if (!S.stats[today][areaId]) S.stats[today][areaId] = { time: 0, problems: 0 };
    S.stats[today][areaId].time += session.minutes;
    S.stats[today][areaId].problems += session.problemsSolved;
    
    save();
    toast('Session updated');
  }
}

// ── UI RENDERING ────────────────────────────────────────────
function renderSolvedQuestionsSection(areaId) {
  const solvedQuestions = getAllSolvedQuestions(areaId);
  
  if (solvedQuestions.length === 0) {
    return '';
  }
  
  let html = `<div class="notes-section" style="margin-top:1.5rem; border-top:2px solid var(--dsa); padding-top:1.5rem;">
    <div class="notes-label">🎯 All Solved Questions (${solvedQuestions.length})</div>
    <div style="display:grid; gap:0.75rem; margin-top:1rem;">`;
  
  solvedQuestions.forEach(q => {
    const diffColor = getDifficultyColor(q.difficulty);
    const linkHtml = q.link ? `<a href="${escapeHTML(q.link)}" target="_blank" style="color:var(--dsa); text-decoration:none; font-weight:600; font-size:0.85rem;">🔗 ${q.platform || 'View'}</a>` : '';
    
    html += `<div style="background:var(--bg3); padding:1rem; border-radius:0.35rem; border-left:3px solid ${diffColor}; border-top:1px solid rgba(255,255,255,0.05);">
      <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.5rem;">
        <div style="flex:1;">
          <div style="font-weight:700; color:var(--text); font-size:0.95rem; margin-bottom:0.35rem;">${q.name}</div>
          <div style="font-size:0.8rem; color:var(--text2); margin-bottom:0.35rem;">
            <span style="background:${diffColor}22; color:${diffColor}; padding:2px 6px; border-radius:3px; font-weight:600;">${q.difficulty.toUpperCase()}</span>
            ${q.chapterName ? `<span style="margin-left:0.5rem; color:var(--text3);">📂 ${q.chapterName}</span>` : ''}
          </div>
          ${linkHtml}
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="background:var(--dsa)22; color:var(--dsa); padding:0.3rem 0.6rem; border-radius:3px; font-size:0.8rem; font-weight:600;">✅ ${q.solutionCount} solution${q.solutionCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      ${q.description ? `<div style="font-size:0.85rem; color:var(--text2); margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid var(--border);">${escapeHTML(q.description.substring(0, 150))}${q.description.length > 150 ? '...' : ''}</div>` : ''}
    </div>`;
  });
  
  html += `</div></div>`;
  return html;
}

// ── UI RENDERING ────────────────────────────────────────────
function renderAreaPanel(areaId) {
  const area  = AREAS.find(a => a.id === areaId);
  if (!area) {
    console.error('Area not found:', areaId);
    return;
  }
  
  const tasks = S.tasks[areaId] || [];
  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct   = total > 0 ? Math.round(done / total * 100) : 0;
  const notes = S.notes[areaId] || [];
  const sessions = getSessionsForArea(areaId);
  const subtopicsContent = buildSubtopicsHTML(areaId);
  const qStats = getTodaysQuestionStats(areaId);

  let lcHtml = '';
  let solvedQuestionsHtml = ''; // Initialize for all areas
  let quickAddQuestionHtml = ''; // For DSA
  
  if (areaId === 'dsa') {
    const lcTotal = S.lc.easy + S.lc.medium + S.lc.hard;
    lcHtml = `<div class="lc-section"><div class="lc-title">LeetCode Problems Solved</div><div class="lc-counters"><div class="lc-group"><div class="lc-label" style="color:${LC_COLORS.easy}">Easy</div><div class="lc-row"><button class="lc-btn" onclick="lcChange('easy',-1)">−</button><div class="lc-num" style="color:${LC_COLORS.easy}" id="lc-easy">${S.lc.easy}</div><button class="lc-btn" onclick="lcChange('easy',1)">+</button></div></div><div class="lc-group"><div class="lc-label" style="color:${LC_COLORS.medium}">Medium</div><div class="lc-row"><button class="lc-btn" onclick="lcChange('medium',-1)">−</button><div class="lc-num" style="color:${LC_COLORS.medium}" id="lc-medium">${S.lc.medium}</div><button class="lc-btn" onclick="lcChange('medium',1)">+</button></div></div><div class="lc-group"><div class="lc-label" style="color:${LC_COLORS.hard}">Hard</div><div class="lc-row"><button class="lc-btn" onclick="lcChange('hard',-1)">−</button><div class="lc-num" style="color:${LC_COLORS.hard}" id="lc-hard">${S.lc.hard}</div><button class="lc-btn" onclick="lcChange('hard',1)">+</button></div></div><div class="lc-total"><div class="lc-total-num" style="color:var(--dsa)">${lcTotal}</div><div class="lc-total-label">total solved</div></div></div></div>`;
    
    // Solved DSA Questions Summary
    const solvedQuestions = getAllSolvedQuestions(areaId);
    const totalSolved = solvedQuestions.length;
    const easyCount = solvedQuestions.filter(q => q.difficulty === 'easy').length;
    const mediumCount = solvedQuestions.filter(q => q.difficulty === 'medium').length;
    const hardCount = solvedQuestions.filter(q => q.difficulty === 'hard').length;
    
    solvedQuestionsHtml = `<div style="background:linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(52,211,153,0.05) 100%); border:1px solid rgba(52,211,153,0.3); border-radius:0.5rem; padding:1.5rem; margin-bottom:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem;">
        <div>
          <div style="font-size:0.9rem; color:var(--text2); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.5rem;">✅ DSA Questions Solved</div>
          <div style="font-size:2.5rem; font-weight:800; color:var(--dsa);">${totalSolved}</div>
        </div>
        <div style="display:flex; gap:1rem;">
          <div style="text-align:center;">
            <div style="font-size:1.5rem; font-weight:700; color:#34d399;">🟢 ${easyCount}</div>
            <div style="font-size:0.75rem; color:var(--text3);">Easy</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.5rem; font-weight:700; color:#fbbf24;">🟡 ${mediumCount}</div>
            <div style="font-size:0.75rem; color:var(--text3);">Medium</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.5rem; font-weight:700; color:#f87171;">🔴 ${hardCount}</div>
            <div style="font-size:0.75rem; color:var(--text3);">Hard</div>
          </div>
        </div>
      </div>
      ${totalSolved > 0 ? `<div style="background:rgba(52,211,153,0.1); height:4px; border-radius:2px; overflow:hidden;"><div style="background:linear-gradient(90deg, #34d399 ${(easyCount/totalSolved)*100}%, #fbbf24 ${(easyCount/totalSolved)*100}%, #f87171 ${((easyCount+mediumCount)/totalSolved)*100}%); height:100%; transition:all 0.3s;"></div></div>` : ''}
    </div>`;
    
    // Quick Add Question Section
    quickAddQuestionHtml = `<div style="background:linear-gradient(135deg, rgba(96,165,250,0.12) 0%, rgba(96,165,250,0.05) 100%); border:2px solid rgba(96,165,250,0.4); border-radius:0.5rem; padding:1.5rem; margin-bottom:1.5rem;">
      <div style="font-size:1rem; font-weight:700; color:var(--text); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem;">
        <span style="font-size:1.2rem;">⚡</span> Quick Add Question (With Solution & Link)
      </div>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
        <div>
          <label style="font-size:0.85rem; color:var(--text2); display:block; margin-bottom:0.5rem; font-weight:600;">Question Name/Number</label>
          <input type="text" id="quick-q-name" placeholder="e.g., Two Sum, LeetCode #1..." style="width:100%; padding:0.75rem; background:var(--bg3); border:1px solid var(--border); border-radius:0.3rem; color:var(--text); font-family:'Syne',sans-serif; font-size:0.9rem;">
        </div>
        <div>
          <label style="font-size:0.85rem; color:var(--text2); display:block; margin-bottom:0.5rem; font-weight:600;">Difficulty</label>
          <select id="quick-q-diff" style="width:100%; padding:0.75rem; background:var(--bg3); border:1px solid var(--border); border-radius:0.3rem; color:var(--text); font-family:'Syne',sans-serif; font-size:0.9rem;">
            <option value="">Select difficulty...</option>
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟡 Medium</option>
            <option value="hard">🔴 Hard</option>
          </select>
        </div>
      </div>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
        <div>
          <label style="font-size:0.85rem; color:var(--text2); display:block; margin-bottom:0.5rem; font-weight:600;">Platform</label>
          <input type="text" id="quick-q-plat" placeholder="e.g., LeetCode, GeeksForGeeks..." style="width:100%; padding:0.75rem; background:var(--bg3); border:1px solid var(--border); border-radius:0.3rem; color:var(--text); font-family:'Syne',sans-serif; font-size:0.9rem;">
        </div>
        <div>
          <label style="font-size:0.85rem; color:var(--text2); display:block; margin-bottom:0.5rem; font-weight:600;">Problem Link</label>
          <input type="url" id="quick-q-link" placeholder="https://..." style="width:100%; padding:0.75rem; background:var(--bg3); border:1px solid var(--border); border-radius:0.3rem; color:var(--text); font-family:'Syne',sans-serif; font-size:0.9rem;">
        </div>
      </div>
      
      <div style="margin-bottom:1rem;">
        <label style="font-size:0.85rem; color:var(--text2); display:block; margin-bottom:0.5rem; font-weight:600;">Approach/Solution</label>
        <textarea id="quick-q-sol" placeholder="Paste your code solution here..." style="width:100%; padding:0.75rem; background:var(--bg3); border:1px solid var(--border); border-radius:0.3rem; color:var(--text); font-family:'JetBrains Mono',monospace; font-size:0.85rem; min-height:4rem; resize:vertical;"></textarea>
      </div>
      
      <button onclick="addQuickQuestion()" style="width:100%; padding:0.85rem; background:linear-gradient(135deg, var(--dsa) 0%, #2dd4c0 100%); color:white; border:none; border-radius:0.3rem; font-weight:700; font-size:0.95rem; cursor:pointer; font-family:'Syne',sans-serif; transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">✅ Add & Track Question</button>
    </div>`;
  }

  const taskHtml = tasks.length === 0 ? `<div class="empty-msg">No tasks yet. Add your first task above ↑</div>` : tasks.map(t => `<div class="task-item ${t.done ? 'done' : ''}"><div class="checkbox ${t.done ? 'checked' : ''}" style="${t.done ? `background:${area.hex};border-color:${area.hex}` : ''}" onclick="toggleTask('${areaId}',${t.id})"></div><span class="task-text ${t.done ? 'done' : ''}">${t.text}</span><span class="task-time">${t.ts || ''}</span><button class="task-del" onclick="deleteTask('${areaId}',${t.id})">×</button></div>`).join('');

  const notesHtml = notes.length === 0 ? `<span style="font-size:12px;color:var(--text3)">No notes yet</span>` : notes.map(n => `<div class="note-chip"><span>${n.text}</span><span class="note-x" onclick="deleteNote('${areaId}',${n.id})">×</span></div>`).join('');

  const sessionsHtml = sessions.length === 0 ? `<div class="empty-msg" style="font-size:12px;">No sessions logged yet</div>` : sessions.map(s => `
    <div style="background:var(--bg3); padding:0.75rem; border-radius:0.35rem; margin-bottom:0.5rem; border-left:3px solid var(--${areaId})">
      <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.35rem;">
        <div style="display:flex; gap:0.5rem; align-items:center; flex:1;">
          <span style="font-weight:600; color:var(--text)">${s.minutes}m</span>
          <span style="color:var(--text2); font-size:0.85rem;">•</span>
          <span style="color:var(--text2)">${s.problemsSolved} problems</span>
          <span style="color:var(--text3); font-size:0.8rem; margin-left:auto;">${s.timestamp}</span>
        </div>
        <button onclick="deleteSession(${s.id})" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:1.1rem; padding:0; margin-left:0.5rem;">×</button>
      </div>
      ${s.notes ? `<div style="color:var(--text2); font-size:0.85rem; margin-top:0.35rem; padding-top:0.35rem; border-top:1px solid var(--border);">${s.notes}</div>` : ''}
    </div>
  `).join('');
  
  // Quick stats for questions/chapters if any exist
  let qStatsHtml = '';
  if (qStats.total > 0) {
    const qPct = Math.round(qStats.solved / qStats.total * 100);
    qStatsHtml = `<div style="background:var(--bg2); padding:0.75rem; border-radius:0.35rem; margin-bottom:1rem; border-left:3px solid var(--dsa);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <div style="font-weight:600; color:var(--text);">📖 Questions</div>
        <div style="font-size:0.85rem; color:var(--text2);">${qStats.solved}/${qStats.total} done (${qPct}%)</div>
      </div>
      <div style="display:flex; gap:0.5rem; font-size:0.8rem; margin-bottom:0.5rem;">
        <div style="flex:1; padding:0.4rem; background:var(--bg3); border-radius:0.2rem; text-align:center; color:var(--text2);">🟢 ${qStats.easy}</div>
        <div style="flex:1; padding:0.4rem; background:var(--bg3); border-radius:0.2rem; text-align:center; color:var(--text2);">🟡 ${qStats.medium}</div>
        <div style="flex:1; padding:0.4rem; background:var(--bg3); border-radius:0.2rem; text-align:center; color:var(--text2);">🔴 ${qStats.hard}</div>
      </div>
      <div style="background:var(--bg3); height:4px; border-radius:2px; overflow:hidden;">
        <div style="background:var(--dsa); height:100%; width:${qPct}%; transition:width 0.3s;"></div>
      </div>
    </div>`;
  }

  // Subtopics section (for all areas)
  const subtopicsSection = `<div class="notes-section" style="margin-top:1rem;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
      <div class="notes-label">📚 Chapters / Topics</div>
      <div style="display:flex; gap:0.5rem;">
        <button onclick="expandAllSubtopics('${areaId}')" style="padding:0.3rem 0.6rem; background:var(--bg3); color:var(--text); border:1px solid var(--border); border-radius:0.2rem; font-size:0.75rem; cursor:pointer; font-family:'Syne',sans-serif;">↓ Expand All</button>
        <button onclick="collapseAllSubtopics('${areaId}')" style="padding:0.3rem 0.6rem; background:var(--bg3); color:var(--text); border:1px solid var(--border); border-radius:0.2rem; font-size:0.75rem; cursor:pointer; font-family:'Syne',sans-serif;">↑ Collapse All</button>
      </div>
    </div>
    <div style="margin-bottom:1rem;">
      <input type="text" id="st-name" placeholder="Add new chapter/topic…" style="width:100%; padding:0.5rem; background:var(--bg3); border:1px solid var(--border); border-radius:0.25rem; color:var(--text); font-family:'Syne',sans-serif; margin-bottom:0.5rem;">
      <textarea id="st-desc" placeholder="Short tricks & notes (optional)…" style="width:100%; padding:0.5rem; background:var(--bg3); border:1px solid var(--border); border-radius:0.25rem; color:var(--text); font-family:'Syne',sans-serif; font-size:0.85rem; margin-bottom:0.5rem; min-height:2rem; resize:vertical;"></textarea>
      <button onclick="addSubtopic('${areaId}', document.getElementById('st-name').value, document.getElementById('st-desc').value); document.getElementById('st-name').value=''; document.getElementById('st-desc').value='';" style="width:100%; padding:0.5rem; background:var(--dsa); color:white; border:none; border-radius:0.25rem; cursor:pointer; font-weight:600; font-family:'Syne',sans-serif;">+ Add Chapter</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:0.75rem;">
      ${subtopicsContent}
    </div>
  </div>
  
  ${areaId === 'dsa' ? renderSolvedQuestionsSection(areaId) : ''}`;

  const panelHtml = `<div class="section-card"><div class="card-header"><div class="card-title"><div class="area-icon" style="background:${area.bg};color:${area.hex}">${area.emoji}</div><div class="card-name">${area.name}</div></div><div class="progress-pill">${done}/${total} done · ${pct}%</div></div><div class="pbar-wrap"><div class="pbar" style="width:${pct}%;background:${area.hex}"></div></div>${solvedQuestionsHtml}${quickAddQuestionHtml}${lcHtml}${qStatsHtml}<div class="task-input-row"><input class="task-input" id="inp-${areaId}" placeholder="Add a task… (press Enter)" onkeydown="if(event.key==='Enter')addTask('${areaId}')"><button class="add-btn" onclick="addTask('${areaId}')">+ Add</button></div><div class="task-list">${taskHtml}</div><div class="notes-section"><div class="notes-label">Quick Notes</div><div class="note-input-row"><input class="note-input" id="note-inp-${areaId}" placeholder="Jot a note…" onkeydown="if(event.key==='Enter')addNote('${areaId}')"><button class="note-save" onclick="addNote('${areaId}')">Save</button></div><div class="notes-chips">${notesHtml}</div></div><div class="notes-section" style="margin-top:1rem;"><div class="notes-label">⏱️ Study Sessions (Today)</div><div style="display:flex; flex-direction:column; gap:0.35rem;">${sessionsHtml}</div></div>${subtopicsSection}</div>`;
  
  document.getElementById('panel-' + areaId).innerHTML = panelHtml;
}

function renderOverview() {
  // Get all data needed for dashboard
  const mission = getTodayMissionProgress();
  const consistency = calculateConsistencyScore();
  const feedback = getDynamicFeedback();
  const nextAction = getNextActionRecommendation();
  const weakAreas = detectWeakAreas();
  const weeklyReport = generateWeeklyReport();
  
  // Mission HTML
  const missionHtml = `
  <div class="overview-card" style="border-top:4px solid var(--dsa); padding:1.5rem;">
    <div style="font-size:0.95rem; font-weight:700; color:var(--text); margin-bottom:1rem;">🎯 TODAY'S MISSION</div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
      <div>
        <div style="font-size:0.8rem; color:var(--text2); margin-bottom:0.3rem;">Study Hours</div>
        <div style="font-size:1.2rem; font-weight:600; color:var(--apt);">${mission.hoursComplete}/${mission.hoursTarget} hrs</div>
        <div style="background:var(--bg3); height:6px; border-radius:3px; margin-top:0.5rem; overflow:hidden;">
          <div style="background:${mission.hoursTargetMet ? 'var(--dsa)' : 'var(--apt)'}; height:100%; width:${mission.hoursPercent}%; transition:width 0.3s;"></div>
        </div>
        <div style="font-size:0.7rem; color:var(--text3); margin-top:0.3rem;">${mission.hoursPercent}%</div>
      </div>
      <div>
        <div style="font-size:0.8rem; color:var(--text2); margin-bottom:0.3rem;">Questions</div>
        <div style="font-size:1.2rem; font-weight:600; color:${mission.questionsTargetMet ? '#34d399' : 'var(--sem)'}">${mission.questionsComplete}/${mission.questionsTarget}</div>
        <div style="background:var(--bg3); height:6px; border-radius:3px; margin-top:0.5rem; overflow:hidden;">
          <div style="background:${mission.questionsTargetMet ? 'var(--dsa)' : 'var(--sem)'}; height:100%; width:${mission.questionsPercent}%; transition:width 0.3s;"></div>
        </div>
        <div style="font-size:0.7rem; color:var(--text3); margin-top:0.3rem;">${mission.questionsPercent}%</div>
      </div>
    </div>
    <div style="background:var(--bg3); padding:0.75rem; border-radius:0.35rem;">
      <div style="font-size:0.9rem; font-weight:600; color:var(--text);">Total Progress: ${mission.totalPercent}%</div>
      <div style="background:var(--bg2); height:8px; border-radius:4px; margin-top:0.5rem; overflow:hidden;">
        <div style="background:${mission.totalPercent === 100 ? '#34d399' : 'var(--dsa)'}; height:100%; width:${Math.min(mission.totalPercent, 100)}%; transition:width 0.3s;"></div>
      </div>
    </div>
    ${!mission.hoursTargetMet || !mission.questionsTargetMet ? `<div style="background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.3); color:#f87171; padding:0.75rem; border-radius:0.35rem; margin-top:1rem; font-size:0.85rem;">⚠️ You've missed one or more targets today. Push harder! 💪</div>` : ''}
  </div>`;
  
  // Consistency Score HTML
  const consistencyHtml = `
  <div class="overview-card" style="border-top:4px solid var(--apt);">
    <div style="font-size:0.95rem; font-weight:700; color:var(--text); margin-bottom:1rem;">📊 Consistency Score</div>
    <div style="display:flex; align-items:center; justify-content:space-between;">
      <div style="flex:1;">
        <div style="font-size:2.5rem; font-weight:800; color:var(--apt);">${consistency}%</div>
        <div style="font-size:0.8rem; color:var(--text2); margin-top:0.3rem;">Based on daily targets & streak</div>
      </div>
      <div style="width:80px; height:80px; border-radius:50%; background:var(--bg3); display:flex; align-items:center; justify-content:center; position:relative;">
        <div style="font-size:2rem;">${consistency >= 70 ? '✅' : consistency >= 50 ? '👍' : '⚠️'}</div>
        <div style="position:absolute; width:80px; height:80px; border-radius:50%; border:3px solid var(--bg3); border-top-color:var(--apt); transform:rotate(${(consistency / 100) * 360}deg); transition:transform 0.5s;"></div>
      </div>
    </div>
  </div>`;
  
  // Next Action HTML
  const nextActionHtml = `
  <div class="overview-card" style="background:linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(52,211,153,0.05) 100%); border-left:4px solid var(--dsa);">
    <div style="font-size:0.95rem; font-weight:700; color:var(--text); margin-bottom:0.75rem;">👉 NEXT ACTION</div>
    <div style="background:var(--bg2); padding:1rem; border-radius:0.35rem; border-left:3px solid var(--dsa);">
      <div style="font-size:1rem; font-weight:600; color:var(--text);">${nextAction.action}</div>
      <div style="font-size:0.8rem; color:var(--text2); margin-top:0.35rem;">💡 ${nextAction.reason}</div>
    </div>
  </div>`;
  
  // Feedback Message HTML
  const feedbackHtml = `
  <div class="overview-card" style="background:${feedback.type === 'success' ? 'rgba(52,211,153,0.1)' : feedback.type === 'good' ? 'rgba(96,165,250,0.1)' : feedback.type === 'warning' ? 'rgba(248,113,113,0.1)' : 'var(--bg2)'}; border-left:4px solid ${feedback.type === 'success' ? 'var(--dsa)' : feedback.type === 'good' ? 'var(--dev)' : feedback.type === 'warning' ? 'var(--red)' : 'var(--apt)'};">
    <div style="font-size:0.95rem; font-weight:600; color:var(--text);">💬 ${feedback.message}</div>
  </div>`;
  
  // Weak Area Alert HTML
  const weakHtml = weakAreas.weakest.time < 60 ? `
  <div class="overview-card" style="background:rgba(248,113,113,0.1); border-left:4px solid var(--red);">
    <div style="font-size:0.95rem; font-weight:700; color:var(--text); margin-bottom:0.75rem;">⚠️ WEAK AREA</div>
    <div style="background:var(--bg2); padding:0.75rem; border-radius:0.35rem;">
      <div style="font-size:1rem; font-weight:600; color:var(--red);">${weakAreas.weakest.emoji} ${weakAreas.weakest.name}</div>
      <div style="font-size:0.8rem; color:var(--text2); margin-top:0.35rem;">This is your weakest area this week. Focus more on it! 🎯</div>
    </div>
  </div>` : '';
  
  // Weekly Report HTML
  const weeklyHtml = `
  <div class="overview-card">
    <div style="font-size:0.95rem; font-weight:700; color:var(--text); margin-bottom:1rem;">📋 WEEKLY REPORT</div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
      <div style="background:var(--bg3); padding:0.75rem; border-radius:0.35rem;">
        <div style="font-size:0.8rem; color:var(--text2);">Total Time</div>
        <div style="font-size:1.2rem; font-weight:600; color:var(--apt);">${weeklyReport.totalTime}h / ${weeklyReport.targetHours}h</div>
        <div style="font-size:0.7rem; color:${weeklyReport.targetMet ? 'var(--dsa)' : 'var(--red)'}; margin-top:0.2rem;">${weeklyReport.targetMet ? '✅ Target met' : '❌ Below target'}</div>
      </div>
      <div style="background:var(--bg3); padding:0.75rem; border-radius:0.35rem;">
        <div style="font-size:0.8rem; color:var(--text2);">Best Day</div>
        <div style="font-size:1.2rem; font-weight:600; color:var(--dsa);">${weeklyReport.bestDay.date}</div>
        <div style="font-size:0.7rem; color:var(--text3); margin-top:0.2rem;">${Math.round(weeklyReport.bestDay.time / 60 * 10) / 10}h studied</div>
      </div>
    </div>
    <div style="background:var(--bg2); padding:0.75rem; border-radius:0.35rem; margin-top:1rem; border-left:3px solid var(--dev);">
      <div style="font-size:0.85rem; color:var(--text);">💡 <strong>Recommendation:</strong> ${weeklyReport.recommendation}</div>
    </div>
  </div>`;
  
  // Insert into HTML
  const ovGridEl = document.getElementById('overview-grid-new');
  if (ovGridEl) {
    ovGridEl.innerHTML = missionHtml + consistencyHtml + nextActionHtml + feedbackHtml + weakHtml + weeklyHtml;
  }
  
  // Original area progress
  document.getElementById('ov-areas').innerHTML = AREAS.map(a => {
    const tasks = S.tasks[a.id];
    const done  = tasks.filter(t => t.done).length;
    const pct   = tasks.length > 0 ? Math.round(done / tasks.length * 100) : 0;
    return `<div class="ov-task-row"><div class="ov-area-dot" style="background:${a.hex}"></div><div class="ov-area-name">${a.emoji} ${a.name}</div><div class="ov-pbar-wrap"><div class="ov-pbar" style="width:${pct}%;background:${a.hex}"></div></div><div class="ov-pct">${pct}%</div></div>`;
  }).join('');

  const lc = S.lc;
  const lcTotal = lc.easy + lc.medium + lc.hard;
  document.getElementById('ov-lc').innerHTML = `<div style="display:flex;gap:16px;margin-bottom:14px;align-items:center"><div style="text-align:center"><div style="font-size:24px;font-weight:800;color:var(--dsa)">${lc.easy}</div><div style="font-size:11px;color:var(--text3)">Easy</div></div><div style="text-align:center"><div style="font-size:24px;font-weight:800;color:var(--sem)">${lc.medium}</div><div style="font-size:11px;color:var(--text3)">Medium</div></div><div style="text-align:center"><div style="font-size:24px;font-weight:800;color:var(--red)">${lc.hard}</div><div style="font-size:11px;color:var(--text3)">Hard</div></div><div style="text-align:center;margin-left:auto"><div style="font-size:28px;font-weight:800;color:var(--text)">${lcTotal}</div><div style="font-size:11px;color:var(--text3)">Total</div></div></div><div style="height:4px;background:var(--bg4);border-radius:4px;overflow:hidden">${lcTotal > 0 ? `<div style="display:flex;height:100%"><div style="flex:${lc.easy};background:var(--dsa);transition:flex 0.4s"></div><div style="flex:${lc.medium};background:var(--sem);transition:flex 0.4s"></div><div style="flex:${lc.hard};background:var(--red);transition:flex 0.4s"></div></div>` : ''}</div>`;

  const pending = [];
  AREAS.forEach(a => S.tasks[a.id].filter(t => !t.done).slice(0, 3).forEach(t => pending.push({ ...t, area: a })));
  document.getElementById('ov-pending').innerHTML = pending.length === 0 ? `<div class="empty-msg" style="color:var(--dsa)">🎉 All caught up! Great work.</div>` : pending.map(t => `<div class="task-item" style="margin-bottom:7px"><div class="area-icon" style="width:24px;height:24px;border-radius:5px;font-size:12px;background:${t.area.bg};color:${t.area.hex}">${t.area.emoji}</div><span class="task-text">${t.text}</span><span style="font-size:11px;color:${t.area.hex};font-family:'JetBrains Mono',monospace">${t.area.name}</span></div>`).join('');
}

function renderStreak() {
  document.getElementById('streak-count').textContent = calcStreak();
  const DAYS = 84, cells = [], d = new Date();
  let prevMonth = '';
  for (let i = DAYS - 1; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    const ds = dt.toISOString().slice(0, 10);
    const month = dt.toLocaleDateString('en-IN', { month: 'short' });
    cells.push({ ds, isToday: ds === todayStr, isOn: S.streak.includes(ds), dayNum: dt.getDate(), month, isFirst: prevMonth !== month });
    prevMonth = month;
  }
  let html = '<div style="display:flex;gap:5px;overflow-x:auto">', week = [];
  cells.forEach((c, i) => {
    week.push(c);
    if (week.length === 7 || i === cells.length - 1) {
      const showLabel = week.some(w => w.isFirst);
      html += `<div style="display:flex;flex-direction:column;gap:5px"><div class="month-label" style="opacity:${showLabel ? 1 : 0}">${week[0].month}</div>`;
      week.forEach(c => html += `<div class="streak-cell ${c.isOn ? 'on' : ''} ${c.isToday ? 'today' : ''}" onclick="toggleStreak('${c.ds}')" title="${c.ds}">${c.dayNum}</div>`);
      html += '</div>';
      week = [];
    }
  });
  html += '</div>';
  document.getElementById('streak-calendar').innerHTML = html;
}

function getTotalProblemsToday() {
  const today = todayStr;
  const stats = getDailyStats(today);
  let total = 0;
  AREAS.forEach(a => {
    if (stats[a.id] && stats[a.id].problems) total += stats[a.id].problems;
  });
  return total;
}

// ─ DASHBOARD: RENDER DAILY SUMMARY ──────────────────────────
function renderDailySummary() {
  const todayStats = getDailyStats(todayStr);
  const totalTime = getTotalTimeToday();
  const totalProblems = getTotalProblemsToday();
  const summaryEl = document.getElementById('daily-summary');
  
  if (!summaryEl) return; // Element not in HTML yet

  let summaryHtml = `<div style="padding:1.5rem;">
    <h3 style="margin:0 0 1rem 0; color:var(--text)">📊 Today's Summary</h3>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
      <div style="background:var(--bg2); padding:1rem; border-radius:0.5rem; border-left:4px solid var(--apt)">
        <div style="font-size:0.85rem; color:var(--text2)">Total Time</div>
        <div style="font-size:1.5rem; font-weight:600; color:var(--apt)">${totalTime} min</div>
      </div>
      <div style="background:var(--bg2); padding:1rem; border-radius:0.5rem; border-left:4px solid var(--dsa)">
        <div style="font-size:0.85rem; color:var(--text2)">Problems</div>
        <div style="font-size:1.5rem; font-weight:600; color:var(--dsa)">${totalProblems}</div>
      </div>
    </div>`;

  // Area breakdown
  summaryHtml += '<h4 style="margin:1rem 0 0.5rem 0; color:var(--text); font-size:0.95rem">By Area:</h4>';
  AREAS.forEach(a => {
    const stats = todayStats[a.id];
    const time = (stats && stats.time) || 0;
    const problems = (stats && stats.problems) || 0;
    if (time > 0) {
      summaryHtml += `<div style="display:flex; justify-content:space-between; padding:0.5rem; background:var(--bg3); margin:0.25rem 0; border-radius:0.3rem; border-left:3px solid var(--${a.id})">
        <span style="color:var(--text)">${a.emoji} ${a.name}</span>
        <span style="color:var(--${a.id}); font-weight:600">${time}m • ${problems}p</span>
      </div>`;
    }
  });

  summaryHtml += '<h4 style="margin:1.5rem 0 0.5rem 0; color:var(--text); font-size:0.95rem">⏰ Activity Timeline:</h4>';
  summaryHtml += renderDailyTimeline();
  
  summaryHtml += '</div>';
  summaryEl.innerHTML = summaryHtml;
}

function updateStats() {
  let done = 0, total = 0;
  AREAS.forEach(a => S.tasks[a.id].forEach(t => { total++; if (t.done) done++; }));
  const lc = S.lc.easy + S.lc.medium + S.lc.hard;
  document.getElementById('s-done').textContent  = done;
  document.getElementById('s-lc').textContent    = lc;
  document.getElementById('s-total').textContent = total;
  document.getElementById('s-pct').textContent   = total > 0 ? Math.round(done / total * 100) + '%' : '0%';
  document.getElementById('streak-count').textContent = calcStreak();
}

// ═══════════════════════════════════════════════════════════
// FEATURE 2: POMODORO TIMER
// ═══════════════════════════════════════════════════════════

let timerState = {
  isRunning: false,
  currentPhase: 'work', // 'work' or 'break'
  remainingSeconds: 25 * 60,
  completedCycles: 0,
  timerInterval: null,
  selectedArea: 'dsa'
};

function startTimer(areaId = null) {
  if (areaId) timerState.selectedArea = areaId;
  
  if (timerState.isRunning) {
    pauseTimer();
    return;
  }
  
  timerState.isRunning = true;
  const workMins = S.timerSettings.workMinutes || 25;
  if (timerState.remainingSeconds === 0) {
    timerState.remainingSeconds = workMins * 60;
  }

  timerState.timerInterval = setInterval(() => {
    timerState.remainingSeconds--;
    updateTimerDisplay();
    
    if (timerState.remainingSeconds === 0) {
      onTimerComplete();
    }
  }, 1000);
  
  updateTimerDisplay();
  toast(`⏱️ Timer started (${timerState.currentPhase === 'work' ? 'Work' : 'Break'} phase)`);
}

function pauseTimer() {
  timerState.isRunning = false;
  if (timerState.timerInterval) {
    clearInterval(timerState.timerInterval);
    timerState.timerInterval = null;
  }
  updateTimerDisplay();
  toast('⏸️ Timer paused');
}

function resetTimer() {
  pauseTimer();
  timerState.currentPhase = 'work';
  timerState.remainingSeconds = (S.timerSettings.workMinutes || 25) * 60;
  timerState.completedCycles = 0;
  updateTimerDisplay();
  toast('🔄 Timer reset');
}

function onTimerComplete() {
  pauseTimer();
  
  if (timerState.currentPhase === 'work') {
    timerState.completedCycles++;
    timerState.currentPhase = 'break';
    timerState.remainingSeconds = (S.timerSettings.breakMinutes || 5) * 60;
    toast(`🎉 Work session done! Break time (${timerState.completedCycles} cycles)`);
    playNotification();
  } else {
    timerState.currentPhase = 'work';
    timerState.remainingSeconds = (S.timerSettings.workMinutes || 25) * 60;
    toast('Break done! Ready for another session?');
    playNotification();
  }
  
  updateTimerDisplay();
}

function getTimerDisplay() {
  const mins = Math.floor(timerState.remainingSeconds / 60);
  const secs = timerState.remainingSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimerDisplay() {
  const display = document.getElementById('timer-display');
  if (display) {
    display.textContent = getTimerDisplay();
    display.style.color = timerState.isRunning ? 'var(--dsa)' : 'var(--text2)';
  }
  
  const btn = document.getElementById('timer-start-btn');
  if (btn) {
    btn.textContent = timerState.isRunning ? '⏸️ Pause' : '▶️ Start';
  }
  
  const phase = document.getElementById('timer-phase');
  if (phase) {
    phase.textContent = timerState.currentPhase === 'work' ? '💪 Work' : '☕ Break';
  }
  
  const cycles = document.getElementById('timer-cycles');
  if (cycles) {
    cycles.textContent = timerState.completedCycles;
  }
}

function saveTimerSession() {
  if (timerState.completedCycles === 0) {
    toast('⚠️ Complete at least one cycle to save');
    return;
  }
  
  const workMins = (S.timerSettings.workMinutes || 25) * timerState.completedCycles;
  const breakMins = (S.timerSettings.breakMinutes || 5) * (timerState.completedCycles - 1);
  const totalMins = workMins + breakMins;
  
  S.timerSessions.push({
    id: Date.now(),
    date: todayStr,
    areaId: timerState.selectedArea,
    workMinutes: workMins,
    breakTotalMinutes: breakMins,
    completedCycles: timerState.completedCycles,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  });
  
  // Add to session tracking
  addSession(timerState.selectedArea, totalMins, 0, `Pomodoro: ${timerState.completedCycles} cycles`);
  
  resetTimer();
  toast(`✅ Timer session saved (${totalMins}m, ${timerState.completedCycles} cycles)`);
}

function playNotification() {
  if (!S.settings.notificationsEnabled) return;
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Notification sound unavailable');
  }
}

// ═══════════════════════════════════════════════════════════
// FEATURE 7: DAILY TIMELINE
// ═══════════════════════════════════════════════════════════

function addToTimeline(areaId, type, description, durationMins) {
  const today = todayStr;
  if (!S.timeline[today]) S.timeline[today] = [];
  
  S.timeline[today].push({
    id: Date.now(),
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    areaId: areaId,
    type: type, // 'session', 'task_completed', 'note_added', 'question_added'
    description: description,
    duration: durationMins || 0,
    timestamp: Date.now()
  });
  
  save();
}

function getTimelineForDate(dateStr) {
  return (S.timeline[dateStr] || []).sort((a, b) => b.timestamp - a.timestamp);
}

function renderDailyTimeline() {
  const today = todayStr;
  const timeline = getTimelineForDate(today);
  
  if (timeline.length === 0) {
    return '<div class="empty-msg">No activity logged yet today</div>';
  }
  
  let html = '<div style="display:flex; flex-direction:column; gap:0.75rem;">';
  
  timeline.forEach(entry => {
    const area = AREAS.find(a => a.id === entry.areaId);
    const typeEmoji = { 'session': '⏱️', 'task_completed': '✓', 'note_added': '📝', 'question_added': '❓' }[entry.type] || '•';
    
    html += `<div style="background:var(--bg3); padding:0.75rem; border-radius:0.35rem; border-left:3px solid var(--${entry.areaId})">
      <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.35rem;">
        <div style="flex:1;">
          <div style="font-weight:600; color:var(--text); font-size:0.9rem;">${typeEmoji} ${entry.description}</div>
          <div style="font-size:0.75rem; color:var(--text3); margin-top:0.2rem;">${area.emoji} ${area.name} • ${entry.time}</div>
        </div>
        ${entry.duration > 0 ? `<span style="background:var(--bg2); padding:0.3rem 0.6rem; border-radius:0.2rem; font-size:0.8rem; color:var(--text2);">${entry.duration}m</span>` : ''}
      </div>
    </div>`;
  });
  
  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════════════════════
// FEATURE 8: ANALYTICS & PROGRESS
// ═══════════════════════════════════════════════════════════

function getAnalyticsForDate(dateStr) {
  return S.analytics[dateStr] || {};
}

function updateDailyAnalytics() {
  const today = todayStr;
  const todayStats = getDailyStats(today);
  const sessionList = (S.sessions || []).filter(s => s.date === today);
  
  if (!S.analytics[today]) S.analytics[today] = {};
  
  S.analytics[today] = {
    totalTime: getTotalTimeToday(),
    sessionsCompleted: sessionList.length,
    avgSessionTime: sessionList.length > 0 ? Math.round(getTotalTimeToday() / sessionList.length) : 0,
    questionsAdded: (S.subtopics && Object.values(S.subtopics).flat().map(st => (st.questions || []).length).reduce((a,b) => a+b, 0)) || 0,
    notesSaved: Object.values(S.notes).flat().length
  };
}

function getWeeklyAnalytics() {
  const stats = {};
  const d = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().slice(0, 10);
    
    const dailyStats = getDailyStats(dateStr);
    let totalTime = 0;
    AREAS.forEach(a => {
      if (dailyStats[a.id]) totalTime += dailyStats[a.id].time || 0;
    });
    
    stats[dateStr] = totalTime;
  }
  
  return stats;
}

function renderAnalyticsDashboard() {
  updateDailyAnalytics();
  const weeklyData = getWeeklyAnalytics();
  const today = todayStr;
  const todayAnalytics = S.analytics[today] || {};
  
  let html = `<div style="background:var(--bg2); border-radius:0.5rem; padding:1.5rem;">
    <h3 style="margin:0 0 1.5rem 0; color:var(--text); font-size:1.1rem;">📊 Your Analytics</h3>
    
    <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; margin-bottom:2rem;">
      <div style="background:var(--bg3); padding:1rem; border-radius:0.35rem; border-left:3px solid var(--apt)">
        <div style="font-size:0.85rem; color:var(--text2); margin-bottom:0.35rem;">Total Study Time</div>
        <div style="font-size:1.8rem; font-weight:700; color:var(--apt)">${todayAnalytics.totalTime || 0} <span style="font-size:0.9rem">min</span></div>
      </div>
      
      <div style="background:var(--bg3); padding:1rem; border-radius:0.35rem; border-left:3px solid var(--dsa)">
        <div style="font-size:0.85rem; color:var(--text2); margin-bottom:0.35rem;">Study Sessions</div>
        <div style="font-size:1.8rem; font-weight:700; color:var(--dsa)">${todayAnalytics.sessionsCompleted || 0}</div>
      </div>
      
      <div style="background:var(--bg3); padding:1rem; border-radius:0.35rem; border-left:3px solid var(--sem)">
        <div style="font-size:0.85rem; color:var(--text2); margin-bottom:0.35rem;">Avg Session Time</div>
        <div style="font-size:1.8rem; font-weight:700; color:var(--sem)">${todayAnalytics.avgSessionTime || 0} <span style="font-size:0.9rem">min</span></div>
      </div>
      
      <div style="background:var(--bg3); padding:1rem; border-radius:0.35rem; border-left:3px solid var(--dev)">
        <div style="font-size:0.85rem; color:var(--text2); margin-bottom:0.35rem;">Notes Saved</div>
        <div style="font-size:1.8rem; font-weight:700; color:var(--dev)">${todayAnalytics.notesSaved || 0}</div>
      </div>
    </div>
    
    <div style="margin-top:1.5rem;">
      <div style="font-weight:600; color:var(--text); margin-bottom:1rem; font-size:0.95rem;">📈 Last 7 Days Activity</div>
      <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:0.5rem;">`;
  
  const maxTime = Math.max(...Object.values(weeklyData), 1);
  Object.entries(weeklyData).forEach(([dateStr, time]) => {
    const date = new Date(dateStr + 'T00:00:00');
    const label = date.toLocaleDateString('en-IN', { weekday: 'short' });
    const barHeight = (time / maxTime * 100) || 5;
    
    html += `<div style="display:flex; flex-direction:column; align-items:center; gap:0.35rem;">
      <div style="width:100%; background:var(--bg3); border-radius:0.2rem; height:60px; display:flex; align-items:flex-end; justify-content:center; position:relative;">
        <div style="width:90%; background:var(--dsa); border-radius:0.15rem; height:${barHeight}%; transition:height 0.3s; min-height:2px;"></div>
        <div style="position:absolute; top:-18px; font-size:0.7rem; color:var(--text2);">${time}m</div>
      </div>
      <div style="font-size:0.7rem; color:var(--text3);">${label}</div>
    </div>`;
  });
  
  html += `</div></div></div>`;
  return html;
}

// ═══════════════════════════════════════════════════════════
// FEATURE 9: SEARCH & FILTER
// ═══════════════════════════════════════════════════════════

function searchGlobal(query) {
  if (!query.trim()) return [];
  
  const results = [];
  const q = query.toLowerCase();
  
  // Search in questions
  if (S.subtopics) {
    Object.entries(S.subtopics).forEach(([areaId, subtopics]) => {
      subtopics.forEach(st => {
        if (st && st.questions) {
          st.questions.forEach(question => {
            if (question && question.name && question.name.toLowerCase().includes(q)) {
              results.push({
                type: 'question',
                title: question.name,
                area: areaId,
                chapter: st.name,
                difficulty: question.difficulty,
                id: question.id
              });
            }
          });
        }
      });
    });
  }
  
  // Search in topics
  if (S.subtopics) {
    Object.entries(S.subtopics).forEach(([areaId, subtopics]) => {
      subtopics.forEach(st => {
        if (st && st.name && st.name.toLowerCase().includes(q)) {
          results.push({
            type: 'topic',
            title: st.name,
            area: areaId,
            id: st.id
          });
        }
      });
    });
  }
  
  // Search in notes
  Object.entries(S.notes).forEach(([areaId, notes]) => {
    notes.forEach(note => {
      if (note && note.text && note.text.toLowerCase().includes(q)) {
        results.push({
          type: 'note',
          title: note.text.substring(0, 50) + (note.text.length > 50 ? '...' : ''),
          area: areaId,
          id: note.id
        });
      }
    });
  });
  
  // Add to search history
  S.searchHistory.push({
    query: query,
    timestamp: Date.now(),
    resultCount: results.length
  });
  
  if (!S.recentSearches) S.recentSearches = [];
  if (!S.recentSearches.includes(query)) {
    S.recentSearches.unshift(query);
    if (S.recentSearches.length > 10) S.recentSearches.pop();
  }
  
  save();
  return results;
}

function renderSearchResults(results) {
  if (results.length === 0) {
    return '<div class="empty-msg">No results found</div>';
  }
  
  let html = `<div style="display:grid; gap:0.75rem;">`;
  
  results.forEach(result => {
    const area = AREAS.find(a => a.id === result.area);
    let resultHtml = `<div style="background:var(--bg3); padding:1rem; border-radius:0.35rem; border-left:3px solid var(--${result.area})">
      <div style="display:flex; justify-content:space-between; align-items:start;">
        <div style="flex:1;">
          <div style="font-weight:600; color:var(--text);">${result.title}</div>
          <div style="font-size:0.85rem; color:var(--text2); margin-top:0.35rem;">`;
    
    if (result.type === 'question') {
      resultHtml += `Question in <strong>${result.chapter}</strong> • ${area.emoji} ${area.name} • <span style="color:#34d399; font-weight:600;">${result.difficulty.toUpperCase()}</span>`;
    } else if (result.type === 'topic') {
      resultHtml += `Topic • ${area.emoji} ${area.name}`;
    } else if (result.type === 'note') {
      resultHtml += `Note • ${area.emoji} ${area.name}`;
    }
    
    resultHtml += `</div></div></div></div>`;
    html += resultHtml;
  });
  
  html += `</div>`;
  return html;
}

// ═══════════════════════════════════════════════════════════
// FEATURE 10: DATA BACKUP & EXPORT/IMPORT
// ═══════════════════════════════════════════════════════════

function exportDataAsJSON() {
  const dataStr = JSON.stringify(S, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `studyos-backup-${todayStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('✅ Data exported successfully');
}

function importDataFromJSON(jsonString) {
  try {
    const imported = JSON.parse(jsonString);
    
    if (confirm('⚠️ This will replace all existing data. Continue?')) {
      S = { ...defaultState(), ...imported };
      save();
      toast('✅ Data imported successfully');
      location.reload();
      return true;
    }
    return false;
  } catch (e) {
    toast('❌ Invalid JSON file');
    return false;
  }
}

function clearAllDataWithConfirm() {
  if (confirm('⚠️ This will DELETE ALL your data permanently. Are you sure?')) {
    if (confirm('🚨 This action cannot be undone. Really delete everything?')) {
      S = defaultState();
      localStorage.removeItem(STORAGE_KEY);
      save();
      toast('🗑️ All data cleared');
      location.reload();
      return true;
    }
  }
  return false;
}

// ═════════════════════════════════════════════════════════════════════════════
// UI HANDLERS FOR NEW FEATURES
// ═════════════════════════════════════════════════════════════════════════════

function performSearch() {
  const query = document.getElementById('search-input').value;
  if (!query.trim()) {
    toast('⚠️ Enter a search query');
    return;
  }
  
  const results = searchGlobal(query);
  const resultsEl = document.getElementById('search-results');
  resultsEl.innerHTML = renderSearchResults(results);
  
  updateRecentSearchesUI();
}

function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    if (importDataFromJSON(content)) {
      updateAll();
    }
  };
  reader.readAsText(file);
}

function updateRecentSearchesUI() {
  const recentList = document.getElementById('recent-list');
  if (!recentList) return;
  
  if (!S.recentSearches || S.recentSearches.length === 0) {
    recentList.innerHTML = '<span style="color:var(--text3);">No recent searches</span>';
    return;
  }
  
  recentList.innerHTML = S.recentSearches.map(query => 
    `<button onclick="document.getElementById('search-input').value='${escapeHTML(query)}'; performSearch();" style="padding:0.5rem 0.75rem; background:var(--bg3); color:var(--text); border:1px solid var(--border); border-radius:0.25rem; cursor:pointer; font-size:0.85rem; font-family:'Syne',sans-serif;">` +
    query + `</button>`
  ).join('');
}

function updateTimerArea() {
  const areaSelect = document.getElementById('timer-area');
  if (areaSelect) {
    timerState.selectedArea = areaSelect.value;
  }
}

function updateSettingsFromUI() {
  const workMinsEl = document.getElementById('settings-work-mins');
  const breakMinsEl = document.getElementById('settings-break-mins');
  const notificationsEl = document.getElementById('settings-notifications');
  
  if (workMinsEl) S.timerSettings.workMinutes = parseInt(workMinsEl.value) || 25;
  if (breakMinsEl) S.timerSettings.breakMinutes = parseInt(breakMinsEl.value) || 5;
  if (notificationsEl) S.settings.notificationsEnabled = notificationsEl.checked;
  
  save();
  toast('✅ Settings saved');
}

function saveMissionSettings() {
  const hoursEl = document.getElementById('mission-hours');
  const questionsEl = document.getElementById('mission-questions');
  
  if (hoursEl) S.missions.dailyStudyHours = parseFloat(hoursEl.value) || 5;
  if (questionsEl) S.missions.dailyQuestionsTarget = parseInt(questionsEl.value) || 10;
  
  save();
  toast('✅ Mission targets saved!');
  renderOverview();
}

// ── THEME SYSTEM ────────────────────────────────────────────
function setTheme(themeName) {
  const validThemes = ['dark', 'light', 'midnight', 'ocean', 'forest', 'sunset'];
  if (!validThemes.includes(themeName)) themeName = 'dark';
  
  S.settings.theme = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  
  // Update active theme card in UI
  document.querySelectorAll('.theme-card').forEach(card => card.classList.remove('active'));
  const activeCard = document.querySelector(`.theme-card[onclick="setTheme('${themeName}')"]`);
  if (activeCard) activeCard.classList.add('active');
  
  save();
  toast(`🎨 Theme changed to ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`);
}

function initializeTheme() {
  const theme = S.settings.theme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  
  // Mark active theme card
  document.querySelectorAll('.theme-card').forEach(card => card.classList.remove('active'));
  const activeCard = document.querySelector(`.theme-card[onclick="setTheme('${theme}')"]`);
  if (activeCard) activeCard.classList.add('active');
}

// ── UI INITIALIZATION ────────────────────────────────────────
function initializeUI() {
  // Initialize analytics panel
  const analyticsContent = document.getElementById('analytics-content');
  if (analyticsContent) {
    analyticsContent.innerHTML = renderAnalyticsDashboard();
  }
  
  // Initialize timer display
  updateTimerDisplay();
  
  // Initialize settings UI
  const workMinsInput = document.getElementById('settings-work-mins');
  const breakMinsInput = document.getElementById('settings-break-mins');
  const notificationsInput = document.getElementById('settings-notifications');
  const missionHoursInput = document.getElementById('mission-hours');
  const missionQuestionsInput = document.getElementById('mission-questions');
  const timerWorkInput = document.getElementById('timer-work-mins');
  const timerBreakInput = document.getElementById('timer-break-mins');
  const timerAreaSelect = document.getElementById('timer-area');
  
  if (workMinsInput) workMinsInput.value = S.timerSettings.workMinutes || 25;
  if (breakMinsInput) breakMinsInput.value = S.timerSettings.breakMinutes || 5;
  if (notificationsInput) notificationsInput.checked = S.settings.notificationsEnabled !== false;
  if (missionHoursInput) missionHoursInput.value = S.missions.dailyStudyHours || 5;
  if (missionQuestionsInput) missionQuestionsInput.value = S.missions.dailyQuestionsTarget || 10;
  if (timerWorkInput) timerWorkInput.value = S.timerSettings.workMinutes || 25;
  if (timerBreakInput) timerBreakInput.value = S.timerSettings.breakMinutes || 5;
  if (timerAreaSelect) timerAreaSelect.value = timerState.selectedArea || 'dsa';
  
  // Initialize recent searches
  updateRecentSearchesUI();
  
  // Add event listeners
  if (workMinsInput) workMinsInput.addEventListener('change', updateSettingsFromUI);
  if (breakMinsInput) breakMinsInput.addEventListener('change', updateSettingsFromUI);
  if (notificationsInput) notificationsInput.addEventListener('change', updateSettingsFromUI);
  if (timerAreaSelect) timerAreaSelect.addEventListener('change', updateTimerArea);
}

// ═════════════════════════════════════════════════════════════════════════════

function updateAll() {
  updateStats();
  AREAS.forEach(a => renderAreaPanel(a.id));
  renderOverview();
  renderStreak();
  renderDailySummary();
}

// ── APPLICATION BOOTSTRAP ──────────────────────────────────
initializeTheme();
updateAll();
initializeUI();
