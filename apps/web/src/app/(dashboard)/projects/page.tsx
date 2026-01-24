import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import Link from 'next/link';

export default async function ProjectsPage() {
    const canCreate = await hasPermission('projects.create' as any);

    const projects = await prisma.project.findMany({
        include: {
            tasks: true,
            creator: { select: { name: true } },
        },
        orderBy: { updatedAt: 'desc' },
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Projects</h1>
                    <p className="text-gray-400 mt-1">Manage your video projects</p>
                </div>
                {canCreate && (
                    <Link href="/projects/new" className="btn-primary">
                        + New Project
                    </Link>
                )}
            </div>

            <div className="grid gap-4">
                {projects.map((project) => {
                    const completed = project.tasks.filter((t) => t.status === 'DONE').length;
                    const progress = project.tasks.length > 0 ? (completed / project.tasks.length) * 100 : 0;

                    return (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="card hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-semibold text-white">{project.name}</h2>
                                        <span className={`badge ${getStatusBadge(project.status)}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 mt-1 line-clamp-1">
                                        {project.description || 'No description'}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                        <span>Created by {project.creator.name}</span>
                                        {project.dueDate && (
                                            <span>Due {formatDate(project.dueDate)}</span>
                                        )}
                                        <span>{project.tasks.length} tasks</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
                                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                                        <div
                                            className="h-full bg-primary-500 rounded-full"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}

                {projects.length === 0 && (
                    <div className="card text-center py-12">
                        <p className="text-gray-400">No projects yet</p>
                        {canCreate && (
                            <Link href="/projects/new" className="btn-primary mt-4 inline-block">
                                Create your first project
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'ACTIVE': return 'badge-green';
        case 'PAUSED': return 'badge-amber';
        case 'COMPLETED': return 'badge-gray';
        case 'ARCHIVED': return 'badge-gray';
        default: return 'badge-gray';
    }
}

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
