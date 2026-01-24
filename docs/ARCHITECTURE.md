# Architecture Document: Tobie Command Center

**Version:** 1.0  
**Date:** January 22, 2026  
**Architect:** Josh  

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TOBIE COMMAND CENTER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐         ┌──────────────────────┐                  │
│  │    Web Portal        │◄───────►│   Desktop Agent      │                  │
│  │    (Next.js)         │  SYNC   │   (Tauri + React)    │                  │
│  │                      │         │                      │                  │
│  │  • Dashboard         │         │  • Tray Icon         │                  │
│  │  • Projects          │         │  • Notifications     │                  │
│  │  • Tasks             │         │  • File Indexer      │                  │
│  │  • Admin UI          │         │  • Voice Commands    │                  │
│  │  • Notifications     │         │  • File Operations   │                  │
│  │                      │         │  • Audit Log         │                  │
│  └──────────┬───────────┘         └──────────┬───────────┘                  │
│             │                                │                              │
│             ▼                                ▼                              │
│  ┌──────────────────────┐         ┌──────────────────────┐                  │
│  │   Postgres (Cloud)   │         │   SQLite (Local)     │                  │
│  │   Supabase/Neon      │         │   Embedded           │                  │
│  └──────────────────────┘         └──────────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Monorepo Structure

```
tobie-command-center/
├── apps/
│   ├── web/                    # Next.js web portal
│   │   ├── app/                # App router pages
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities, API clients
│   │   └── prisma/             # Database schema
│   │
│   └── desktop/                # Tauri desktop app
│       ├── src/                # React frontend
│       ├── src-tauri/          # Rust backend
│       │   ├── src/
│       │   │   ├── main.rs
│       │   │   ├── commands/   # IPC handlers
│       │   │   ├── indexer/    # File indexing
│       │   │   ├── notifier/   # OS notifications
│       │   │   └── audit/      # Logging
│       │   └── Cargo.toml
│       └── tauri.conf.json
│
├── packages/
│   ├── shared/                 # Shared types & utils
│   │   ├── types/              # TypeScript interfaces
│   │   ├── validation/         # Zod schemas
│   │   └── utils/              # Common utilities
│   │
│   ├── agent-core/             # Task intelligence
│   │   ├── recommender/        # Priority calculation
│   │   ├── scheduler/          # Dependency resolution
│   │   └── planner/            # File operation planning
│   │
│   └── audit/                  # Audit logging
│       ├── logger/             # Append-only writer
│       └── viewer/             # Log query/export
│
├── turbo.json                  # Turborepo config
├── pnpm-workspace.yaml         # PNPM workspaces
└── package.json
```

### 2.2 Web Portal Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Web Portal                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    App Router (RSC)                      │    │
│  │  /dashboard    /projects    /tasks    /admin    /api     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌──────────────┬────────────┼────────────┬──────────────┐      │
│  │   Auth       │  API Routes │            │   UI         │      │
│  │  NextAuth.js │  /api/*     │            │  React       │      │
│  │              │             │            │  TailwindCSS │      │
│  └──────────────┴─────────────┴────────────┴──────────────┘      │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Prisma ORM                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL (Supabase/Neon)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Decisions:**
- **App Router**: React Server Components for performance
- **API Routes**: REST endpoints for CRUD + sync
- **NextAuth.js v5**: Credential provider, JWT sessions
- **Prisma**: Type-safe ORM, migrations
- **PostgreSQL**: Supabase free tier for MVP

### 2.3 Desktop Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Tauri Desktop Agent                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   React Frontend (WebView)               │    │
│  │  • Settings UI    • File Browser    • Today View         │    │
│  │  • Audit Log View • Voice Status    • Sync Status        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │ IPC (invoke/listen)              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Rust Backend                           │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │   │
│  │  │  Commands  │ │  Indexer   │ │  Notifier  │            │   │
│  │  │  (IPC API) │ │  (fs watch)│ │  (notify)  │            │   │
│  │  └────────────┘ └────────────┘ └────────────┘            │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │   │
│  │  │  Audit     │ │  Voice     │ │  File Ops  │            │   │
│  │  │  (append)  │ │  (whisper) │ │  (dry-run) │            │   │
│  │  └────────────┘ └────────────┘ └────────────┘            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   SQLite (Local DB)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Local File System (Root Folder ONLY)         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Decisions:**
- **Tauri v2**: Security, performance, small binary
- **React Frontend**: Shared knowledge, familiar tooling
- **Rust Backend**: File system, notifications, audio
- **SQLite**: Embedded, zero-config, syncs to cloud
- **notify-rust**: Native OS notifications
- **whisper-rs**: Local speech-to-text

---

## 3. Data Flows

### 3.1 Authentication Flow

```
┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ User │────►│ Login UI │────►│ NextAuth │────►│ Database │
└──────┘     └──────────┘     └──────────┘     └──────────┘
                  │                 │
                  │            JWT Token
                  │◄────────────────┘
                  │
                  ▼
           ┌──────────────┐
           │ Session Cookie│
           │ (httpOnly)   │
           └──────────────┘
```

### 3.2 Task Recommendation Flow

```
┌────────────┐     ┌─────────────┐     ┌──────────────┐
│  Dashboard │────►│ agent-core  │────►│   Database   │
│  (Request) │     │ recommender │     │ (tasks, deps)│
└────────────┘     └─────────────┘     └──────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Priority Algorithm:   │
              │ 1. Due date urgency   │
              │ 2. Blocked tasks count│
              │ 3. User assignment    │
              │ 4. Dependency chain   │
              └──────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Returns:             │
              │ - Today's priorities │
              │ - Bottleneck risks   │
              │ - Next actions       │
              └──────────────────────┘
```

### 3.3 File Operation Flow (Dry-Run Required)

```
┌──────────────┐
│ File Planner │
│ (agent-core) │
└──────┬───────┘
       │ 1. Analyze files in root folder
       ▼
┌──────────────┐
│  Proposal    │
│  Generation  │
└──────┬───────┘
       │ 2. Generate move/rename proposals
       ▼
┌──────────────┐
│  DRY-RUN     │ ◄── ALWAYS first step
│  Preview     │
└──────┬───────┘
       │ 3. Show user what WOULD happen
       ▼
┌──────────────┐
│ User Reviews │
│ Approves/    │
│ Rejects      │
└──────┬───────┘
       │ 4. If approved:
       ▼
┌──────────────┐     ┌──────────────┐
│ Execute Ops  │────►│ AUDIT LOG    │
│ (actual move)│     │ (append-only)│
└──────────────┘     └──────────────┘
```

### 3.4 Voice Command Flow

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│  Hotkey  │────►│  Record  │────►│  Whisper.cpp │
│  Press   │     │  Audio   │     │  (local STT) │
└──────────┘     └──────────┘     └──────────────┘
                                        │
                                   Transcript
                                        ▼
                              ┌──────────────────┐
                              │ Command Parser   │
                              │ "Add task: X"    │
                              │ "Mark X done"    │
                              │ "Show today"     │
                              └──────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │ Execute Action   │
                              │ (via IPC → API)  │
                              └──────────────────┘
```

### 3.5 Sync Strategy (Local ↔ Cloud)

```
┌─────────────────────────────────────────────────────────────────┐
│                        SYNC MODES                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LOCAL-ONLY MODE                    SYNC MODE                    │
│  ┌────────────────┐                 ┌────────────────┐          │
│  │ Desktop Agent  │                 │ Desktop Agent  │          │
│  │    SQLite      │                 │    SQLite      │          │
│  │                │                 │       ▲        │          │
│  │ No cloud sync  │                 │       │ Sync   │          │
│  └────────────────┘                 │       ▼        │          │
│                                     │ ┌────────────┐ │          │
│                                     │ │ Web Portal │ │          │
│                                     │ │ PostgreSQL │ │          │
│                                     │ └────────────┘ │          │
│                                     └────────────────┘          │
│                                                                  │
│  Privacy: File CONTENTS never synced.                           │
│  Only: file paths, metadata, timestamps                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Sync Protocol:
1. Desktop pulls changes from portal on startup
2. Desktop pushes changes on task/project update
3. Conflict resolution: Last-write-wins with audit log
4. Sync happens over HTTPS with JWT authentication
```

---

## 4. Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                      TRUST BOUNDARIES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  TRUST ZONE 1: User's Local Machine                     │    │
│  │                                                         │    │
│  │  ┌───────────────┐    ┌───────────────────────────┐    │    │
│  │  │ Desktop Agent │    │ Root Folder ONLY          │    │    │
│  │  │ (full trust)  │───►│ C:\Tobie\                │    │    │
│  │  └───────────────┘    │ (explicit user config)    │    │    │
│  │         │             └───────────────────────────┘    │    │
│  │         │ BLOCKED                                      │    │
│  │         ▼                                              │    │
│  │  ┌───────────────────────────────────────────────┐    │    │
│  │  │ Other Folders: C:\Users\*, C:\Windows\*, etc. │    │    │
│  │  │ ACCESS DENIED by Tauri allowlist              │    │    │
│  │  └───────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ════════════════════════════════════════════════════════════   │
│                          NETWORK BOUNDARY                        │
│  ════════════════════════════════════════════════════════════   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  TRUST ZONE 2: Cloud (Optional Sync Mode)               │    │
│  │                                                         │    │
│  │  • Only metadata synced (file paths, not contents)      │    │
│  │  • JWT authentication required                          │    │
│  │  • HTTPS only                                           │    │
│  │  • RBAC enforced on all API endpoints                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  UNTRUSTED ZONE: External Services                      │    │
│  │                                                         │    │
│  │  • Whisper API (optional, disabled by default)          │    │
│  │  • Never receive file contents                          │    │
│  │  • User must explicitly enable                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Notification Strategy

### Desktop Notifications (Tauri)
```rust
// Using notify-rust crate
Notification::new()
    .summary("Task Due: Animate Scene 3")
    .body("Empire Life project - Due in 2 hours")
    .icon("tobie-icon")
    .show()?;
```

**Trigger Events:**
- Task due within X hours (configurable)
- Task assigned to user
- Bottleneck detected
- File operation completed

### Portal Notifications (Web)
```typescript
// In-app notification system
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string; // Optional deep link
}
```

**Delivery:**
- In-app notification dropdown
- Real-time updates via polling (MVP) or WebSocket (future)
- Email notifications (future)

---

## 6. Technology Stack Summary

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Web Frontend** | Next.js 14 (App Router) | RSC, TypeScript, popular |
| **Web Styling** | TailwindCSS | Rapid development, utility-first |
| **Web Auth** | NextAuth.js v5 | Flexible, credential provider |
| **Web API** | Next.js API Routes | Colocated, serverless-ready |
| **Desktop Framework** | Tauri v2 | Secure, small, performant |
| **Desktop Frontend** | React + Vite | Shared knowledge |
| **Desktop Backend** | Rust | Performance, safety |
| **Database (Cloud)** | PostgreSQL (Supabase) | Free tier, reliable |
| **Database (Local)** | SQLite | Embedded, zero-config |
| **ORM** | Prisma | Type-safe, migrations |
| **Monorepo** | pnpm + Turborepo | Fast, efficient |
| **Voice (Local)** | whisper-rs | Local transcription |
| **Notifications** | notify-rust | Native OS |

---

## 7. Deployment Architecture

### MVP Deployment
```
┌─────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Web Portal:                                                     │
│  ┌─────────────────────────────────────────────────┐            │
│  │ Vercel (Free Tier)                              │            │
│  │ - Automatic HTTPS                               │            │
│  │ - Edge functions                                │            │
│  │ - Preview deployments                           │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                  │
│  Database:                                                       │
│  ┌─────────────────────────────────────────────────┐            │
│  │ Supabase (Free Tier)                            │            │
│  │ - 500MB storage                                 │            │
│  │ - 50K monthly active users                      │            │
│  │ - Automatic backups                             │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                  │
│  Desktop Agent:                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │ GitHub Releases                                 │            │
│  │ - Windows .msi installer                        │            │
│  │ - Auto-updater via Tauri                        │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Approval

- [ ] Josh approves Architecture
- [ ] Ready to proceed to Threat Model
