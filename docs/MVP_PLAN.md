# MVP Plan: Tobie Command Center

**Version:** 1.0  
**Date:** January 22, 2026  
**Status:** Ready for Implementation

---

## Overview

This plan delivers Tobie Command Center in 3 milestones, each producing a runnable increment.

| Milestone | Focus | Duration | Deliverables |
|-----------|-------|----------|--------------|
| **M1** | Foundation | 1 week | Auth, RBAC, Projects, Tasks API + basic UI |
| **M2** | Desktop Agent | 1 week | Tauri app, notifications, file indexer |
| **M3** | Intelligence | 1 week | Recommendations, voice commands, polish |

Total estimated: **3 weeks** (part-time development)

---

## Milestone 1: Foundation

**Goal:** Web portal with login, projects, tasks, and admin UI

### Week 1 Deliverables

#### 1.1 Monorepo Setup (Day 1)
- [x] Initialize pnpm workspace
- [x] Create apps/web (Next.js 14)
- [x] Create packages/shared (types, validation)
- [x] Configure TypeScript, ESLint, Prettier
- [x] Turborepo build pipeline

**Acceptance Criteria:**
- `pnpm install` succeeds
- `pnpm dev` starts Next.js on localhost:3000
- TypeScript compilation passes

**Definition of Done:**
- [ ] README with setup instructions
- [ ] All packages build without errors

#### 1.2 Database & Auth (Day 2-3)
- [x] Prisma schema (from DB_SCHEMA.prisma)
- [x] SQLite for local dev
- [x] NextAuth.js with credentials provider
- [x] Login/logout pages
- [x] Session management

**Acceptance Criteria:**
- Can create user via seed script
- Can log in with email/password
- Session persists across page refresh
- Logout invalidates session

**Definition of Done:**
- [ ] `/api/auth/*` routes functional
- [ ] Login page styled
- [ ] Protected routes redirect to login

#### 1.3 RBAC System (Day 3-4)
- [x] Roles table seeded (Admin, Designer)
- [x] Permissions seeded (20+ permissions)
- [x] Permission check middleware
- [x] Admin UI for role management

**Acceptance Criteria:**
- Josh (Admin) can access all routes
- Ann (Designer) cannot access admin routes
- Checkbox UI to toggle permissions per role

**Definition of Done:**
- [ ] RBAC tests pass
- [ ] 403 returned for unauthorized requests
- [ ] Audit log records permission denials

#### 1.4 Projects & Tasks (Day 4-6)
- [x] Project CRUD API
- [x] Task CRUD API
- [x] Project templates
- [x] Task dependencies
- [x] Kanban view (drag-drop)
- [x] Timeline view (basic)

**Acceptance Criteria:**
- Can create project from template
- Tasks auto-generated with dates
- Can drag task between columns
- Dependencies shown visually

**Definition of Done:**
- [ ] All project API tests pass
- [ ] All task API tests pass
- [ ] UI matches PRD user journeys

#### 1.5 Dashboard (Day 6-7)
- [x] Today's priorities widget
- [x] Bottleneck warnings widget
- [x] Project overview cards
- [x] Notification bell (UI only)

**Acceptance Criteria:**
- Dashboard loads in < 2s
- Shows 3 most urgent tasks
- Shows blocked tasks with warnings

**Definition of Done:**
- [ ] Dashboard functional
- [ ] Responsive on desktop

### M1 Demo Script
```
1. Open localhost:3000
2. Log in as josh@tobie.team / password
3. Click "New Project" → Select "Benefits Video" template
4. See auto-generated tasks in Kanban
5. Drag a task to "In Progress"
6. Go to Admin → Users → See Ann's permissions
7. Toggle a permission checkbox
8. Log out, log in as ann@tobie.team
9. Verify cannot access Admin section
```

---

## Milestone 2: Desktop Agent

**Goal:** Tauri tray app with notifications and file indexing

### Week 2 Deliverables

#### 2.1 Tauri Scaffold (Day 1-2)
- [ ] Create apps/desktop (Tauri + React)
- [ ] System tray icon
- [ ] Context menu (Show, Settings, Quit)
- [ ] Window management (minimize to tray)

**Acceptance Criteria:**
- App starts and shows tray icon
- Clicking tray opens main window
- App minimizes to tray on close (not exit)

**Definition of Done:**
- [ ] Windows .exe builds
- [ ] Tray icon functional

#### 2.2 Settings & Folder Picker (Day 2-3)
- [ ] Settings window
- [ ] Root folder picker dialog
- [ ] Save settings to local config
- [ ] Sync mode toggle

**Acceptance Criteria:**
- Can select Tobie root folder
- Path saved and persists across restarts
- Clear display of current root folder

**Definition of Done:**
- [ ] Settings persist to disk
- [ ] Path validation (exists, accessible)

#### 2.3 File Indexer (Day 3-4)
- [ ] Scan files in root folder
- [ ] Store in local SQLite
- [ ] Watch for file changes (notify crate)
- [ ] Display file tree in UI

**Acceptance Criteria:**
- Indexes 1000 files in < 5 seconds
- Updates index on file add/modify/delete
- Shows indexed file count in UI

**Definition of Done:**
- [ ] Indexer respects root folder boundary
- [ ] No access to files outside root

#### 2.4 Native Notifications (Day 4-5)
- [ ] notify-rust integration
- [ ] Push notification for due tasks
- [ ] Click notification opens app
- [ ] Notification preferences

**Acceptance Criteria:**
- Notification appears for task due in 2 hours
- Clicking notification focuses app to task
- Can disable notifications in settings

**Definition of Done:**
- [ ] Notifications work on Windows
- [ ] Rate-limited (max 5/hour)

#### 2.5 Portal Sync (Day 5-6)
- [ ] Login via desktop app
- [ ] Pull projects/tasks from portal
- [ ] Push task updates to portal
- [ ] Sync status indicator

**Acceptance Criteria:**
- Can log in to portal from desktop
- Tasks sync bi-directionally
- Offline changes queue and sync when online

**Definition of Done:**
- [ ] Sync conflict handling
- [ ] Audit log of sync operations

#### 2.6 File Operations (Day 6-7)
- [ ] File move/rename proposal UI
- [ ] Dry-run preview (what will happen)
- [ ] Approve/reject buttons
- [ ] Execute with audit log

**Acceptance Criteria:**
- Agent proposes file moves
- Preview shows exact changes
- Must click Approve to execute
- Audit log records operation

**Definition of Done:**
- [ ] Append-only audit log
- [ ] No operations without approval
- [ ] Undo via "move to trash"

### M2 Demo Script
```
1. Launch TobieDesktop.exe
2. See tray icon appear
3. Click tray → Configure → Set root folder to C:\Tobie
4. Watch files get indexed (progress bar)
5. Log in to portal via desktop
6. See tasks sync from portal
7. Receive notification: "Task due: Script Review"
8. Click notification → taken to task detail
9. Desktop proposes: "Move 5 files to Assets folder?"
10. Click Preview → See exactly what will move
11. Click Approve → Files move, audit log updated
```

---

## Milestone 3: Intelligence & Polish

**Goal:** Task recommendations, voice commands, full integration

### Week 3 Deliverables

#### 3.1 Task Recommender (Day 1-2)
- [ ] Priority calculation algorithm
- [ ] Bottleneck detection
- [ ] Next actions generation
- [ ] package: agent-core

**Acceptance Criteria:**
- Correctly identifies most urgent task
- Warns about blocking tasks
- Explains why tasks are prioritized

**Algorithm:**
```
priority_score = (
  due_date_urgency * 40 +
  blocking_count * 30 +
  explicit_priority * 20 +
  assignment_match * 10
)
```

**Definition of Done:**
- [ ] Unit tests for recommender
- [ ] Dashboard uses recommender

#### 3.2 Voice Commands (Day 2-4)
- [ ] Push-to-talk hotkey (Ctrl+Shift+T)
- [ ] Audio recording
- [ ] Whisper.cpp integration (local)
- [ ] Command parsing

**Commands:**
```
"Add task <title>" → Creates task in current project
"Mark <task> done" → Updates task status
"Set due date <task> <date>" → Updates due date
"Show today" → Opens today's priorities
```

**Acceptance Criteria:**
- Hotkey activates recording
- Audio transcribed locally (no cloud)
- Recognized commands execute
- Unrecognized → "Command not understood"

**Definition of Done:**
- [ ] 80%+ recognition accuracy
- [ ] Confirmation before destructive actions

#### 3.3 In-App Notifications (Day 4-5)
- [ ] Notification dropdown in portal
- [ ] Unread count badge
- [ ] Mark as read
- [ ] Polling for new notifications

**Acceptance Criteria:**
- Bell icon shows unread count
- Clicking shows notification list
- Can mark all as read

**Definition of Done:**
- [ ] Notifications persist in DB
- [ ] Links to relevant entities

#### 3.4 Timeline View (Day 5-6)
- [ ] Gantt-style chart
- [ ] Task bars with dependencies
- [ ] Drag to reschedule
- [ ] Milestone markers

**Acceptance Criteria:**
- Shows tasks on timeline
- Dependencies shown as arrows
- Can drag to change dates

**Definition of Done:**
- [ ] Responsive design
- [ ] Date picker integration

#### 3.5 Polish & Testing (Day 6-7)
- [ ] Smoke tests for all APIs
- [ ] RBAC test suite
- [ ] Demo dataset seed
- [ ] README documentation
- [ ] Bug fixes

**Acceptance Criteria:**
- All tests pass
- No critical bugs
- Demo runs smoothly

**Definition of Done:**
- [ ] 80%+ test coverage on critical paths
- [ ] Windows run commands documented
- [ ] Demo video recorded

### M3 Demo Script
```
1. Open portal dashboard
2. See "Today's Priorities" with explanations:
   "Due in 4 hours, blocks 2 other tasks"
3. See "Bottleneck Alert: Animation review overdue"
4. Open Desktop Agent
5. Press Ctrl+Shift+T → "Add task demo for client"
6. Hear confirmation beep, task appears
7. Say "Mark demo task done"
8. Task status updates
9. Check notification bell → "Task marked done"
10. Open Timeline view, drag task to new date
11. Check Audit Log (admin) → See all actions
```

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Whisper.cpp build issues | Medium | High | Pre-built binaries, fallback to text input |
| Tauri learning curve | Low | Medium | Extensive Tauri docs, similar to Electron patterns |
| Time overrun | Medium | Medium | Cut M3 voice to stub if needed |
| Windows-specific bugs | Medium | Low | Primary dev on Windows |

---

## Test Strategy

### Automated Tests
```powershell
# Run all tests
pnpm test

# Run API tests only
pnpm --filter web test

# Run RBAC tests
pnpm --filter web test:rbac
```

### Manual Testing Checklist
- [ ] Login flow (valid and invalid credentials)
- [ ] Permission denied scenarios
- [ ] Project creation from template
- [ ] Task drag-drop in Kanban
- [ ] Desktop notification appearance
- [ ] File indexer respects root folder
- [ ] Dry-run preview accuracy
- [ ] Voice command recognition

---

## Windows Setup Commands

```powershell
# Prerequisites
winget install Node.js.LTS
winget install pnpm
winget install Rustlang.Rust.MSVC

# Clone and setup
cd C:\Users\josha\OneDrive\Desktop\ORG AI AGENT
pnpm install

# Run web portal
pnpm --filter web dev

# Run desktop agent (after M2)
pnpm --filter desktop tauri dev

# Build for production
pnpm build
pnpm --filter desktop tauri build
```

---

## Definition of Done (Overall MVP)

- [ ] All M1, M2, M3 deliverables complete
- [ ] All tests passing
- [ ] Demo script runs successfully
- [ ] Documentation complete
- [ ] Windows installer generated
- [ ] Josh and Ann can use the system daily

---

## Approval

- [ ] Josh approves MVP Plan
- [ ] Ready to begin implementation
