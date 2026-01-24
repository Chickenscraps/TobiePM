import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/permissions';
import { generateTodayRecommendations } from '@tobie/agent-core';
import Link from 'next/link';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

export default async function DashboardPage() {
    const user = await getCurrentUser();

    // Fetch data
    const [projects, tasks, taskDeps] = await Promise.all([
        prisma.project.findMany({
            where: { status: 'ACTIVE' },
            include: { tasks: true },
            orderBy: { updatedAt: 'desc' },
            take: 5,
        }),
        prisma.task.findMany({
            where: { status: { not: 'DONE' } },
            include: { assignee: true, project: true },
            orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
        }),
        prisma.taskDependency.findMany(),
    ]);

    // Generate recommendations
    const recommendations = generateTodayRecommendations({
        tasks: tasks.map((t) => ({
            ...t,
            assignee: t.assignee ? { ...t.assignee, role: { id: '', name: '', description: null, permissions: [] }, createdAt: new Date(), updatedAt: new Date(), lastLoginAt: null } : null,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            status: t.status as any,
        })),
        dependencies: taskDeps,
        currentUser: user as any,
    });

    const stats = {
        activeProjects: projects.length,
        totalTasks: tasks.length,
        dueSoon: tasks.filter((t) => t.dueDate && t.dueDate <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).length,
        overdue: tasks.filter((t) => t.dueDate && t.dueDate < new Date()).length,
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-white">
                    Good {getTimeOfDay()}, {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-gray-400 mt-1">
                    Here's what needs your attention today
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    label="Active Projects"
                    value={stats.activeProjects}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    }
                    color="blue"
                />
                <StatCard
                    label="Open Tasks"
                    value={stats.totalTasks}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    }
                    color="green"
                />
                <StatCard
                    label="Due Soon"
                    value={stats.dueSoon}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color="amber"
                />
                <StatCard
                    label="Overdue"
                    value={stats.overdue}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    }
                    color="red"
                />
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Today's Priorities */}
                <div className="col-span-2 card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Today's Priorities</h2>
                        <Link href="/tasks" className="text-sm text-primary-400 hover:text-primary-300">
                            View all
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recommendations.priorities.slice(0, 5).map((task) => (
                            <div
                                key={task.id}
                                className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium text-white">{task.title}</h3>
                                        <p className="text-sm text-gray-400 mt-1">{task.reason}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                        {task.dueDate && (
                                            <span className="text-xs text-gray-500">
                                                {formatDate(task.dueDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recommendations.priorities.length === 0 && (
                            <p className="text-gray-500 text-center py-8">No priorities for today 🎉</p>
                        )}
                    </div>
                </div>

                {/* Bottlenecks & Actions */}
                <div className="space-y-6">
                    {/* Bottlenecks */}
                    {recommendations.bottlenecks.length > 0 && (
                        <div className="card border-l-4 border-l-amber-500">
                            <h2 className="text-lg font-semibold text-white mb-4">⚠️ Bottlenecks</h2>
                            <div className="space-y-3">
                                {recommendations.bottlenecks.map((b) => (
                                    <div key={b.task.id} className="text-sm">
                                        <p className="font-medium text-amber-400">{b.task.title}</p>
                                        <p className="text-gray-400">{b.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommended Actions */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-white mb-4">💡 Recommended Actions</h2>
                        <div className="space-y-3">
                            {recommendations.nextActions.map((action, i) => (
                                <div key={i} className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                                    <p className="text-sm font-medium text-primary-300">{action.action}</p>
                                    <p className="text-xs text-gray-400 mt-1">{action.reason}</p>
                                </div>
                            ))}
                            {recommendations.nextActions.length === 0 && (
                                <p className="text-gray-500 text-sm">No recommended actions</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Projects & Activity */}
            <div className="grid grid-cols-3 gap-6">
                {/* Recent Projects */}
                <div className="col-span-2 card">

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
                        <Link href="/projects" className="text-sm text-primary-400 hover:text-primary-300">
                            View all
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {projects.map((project) => {
                            const completed = project.tasks.filter((t) => t.status === 'DONE').length;
                            const progress = project.tasks.length > 0 ? (completed / project.tasks.length) * 100 : 0;

                            return (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <h3 className="font-medium text-white">{project.name}</h3>
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                                        {project.description || 'No description'}
                                    </p>
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                            <span>{completed}/{project.tasks.length} tasks</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-500 rounded-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Activity Feed */}
            <div>
                <ActivityFeed />
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'amber' | 'red';
}) {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-400',
        green: 'bg-green-500/10 text-green-400',
        amber: 'bg-amber-500/10 text-amber-400',
        red: 'bg-red-500/10 text-red-400',
    };

    return (
        <div className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colorClasses[color]}`}>{icon}</div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-gray-400">{label}</p>
            </div>
        </div>
    );
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
}

function getStatusBadgeClass(status: string) {
    switch (status) {
        case 'TODO':
            return 'badge-gray';
        case 'IN_PROGRESS':
            return 'badge-blue';
        case 'REVIEW':
            return 'badge-amber';
        case 'DONE':
            return 'badge-green';
        case 'BLOCKED':
            return 'badge-red';
        default:
            return 'badge-gray';
    }
}

function formatDate(date: Date) {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days}d`;
}
