# Decision Memo: Development Tooling & Desktop Framework

**Date:** January 22, 2026  
**Author:** Josh (Admin/Coordinator/Engineer)  
**Status:** Recommended

---

## 1. AI Development Assistant Comparison

### Candidates
| Criteria | Antigravity (Gemini) | Claude Code (Anthropic) | Quadcode AI |
|----------|---------------------|------------------------|-------------|
| **Code Generation Quality** | Excellent - strong at full-stack, monorepo patterns | Excellent - Claude 3.5/Opus reasoning | Good - focused on specific frameworks |
| **Context Window** | Very large (1M+ tokens) | 200K tokens | Limited |
| **Multi-file Editing** | Native support | Native support | Partial |
| **Browser Automation** | Built-in | Limited | No |
| **Cost** | Free (API usage) | ~$20/mo Pro tier | Varies |
| **IDE Integration** | VS Code extension | VS Code extension | Various |
| **Agentic Capabilities** | Full task tracking, artifacts | Task completion | Basic |
| **Local File Access** | Full (with approval) | Full (with approval) | Limited |

### Recommendation: **Antigravity (Current Environment)**

**Rationale:**
1. **Already active** - We're using Antigravity now with full context of this conversation
2. **Artifact system** - Built-in task tracking, implementation plans, and walkthroughs
3. **Large context** - Can hold entire codebase understanding
4. **Browser testing** - Native browser subagent for UI verification
5. **File operations** - Direct file creation and editing with safety controls
6. **Cost-effective** - No additional subscription needed for this project

### Development Workflow Recommendation

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Loop                          │
├─────────────────────────────────────────────────────────────┤
│  1. PLANNING (Antigravity)                                  │
│     └─ Write docs, PRD, architecture                        │
│     └─ Create implementation plan                           │
│     └─ User reviews and approves                            │
│                                                             │
│  2. EXECUTION (Antigravity)                                 │
│     └─ Generate code scaffold                               │
│     └─ Implement features in chunks                         │
│     └─ Run local dev servers                                │
│                                                             │
│  3. VERIFICATION (Antigravity)                              │
│     └─ Run tests                                            │
│     └─ Browser automation for UI testing                    │
│     └─ Generate walkthrough                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Desktop Framework Comparison: Tauri vs Electron

### Technical Comparison

| Criteria | Tauri (Rust + WebView) | Electron (Node + Chromium) |
|----------|------------------------|---------------------------|
| **Binary Size** | ~3-10 MB | ~150-200 MB |
| **Memory Usage** | ~30-60 MB | ~100-300 MB |
| **Startup Time** | ~100-300ms | ~500ms-2s |
| **Security Model** | Strict CSP, allowlist APIs | Full Node access by default |
| **File System Access** | Granular permissions | Full access |
| **Native APIs** | Rust plugins, IPC | Node.js native modules |
| **Auto-update** | Built-in updater | electron-updater |
| **Tray Support** | Native | Native |
| **Notifications** | Native OS | Native OS |
| **Learning Curve** | Moderate (Rust optional) | Low (JS/TS only) |
| **Cross-platform** | Windows, macOS, Linux | Windows, macOS, Linux |
| **Maturity** | v1.5+ (stable) | v28+ (very mature) |

### Security Analysis (Critical for File Operations)

**Tauri Advantages:**
- **Allowlist model**: Only explicitly enabled APIs are accessible
- **IPC security**: Frontend cannot directly call system APIs
- **No Node.js in renderer**: Eliminates class of XSS → RCE attacks
- **Smaller attack surface**: Less bundled code
- **Rust memory safety**: No buffer overflows

**Electron Risks:**
- `nodeIntegration` must be explicitly disabled
- `contextIsolation` must be explicitly enabled
- Larger attack surface due to bundled Chromium
- More CVEs historically

### Recommendation: **Tauri**

**Rationale:**
1. **Security-first** - Aligns with non-negotiables (safety, auditability)
2. **Minimal binary** - Better for bootstrapped startup (user downloads)
3. **Memory footprint** - Desktop agent should be lightweight
4. **Granular permissions** - Can expose only file APIs within root folder
5. **Rust backend** - Can implement file indexer/watcher efficiently
6. **Active ecosystem** - Tauri v2 (stable) with good plugin support

**Trade-offs Accepted:**
- Slightly steeper learning curve for Rust components
- Smaller ecosystem than Electron (but sufficient for our needs)
- WebView differences across platforms (minor)

---

## 3. Database Choice

### Recommendation: **SQLite (Local) + Postgres (Cloud Sync)**

**Local-only mode:** SQLite via Prisma
- Zero configuration
- Single file database
- Perfect for desktop agent
- Bundled with Tauri easily

**Sync mode:** Postgres (Supabase free tier)
- Generous free tier (500MB, 50K MAU)
- Built-in auth if needed
- Row-level security compatible

---

## 4. Summary of Technical Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Dev Assistant | Antigravity | Already active, full agentic support |
| Desktop Framework | Tauri | Security, size, memory efficiency |
| Web Framework | Next.js 14 (App Router) | Modern RSC, API routes, TypeScript |
| Database ORM | Prisma | Type-safe, SQLite + Postgres support |
| Auth | NextAuth.js v5 | RBAC-friendly, credential provider |
| Monorepo | pnpm + Turborepo | Fast, workspace support |
| Package Manager | pnpm | Disk efficient, strict |
| Voice Transcription | Whisper.cpp (local) | Privacy-first, no cloud required |
| Notifications | Native OS APIs | Tauri native, web push for portal |

---

## Appendix: Risk Mitigation

### Tauri Risks
| Risk | Mitigation |
|------|------------|
| WebView inconsistencies | Test on Windows primarily (target platform) |
| Rust learning curve | Minimal Rust needed; use JS for frontend |
| Plugin ecosystem gaps | Core plugins sufficient; can write Rust if needed |

### Approval
- [ ] Josh approves technical decisions
- [ ] Ready to proceed to PRD
