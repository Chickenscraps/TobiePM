import { prisma } from '@/lib/prisma';
import { CalendarView } from '../components/CalendarView';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
    // Fetch all tasks with project info for the calendar
    const tasks = await prisma.task.findMany({
        include: {
            project: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            dueDate: 'asc'
        }
    });

    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-120px)]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Project Calendar</h1>
                    <p className="text-gray-400 mt-1">
                        Visualize deadlines and milestones across all workstreams
                    </p>
                </div>
            </div>

            <div className="h-full">
                <CalendarView initialTasks={tasks} />
            </div>
        </div>
    );
}
