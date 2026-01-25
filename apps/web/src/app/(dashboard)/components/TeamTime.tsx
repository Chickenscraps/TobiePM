'use client';

import { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';

export function TeamTime() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => {
            setTime(new Date());
        }, 30000); // Update every 30 seconds

        return () => clearInterval(timer);
    }, []);

    if (!time) return null;

    // Timezones
    const PT_ZONE = 'America/Los_Angeles';
    const VN_ZONE = 'Asia/Ho_Chi_Minh';

    const ptTime = formatInTimeZone(time, PT_ZONE, 'h:mm a');
    const vnTime = formatInTimeZone(time, VN_ZONE, 'h:mm a');

    // Status Logic
    const getStatus = (date: Date, tz: string) => {
        const hour = parseInt(formatInTimeZone(date, tz, 'H'));
        if (hour >= 9 && hour < 18) return { label: 'Working', color: 'text-green-400' };
        if (hour >= 22 || hour < 7) return { label: 'Sleeping', color: 'text-blue-400' };
        return { label: 'Away', color: 'text-gray-400' };
    };

    const ptStatus = getStatus(time, PT_ZONE);
    const vnStatus = getStatus(time, VN_ZONE);

    return (
        <div className="flex items-center gap-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs shadow-inner">
            {/* Josh (PT) */}
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white">Josh (PT)</span>
                    <span className={`w-1.5 h-1.5 rounded-full bg-current ${ptStatus.color}`} />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-gray-300 tabular-nums">{ptTime}</span>
                    <span className={`text-[10px] uppercase tracking-tighter ${ptStatus.color}`}>
                        {ptStatus.label}
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Ann (Vietnam) */}
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white">Ann (ICT)</span>
                    <span className={`w-1.5 h-1.5 rounded-full bg-current ${vnStatus.color}`} />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-gray-300 tabular-nums">{vnTime}</span>
                    <span className={`text-[10px] uppercase tracking-tighter ${vnStatus.color}`}>
                        {vnStatus.label}
                    </span>
                </div>
            </div>
        </div>
    );
}
