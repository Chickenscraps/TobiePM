export interface RecommendationInput {
    tasks: any[];
    dependencies: any[];
    currentUser: any;
}

export interface PriorityItem {
    id: string;
    title: string;
    reason: string;
    status: string;
    dueDate?: Date | null;
}

export interface BottleneckItem {
    task: { id: string; title: string };
    message: string;
}

export interface ActionItem {
    action: string;
    reason: string;
}

export interface DayRecommendations {
    priorities: PriorityItem[];
    bottlenecks: BottleneckItem[];
    nextActions: ActionItem[];
}

export function generateTodayRecommendations(input: RecommendationInput): DayRecommendations {
    const { tasks } = input;
    const recommendations: DayRecommendations = {
        priorities: [],
        bottlenecks: [],
        nextActions: []
    };

    // 1. Identify Priorities (High Priority or Due Soon)
    const urgentTasks = tasks.filter(t => {
        if (t.status === 'DONE') return false;
        if (t.priority === 'HIGH' || t.priority === 'URGENT') return true;
        if (t.dueDate) {
            const daysUntilDue = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return daysUntilDue <= 2;
        }
        return false;
    });

    recommendations.priorities = urgentTasks.slice(0, 5).map(t => ({
        id: t.id,
        title: t.title,
        reason: t.priority === 'URGENT' ? 'Marked as Urgent' : 'Due soon',
        status: t.status,
        dueDate: t.dueDate ? new Date(t.dueDate) : null
    }));

    // 2. Identify Bottlenecks (Blocked tasks)
    const blockedTasks = tasks.filter(t => t.status === 'BLOCKED');
    recommendations.bottlenecks = blockedTasks.map(t => ({
        task: { id: t.id, title: t.title },
        message: 'This task is blocked and needs attention.'
    }));

    // 3. Next Actions
    if (recommendations.priorities.length > 0 && recommendations.priorities[0]) {
        recommendations.nextActions.push({
            action: `Focus on "${recommendations.priorities[0].title}"`,
            reason: 'It is your highest priority item.'
        });
    }

    if (recommendations.bottlenecks.length > 0 && recommendations.bottlenecks[0]) {
        recommendations.nextActions.push({
            action: `Unblock "${recommendations.bottlenecks[0].task.title}"`,
            reason: 'Clearing bottlenecks improves flow.'
        });
    }

    if (recommendations.nextActions.length === 0) {
        recommendations.nextActions.push({
            action: 'Review project backlog',
            reason: 'No immediate urgent items found.'
        });
    }

    return recommendations;
}
