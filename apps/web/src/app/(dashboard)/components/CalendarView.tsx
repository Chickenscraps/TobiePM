'use client';

import { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    eachDayOfInterval,
    isToday
} from 'date-fns';

interface Task {
    id: string;
    title: string;
    dueDate: Date | null;
    status: string;
    priority: number;
    project: {
        name: string;
    } | null;
}

interface CalendarViewProps {
    initialTasks: any[];
}

export function CalendarView({ initialTasks }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Parse dates
    const tasks: Task[] = initialTasks.map(t => ({
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate) : null
    }));

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Calendar logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const getPriorityColor = (priority: number) => {
        if (priority >= 5) return 'bg-red-500/20 text-red-400 border-red-500/30';
        if (priority >= 3) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    };

    return (
        <div className="card h-full flex flex-col min-h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h2 className="text-xl font-bold text-white">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
                        title="Previous Month"
                        aria-label="Previous Month"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-3 py-1 text-xs font-medium bg-white/5 hover:bg-white/10 text-white rounded-md border border-white/10"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
                        title="Next Month"
                        aria-label="Next Month"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b border-white/5">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="flex-1 grid grid-cols-7">
                {days.map((day) => {
                    const dayTasks = tasks.filter(t => t.dueDate && isSameDay(t.dueDate, day));

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[100px] p-2 border-r border-b border-white/5 last:border-r-0 ${!isSameMonth(day, monthStart) ? 'bg-black/20 text-gray-700' : 'text-gray-300'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-medium ${isToday(day) ? 'bg-primary-500 text-white w-6 h-6 flex items-center justify-center rounded-full' : ''
                                    }`}>
                                    {format(day, 'd')}
                                </span>
                                {dayTasks.length > 0 && (
                                    <span className="text-[10px] text-gray-500">{dayTasks.length} tasks</span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayTasks.slice(0, 3).map((task) => (
                                    <div
                                        key={task.id}
                                        className={`px-1.5 py-0.5 text-[10px] rounded border truncate ${getPriorityColor(task.priority)}`}
                                        title={`${task.title} (${task.project?.name || 'No Project'})`}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                                {dayTasks.length > 3 && (
                                    <div className="text-[9px] text-center text-gray-600 font-medium">
                                        + {dayTasks.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
