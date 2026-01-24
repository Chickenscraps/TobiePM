# Threat Model: Tobie Command Center

**Version:** 1.0  
**Date:** January 22, 2026  
**Security Lead:** Josh  

---

## 1. Overview

This document identifies security threats to the Tobie Command Center system and defines mitigations. The system has two attack surfaces:
1. **Web Portal** - Cloud-hosted, internet-accessible
2. **Desktop Agent** - Local application with file system access

---

## 2. Assets to Protect

| Asset | Sensitivity | Impact if Compromised |
|-------|-------------|----------------------|
| User credentials | High | Account takeover |
| Session tokens | High | Session hijacking |
| Project data | Medium | Business data exposure |
| File paths | Medium | Information disclosure |
| File contents | High | Intellectual property theft |
| Audit logs | High | Evidence tampering |
| Voice recordings | Medium | Privacy violation |

---

## 3. Threat Actors

| Actor | Motivation | Capability |
|-------|------------|------------|
| External attacker | Data theft, ransomware | Medium-High |
| Malicious insider | Data theft, sabotage | High (legitimate access) |
| Compromised dependency | Supply chain attack | High |
| Malicious file | Exploit via crafted filename | Low-Medium |

---

## 4. Threats & Mitigations

### 4.1 Authentication & Authorization

#### T-01: Credential Stuffing / Brute Force
**Risk:** HIGH  
**Attack:** Automated login attempts with leaked credentials

**Mitigations:**
- [ ] Rate limiting: 5 failed attempts → 15-minute lockout
- [ ] bcrypt password hashing (cost factor 12)
- [ ] Account lockout notification via audit log
- [ ] Future: MFA support

#### T-02: Session Hijacking
**Risk:** MEDIUM  
**Attack:** Stealing session cookie via XSS or network sniffing

**Mitigations:**
- [ ] httpOnly cookies (no JS access)
- [ ] Secure flag (HTTPS only)
- [ ] SameSite=Strict
- [ ] Short session expiry (24 hours)
- [ ] Session invalidation on password change

#### T-03: RBAC Bypass
**Risk:** HIGH  
**Attack:** Unprivileged user accessing admin functions

**Mitigations:**
- [ ] Server-side permission checks on ALL API routes
- [ ] Permission denied returns 403, not 404 (no enumeration)
- [ ] Unit tests for RBAC on every protected endpoint
- [ ] Audit log of permission denial attempts

```typescript
// Example: Middleware pattern
export async function requirePermission(permission: Permission) {
  return async (req: Request) => {
    const user = await getUser(req);
    if (!hasPermission(user, permission)) {
      await auditLog('PERMISSION_DENIED', { user, permission });
      throw new ForbiddenError();
    }
  };
}
```

### 4.2 Prompt Injection (Voice Commands)

#### T-04: Malicious Voice Command Injection
**Risk:** MEDIUM  
**Attack:** User (or ambient audio) issues destructive command

**Mitigations:**
- [ ] Strict command grammar (only predefined commands)
- [ ] No arbitrary code execution from voice
- [ ] File operations ALWAYS require UI confirmation
- [ ] Voice-initiated actions logged with `source: voice`

**Safe Grammar (Allowlist):**
```
add task <title> [due <date>]
mark <task> done
show today
show project <name>
```

**Rejected:**
```
delete all files        → NOT RECOGNIZED
run command <x>         → NOT RECOGNIZED
<arbitrary text>        → NOT RECOGNIZED
```

### 4.3 File System Attacks

#### T-05: Path Traversal
**Risk:** CRITICAL  
**Attack:** Agent manipulated to access files outside root folder

**Mitigations:**
- [ ] Tauri allowlist: ONLY configured root folder
- [ ] Path canonicalization before any operation
- [ ] Reject paths containing `..`, absolute paths outside root
- [ ] Rust-level validation (not just JS)

```rust
// Example: Path validation
fn validate_path(path: &Path, root: &Path) -> Result<PathBuf, Error> {
    let canonical = path.canonicalize()?;
    if !canonical.starts_with(root) {
        return Err(Error::PathTraversalAttempt);
    }
    Ok(canonical)
}
```

#### T-06: Malicious Filename Exploitation
**Risk:** MEDIUM  
**Attack:** Crafted filenames with special characters causing issues

**Mitigations:**
- [ ] Sanitize filenames before display (HTML escape)
- [ ] Reject control characters in filenames
- [ ] Use parameterized queries (no SQL injection via filename)
- [ ] No shell execution with user-provided filenames

#### T-07: Unauthorized File Operations
**Risk:** HIGH  
**Attack:** File moved/deleted without user consent

**Mitigations:**
- [ ] DRY-RUN MANDATORY before any destructive operation
- [ ] User must click "Approve" in UI
- [ ] Append-only audit log of all operations
- [ ] Undo capability (move to trash, not hard delete)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FILE OPERATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Agent proposes operation                                     │
│           │                                                      │
│           ▼                                                      │
│  2. DRY-RUN executes (no actual changes)                        │
│           │                                                      │
│           ▼                                                      │
│  3. User sees preview in UI                                     │
│           │                                                      │
│           ▼                                                      │
│  4. User clicks APPROVE or REJECT                               │
│           │                                                      │
│      ┌────┴────┐                                                 │
│      ▼         ▼                                                 │
│  APPROVED   REJECTED                                             │
│      │         │                                                 │
│      ▼         ▼                                                 │
│  Execute    Log rejection                                        │
│  + Log                                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Data Exfiltration

#### T-08: File Contents Sent to Cloud
**Risk:** HIGH  
**Attack:** Sensitive file contents uploaded without consent

**Mitigations:**
- [ ] Default mode: LOCAL-ONLY (no cloud sync)
- [ ] Sync mode: ONLY syncs metadata (paths, timestamps)
- [ ] File contents NEVER leave local machine
- [ ] External APIs (Whisper cloud) disabled by default
- [ ] Clear settings indicating what syncs

```typescript
// Sync payload - NEVER includes file contents
interface SyncPayload {
  tasks: Task[];         // OK
  projects: Project[];   // OK
  files: {
    path: string;        // OK - just the path
    size: number;        // OK - just metadata
    modifiedAt: Date;    // OK - just metadata
    // content: NEVER
  }[];
}
```

### 4.5 Supply Chain Attacks

#### T-09: Malicious npm/Cargo Dependency
**Risk:** MEDIUM  
**Attack:** Compromised package runs malicious code

**Mitigations:**
- [ ] Use pnpm (strict, no phantom dependencies)
- [ ] Lock files committed (pnpm-lock.yaml, Cargo.lock)
- [ ] Dependabot or Renovate for updates
- [ ] Audit before major version upgrades
- [ ] Minimal dependencies

### 4.6 Credential Leakage

#### T-10: Secrets in Source Control
**Risk:** HIGH  
**Attack:** API keys, passwords committed to git

**Mitigations:**
- [ ] `.env` files in `.gitignore`
- [ ] Use environment variables for secrets
- [ ] Pre-commit hook to scan for secrets
- [ ] Document required env vars in CONFIG.md
- [ ] Never log secrets

```
# .gitignore
.env
.env.local
.env.production
*.pem
*.key
```

### 4.7 Desktop Agent Specific

#### T-11: Malicious WebView Content
**Risk:** LOW (Tauri mitigates)  
**Attack:** XSS in WebView leads to system compromise

**Mitigations:**
- [ ] Tauri CSP (Content Security Policy)
- [ ] No `nodeIntegration` equivalent
- [ ] IPC allowlist (only defined commands)
- [ ] No `eval()` or dynamic code execution

#### T-12: Insecure IPC
**Risk:** MEDIUM  
**Attack:** Frontend sends malicious IPC commands

**Mitigations:**
- [ ] Validate all IPC inputs in Rust
- [ ] Type-safe command definitions
- [ ] No shell command execution
- [ ] Audit log IPC calls

---

## 5. Secure Defaults

| Setting | Default | User Can Change |
|---------|---------|-----------------|
| Cloud sync | OFF (local-only) | Yes, opt-in |
| External Whisper API | OFF | Yes, opt-in |
| File operations | Dry-run required | No (mandatory) |
| Audit logging | ON | No (always on) |
| Root folder access | User-configured only | Yes |
| Rate limiting | 5 attempts | No |
| Session expiry | 24 hours | No (security) |

---

## 6. Audit Log Requirements

**Append-only log format:**
```json
{
  "timestamp": "2026-01-22T14:30:00.000Z",
  "eventType": "FILE_MOVE",
  "userId": "josh",
  "source": "desktop-agent",
  "details": {
    "from": "C:\\Tobie\\Downloads\\file.psd",
    "to": "C:\\Tobie\\Projects\\Empire\\Assets\\file.psd",
    "approved": true,
    "dryRun": false
  },
  "checksum": "sha256:abc123..."
}
```

**Required events to log:**
- Login success/failure
- Permission denied
- File operation (proposed, approved, rejected, executed)
- Settings changes
- Voice commands received
- Sync operations
- Error conditions

**Log protection:**
- [ ] Append-only (no deletion)
- [ ] Checksums for integrity
- [ ] Separate storage from main database
- [ ] Rotation policy (archive after 90 days)

---

## 7. Security Testing Checklist

### Pre-release
- [ ] RBAC tests pass for all endpoints
- [ ] Path traversal tests (positive and negative)
- [ ] SQL injection tests
- [ ] XSS tests in web portal
- [ ] Rate limiting verified
- [ ] Session handling tested

### Periodic
- [ ] Dependency audit (`pnpm audit`, `cargo audit`)
- [ ] Review audit logs for anomalies
- [ ] Test backup/restore of audit logs

---

## Approval

- [ ] Josh reviews and approves Threat Model
- [ ] Security mitigations added to task backlog
