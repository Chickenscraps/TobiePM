# Configuration Guide: Tobie Command Center

**Version:** 1.0  
**Date:** January 22, 2026

---

## Environment Variables

### Web Portal (.env.local)

Create `apps/web/.env.local` with:

```bash
# Database
DATABASE_URL="file:./dev.db"                    # SQLite for local dev
# DATABASE_URL="postgresql://..."               # Postgres for production

# NextAuth
NEXTAUTH_SECRET="your-32-char-random-secret"   # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"            # Your app URL

# Optional: External services (disabled by default)
# WHISPER_API_KEY=""                            # Only if using cloud Whisper
# SUPABASE_URL=""                               # Only in sync mode
# SUPABASE_ANON_KEY=""                          # Only in sync mode
```

### Desktop Agent (config.json)

Located at: `%APPDATA%\tobie-desktop\config.json`

```json
{
  "rootFolder": "C:\\Tobie",
  "syncMode": false,
  "portalUrl": "http://localhost:3000",
  "notifications": {
    "enabled": true,
    "dueSoonHours": 2,
    "maxPerHour": 5
  },
  "voice": {
    "enabled": true,
    "hotkey": "Ctrl+Shift+T",
    "engine": "local"
  },
  "fileOperations": {
    "alwaysDryRun": true,
    "trashInsteadOfDelete": true
  }
}
```

---

## Default Users (Seed Data)

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| josh@tobie.team | TobieAdmin2026! | Admin | All permissions |
| ann@tobie.team | TobieDesigner2026! | Designer | View projects, edit tasks, view files |

**Change these passwords immediately after first login!**

---

## Default Permissions

### Admin Role
- ✅ All permissions granted

### Designer Role
| Category | Permission | Granted |
|----------|------------|---------|
| Projects | View | ✅ |
| Projects | Create | ❌ |
| Projects | Edit | ❌ |
| Projects | Delete | ❌ |
| Tasks | View | ✅ |
| Tasks | Create | ✅ |
| Tasks | Edit | ✅ |
| Tasks | Delete | ❌ |
| Files | View | ✅ |
| Files | Attach | ✅ |
| Files | Approve Ops | ❌ |
| Admin | View Users | ❌ |
| Admin | Manage Roles | ❌ |
| Audit | View Logs | ❌ |

---

## Project Template: Benefits Video

Auto-generates these tasks when creating a new project:

| Order | Task | Default Assignee | Duration | Dependencies |
|-------|------|-----------------|----------|--------------|
| 1 | Script Drafting | Admin | 2 days | - |
| 2 | Script Approval | Admin | 1 day | Task 1 |
| 3 | Storyboard/Layout | Designer | 3 days | Task 2 |
| 4 | Motion Graphics | Designer | 5 days | Task 3 |
| 5 | Rendering | System | 1 day | Task 4 |
| 6 | QA Review | Admin | 1 day | Task 5 |
| 7 | Client Delivery | Admin | 1 day | Task 6 |

---

## Security Defaults

| Setting | Default | Notes |
|---------|---------|-------|
| Sync mode | OFF | Data stays local |
| Cloud Whisper | OFF | Uses local transcription |
| File operations | Dry-run required | Cannot skip preview |
| Audit logging | ON (always) | Cannot disable |
| Session expiry | 24 hours | Re-login required |
| Rate limiting | 5 failed logins | 15-minute lockout |

---

## Notification Defaults

| Event | Desktop | Portal | Email |
|-------|---------|--------|-------|
| Task assigned to me | ✅ | ✅ | ❌ |
| Task due in 2 hours | ✅ | ✅ | ❌ |
| Task overdue | ✅ | ✅ | ❌ |
| Bottleneck detected | ❌ | ✅ | ❌ |
| File operation complete | ✅ | ❌ | ❌ |
| New project created | ❌ | ✅ | ❌ |

---

## Voice Command Grammar

Supported commands (case-insensitive):

```
add task <title>
add task <title> due <date>
mark <task-title> done
mark <task-title> complete
mark task <task-title> done
set due date <task-title> <date>
show today
show today's tasks
what's next
```

Date formats accepted:
- "Friday", "next Monday"
- "January 25", "Jan 25"
- "in 3 days", "tomorrow"

---

## Audit Log Retention

| Environment | Retention | Storage |
|-------------|-----------|---------|
| Local | Forever | SQLite |
| Production | 90 days active, archived | Postgres + S3 |

---

## Port Configuration

| Service | Default Port | Environment Variable |
|---------|--------------|---------------------|
| Web Portal | 3000 | PORT |
| API Routes | 3000/api | - |
| Tauri Dev Server | 1420 | VITE_PORT |

---

## Build Outputs

| Platform | Output Location | Size |
|----------|-----------------|------|
| Web | apps/web/.next | ~50 MB |
| Desktop | apps/desktop/src-tauri/target/release | ~8 MB |
| Windows Installer | apps/desktop/src-tauri/target/release/bundle/msi | ~12 MB |

---

## Troubleshooting

### Common Issues

**"EPERM: operation not permitted" on Windows**
→ Run terminal as Administrator for first install

**"prisma schema not found"**
→ Run from apps/web directory: `npx prisma generate`

**Tauri build fails with Rust error**
→ Update Rust: `rustup update stable`

**Voice commands not working**
→ Check microphone permissions in Windows Settings

### Log Locations

| Component | Log Path |
|-----------|----------|
| Web (dev) | Console output |
| Web (prod) | Vercel logs |
| Desktop | %APPDATA%\tobie-desktop\logs\ |
| Audit | Database (AuditLog table) |

---

## Support

- Tobie Team: josh@tobie.team
- GitHub Issues: [repository URL]
