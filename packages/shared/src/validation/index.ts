import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const createUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').max(100),
    roleId: z.string().cuid('Invalid role ID'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    avatarUrl: z.string().url().nullable().optional(),
    password: z.string().min(8).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const assignRoleSchema = z.object({
    roleId: z.string().cuid('Invalid role ID'),
});

export type AssignRoleInput = z.infer<typeof assignRoleSchema>;

// ============================================================================
// ROLE SCHEMAS
// ============================================================================

export const createRoleSchema = z.object({
    name: z.string().min(1, 'Role name is required').max(50),
    description: z.string().max(255).nullable().optional(),
    permissionIds: z.array(z.string().cuid()).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRolePermissionsSchema = z.object({
    permissionIds: z.array(z.string().cuid()),
});

export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;

// ============================================================================
// PROJECT SCHEMAS
// ============================================================================

export const projectStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']);

export const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(100),
    description: z.string().max(1000).nullable().optional(),
    templateId: z.string().cuid().optional(),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).nullable().optional(),
    status: projectStatusSchema.optional(),
    startDate: z.coerce.date().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// ============================================================================
// TASK SCHEMAS
// ============================================================================

export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']);

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Task title is required').max(200),
    description: z.string().max(2000).nullable().optional(),
    projectId: z.string().cuid('Invalid project ID'),
    assigneeId: z.string().cuid().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    startDate: z.coerce.date().nullable().optional(),
    priority: z.number().int().min(0).max(100).optional(),
    blockedByTaskIds: z.array(z.string().cuid()).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).nullable().optional(),
    status: taskStatusSchema.optional(),
    assigneeId: z.string().cuid().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    startDate: z.coerce.date().nullable().optional(),
    priority: z.number().int().min(0).max(100).optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const updateTaskStatusSchema = z.object({
    status: taskStatusSchema,
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

export const reorderTasksSchema = z.object({
    taskId: z.string().cuid('Invalid task ID'),
    newStatus: taskStatusSchema,
    newSortOrder: z.number().int().min(0),
});

export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>;

// ============================================================================
// FILE SCHEMAS
// ============================================================================

export const createFileAttachmentSchema = z.object({
    filename: z.string().min(1, 'Filename is required').max(255),
    localPath: z.string().max(1000).nullable().optional(),
    externalUrl: z.string().url().nullable().optional(),
    mimeType: z.string().max(100).nullable().optional(),
    sizeBytes: z.number().int().positive().nullable().optional(),
    projectId: z.string().cuid().nullable().optional(),
    taskId: z.string().cuid().nullable().optional(),
}).refine(
    (data) => data.projectId || data.taskId,
    { message: 'Either projectId or taskId must be provided' }
);

export type CreateFileAttachmentInput = z.infer<typeof createFileAttachmentSchema>;

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================

export const markNotificationsReadSchema = z.object({
    notificationIds: z.array(z.string().cuid()).optional(),
    all: z.boolean().optional(),
}).refine(
    (data) => data.notificationIds || data.all,
    { message: 'Either notificationIds or all must be provided' }
);

export type MarkNotificationsReadInput = z.infer<typeof markNotificationsReadSchema>;

// ============================================================================
// SYNC SCHEMAS
// ============================================================================

export const syncPullSchema = z.object({
    lastSyncedAt: z.coerce.date().optional(),
});

export type SyncPullInput = z.infer<typeof syncPullSchema>;

export const fileOperationSchema = z.object({
    type: z.enum(['CREATE', 'MOVE', 'RENAME', 'DELETE']),
    path: z.string().min(1),
    newPath: z.string().optional(),
    approved: z.boolean(),
    executedAt: z.coerce.date().optional(),
});

export const syncPushSchema = z.object({
    tasks: z.array(updateTaskSchema.extend({ id: z.string().cuid() })).optional(),
    fileOperations: z.array(fileOperationSchema).optional(),
});

export type SyncPushInput = z.infer<typeof syncPushSchema>;

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const taskFilterSchema = z.object({
    projectId: z.string().cuid().optional(),
    assigneeId: z.string().cuid().optional(),
    status: taskStatusSchema.optional(),
    dueWithin: z.coerce.number().int().positive().optional(), // days
});

export type TaskFilterInput = z.infer<typeof taskFilterSchema>;

export const auditFilterSchema = z.object({
    eventType: z.string().optional(),
    userId: z.string().cuid().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    limit: z.coerce.number().int().min(1).max(200).default(50),
});

export type AuditFilterInput = z.infer<typeof auditFilterSchema>;
