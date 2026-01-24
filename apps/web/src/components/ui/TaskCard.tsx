/**
 * TaskCard Component
 * 
 * Mobile-first task card with:
 * - 48px+ touch targets
 * - Swipe left to complete
 * - Swipe right to edit  
 * - Long-press context menu
 * - Visual priority indicators
 */

'use client';

import { useState, useRef, TouchEvent } from 'react';

export interface TaskCardProps {
    id: string;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: Date | null;
    projectName?: string;
    assigneeName?: string;
    reason?: string; // For AI recommendations
    onStatusChange?: (id: string, status: string) => void;
    onEdit?: (id: string) => void;
}

const SWIPE_THRESHOLD = 80;

export function TaskCard({
    id,
    title,
    description,
    status,
    priority,
    dueDate,
    projectName,
    assigneeName,
    reason,
    onStatusChange,
    onEdit,
}: TaskCardProps) {
    const [swipeX, setSwipeX] = useState(0);
    const [isHeld, setIsHeld] = useState(false);
    const touchStartX = useRef(0);
    const touchStartTime = useRef(0);
    const holdTimer = useRef<NodeJS.Timeout | null>(null);

    // Touch handlers
    const handleTouchStart = (e: TouchEvent) => {
        touchStartX.current = e.touches[0]?.clientX ?? 0;
        touchStartTime.current = Date.now();

        // Long press detection
        holdTimer.current = setTimeout(() => {
            setIsHeld(true);
            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }, 500);
    };

    const handleTouchMove = (e: TouchEvent) => {
        // Cancel long press if moving
        if (holdTimer.current) {
            clearTimeout(holdTimer.current);
        }

        const deltaX = (e.touches[0]?.clientX ?? 0) - touchStartX.current;
        // Limit swipe distance
        const clampedX = Math.max(-120, Math.min(120, deltaX));
        setSwipeX(clampedX);
    };

    const handleTouchEnd = () => {
        if (holdTimer.current) {
            clearTimeout(holdTimer.current);
        }

        // Check for swipe actions
        if (swipeX > SWIPE_THRESHOLD && onEdit) {
            // Swipe right = edit
            onEdit(id);
        } else if (swipeX < -SWIPE_THRESHOLD && onStatusChange) {
            // Swipe left = mark done
            onStatusChange(id, status === 'DONE' ? 'TODO' : 'DONE');
        }

        // Reset
        setSwipeX(0);
        setIsHeld(false);
    };

    // Priority styling
    const priorityColors = {
        LOW: 'border-l-gray-500',
        MEDIUM: 'border-l-blue-500',
        HIGH: 'border-l-amber-500',
        URGENT: 'border-l-red-500',
    };

    const statusBadge = {
        TODO: 'bg-gray-500/20 text-gray-300',
        IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
        REVIEW: 'bg-amber-500/20 text-amber-300',
        DONE: 'bg-green-500/20 text-green-300',
        BLOCKED: 'bg-red-500/20 text-red-300',
    };

    const formatDueDate = (date: Date) => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return { text: `${Math.abs(days)}d overdue`, urgent: true };
        if (days === 0) return { text: 'Today', urgent: true };
        if (days === 1) return { text: 'Tomorrow', urgent: false };
        return { text: `${days}d`, urgent: false };
    };

    const dueDateInfo = dueDate ? formatDueDate(new Date(dueDate)) : null;

    return (
        <div className="relative overflow-hidden rounded-lg">
            {/* Swipe action backgrounds */}
            <div className="absolute inset-0 flex">
                {/* Edit action (right swipe) */}
                <div className={`flex items-center justify-start px-4 bg-blue-500 transition-opacity ${swipeX > 20 ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="ml-2 text-white font-medium">Edit</span>
                </div>
                {/* Complete action (left swipe) */}
                <div className={`flex items-center justify-end px-4 bg-green-500 ml-auto transition-opacity ${swipeX < -20 ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <span className="mr-2 text-white font-medium">
                        {status === 'DONE' ? 'Reopen' : 'Done'}
                    </span>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            {/* Card content */}
            <div
                className={`
                    relative p-4 bg-white/5 border-l-4 ${priorityColors[priority]}
                    hover:bg-white/10 transition-all touch-manipulation
                    min-h-touch-lg cursor-pointer
                    ${isHeld ? 'scale-[0.98] bg-white/15' : ''}
                    ${status === 'DONE' ? 'opacity-60' : ''}
                `}
                style={{ transform: `translateX(${swipeX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex items-start justify-between gap-3">
                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-white ${status === 'DONE' ? 'line-through' : ''}`}>
                            {title}
                        </h3>
                        {description && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{description}</p>
                        )}
                        {reason && (
                            <p className="text-xs text-primary-400 mt-1 italic">{reason}</p>
                        )}
                        {/* Meta row */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {projectName && (
                                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                                    {projectName}
                                </span>
                            )}
                            {assigneeName && (
                                <span className="text-xs text-gray-500">
                                    👤 {assigneeName}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`badge text-xs ${statusBadge[status]}`}>
                            {status.replace('_', ' ')}
                        </span>
                        {dueDateInfo && (
                            <span className={`text-xs ${dueDateInfo.urgent ? 'text-red-400 font-medium' : 'text-gray-500'}`}>
                                {dueDateInfo.text}
                            </span>
                        )}
                    </div>
                </div>

                {/* Swipe hint on first render */}
                {swipeX === 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-gray-600 pointer-events-none md:hidden">
                        ← swipe →
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * TaskCardList - Wrapper for a list of task cards
 */
export function TaskCardList({
    tasks,
    onStatusChange,
    onEdit,
}: {
    tasks: TaskCardProps[];
    onStatusChange?: (id: string, status: string) => void;
    onEdit?: (id: string) => void;
}) {
    return (
        <div className="space-y-2">
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    {...task}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                />
            ))}
            {tasks.length === 0 && (
                <p className="text-gray-500 text-center py-8">No tasks to display</p>
            )}
        </div>
    );
}
