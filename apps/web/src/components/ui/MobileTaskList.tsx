/**
 * Mobile Task List Component
 * 
 * Client component that wraps TaskCard with swipe handlers
 * for server-sent task data. Uses API calls to update status.
 */

'use client';

import { TaskCard, TaskCardProps } from '@/components/ui';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface MobileTaskListProps {
    tasks: Omit<TaskCardProps, 'onStatusChange' | 'onEdit'>[];
}

export function MobileTaskList({ tasks: initialTasks }: MobileTaskListProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleStatusChange = async (id: string, newStatus: string) => {
        // Optimistic update
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, status: newStatus as TaskCardProps['status'] } : t
        ));

        try {
            const response = await fetch(`/api/tasks/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                // Revert on error
                setTasks(initialTasks);
            } else {
                // Refresh to get latest data
                startTransition(() => {
                    router.refresh();
                });
            }
        } catch (error) {
            console.error('Failed to update task status:', error);
            setTasks(initialTasks);
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/tasks/${id}/edit`);
    };

    return (
        <div className={`space-y-2 ${isPending ? 'opacity-70' : ''} transition-opacity`}>
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    {...task}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEdit}
                />
            ))}
            {tasks.length === 0 && (
                <p className="text-gray-500 text-center py-8">No tasks to display</p>
            )}
        </div>
    );
}
