import { prisma } from '@/lib/prisma';
import { KanbanBoard, KanbanTask } from '@/components/kanban';

export default async function TasksPage() {

    const tasks = await prisma.task.findMany({
        include: {
            project: true,
            assignee: true,
        },
        orderBy: [
            { status: 'asc' },
            { dueDate: 'asc' },
            { priority: 'desc' },
        ],
    });

    // Transform to KanbanTask format
    const kanbanTasks: KanbanTask[] = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectName: task.project.name,
        assigneeName: task.assignee?.name,
    }));

    return (
        <div className="space-y-6 animate-fade-in h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tasks</h1>
                    <p className="text-gray-400 mt-1">
                        Drag and drop to reorganize • {tasks.length} total tasks
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary text-sm min-h-touch">
                        <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter
                    </button>
                </div>
            </div>

            {/* Drag-and-drop Kanban Board */}
            <div className="flex-1 -mx-4 md:mx-0">
                <KanbanBoard initialTasks={kanbanTasks} />
            </div>
        </div>
    );
}

