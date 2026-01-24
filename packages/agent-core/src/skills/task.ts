import { Tool } from '../agent/orchestrator';

export const createTaskSkill = (context: { db: any; audit: any; userId?: string }): Tool => ({
    name: 'create_task',
    description: 'Create a new task in the project',
    parameters: {
        type: 'object',
        properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            projectId: { type: 'string' },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
            dueDate: { type: 'string', description: 'ISO date string' }
        },
        required: ['title', 'projectId']
    },
    execute: async ({ title, description, projectId, priority, dueDate }) => {
        console.log(`[Skill] Creating task: ${title} in project ${projectId}`);

        try {
            // Real Database Write
            const task = await context.db.task.create({
                data: {
                    title,
                    description,
                    projectId,
                    status: 'TODO',
                    priority: priority === 'URGENT' ? 100 : priority === 'HIGH' ? 80 : 0,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    creatorId: context.userId || 'ai-agent', // specific creator if known
                }
            });

            // Audit Logging
            if (context.audit) {
                await context.audit.log({
                    eventType: 'TASK_CREATED',
                    eventSource: 'ai-agent',
                    userId: context.userId,
                    details: { taskId: task.id, title, projectId },
                    entityType: 'task',
                    entityId: task.id
                });
            }

            return {
                id: task.id,
                title: task.title,
                status: task.status,
                message: `Task "${title}" created successfully.`
            };
        } catch (error: any) {
            console.error('[Skill] Error creating task:', error);
            return { error: `Failed to create task: ${error.message}` };
        }
    }
});

export const listTasksSkill = (context: { db: any }): Tool => ({
    name: 'list_tasks',
    description: 'List tasks for a project',
    parameters: {
        type: 'object',
        properties: {
            projectId: { type: 'string' },
            status: { type: 'string' }
        },
        required: ['projectId']
    },
    execute: async ({ projectId, status }) => {
        console.log(`[Skill] Listing tasks for project ${projectId}`);
        try {
            const where: any = { projectId };
            if (status) where.status = status;

            const tasks = await context.db.task.findMany({
                where,
                take: 10,
                orderBy: { updatedAt: 'desc' },
                select: { id: true, title: true, status: true, priority: true, dueDate: true }
            });

            return tasks;
        } catch (error: any) {
            console.error('[Skill] Error listing tasks:', error);
            return { error: `Failed to list tasks: ${error.message}` };
        }
    }
});
