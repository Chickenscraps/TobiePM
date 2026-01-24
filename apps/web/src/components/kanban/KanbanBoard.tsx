/**
 * Kanban Board Component
 * 
 * Drag-and-drop task board using @dnd-kit
 * Features:
 * - Drag tasks between columns
 * - Reorder within columns
 * - Touch-friendly
 * - Optimistic updates
 */

'use client';

import { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';

// Types
export interface KanbanTask {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: number;
    dueDate?: Date | null;
    projectName?: string;
    assigneeName?: string;
}

interface KanbanBoardProps {
    initialTasks: KanbanTask[];
}

const COLUMNS = [
    { id: 'TODO', title: 'To Do', color: 'bg-gray-500' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'REVIEW', title: 'Review', color: 'bg-amber-500' },
    { id: 'DONE', title: 'Done', color: 'bg-green-500' },
] as const;

export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
    const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
    const router = useRouter();

    // Touch-friendly sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 8 },
        })
    );

    const tasksByColumn = COLUMNS.reduce((acc, col) => {
        acc[col.id] = tasks.filter(t => t.status === col.id);
        return acc;
    }, {} as Record<string, KanbanTask[]>);

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id);
        if (task) setActiveTask(task);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find which column we're over
        const overColumn = COLUMNS.find(c => c.id === overId);
        if (overColumn) {
            // Dropped on column header
            setTasks(prev => prev.map(t =>
                t.id === activeId ? { ...t, status: overColumn.id } : t
            ));
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // Check if dropped on another task
        const overTask = tasks.find(t => t.id === overId);
        if (overTask && activeTask.status === overTask.status) {
            // Reorder within same column
            const columnTasks = tasksByColumn[activeTask.status] || [];
            const oldIndex = columnTasks.findIndex(t => t.id === activeId);
            const newIndex = columnTasks.findIndex(t => t.id === overId);

            if (oldIndex !== newIndex) {
                const reordered = arrayMove(columnTasks, oldIndex, newIndex);
                setTasks(prev => {
                    const otherTasks = prev.filter(t => t.status !== activeTask.status);
                    return [...otherTasks, ...reordered];
                });
            }
        } else if (overTask && activeTask.status !== overTask.status) {
            // Moved to different column
            const newStatus = overTask.status;
            setTasks(prev => prev.map(t =>
                t.id === activeId ? { ...t, status: newStatus } : t
            ));

            // Update via API
            await updateTaskStatus(activeId, newStatus);
        }

        // Check if dropped on column
        const overColumn = COLUMNS.find(c => c.id === overId);
        if (overColumn && activeTask.status !== overColumn.id) {
            setTasks(prev => prev.map(t =>
                t.id === activeId ? { ...t, status: overColumn.id } : t
            ));
            await updateTaskStatus(activeId, overColumn.id);
        }
    };

    const updateTaskStatus = async (taskId: string, status: string) => {
        try {
            await fetch(`/api/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            router.refresh();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 h-full">
                {COLUMNS.map(column => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        color={column.color}
                        tasks={tasksByColumn[column.id] || []}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask && <TaskCard task={activeTask} isDragging />}
            </DragOverlay>
        </DndContext>
    );
}

// Column component
function KanbanColumn({
    id,
    title,
    color,
    tasks,
}: {
    id: string;
    title: string;
    color: string;
    tasks: KanbanTask[];
}) {
    const { setNodeRef } = useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            className="flex-shrink-0 w-72 md:w-80 flex flex-col bg-white/5 rounded-xl p-3"
        >
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-4 px-1">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <h2 className="font-semibold text-white">{title}</h2>
                <span className="text-sm text-gray-500 ml-auto">{tasks.length}</span>
            </div>

            {/* Tasks */}
            <SortableContext
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 space-y-2 min-h-[100px]">
                    {tasks.map(task => (
                        <SortableTaskCard key={task.id} task={task} />
                    ))}
                    {tasks.length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm border-2 border-dashed border-white/10 rounded-lg">
                            Drop tasks here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

// Sortable task card wrapper
function SortableTaskCard({ task }: { task: KanbanTask }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} />
        </div>
    );
}

// Task card display
function TaskCard({ task, isDragging = false }: { task: KanbanTask; isDragging?: boolean }) {
    const priorityColor = task.priority >= 80 ? 'border-l-red-500' :
        task.priority >= 50 ? 'border-l-amber-500' :
            'border-l-gray-500';

    const formatDueDate = (date: Date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = d.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return { text: `${Math.abs(days)}d overdue`, urgent: true };
        if (days === 0) return { text: 'Today', urgent: true };
        if (days === 1) return { text: 'Tomorrow', urgent: false };
        return { text: `${days}d`, urgent: false };
    };

    const dueInfo = task.dueDate ? formatDueDate(new Date(task.dueDate)) : null;

    return (
        <div
            className={`
                p-3 rounded-lg bg-brand-dark/80 border-l-4 ${priorityColor}
                ${isDragging ? 'shadow-2xl scale-105 rotate-2' : 'hover:bg-white/10'}
                transition-all cursor-grab active:cursor-grabbing
                touch-manipulation min-h-touch
            `}
        >
            <h3 className="font-medium text-white text-sm leading-snug">{task.title}</h3>

            {task.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center justify-between mt-3 gap-2">
                {task.projectName && (
                    <span className="text-xs text-gray-500 truncate max-w-[120px]">
                        {task.projectName}
                    </span>
                )}
                <div className="flex items-center gap-2 ml-auto">
                    {dueInfo && (
                        <span className={`text-xs ${dueInfo.urgent ? 'text-red-400' : 'text-gray-400'}`}>
                            {dueInfo.text}
                        </span>
                    )}
                    {task.assigneeName && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                                {task.assigneeName.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
