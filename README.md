# StudyOS — AI-Powered Study Coach & Productivity System

**Transform from a tracker into a personal study coach.** A powerful, dark-themed study & productivity system that motivates you daily, identifies weak areas, and guides your learning journey.

---

## 🚀 What's NEW? (Behavior-Driven Features)

### **🎯 Daily Mission System**
Set personal goals and track real-time progress:
- Define daily study hours target (customizable)
- Set daily question-solving target
- Real-time progress bars on dashboard
- Auto-calculated completion percentage
- Warning alerts if targets missed

### **📊 Consistency Score**
Smart scoring (0-100%) based on:
- Days studied in the week
- Target completion rate
- Active streak preservation

### **👉 Next Action Recommendations**
AI-like guidance telling you what to do next:
- Detects your weakest subject area
- Suggests action to strengthen it
- Reason for the recommendation

### **⚠️ Weak Area Detection**
Automatic identification of:
- Least studied subject this week
- Least solved questions by difficulty
- Alert on dashboard to focus on weak areas

### **📈 Dynamic Feedback Messages**
Context-aware motivational messages:
- "You studied 20% more than yesterday! 🎉"
- "You're studying less than usual today. Let's increase it! ⚠️"
- "Same as yesterday. Push harder today! 💪"
- Personalized based on performance trends

### **📋 Weekly Performance Report**
Auto-generated summary showing:
- Total study hours vs target
- Best day + worst day
- Strongest vs weakest topics
- Smart recommendation for next week

### **🔖 Mark for Revision System**
- Mark difficult questions for later review
- Find all marked questions instantly
- Dedicated review mode

---

## ✨ Complete Feature List (15 Systems)

### **1. Daily Study Tracking** 📊
- Log study sessions with time duration
- Track problems solved by area
- Daily statistics per subject area
- Auto-calculated progress metrics

### **2. Pomodoro Timer** 🍅
- 25/5 customizable work/break cycles
- Audio notifications for phase changes
- Track completed cycles
- Save sessions to data

### **3. Topic & Chapter Management** 📚
- Create hierarchical chapters/topics per area
- Add topic trick notes and descriptions
- Expandable/collapsible chapters
- Full-text organization system

### **4. Question & Solution Tracking** ⚡
- Track DSA questions with difficulty levels
- Store multiple solutions per question
- Link to original problem
- Platform tracking (LeetCode, GeeksForGeeks, etc.)
- **Quick-add form** for rapid entry

### **5. Progress Calculation** 📈
- Real-time progress bars
- Questions solved breakdown (Easy/Medium/Hard)
- Daily and cumulative stats
- Auto-calculated completion percentages

### **6. Daily Activity Timeline** ⏱️
- Chronological log of all activities
- Session durations and timestamps
- Type categorization
- Today's summary view

### **7. Analytics Dashboard** 📉
- 7-day activity chart
- Total study time metrics
- Sessions completed today
- Average session duration
- Notes saved count

### **8. Global Search** 🔍
- Search across all questions, topics, notes
- Recent searches history
- Filtered results by type
- Quick access to past searches

### **9. Data Backup & Export** 💾
- **Export data as JSON** — Download complete backup
- **Import data from JSON** — Restore from backup
- **Clear all data** — With confirmation
- localStorage persistence

### **10. LeetCode Problem Counter** 🎯
- Separate tracking for Easy/Medium/Hard
- Quick increment/decrement
- Difficulty breakdown
- Integrated with DSA section

### **11. Daily Mission System** 🎯 [NEW]
- Set daily study hours target
- Set daily questions target
- Real-time progress tracking
- Warning alerts for missed targets
- Highlighted on main dashboard

### **12. Consistency Score** 📊 [NEW]
- 0-100% score based on performance
- Tracks streak + target completion
- Visual indicator with emoji feedback
- Encourages daily consistency

### **13. Performance Analytics** 📈 [NEW]
- Weekly performance report auto-generated
- Best/worst day identification
- Strong vs weak area detection
- Smart recommendations
- Dynamic feedback messages

### **14. Mark for Revision Mode** 🔖 [NEW]
- Mark difficult questions
- Review mode for marked questions
- Weak question tracking
- Batch viewing and management

### **15. Theme System** 🎨 [NEW]
- 6 beautiful themes (Dark, Light, Midnight, Ocean, Forest, Sunset)
- One-click theme switching in Settings
- Instant UI updates with smooth transitions
- Theme preference persists across sessions
- Carefully designed color palettes for different study moods

---

## 📁 Project Structure

```
study-tracker/
├── index.html                 # Main application (11 navigation tabs)
├── README.md                  # Documentation
├── css/
│   └── style.css             # All styling (~1100 lines, 6 themes)
└── js/
    └── app.js                # Complete application (~2200 lines)
              # All features integrated in single file
              # Constants, state, UI rendering, all logic
```

---

## 🏗️ Application Architecture

**Single-file architecture** with clear functional organization:

```javascript
app.js structure:
├── CONSTANTS & SETUP (Areas, colors, storage key)
├── STATE MANAGEMENT (loadState, save, defaultState)
├── INITIALIZATION (date display, bootstrap)
├── TAB NAVIGATION (switchTab, currentTab)
├── TASK MANAGEMENT (addTask, toggleTask, deleteTask)
├── NOTES & SESSIONS (addNote, addSession, logSession)
├── LEETCODE COUNTER (lcChange, LC stats)
├── SUBTOPICS & QUESTIONS (addSubtopic, addQuestion, solutions)
├── DSA QUICK-ADD (addQuickQuestion, auto-chapter creation)
├── POMODORO TIMER (startTimer, pauseTimer, notifications)
├── DAILY TIMELINE (addToTimeline, renderTimeline)
├── ANALYTICS (updateAnalytics, getWeeklyAnalytics, chart)
├── SEARCH & FILTER (searchGlobal, recent searches)
├── BACKUP & SETTINGS (exportJSON, importJSON, settings)
├── UI RENDERING (renderAreaPanel, renderOverview, etc.)
└── UTILITY HELPERS (toast, escapeHTML, calcStreak, etc.)
```

**State Structure (localStorage key: `studyos_v1`):**
```javascript
{
  tasks: { apt: [], dsa: [], sem: [], dev: [] },
  notes: { apt: [], dsa: [], sem: [], dev: [] },
  lc: { easy: 0, medium: 0, hard: 0 },
  subtopics: { apt: [], dsa: [], sem: [], dev: [] },
  sessions: [],
  stats: { "2024-01-15": { dsa: { time, problems }, ... } },
  streak: ["2024-01-15", "2024-01-16", ...],
  timerSessions: [],
  timerSettings: { workMinutes: 25, breakMinutes: 5 },
  timeline: { "2024-01-15": [{time, areaId, type, description}] },
  analytics: { "2024-01-15": { totalTime, sessionsCompleted, ... } },
  searchHistory: [],
  recentSearches: [],
  settings: { notificationsEnabled: true, theme: 'dark' }
}
```

---

## 🚀 Getting Started

### **Run Locally**
1. Open `index.html` in any modern browser
2. App loads instantly — no server needed
3. All data saves to browser localStorage automatically

### **Deploy to Web**
- Upload folder to Netlify, Vercel, or GitHub Pages
- Or use `python -m http.server 8000` then visit `localhost:8000`

---

## 📱 Navigation (11 Tabs)

| Tab | Purpose |
|-----|---------|
| **Overview** | Dashboard with all progress bars & pending tasks |
| **Aptitude** | Aptitude prep tasks, notes, chapters |
| **DSA** | DSA problems, quick-add form, LeetCode counter |
| **Semester** | Semester course tracking |
| **Dev** | Development project tracking |
| **Timer** | Pomodoro timer with customization |
| **Daily Log** | Today's sessions + activity timeline |
| **Analytics** | 7-day study chart + metrics |
| **Search** | Global search across all content |
| **Settings** | Timer config, data export/import |
| **Streak** | 84-day activity calendar |

---

## 💡 Usage Guide

### **Adding Tasks**
1. Go to any area tab (Aptitude, DSA, etc.)
2. Type task name → Press Enter or click "+ Add"
3. Task auto-timestamps

### **Quick Add DSA Question**
1. Go to DSA tab
2. Scroll to "Quick Add Question" form
3. Enter: Name, Difficulty, Platform, Link, Solution code
4. Click "✅ Add & Track Question"
5. Auto-creates "Solved Questions" chapter + updates stats

### **Logging Study Sessions**
1. Go to Daily Log tab
2. Select area, duration, problems solved, notes
3. Click "✓ Log Session"
4. Updates daily stats automatically

### **Using Pomodoro Timer**
1. Go to Timer tab
2. Customize work/break minutes
3. Select study area
4. Click "▶️ Start"
5. Audio notifies when phases complete

### **Tracking Progress**
- **Overview**: See all 4 areas' progress at a glance
- **Area Panels**: Individual progress bars per area
- **Analytics**: 7-day bar chart showing daily time spent
- **Streak**: Calendar showing active study days

### **Backing Up Data**
1. Settings tab → "📥 Export Data (JSON)"
2. File downloads as `studyos_backup_[date].json`
3. To restore: Settings → "📤 Import Data (JSON)"

### **Setting Up Daily Missions** 🎯 [NEW]
1. Go to Settings tab
2. Scroll to "Daily Mission Targets" section
3. Set your daily study hours (e.g., 5 hours)
4. Set your daily questions target (e.g., 10 problems)
5. Click "💾 Save Targets"
6. Dashboard now shows real-time progress toward your goals

### **Understanding Your Dashboard** 📊 [NEW]
The Overview tab now shows (top to bottom):

1. **Today's Mission** - Your daily progress with two bars:
   - Study hours progress → Study Hours
   - Questions solved progress → Questions
   - Total completion % indicator
   - ⚠️ Warning if targets missed by end of day

2. **Consistency Score** - Your weekly performance (0-100%):
   - ✅ 70%+ = Excellent
   - 👍 50-70% = Good
   - ⚠️ <50% = Needs improvement

3. **Next Action** - What you should do next:
   - Targets your weakest area
   - Suggests specific action
   - Motivational reason

4. **Feedback Message** - Personalized encouragement:
   - "You studied 20% more than yesterday! 🎉"
   - "Slightly more than yesterday. Keep it up! 👍"
   - "You're studying less than usual today. Let's increase it! ⚠️"

5. **Weak Area Alert** - If your weakest subject has <1hr this week:
   - Shows which area to focus on
   - Encourages concentrated effort

6. **Weekly Report** - Auto-generated summary:
   - Total hours vs target
   - Best and worst day
   - Strong vs weak topics
   - Personalized recommendation

---

## 🎯 Key Features in Detail

### **Question Tracking with Solutions**
- Store unlimited questions per chapter
- Multiple approaches/solutions per question
- Platform links (LeetCode, GFG, etc.)
- Difficulty breakdown (Easy/Medium/Hard)
- Auto-calculate solved percentage

### **DSA Quick-Add Form**
```
Perfect for rapid entry while solving problems:
1. Question name (e.g., "Two Sum")
2. Difficulty level
3. Platform & link
4. Your solution code
→ Auto-creates "Solved Questions" chapter if needed
→ Stats update instantly
→ Form clears for next entry
```

### **LeetCode Counter**
- Separate tracking for Easy/Medium/Hard
- Quick +/- buttons
- Visible in DSA tab + Overview
- Syncs with questions solved

### **Analytics Dashboard**
```
Shows today + last 7 days:
✅ Total study time (minutes)
✅ Sessions completed
✅ Average session length
✅ Questions added
✅ Notes saved
📊 7-day bar chart (visual progress)
```

### **Global Search**
- Search across questions, topics, notes
- Recent searches history
- Type-filtered results
- Quick re-run previous searches

### **Data Persistence**
- Auto-saves to browser localStorage
- Zero cloud dependency
- Works offline
- Export/import for backup

---

## 🛠️ Technical Details

**File Sizes:**
- `app.js`: ~1800 lines (all logic)
- `style.css`: ~800 lines (dark theme styling)
- `index.html`: ~250 lines (11 tab structure)

**Browser Requirements:**
- localStorage support
- ES6+ JavaScript
- CSS Grid & Flexbox
- Modern CSS (custom properties)

**Storage Capacity:**
- Typically 5-10MB localStorage limit
- Easily handles 1000+ questions + tasks

---

## 🧠 How the Mission System Works

### **Daily Mission Progress**
Calculated in real-time as you study:
```
Hours Progress = (Logged hours / Daily target) × 100%
Questions Progress = (Questions solved / Daily target) × 100%
Total = Average of both percentages

If either reaches 100%: ✅ Target met
If both reach 100%: 🎉 Perfect day!
If neither reached by day end: ⚠️ Warning alert
```

### **Consistency Score Calculation**
Weekly score based on:
```
Days Studied: 60% of score
- 7/7 days = 42/60 points
- Each day studied = 6 points max

Target Completion: 40% of score
- Check if daily targets met on each study day
- Percentage of days targets were met × 40 = points

Result: 0-100% consistency level
- 70-100%: Excellent consistency ✅
- 50-70%: Good consistency 👍
- 0-50%: Needs improvement ⚠️
```

### **Weak Area Detection**
Automatic analysis:
```
Compare each study area over last 7 days:
- Count total study hours per area
- Count total questions solved per area
- Identify area(s) with lowest activity
- Alert if weakest area has <1 hour this week
```

### **Dynamic Feedback Logic**
```
Compare today vs yesterday:
- If today > yesterday × 1.2: "Great! 20% more! 🎉"
- If today > yesterday: "Good! Slightly more! 👍"
- If today = yesterday: "Same level. Push harder! 💪"
- If today < yesterday × 0.8: "Less than usual. Increase it! ⚠️"
- If today = 0: "You haven't studied yet. Start now! 🚀"
```

---

## ⚙️ Customization

### **🎨 Choose Your Theme**
Settings tab → App Theme section (6 beautiful themes)

**Available Themes:**
1. **Dark** (Default) - Classic dark mode, easy on eyes
   - Perfect for night studying, reduced eyestrain
   - Cold blues and purples, professional look

2. **Light/Day** - Bright and readable
   - Best for daytime studying, natural lighting
   - Warm whites and vibrant colors

3. **Midnight** - Deep blues and purples
   - Focus-oriented, mystical vibe
   - Great for long study sessions

4. **Ocean** - Cool blues and teals
   - Calm and serene atmosphere
   - Perfect for meditation + study combo

5. **Forest** - Nature-inspired greens
   - Relaxing and organic
   - Reduces fatigue during marathon sessions

6. **Sunset** - Warm oranges and reds
   - Energizing and motivating
   - Great for evening study sessions

**How to switch:**
- Go to Settings tab
- Click any theme card to instantly apply it
- Changes save automatically
- Theme persists across app restarts

### **Change Daily Mission Targets**
Settings tab → Daily Mission Targets section
- Set study hours (1-12 hours)
- Set questions target (1-50 per day)
- Changes apply immediately to dashboard

### **Change Areas**
Edit `AREAS` array in `app.js`:
```javascript
const AREAS = [
  { id: 'custom', name: 'My Area', emoji: '📌', color: '#a78bfa', ... },
  // ...
];
```

### **Timer Duration**
Settings tab or directly:
- Work: 1-60 minutes (default 25)
- Break: 1-30 minutes (default 5)

### **Colors**
Edit CSS variables in `style.css`:
```css
:root[data-theme="dark"] {
  --dsa: #34d399;     /* DSA color */
  --apt: #a78bfa;     /* Aptitude color */
  --bg: #0a0a0f;      /* Dark background */
  /* etc... */
}
```

---

## � Mark for Revision System

**Purpose:** Track challenging questions you want to review later without deleting them.

**How to Mark:**
*(Note: Mark buttons can be added to DSA questions tab)*
- Click ⭐ icon on any question to mark it
- Question stays in original location
- Appears in your "Marked for Review" list

**How to Review:**
```javascript
// Internally tracked as:
markedForRevision: [
  { areaId: "dsa", subtopicId: 123, questionId: 456, timestamp: "2024-01-15" }
]

// Function to get all marked questions:
getMarkedForRevision() // Returns full question objects
```

**Review Workflow:**
1. Go to "Review Marked Questions" (coming in UI update)
2. See all questions you marked across all areas
3. Try solving them again
4. Click ✓ to unmark when solved
5. Focus on questions you're still struggling with

**Benefits:**
- No data loss (questions stay with original questions)
- Centralized revision list
- Track progress on hard questions
- Revisit problem areas systematically

---

## �🐛 Troubleshooting

**"Data not saving?"**
- Check if localStorage is enabled (not in private mode)
- Export data before clearing cache
- Browser DevTools → Application → Storage

**"Styles look broken?"**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check `style.css` file exists

**"Quick-add form not showing?"**
- Ensure you're in DSA tab
- Form only appears in DSA section
- Scroll down if not visible

**"Timer not making sound?"**
- Check Settings → Notifications enabled
- Browser volume not muted
- Some browsers require user interaction first

**"Mission targets not showing on dashboard?"** [NEW]
- Go to Settings tab
- Scroll to "Daily Mission Targets" section
- Enter your targets (5 hrs, 10 questions suggested)
- Click "💾 Save Targets"
- Return to Overview tab to see real-time progress

**"Consistency score shows 0%?"** [NEW]
- You haven't studied for a full week yet
- OR no targets have been met
- Start logging sessions to see score increase

**"Why is my weak area different each day?"** [NEW]
- Score is calculated for last 7 days only
- As old days fall off, priorities shift
- This is normal and helps adapt your focus

**"How do I mark questions for revision?"** [NEW]
- Mark buttons will be added to each question in DSA tab
- Click ⭐ to mark, ✓ to unmark
- Marked questions stored separately but not deleted

**"Where can I see all my marked questions?"** [NEW]
- Search tab has a "Show Marked for Review" option
- Or dedicated "Review Marked Questions" tab (coming soon)
- Shows questions from all areas you've marked

**"If I mark a question, will it be in two places?"** [NEW]
- No, marking doesn't duplicate it
- Original stays in DSA → Algorithms (or your area)
- Also appears in "Marked for Review" list
- One question, two views

**"Can I mark questions from LC (LeetCode) section?"** [NEW]
- Currently mark system works for custom DSA questions
- LC integration for marking coming in future update

**"Why does my feedback message change daily?"** [NEW]
- Feedback compares today to yesterday's study hours
- 20% more → "Great! 20% more! 🎉"
- Slightly more → "Good! Slightly more! 👍"
- Same → "Same level. Push harder! 💪"
- 20% less → "Less than usual. ⚠️"
- First study day → "You haven't studied yet! 🚀"
- Messages are personalized based on your effort

**"What does the Weekly Report show?"** [NEW]
- Total hours studied this week vs your weekly goal
- Best and worst days of the week
- Your strongest and weakest areas
- Personalized recommendation for next week
- Only appears if you've studied during week

**"Can I disable the mission system?"** [NEW]
- Yes, set mission-hours to 0 to disable
- Or don't set targets in Settings panel
- Dashboard will still show other metrics

**"How do I change the app theme?"** [NEW]
- Go to Settings tab
- Click "🎨 App Theme" section
- Click any theme card to instantly switch
- Theme changes apply immediately
- Your preference is saved automatically

**"Which theme is best for late-night studying?"** [NEW]
- **Dark Theme** - Default, easiest on eyes, reduced blue light
- **Midnight Theme** - Deep purples and blues, very calming
- **Ocean Theme** - Cool blues, serene atmosphere
- All dark themes are designed to reduce eyestrain

**"Which theme works best in bright sunlight?"** [NEW]
- **Light/Day Theme** - Specifically designed for daylight
- High contrast, bright backgrounds
- Perfect for outdoor studying with laptop

**"Can I customize theme colors further?"** [NEW]
- Current themes are pre-designed and optim ized
- To customize: Edit CSS variables in `style.css`
- Modify `:root[data-theme="dark"]` (or any theme) colors
- Don't forget to restart the app to see changes

**"Do theme changes affect my data?"** [NEW]
- No, themes are purely visual/cosmetic
- All your data remains unchanged
- Switch themes as often as you want
- Export/Import data works with any theme

---

## 💾 Data Export Format

When exporting, you get a complete JSON with:
```json
{
  "tasks": { "apt": [...], "dsa": [...], ... },
  "notes": { "apt": [...], "dsa": [...], ... },
  "lc": { "easy": 45, "medium": 32, "hard": 12 },
  "subtopics": { "dsa": [{ name, questions: [...], ... }], ... },
  "sessions": [...],
  "streak": ["2024-01-15", "2024-01-16", ...],
  "analytics": { "2024-01-15": { ... }, ... },
  "missions": {
    "dailyStudyHours": 5,
    "dailyQuestionsTarget": 10,
    "enabled": true
  },
  "performanceHistory": {
    "2024-01-15": { "studyHours": 4.5, "questionsSolved": 8, "areasWorked": ["dsa", "apt"] }
  },
  "markedForRevision": [
    { "areaId": "dsa", "subtopicId": 123, "questionId": 456, "timestamp": "2024-01-15" }
  ],
  "settings": {
    "notificationsEnabled": true,
    "theme": "dark",
    "autoSaveIntervalSeconds": 10
  }
}
```

---

## 🎓 Best Practices

1. **Daily Logging** — Log sessions at end of study (or use Daily Log tab)
2. **Question Tracking** — Add question right after solving for accuracy
3. **Chapters Organization** — Create by topic/chapter for easy navigation
4. **Regular Backups** — Export data weekly
5. **Streak Goal** — Try to maintain active days in calendar

---

## 📞 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Add task/note | Enter in input field |
| Expand chapter | Click chapter header |
| Delete item | Click × button |
| Start timer | Timer tab → Start button |
| Export data | Settings → Export button |

---

**✨ Built for students serious about placement prep**

*Last Updated: April 2026*

