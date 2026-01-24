# Tobie Desktop Agent

Desktop tray application built with Tauri.

## Prerequisites

- Rust (install from [rustup.rs](https://rustup.rs))
- Node.js 18+ and pnpm

## Setup

```powershell
# Install Tauri CLI globally (optional)
cargo install tauri-cli

# Install dependencies
pnpm install

# Run in development
pnpm dev

# Build for production
pnpm build
```

## Features (Planned)

- System tray with quick actions
- Native OS notifications
- Folder picker for root path
- Local file indexer
- Voice command capture (Whisper.cpp)
- File operation approval UI
- Append-only audit log

## Architecture

```
apps/desktop/
├── src/                    # React frontend
│   ├── App.tsx
│   ├── pages/
│   │   ├── Today.tsx       # Today's priorities
│   │   ├── Settings.tsx    # Configuration
│   │   └── Audit.tsx       # Local audit log
│   └── components/
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── commands/       # IPC handlers
│   │   ├── indexer.rs      # File watcher
│   │   ├── notifier.rs     # Notifications
│   │   └── voice.rs        # Audio capture
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## Status

🚧 In development - See MVP_PLAN.md Milestone 2
