'use client';

import { useEffect, useState } from 'react';

interface AuditLog {
    id: string;
    timestamp: string;
    eventType: string;
    details: any;
    user?: {
        name: string;
        avatarUrl?: string;
    } | null;
}

export function ActivityFeed() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/audit/recent');
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.logs);
                }
            } catch (error) {
                console.error('Failed to load activity feed', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    // Mock data for display until API is ready
    const mockLogs: AuditLog[] = [
        {
            id: '1',
            timestamp: new Date().toISOString(),
            eventType: 'PROJECT_CREATED',
            details: { name: 'Empire Life Q1 Video' },
            user: { name: 'Josh' }
        },
        {
            id: '2',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            eventType: 'TASK_CREATED',
            details: { title: 'Script Drafting' },
            user: { name: 'Tobie Assistant' }
        },
        {
            id: '3',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            eventType: 'FILE_UPLOADED',
            details: { filename: 'script_v1.docx' },
            user: { name: 'Ann Le' }
        }
    ];

    const displayLogs = logs.length > 0 ? logs : mockLogs;

    return (
        <div className="card h-full flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Activity
            </h2>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center text-gray-500 py-4">Loading activity...</div>
                ) : (
                    displayLogs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-sm">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white">
                                    {log.user?.name?.[0] || '?'}
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-200">
                                    <span className="font-medium text-white">{log.user?.name || 'System'}</span>
                                    {' '}
                                    {formatEventType(log.eventType)}
                                    {' '}
                                    <span className="text-primary-300">
                                        {log.details.title || log.details.name || log.details.filename || 'an item'}
                                    </span>
                                </p>
                                <span className="text-xs text-gray-500">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {' • '}
                                    {new Date(log.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function formatEventType(type: string) {
    switch (type) {
        case 'PROJECT_CREATED': return 'created project';
        case 'TASK_CREATED': return 'added task';
        case 'TASK_COMPLETED': return 'completed task';
        case 'FILE_UPLOADED': return 'uploaded file';
        default: return 'updated';
    }
}
