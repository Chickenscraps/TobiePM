import type { AuditEventType, AuditEventSource, AuditLog } from '@tobie/shared';
import { generateAuditChecksum } from '@tobie/shared';

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export interface AuditEventInput {
    eventType: AuditEventType;
    eventSource: AuditEventSource;
    userId?: string | null;
    details: Record<string, unknown>;
    entityType?: string | null;
    entityId?: string | null;
}

export interface AuditLogEntry extends AuditEventInput {
    id: string;
    timestamp: Date;
    checksum: string;
}

// ============================================================================
// AUDIT LOGGER INTERFACE
// ============================================================================

export interface AuditLogger {
    log(event: AuditEventInput): Promise<AuditLogEntry>;
    query(filter: AuditQueryFilter): Promise<AuditLog[]>;
}

export interface AuditQueryFilter {
    eventType?: AuditEventType;
    eventSource?: AuditEventSource;
    userId?: string;
    entityType?: string;
    entityId?: string;
    from?: Date;
    to?: Date;
    limit?: number;
    offset?: number;
}

// ============================================================================
// IN-MEMORY AUDIT LOGGER (for testing/desktop)
// ============================================================================

export class InMemoryAuditLogger implements AuditLogger {
    private logs: AuditLogEntry[] = [];
    private idCounter = 0;

    async log(event: AuditEventInput): Promise<AuditLogEntry> {
        const timestamp = new Date();
        const id = `audit_${++this.idCounter}`;
        const checksum = generateAuditChecksum(
            timestamp,
            event.eventType,
            event.userId || null,
            event.details
        );

        const entry: AuditLogEntry = {
            id,
            timestamp,
            checksum,
            eventType: event.eventType,
            eventSource: event.eventSource,
            userId: event.userId || null,
            details: event.details,
            entityType: event.entityType || null,
            entityId: event.entityId || null,
        };

        // Append-only: only push, never modify or delete
        this.logs.push(entry);

        return entry;
    }

    async query(filter: AuditQueryFilter): Promise<AuditLog[]> {
        let results = [...this.logs];

        if (filter.eventType) {
            results = results.filter((l) => l.eventType === filter.eventType);
        }

        if (filter.eventSource) {
            results = results.filter((l) => l.eventSource === filter.eventSource);
        }

        if (filter.userId) {
            results = results.filter((l) => l.userId === filter.userId);
        }

        if (filter.entityType) {
            results = results.filter((l) => l.entityType === filter.entityType);
        }

        if (filter.entityId) {
            results = results.filter((l) => l.entityId === filter.entityId);
        }

        if (filter.from) {
            results = results.filter((l) => l.timestamp >= filter.from!);
        }

        if (filter.to) {
            results = results.filter((l) => l.timestamp <= filter.to!);
        }

        // Sort by timestamp descending (newest first)
        results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Apply pagination
        const offset = filter.offset || 0;
        const limit = filter.limit || 50;
        results = results.slice(offset, offset + limit);

        return results as AuditLog[];
    }

    // Export logs for backup
    async exportLogs(): Promise<string> {
        return JSON.stringify(this.logs, null, 2);
    }

    // Get log count
    get count(): number {
        return this.logs.length;
    }
}

// ============================================================================
// FILE-BASED AUDIT LOGGER (for desktop agent)
// ============================================================================

import { appendFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class FileAuditLogger implements AuditLogger {
    private filePath: string;
    private idCounter = 0;

    constructor(logDirectory: string) {
        // Ensure directory exists
        if (!existsSync(logDirectory)) {
            mkdirSync(logDirectory, { recursive: true });
        }

        // Create log file with date
        const date = new Date().toISOString().split('T')[0];
        this.filePath = join(logDirectory, `audit-${date}.jsonl`);

        // Load existing ID counter
        if (existsSync(this.filePath)) {
            const lines = readFileSync(this.filePath, 'utf-8').trim().split('\n');
            this.idCounter = lines.length;
        }
    }

    async log(event: AuditEventInput): Promise<AuditLogEntry> {
        const timestamp = new Date();
        const id = `audit_${++this.idCounter}`;
        const checksum = generateAuditChecksum(
            timestamp,
            event.eventType,
            event.userId || null,
            event.details
        );

        const entry: AuditLogEntry = {
            id,
            timestamp,
            checksum,
            eventType: event.eventType,
            eventSource: event.eventSource,
            userId: event.userId || null,
            details: event.details,
            entityType: event.entityType || null,
            entityId: event.entityId || null,
        };

        // Append to file (one JSON object per line - JSONL format)
        appendFileSync(this.filePath, JSON.stringify(entry) + '\n');

        return entry;
    }

    async query(filter: AuditQueryFilter): Promise<AuditLog[]> {
        if (!existsSync(this.filePath)) {
            return [];
        }

        const content = readFileSync(this.filePath, 'utf-8');
        const lines = content.trim().split('\n').filter(Boolean);

        let results: AuditLogEntry[] = lines.map((line) => {
            const parsed = JSON.parse(line);
            return {
                ...parsed,
                timestamp: new Date(parsed.timestamp),
            };
        });

        // Apply filters (same as InMemoryAuditLogger)
        if (filter.eventType) {
            results = results.filter((l) => l.eventType === filter.eventType);
        }

        if (filter.eventSource) {
            results = results.filter((l) => l.eventSource === filter.eventSource);
        }

        if (filter.userId) {
            results = results.filter((l) => l.userId === filter.userId);
        }

        if (filter.from) {
            results = results.filter((l) => l.timestamp >= filter.from!);
        }

        if (filter.to) {
            results = results.filter((l) => l.timestamp <= filter.to!);
        }

        // Sort newest first
        results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Paginate
        const offset = filter.offset || 0;
        const limit = filter.limit || 50;

        return results.slice(offset, offset + limit) as AuditLog[];
    }
}

// ============================================================================
// AUDIT EVENT HELPERS
// ============================================================================

export function createLoginSuccessEvent(
    userId: string,
    source: AuditEventSource = 'web-portal'
): AuditEventInput {
    return {
        eventType: 'LOGIN_SUCCESS',
        eventSource: source,
        userId,
        details: { action: 'User logged in successfully' },
    };
}

export function createLoginFailureEvent(
    email: string,
    reason: string,
    source: AuditEventSource = 'web-portal'
): AuditEventInput {
    return {
        eventType: 'LOGIN_FAILURE',
        eventSource: source,
        userId: null,
        details: { email, reason },
    };
}

export function createPermissionDeniedEvent(
    userId: string,
    permission: string,
    resource: string,
    source: AuditEventSource = 'web-portal'
): AuditEventInput {
    return {
        eventType: 'PERMISSION_DENIED',
        eventSource: source,
        userId,
        details: { permission, resource },
    };
}

export function createFileOperationEvent(
    eventType: 'FILE_MOVE' | 'FILE_RENAME' | 'FILE_DELETE',
    userId: string,
    details: {
        from: string;
        to?: string;
        approved: boolean;
        dryRun: boolean;
    },
    source: AuditEventSource = 'desktop-agent'
): AuditEventInput {
    return {
        eventType,
        eventSource: source,
        userId,
        details,
    };
}

export function createVoiceCommandEvent(
    userId: string,
    command: string,
    recognized: boolean,
    action?: string
): AuditEventInput {
    return {
        eventType: 'VOICE_COMMAND',
        eventSource: 'desktop-agent',
        userId,
        details: { command, recognized, action },
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { AuditLog, AuditEventType, AuditEventSource };
