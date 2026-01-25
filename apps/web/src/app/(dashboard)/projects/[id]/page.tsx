import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BrandGuideEditor } from '../components/BrandGuideEditor';
import { FileText, Calendar, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            tasks: {
                orderBy: { dueDate: 'asc' }
            },
            creator: {
                select: { name: true }
            }
        }
    });

    if (!project) {
        notFound();
    }

    // Special case for Brand Guide
    if (id === 'brand-guide-id') {
        return (
            <div className="animate-fade-in">
                <BrandGuideEditor projectId={id} initialContent={project.description || ''} />
            </div>
        );
    }

    const completedTasks = project.tasks.filter(t => t.status === 'DONE').length;
    const progress = project.tasks.length > 0 ? (completedTasks / project.tasks.length) * 100 : 0;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${project.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                            {project.status}
                        </span>
                    </div>
                    <p className="text-gray-400 max-w-2xl">{project.description}</p>
                </div>

                <div className="flex gap-3">
                    <Link href={`/projects/${id}/files`} className="btn-secondary flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Project Files
                    </Link>
                    <Link href={`/projects/${id}/review`} className="btn-primary flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Video Reviews
                    </Link>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 bg-gray-900/40">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Progress</div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
                        <span className="text-gray-500 mb-1 text-sm">completed</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="card p-6 bg-gray-900/40">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Timeline</div>
                    <div className="flex items-center gap-2 text-white">
                        <Calendar className="w-5 h-5 text-primary-500" />
                        <span className="font-semibold">
                            {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
                        </span>
                    </div>
                </div>

                <div className="card p-6 bg-gray-900/40">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Tasks</div>
                    <div className="flex items-center gap-2 text-white">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="font-semibold">{completedTasks} / {project.tasks.length} Done</span>
                    </div>
                </div>
            </div>

            {/* Tasks Section */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Immediate Tasks</h3>
                <div className="space-y-2">
                    {project.tasks.slice(0, 5).map(task => (
                        <div key={task.id} className="card p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${task.status === 'DONE' ? 'bg-green-500' : task.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-gray-500'
                                    }`} />
                                <div>
                                    <p className="text-sm font-medium text-white">{task.title}</p>
                                    <p className="text-xs text-gray-500">Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${task.priority >= 5 ? 'text-red-400 bg-red-400/10' : 'text-gray-400 bg-gray-400/10'
                                }`}>
                                P{task.priority}
                            </span>
                        </div>
                    ))}
                    {project.tasks.length === 0 && (
                        <div className="text-center py-12 text-gray-500 italic">
                            No tasks found for this project.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
