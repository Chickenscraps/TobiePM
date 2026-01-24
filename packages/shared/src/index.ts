import type { PermissionCode, User } from './types';
import { PERMISSION_CODES } from './types';

// ============================================================================
// PERMISSION UTILITIES
// ============================================================================

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, permissionCode: PermissionCode): boolean {
    if (!user || !user.role) return false;
    return user.role.permissions.some((p) => p.code === permissionCode);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
    user: User | null,
    permissionCodes: PermissionCode[]
): boolean {
    if (!user || !user.role) return false;
    return permissionCodes.some((code) =>
        user.role.permissions.some((p) => p.code === code)
    );
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
    user: User | null,
    permissionCodes: PermissionCode[]
): boolean {
    if (!user || !user.role) return false;
    return permissionCodes.every((code) =>
        user.role.permissions.some((p) => p.code === code)
    );
}

/**
 * Check if a user is an admin (has role management permission)
 */
export function isAdmin(user: User | null): boolean {
    return hasPermission(user, PERMISSION_CODES.ADMIN_MANAGE_ROLES);
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get the number of days until a date
 */
export function daysUntil(date: Date | null): number | null {
    if (!date) return null;
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is overdue
 */
export function isOverdue(date: Date | null): boolean {
    if (!date) return false;
    return new Date() > date;
}

/**
 * Check if a date is due within N days
 */
export function isDueWithin(date: Date | null, days: number): boolean {
    if (!date) return false;
    const daysRemaining = daysUntil(date);
    return daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= days;
}

/**
 * Format a date as a relative string
 */
export function formatRelativeDate(date: Date | null): string {
    if (!date) return 'No date';

    const days = daysUntil(date);
    if (days === null) return 'No date';

    if (days < 0) {
        const absDays = Math.abs(days);
        return absDays === 1 ? 'Yesterday' : `${absDays} days overdue`;
    }
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `In ${days} days`;

    return date.toLocaleDateString();
}

/**
 * Add business days to a date
 */
export function addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let added = 0;

    while (added < days) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            added++;
        }
    }

    return result;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
}

/**
 * Slugify a string for URLs
 */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ============================================================================
// TASK STATUS UTILITIES
// ============================================================================

export const TASK_STATUS_ORDER = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'] as const;

export const TASK_STATUS_LABELS: Record<string, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    REVIEW: 'Review',
    DONE: 'Done',
    BLOCKED: 'Blocked',
};

export const TASK_STATUS_COLORS: Record<string, string> = {
    TODO: '#6b7280',      // gray
    IN_PROGRESS: '#3b82f6', // blue
    REVIEW: '#f59e0b',    // amber
    DONE: '#10b981',      // green
    BLOCKED: '#ef4444',   // red
};

// ============================================================================
// PROJECT STATUS UTILITIES
// ============================================================================

export const PROJECT_STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Active',
    PAUSED: 'Paused',
    COMPLETED: 'Completed',
    ARCHIVED: 'Archived',
};

export const PROJECT_STATUS_COLORS: Record<string, string> = {
    ACTIVE: '#10b981',    // green
    PAUSED: '#f59e0b',    // amber
    COMPLETED: '#6b7280', // gray
    ARCHIVED: '#9ca3af',  // light gray
};

// ============================================================================
// AUDIT UTILITIES
// ============================================================================

/**
 * Simple hash function for audit log integrity (works in browser and Node)
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Generate a checksum for audit log integrity
 */
export function generateAuditChecksum(
    timestamp: Date,
    eventType: string,
    userId: string | null,
    details: Record<string, unknown>
): string {
    const data = JSON.stringify({
        timestamp: timestamp.toISOString(),
        eventType,
        userId,
        details,
    });
    // Use simple hash - for production, use crypto.subtle in browser or crypto in Node
    return simpleHash(data);
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './types';
export * from './validation';
