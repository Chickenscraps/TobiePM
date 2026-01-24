# Product Requirements Document: Tobie Command Center (AntiGravity)

**Version:** 1.1  
**Date:** January 23, 2026  
**Product Owner:** Josh  
**Status:** Active

---

## 1. Executive Summary

Tobie Command Center (codename: **AntiGravity**) is a mobile-first, AI-powered project management dashboard for Tobie.team, consisting of:
1. **Web Portal** - Dashboard for project management, task tracking, team coordination, and video review
2. **AI Assistant** - Intelligent copilot for planning, task management, and scope detection
3. **Desktop Agent** (planned) - Local tray application for native notifications and file organization

The system is designed for a 2-person bootstrapped startup producing benefits plan explainer videos.

### Vision Statement

We aim to build a project management dashboard that is **simple, intuitive, and mobile-first**, yet powerful. The system serves both internal team members and external clients, providing tools for task management, scheduling, and rich media review—all enhanced by AI assistance. The core idea is to focus on what matters: upcoming deliverables, timelines, and collaboration, while hiding complexity until needed (progressive disclosure). An integrated AI "copilot" helps with planning, makes adjustments on command, logs all changes for audit, and handles video review feedback intelligently.

---

## 2. Design Principles

AntiGravity is built on these core UX principles:

1. **Mobile-First & Responsive**: Design for the smallest screen first, then enhance for larger screens. All interactions are touch-friendly (44px+ targets).
2. **Clear & Minimal Interface**: Embrace minimalism—plenty of whitespace, limited color palette, remove/hide non-essential elements.
3. **Progressive Disclosure**: Show basic, frequently-used information up front; tuck away advanced details under toggles/accordions.
4. **Timeline and Calendar Focus**: Visual timeline/calendar view is core. What's due next and upcoming deadlines are immediately visible.
5. **Drag-and-Drop Simplicity**: Leverage drag-and-drop for reordering tasks, scheduling, and Kanban workflows.
6. **Visual Hierarchy & Clarity**: Important information stands out via typography, color, and layout. Consistent icons and patterns.

---

## 3. Personas

### 2.1 Josh - Admin/Coordinator/Engineer
| Attribute | Details |
|-----------|---------|
| **Role** | Admin, Product Owner, Engineer |
| **Goals** | Oversee all projects, manage timelines, coordinate with Ann, maintain quality |
| **Pain Points** | Tracking multiple projects manually, missing deadlines, scattered files |
| **Permissions** | Full access: create/edit/delete projects, manage users, approve file operations |
| **Tech Comfort** | High - comfortable with command line, coding |

**User Story Themes:**
- "As Josh, I want to see all project statuses at a glance so I can identify bottlenecks"
- "As Josh, I want the system to recommend my next actions so I don't miss critical tasks"
- "As Josh, I want to control who can do what through simple checkboxes"

### 2.2 Ann Le - Motion Designer
| Attribute | Details |
|-----------|---------|
| **Role** | Designer, Motion Graphics Artist |
| **Goals** | Focus on creative work, clear task assignments, organized assets |
| **Pain Points** | Unclear priorities, finding the right files, context switching |
| **Permissions** | View projects, edit assigned tasks, read files, no admin access |
| **Tech Comfort** | Medium - comfortable with After Effects, Figma, basic file management |

**User Story Themes:**
- "As Ann, I want to know exactly what to work on today without searching"
- "As Ann, I want files organized automatically so I can find assets quickly"
- "As Ann, I want voice commands to update task status while working in AE"

### 2.3 Client - External Stakeholder
| Attribute | Details |
|-----------|---------|
| **Role** | Client, Reviewer |
| **Goals** | Review video deliverables, provide feedback, track project status |
| **Pain Points** | Email back-and-forth for feedback, unclear revision scope, lost comments |
| **Permissions** | View assigned project(s), review videos, add time-coded comments, no admin/internal access |
| **Tech Comfort** | Low-Medium - expects simple, intuitive interfaces |

**User Story Themes:**
- "As a Client, I want to review videos and leave feedback at specific timestamps without complicated tools"
- "As a Client, I want an AI assistant to help me articulate feedback clearly"
- "As a Client, I want to know if my requested changes are within project scope"

---

## 4. User Journeys

### Journey 1: Morning Start (Josh)
```
1. Josh opens Tobie Portal (web)
2. Dashboard shows:
   - 3 projects in progress
   - 2 tasks due today (highlighted)
   - 1 bottleneck warning (Ann blocked on script approval)
3. Josh clicks "Resolve Bottleneck" → taken to approval task
4. Josh approves script, task auto-moves to Ann's queue
5. Josh uses voice command: "Add task: Review Empire Life final, due Friday"
6. Task appears in project timeline
```

### Journey 2: Deep Work Session (Ann)
```
1. Ann sees desktop notification: "Today's priority: Animate Scene 3 - Empire Life"
2. Ann opens After Effects, starts working
3. Mid-session, Ann holds hotkey, says: "Mark scene 3 animation complete"
4. Desktop agent transcribes, confirms: "Marked 'Animate Scene 3' as done. Next: Scene 4 ready?"
5. Ann continues working without switching apps
```

### Journey 3: File Organization (Josh)
```
1. Josh notices messy Downloads folder in configured root
2. Opens Desktop Agent → File Operations
3. Agent proposes: "Move 12 .psd files to /Projects/Empire-Life/Assets/PSD?"
4. Shows dry-run preview:
   - Source: /Downloads/empire-*.psd
   - Destination: /Projects/Empire-Life/Assets/PSD/
   - Action: MOVE (will rename duplicates)
5. Josh clicks "Approve" → files move
6. Audit log records: [2026-01-22 10:30:15] MOVE 12 files → /Projects/Empire-Life/Assets/PSD/ [approved by josh]
```

### Journey 4: Project Kickoff (Josh)
```
1. Josh creates new project: "Manulife Q1 Video"
2. Selects template: "Benefits Video Project"
3. System auto-generates task list:
   - Script drafting (Josh) - 2 days
   - Script approval (Josh) - 1 day
   - Storyboard/Layout (Ann) - 3 days
   - Motion graphics (Ann) - 5 days
   - Rendering - 1 day
   - QA Review (Josh) - 1 day
   - Client delivery (Josh) - 1 day
4. Timeline view shows dependencies
5. Josh adjusts dates, assigns due dates
6. Ann receives notification: "New project assigned: Manulife Q1 Video"
```

---

## 5. User Stories (MVP + Planned Scope)

### Authentication & RBAC
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-01 | As Josh, I want to log in securely so my data is protected | P0 | Login with email/password, session persists |
| US-02 | As Josh, I want to assign roles to users | P0 | Can set Ann as "Designer" role |
| US-03 | As Josh, I want checkbox-style permission controls | P0 | Admin UI with toggles for each permission |
| US-04 | As Ann, I cannot access admin settings | P0 | Admin routes return 403 for non-admins |

### Projects
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-10 | As Josh, I want to create projects from templates | P0 | Template populates default tasks |
| US-11 | As a user, I want to see projects in a list | P0 | List view with status, dates, progress |
| US-12 | As a user, I want to see a project's tasks in Kanban view | P0 | Drag-drop between columns |
| US-13 | As a user, I want to see a project's timeline | P1 | Gantt-style with dependencies |

### Tasks
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-20 | As a user, I want to create tasks manually | P0 | Form with title, description, due date, assignee |
| US-21 | As a user, I want to see "Today's Priorities" | P0 | Dashboard widget, ordered by urgency |
| US-22 | As Josh, I want to see "Bottleneck Risks" | P0 | Tasks blocking others, highlighted |
| US-23 | As a user, I want recommended next actions | P1 | System suggests what to do next |
| US-24 | As a user, I want task dependencies | P1 | Task B blocked until Task A done |

### Files
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-30 | As a user, I want to attach files to tasks | P0 | File path + optional URL |
| US-31 | As Josh, I want desktop agent to index my root folder | P0 | Files scanned, indexed locally |
| US-32 | As Josh, I want file organization suggestions | P1 | Agent proposes moves/renames |
| US-33 | As Josh, I must approve file operations | P0 | Dry-run preview required |
| US-34 | All file ops must be audit logged | P0 | Append-only log with timestamp, user, action |

### Notifications
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-40 | As a user, I want desktop notifications for due tasks | P0 | Native OS notification |
| US-41 | As a user, I want in-app portal notifications | P0 | Dropdown with unread count |
| US-42 | As a user, I want notification preferences | P1 | Toggle which events notify |

### Voice Commands (Desktop)
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-50 | As a user, I want push-to-talk voice input | P1 | Hotkey activates mic |
| US-51 | As a user, I want "Add task…" command | P1 | Creates task from speech |
| US-52 | As a user, I want "Mark task done" command | P1 | Updates task status |
| US-53 | As a user, I want "Show today" command | P1 | Opens today view or reads back |

### AI Assistant
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-70 | As a user, I want to chat with an AI assistant about my tasks | P1 | Chat UI, natural language input |
| US-71 | As a user, I want AI to create tasks from natural language | P1 | "Create task for X due Friday" works |
| US-72 | As a user, I want AI to suggest next actions | P1 | "What should I do next?" returns priorities |
| US-73 | As Josh, I want AI to detect out-of-scope requests | P1 | Politely declines and flags OOS requests |
| US-74 | As a user, I want AI chat transcripts saved | P0 | All interactions logged and auditable |
| US-75 | As Josh, I want exportable AI-generated reports | P2 | "Give me status report" → copyable summary |

### Video Review Portal
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-60 | As a user, I want to upload videos to projects | P1 | Upload UI, file size limits, version tracking |
| US-61 | As a reviewer, I want to add time-coded comments | P0 | Click timeline → add comment at timestamp |
| US-62 | As a reviewer, I want an AI assistant during review | P1 | Chat with AI to record feedback naturally |
| US-63 | As a user, I want version control for videos | P1 | Track v1, v2, etc. with comment history |
| US-64 | As Josh, I want AI to flag out-of-scope review requests | P0 | AI detects scope violations in comments |
| US-65 | As a user, I want automated review transcripts | P1 | Export all feedback as structured document |
| US-66 | As a Client, I want secure, private video access | P0 | Unique link, login required, no cross-project access |

---

## 5. Success Metrics

### North Star Metric
**Weekly Active Usage** - Both users actively using portal + desktop agent weekly

### Supporting Metrics
| Metric | Target (MVP) | Measurement |
|--------|--------------|-------------|
| Time to find "what to do next" | < 5 seconds | Dashboard load time |
| Missed deadlines | 0 | Overdue task count |
| File organization time | -50% | Self-reported |
| Voice command success rate | > 80% | Successful transcription + action |
| System downtime | < 1 hour/month | Uptime monitoring |

---

## 6. Out of Scope (Post-MVP)

- Mobile app
- Client portal (external users)
- Video rendering automation
- AI script generation
- Real-time collaboration (live cursors)
- Integrations (Slack, Figma, After Effects plugins)
- Multi-tenant / other companies

---

## 7. Technical Constraints

1. **Privacy**: No file content exfiltration without explicit setting
2. **Local-first**: Must work fully offline (local-only mode)
3. **Root folder isolation**: Desktop agent ONLY accesses configured path
4. **Audit trail**: Every agent action logged immutably
5. **Dry-run default**: All destructive file ops preview-only first
6. **Open source preference**: Minimize vendor lock-in
7. **Low cost**: Free tiers, no enterprise pricing

---

## 8. Dependencies

| Dependency | Owner | Risk |
|------------|-------|------|
| Windows OS support | Josh | Low - primary platform |
| Tauri / Rust toolchain | Josh | Medium - learning curve |
| Whisper.cpp compilation | Josh | Medium - may need pre-built binary |
| Domain / hosting | Josh | Low - use Vercel/Netlify free tier |

---

## Approval

- [ ] Josh approves PRD
- [ ] Ready to proceed to Architecture
