/**
 * Mobile Bottom Navigation Component
 * 
 * Thumb-zone navigation for mobile devices with 60px height
 * for comfortable tapping. Hidden on desktop (md:hidden).
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    {
        name: 'Home',
        href: '/dashboard',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        name: 'Projects',
        href: '/projects',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
        ),
    },
    {
        name: 'Tasks',
        href: '/tasks',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
    },
    {
        name: 'AI',
        href: '#ai-assistant',
        isAction: true,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
        ),
    },
];

interface BottomNavProps {
    onAIClick?: () => void;
}

export function BottomNav({ onAIClick }: BottomNavProps) {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-dark/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = !item.isAction && (pathname === item.href || pathname.startsWith(item.href + '/'));

                    if (item.isAction) {
                        return (
                            <button
                                key={item.name}
                                onClick={onAIClick}
                                className="flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-3 py-2 text-text-secondary hover:text-brand-blue transition-colors touch-manipulation"
                            >
                                <div className="relative">
                                    {item.icon}
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-green rounded-full animate-pulse" />
                                </div>
                                <span className="text-xs mt-1 font-medium">{item.name}</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-3 py-2 transition-colors touch-manipulation ${isActive
                                    ? 'text-brand-blue'
                                    : 'text-text-secondary hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="text-xs mt-1 font-medium">{item.name}</span>
                            {isActive && (
                                <span className="absolute bottom-1 w-1 h-1 bg-brand-blue rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
