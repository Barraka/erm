# Escape Room Manager - Project Context for Claude Code

## Project Overview
**Escape Room Manager** is a web-based Game Master (GM) dashboard for managing escape room sessions. Built for **Escape Yourself** (French escape room company). The app provides timers, hints, audio management, and a secondary display for players.

## Tech Stack
- **Framework**: React 19 (functional components + hooks)
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS + CSS custom properties (design system)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Storage**: IndexedDB (via `idb-keyval` library)
- **Room Controller**: WebSocket connection to Room Controller (MiniPC)
- **Language**: JavaScript only - **NO TYPESCRIPT**
- **UI Language**: French throughout

---

## Core Features

### 1. Timer System
- **Dual timer:** Countdown (adjustable) + Real elapsed time (independent, keeps counting even when paused)
- **Controls:** +/- 1 minute, +/- 10 seconds (disabled during session)
- **States:**
  - `isRunning` - Timer currently counting down
  - `sessionActive` - Session has started (persists across pauses)
- **Session flow:** Single "Débuter Session" button → transforms to Pause/Resume toggle + "Fin de Session"
- **Configurable duration:** 1-180 minutes (stored in IndexedDB)

### 2. Hint System
- Predefined hint library (10 defaults, fully editable)
- One-click hint sending to secondary screen
- Custom hint notification sound (with default fallback)
- Hint counter tracks hints given per session
- Collapsible interface

### 3. Audio Management
- **Background Music:** Multiple tracks, auto-plays first track on session start
- **Sound Effects:** Separate library for manual triggers
- **End-of-session sounds:** Victory/defeat sounds can be assigned (auto-trigger not yet implemented)
- **File size limit:** 500MB for all media uploads
- **Memory management:** Blob URLs properly revoked to prevent leaks

### 4. Secondary Screen (Player Display)
- Opens in separate browser window via `window.open()`
- Shows large timer + current hint with animations
- Custom background image support
- Glass morphism design with backdrop blur
- Detects when window is closed externally

### 5. Session Statistics (Stats Modal)
- **Read-only for GMs** - Cannot delete individual sessions or clear history
- Summary stats: Total sessions, win rate %, average time, average hints
- Session history list with:
  - Victory/defeat indicator
  - Date/time
  - Time used
  - Hints given
  - Expandable comments (click to expand full text)
- Filter by: All / Victories / Defeats

### 6. End Session Flow
- "Fin de Session" button (always enabled, even when paused)
- Modal with:
  - "Commentaires" textarea (optional session notes)
  - Victory button
  - Defeat button
  - "Ne pas enregistrer" (don't save, just reset)

### 7. Settings Modal
- Room duration (1-180 minutes)
- Background image picker
- Hint sound picker
- Background music manager (upload, rename, delete tracks)
- Sound effects manager (upload, rename, delete, assign victory/defeat roles)

---

## Project Structure

```
src/
├── App.jsx                    # Main component, orchestrates everything
├── App.css                    # Design system (CSS variables, utilities)
├── main.jsx                   # Entry point with ToastProvider
├── components/
│   ├── TimerDisplay.jsx       # Timer UI with controls
│   ├── BackgroundMusicPlayer.jsx
│   ├── SoundEffectPlayer.jsx
│   ├── ManageHints.jsx        # Hint management interface
│   ├── HintList.jsx           # Reusable hint list component
│   ├── SecondaryScreen.jsx    # Player display (React portal to popup)
│   ├── SettingsModal.jsx      # Configuration modal
│   ├── StatsModal.jsx         # Session statistics viewer (read-only)
│   ├── EndSessionModal.jsx    # Victory/Defeat/Comments dialog
│   ├── ManageScreen.jsx       # Secondary screen open/close buttons
│   ├── Controls.jsx           # Play/Pause/Stop buttons (reusable)
│   ├── FilePicker.jsx         # File upload component
│   ├── ToastProvider.jsx      # Toast notification system
│   ├── PropsPanel.jsx         # Props grid with connection status
│   ├── PropCard.jsx           # Individual prop display with controls
│   └── settings/
│       ├── BackgroundImagePicker.jsx
│       ├── HintSoundPicker.jsx
│       ├── BackgroundMusicManager.jsx
│       ├── BackgroundMusicUploader.jsx
│       ├── SoundEffectManager.jsx
│       └── SoundEffectPicker.jsx
├── contexts/
│   ├── TimerContext.jsx       # Global timer state management
│   └── RoomControllerContext.jsx  # WebSocket connection to Room Controller
├── hooks/
│   └── useTimer.js            # Timer logic hook
├── utils/
│   ├── soundEffectsDB.js      # IndexedDB operations
│   └── helperFile.js          # Default hints & helpers
└── assets/
    ├── logo.png               # Escape Yourself logo (displayed in header)
    └── hint.mp3               # Default hint notification sound
```

---

## State Management

### TimerContext (`contexts/TimerContext.jsx`)
```javascript
{
  time,              // Formatted countdown "MM:SS"
  realTime,          // Formatted elapsed "MM:SS"
  seconds,           // Raw countdown seconds
  isRunning,         // Timer currently counting
  sessionActive,     // Session has started (persists across pauses)
  roomDuration,      // Configured duration in seconds
  // Actions:
  addTime(delta),    // Add/subtract seconds
  start(),           // Start countdown
  pause(),           // Pause countdown
  reset(),           // Reset both timers
  setSeconds(),      // Direct set countdown
  updateRoomDuration(newDuration)  // Update configured duration
}
```

### RoomControllerContext (`contexts/RoomControllerContext.jsx`)
WebSocket connection to the Room Controller (MiniPC).

```javascript
{
  // Connection
  connectionStatus,    // 'disconnected' | 'connecting' | 'connected'
  roomInfo,            // { id, name, site } from Room Controller
  serverVersion,       // Room Controller version
  connect(),           // Manual reconnect
  disconnect(),        // Manual disconnect

  // State (from Room Controller)
  props,               // Array of prop objects
  session,             // { active, startedAt, pausedAt, totalPausedMs, hintsGiven }
  getRealElapsedMs(),  // Calculated real elapsed time

  // Prop commands
  forceSolve(propId),
  resetProp(propId),
  triggerSensor(propId, sensorId),

  // Session commands
  startSession(),
  pauseSession(),
  resumeSession(),
  endSession(result, comments),
  abortSession(),
  notifyHintGiven()
}
```

**WebSocket URL**: `ws://localhost:3001` (or `VITE_WS_URL` env var)

### IndexedDB Storage Keys (`utils/soundEffectsDB.js`)
```javascript
'sound-effects-list'    // Array of {key, name, type: 'music'|'effect', role: 'victory'|'defeat'|null}
'sound-{timestamp}'     // Individual audio blob
'hint-list'             // Array of hint strings
'backgroundImage'       // Blob - player screen background
'hintSound'             // Blob - custom hint notification
'roomDuration'          // Number - configured session length (seconds)
'session-history'       // Array of session objects
```

### Session Data Structure
```javascript
{
  id: "session-{timestamp}",
  date: "ISO8601 string",
  result: "victory" | "defeat",
  roomDuration: number,      // configured duration in seconds
  timeRemaining: number,     // seconds remaining when ended
  hintsGiven: number,
  comments: string           // optional session notes
}
```

---

## Design System

### CSS Variables (`App.css`)
```css
--color-bg-primary: #0f172a      /* slate-900 - main background */
--color-bg-secondary: #1e293b    /* slate-800 - cards */
--color-bg-tertiary: #334155     /* slate-700 - hover/elevated */
--color-bg-elevated: #475569     /* slate-600 - even lighter */
--color-accent-primary: #3b82f6  /* blue-500 */
--color-success: #22c55e         /* green-500 */
--color-warning: #f59e0b         /* amber-500 */
--color-danger: #ef4444          /* red-500 */
--color-text-primary: #f8fafc    /* slate-50 */
--color-text-secondary: #cbd5e1  /* slate-300 */
--color-text-muted: #94a3b8      /* slate-400 */
```

### Utility Classes
- `.card` - Component container styling
- `.btn`, `.btn-primary`, `.btn-success`, `.btn-danger`, `.btn-warning`
- `.input` - Form input styling
- `.glow-pulse` - Animation for active timer
- `.fade-in`, `.slide-up` - Entrance animations
- `.volume-slider` - Styled range inputs

### Timeline Classes (PropsPanel)
- `.props-timeline-container` - Horizontal scroll container
- `.props-timeline` - Flex row for steps
- `.step-column` - Vertical stack for parallel props
- `.step-badge` - Circled number (①②③)
- `.step-connector` - Arrow icon container

### PropCard Classes
- `.prop-card-compact` - Timeline view card (fixed width)
- `.prop-card-compact.solved` - Green glow effect
- `.prop-card-compact.offline` - Dimmed appearance
- `.sensor-dots` - Row of status indicators
- `.sensor-dot.waiting` - Red dot
- `.sensor-dot.triggered` - Green dot with glow

---

## Important Implementation Details

### Timer Pause Bug Fix
The `updateRoomDuration` callback was being recreated on every `isRunning` change, causing useEffect re-runs that reset the timer. Fixed by using a ref:

```javascript
// TimerContext.jsx
const isRunningRef = useRef(timer.isRunning);
isRunningRef.current = timer.isRunning;

const updateRoomDuration = useCallback((newDuration) => {
  setRoomDuration(newDuration);
  if (!isRunningRef.current) {  // Use ref, not state
    timer.setSeconds(newDuration);
  }
}, [timer.setSeconds]);  // No isRunning in dependencies
```

### Session Controls UX
- **Before session:** Single "Débuter Session" button
- **During session (running):** "Pause" button + "Fin de Session" button
- **During session (paused):** "Reprendre" button + "Fin de Session" button
- **"Fin de Session" is always enabled** when session is active (GM might pause to debrief before ending)

### Memory Management for Audio
```javascript
// Create blob URL
const url = URL.createObjectURL(blob);

// Track in ref to revoke later
prevUrlsRef.current.add(url);

// Revoke when no longer needed
URL.revokeObjectURL(url);
```

### Secondary Screen
- Uses `window.open()` to create popup
- React portal renders into popup's DOM
- Monitors for external window closure
- Copies stylesheets from main window

---

## Recent Work

### Session Sync with Room Controller (Latest)
- Dashboard now notifies Room Controller on session start/pause/resume/end/abort
- `App.jsx` calls `rc.startSession()`, `rc.pauseSession()`, `rc.resumeSession()`, `rc.endSession()`, `rc.abortSession()`
- On session start, Room Controller resets all props and broadcasts `full_state`
- All RC calls use `.catch()` for graceful fallback when RC is disconnected
- `TimerDisplay` accepts `onPause` and `onResume` callbacks (separate from `onStart`)

### Props Panel Improvements
1. **Collapsible section** - Clickable header with animated chevron (matches other sections)
2. **Puzzle icon** - Section icon matching other dashboard sections
3. **Title "Enigmes"** - Renamed from "Props"
4. **Online count badge** - Shows "X/Y" (green when all online, orange otherwise), visible in collapsed state
5. **Offline indicators** - Red border on offline prop cards
6. **Step timers** - Per-step elapsed time from session start, freezes green when step solved
7. **Popover on click** - Click compact PropCard to open popover with sensors + actions
8. **Popover sensors** - Individual trigger buttons per untriggered sensor
9. **Popover offline text** - "- hors ligne" in red when prop is offline
10. **Popover left-aligned** - Fixed clipping on first prop

### Sensor Merging Fix
- `prop_update` handler in `RoomControllerContext` merges sensors by `sensorId` instead of replacing the array
- Prevents sensors from disappearing when a partial update arrives

### Previous Features
1. **Stats Modal** - Full session history viewer with summary statistics
2. **Session Comments** - "Commentaires" textarea in EndSessionModal
3. **Expandable Comments** - Click "Commentaire:" to expand/collapse in history
4. **Logo in Header** - Escape Yourself logo on left side

### Previous Bug Fixes
1. **Timer pause bug** - Fixed timer resetting when paused (ref solution)
2. **Button layout shift** - Fixed "Fin de Session" button causing layout shifts

### Previous UX Improvements
1. **Single start button** - "Débuter Session" transforms into control buttons
2. **Play/Pause toggle** - Combined into single button that changes based on state
3. **"Fin de Session" always enabled** - Works during pause for debriefing scenarios
4. **Read-only stats** - GMs cannot delete sessions (data protection)

---

## Room Controller Integration

The Dashboard connects to the Room Controller via WebSocket for prop management.

```
ESP32 Props ←──MQTT──→ Room Controller ←──WebSocket──→ GM Dashboard
                        (MiniPC)                        (this app)
```

### Props Panel - Horizontal Timeline Layout
- **Horizontal timeline** with horizontal scrolling
- Props grouped by `order` value into "steps"
- **Parallel props** (same order) stack vertically within a step
- **Step badges**: Circled numbers (①②③④⑤⑥⑦⑧⑨⑩)
- **Arrow connectors** between steps (→)
- Auto-reconnects with exponential backoff

**Timeline Structure:**
```
  ①              ②                  ③
┌────────┐  →  ┌────────┐  →  ┌────────┐
│ Prop A │     │ Prop B │     │ Prop D │
└────────┘     ├────────┤     └────────┘
               │ Prop C │  ← Parallel (same order)
               └────────┘
```

### PropCard - Compact Timeline View
- **Sensor dots**: Always visible (○ red=waiting, ● green=triggered)
- **Solved state**: Green glow effect + checkmark
- **Offline state**: Dimmed (opacity 0.5), red border, "- hors ligne" in popover
- **GM Override**: Yellow "GM" badge
- **Click popover**: Click card to open popover with sensor list + action buttons
- **Sensor trigger**: Individual trigger button per untriggered sensor in popover
- **Actions**: Force Solve + Reset in popover
- **Fixed width** for consistent timeline appearance
- **Step timers**: Per-step elapsed time below cards (green when solved)

### Related Files
- **WebSocket Contract**: `../WEBSOCKET_CONTRACT_v1.md`
- **Room Controller Project**: `../room-controller/`

---

## Pending/Future Features

1. **Ending Track Auto-Trigger** - Automatically play victory/defeat sound when timer reaches threshold
2. **Keyboard Shortcuts** - Spacebar for pause/resume, etc.
3. **Hint Clear Button** - Clear hint from secondary screen after players read it
4. **Sound Preview** - Preview sounds in settings before selecting
5. **Confirmation for "Ne pas enregistrer"** - Prevent accidental session loss
6. ~~**Session sync with Room Controller**~~ - Done: dashboard now calls RC session commands

---

## Commands

```bash
npm run dev      # Development server (localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

---

## Important Notes for Claude

- All UI text is in **French**
- **NO TYPESCRIPT** - Keep everything as .jsx
- GMs have **read-only access** to session history (cannot delete)
- Use **CSS variables** for colors, not Tailwind color classes directly
- Audio uses native `Audio()` API with blob URLs (not `<audio>` elements)
- Secondary screen is a **separate browser window** (popup), not iframe
- IndexedDB via `idb-keyval` for all persistence (no backend)
- File size limit is **500MB** for all media uploads
- Room Controller connection is **optional** - dashboard works standalone
- WebSocket URL configurable via `VITE_WS_URL` environment variable
