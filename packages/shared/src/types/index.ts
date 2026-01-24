// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
}

export interface Role {
    id: string;
    name: string;
    description: string | null;
    permissions: Permission[];
}

export interface Permission {
    id: string;
    code: string;
    name: string;
    description: string | null;
    category: string;
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    template: string | null;
    startDate: Date | null;
    dueDate: Date | null;
    completedAt: Date | null;
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectWithTasks extends Project {
    tasks: Task[];
    progress: {
        total: number;
        completed: number;
        percentage: number;
    };
}

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string | null;
    taskTemplates: TaskTemplate[];
}

export interface TaskTemplate {
    id: string;
    title: string;
    description: string | null;
    defaultDuration: number;
    sortOrder: number;
    defaultAssignee: string | null;
    dependsOn: string[];
}

// ============================================================================
// TASK TYPES
// ============================================================================

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: number;
    projectId: string;
    assigneeId: string | null;
    assignee?: User | null;
    creatorId: string;
    dueDate: Date | null;
    startDate: Date | null;
    completedAt: Date | null;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface TaskWithDependencies extends Task {
    blockedBy: Task[];
    blocks: Task[];
    files: FileAttachment[];
}

export interface TaskDependency {
    id: string;
    blockedTaskId: string;
    blockingTaskId: string;
}

// ============================================================================
// FILE TYPES
// ============================================================================

export interface FileAttachment {
    id: string;
    localPath: string | null;
    externalUrl: string | null;
    filename: string;
    mimeType: string | null;
    sizeBytes: number | null;
    projectId: string | null;
    taskId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface FileIndex {
    id: string;
    path: string;
    filename: string;
    extension: string | null;
    sizeBytes: bigint;
    modifiedAt: Date;
    indexedAt: Date;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType =
    | 'TASK_ASSIGNED'
    | 'TASK_DUE_SOON'
    | 'TASK_OVERDUE'
    | 'PROJECT_CREATED'
    | 'BOTTLENECK_DETECTED'
    | 'FILE_OPERATION_COMPLETE'
    | 'SYSTEM';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    entityType: string | null;
    entityId: string | null;
    userId: string;
    createdAt: Date;
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

export type AuditEventType =
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILURE'
    | 'LOGOUT'
    | 'PERMISSION_DENIED'
    | 'PROJECT_CREATE'
    | 'PROJECT_UPDATE'
    | 'PROJECT_DELETE'
    | 'TASK_CREATE'
    | 'TASK_UPDATE'
    | 'TASK_DELETE'
    | 'TASK_STATUS_CHANGE'
    | 'FILE_ATTACH'
    | 'FILE_DETACH'
    | 'FILE_MOVE'
    | 'FILE_RENAME'
    | 'FILE_DELETE'
    | 'ROLE_UPDATE'
    | 'USER_CREATE'
    | 'USER_UPDATE'
    | 'SETTINGS_CHANGE'
    | 'VOICE_COMMAND'
    | 'SYNC_PUSH'
    | 'SYNC_PULL';

export type AuditEventSource = 'web-portal' | 'desktop-agent' | 'system';

export interface AuditLog {
    id: string;
    timestamp: Date;
    eventType: AuditEventType;
    eventSource: AuditEventSource;
    userId: string | null;
    details: Record<string, unknown>;
    entityType: string | null;
    entityId: string | null;
    checksum: string | null;
}

// ============================================================================
// RECOMMENDATION TYPES
// ============================================================================

export interface TaskWithReason extends Task {
    reason: string;
    priorityScore: number;
}

export type BottleneckSeverity = 'low' | 'medium' | 'high';

export interface BottleneckWarning {
    task: Task;
    blockedTasksCount: number;
    severity: BottleneckSeverity;
    message: string;
}

export interface RecommendedAction {
    action: string;
    taskId: string | null;
    reason: string;
}

export interface TodayRecommendations {
    priorities: TaskWithReason[];
    bottlenecks: BottleneckWarning[];
    nextActions: RecommendedAction[];
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T> {
    data: T;
    error?: never;
}

export interface ApiError {
    data?: never;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
}

// ============================================================================
// SYNC TYPES
// ============================================================================

export interface SyncPullResponse {
    projects: Project[];
    tasks: Task[];
    serverTime: Date;
}

export interface SyncPushRequest {
    tasks: Partial<Task>[];
    fileOperations: FileOperation[];
}

export interface FileOperation {
    type: 'CREATE' | 'MOVE' | 'RENAME' | 'DELETE';
    path: string;
    newPath?: string;
    approved: boolean;
    executedAt?: Date;
}

// ============================================================================
// PERMISSION CODES
// ============================================================================

export const PERMISSION_CODES = {
    // Projects
    PROJECTS_VIEW: 'projects.view',
    PROJECTS_CREATE: 'projects.create',
    PROJECTS_EDIT: 'projects.edit',
    PROJECTS_DELETE: 'projects.delete',

    // Tasks
    TASKS_VIEW: 'tasks.view',
    TASKS_CREATE: 'tasks.create',
    TASKS_EDIT: 'tasks.edit',
    TASKS_DELETE: 'tasks.delete',
    TASKS_ASSIGN: 'tasks.assign',

    // Files
    FILES_VIEW: 'files.view',
    FILES_ATTACH: 'files.attach',
    FILES_APPROVE_OPS: 'files.approveOps',

    // Admin
    ADMIN_VIEW_USERS: 'admin.viewUsers',
    ADMIN_CREATE_USERS: 'admin.createUsers',
    ADMIN_EDIT_USERS: 'admin.editUsers',
    ADMIN_MANAGE_ROLES: 'admin.manageRoles',

    // Audit
    AUDIT_VIEW: 'audit.view',
} as const;

export type PermissionCode = (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];
