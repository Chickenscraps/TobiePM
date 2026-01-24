'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

interface User {
    id: string;
    name: string;
    email: string;
    role: {
        name: string;
    };
}

interface HeaderProps {
    user: User;
}

export function Header({ user }: HeaderProps) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="h-16 border-b border-white/5 bg-gray-900/50 flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex-1 max-w-lg">
                <div className="relative">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search projects, tasks..."
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                        {/* Unread indicator */}
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 card py-2 z-50 animate-fade-in">
                            <div className="px-4 py-2 border-b border-white/10">
                                <h3 className="font-semibold text-white">Notifications</h3>
                            </div>
                            <div className="max-h-64 overflow-auto">
                                <NotificationItem
                                    title="Task due soon"
                                    message="Script Approval is due tomorrow"
                                    time="2 hours ago"
                                    unread
                                />
                                <NotificationItem
                                    title="New task assigned"
                                    message='You have been assigned to "Storyboard/Layout"'
                                    time="5 hours ago"
                                    unread
                                />
                                <NotificationItem
                                    title="Project created"
                                    message="Empire Life Q1 Video has been created"
                                    time="1 day ago"
                                />
                            </div>
                            <div className="px-4 py-2 border-t border-white/10">
                                <button className="text-sm text-primary-400 hover:text-primary-300">
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-56 card py-2 z-50 animate-fade-in">
                            <div className="px-4 py-2 border-b border-white/10">
                                <p className="font-medium text-white">{user.name}</p>
                                <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                            <div className="py-2">
                                <button className="w-full px-4 py-2 text-left text-gray-300 hover:bg-white/5 transition-colors">
                                    Settings
                                </button>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/5 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function NotificationItem({
    title,
    message,
    time,
    unread = false,
}: {
    title: string;
    message: string;
    time: string;
    unread?: boolean;
}) {
    return (
        <div className={`px-4 py-3 hover:bg-white/5 cursor-pointer ${unread ? 'bg-primary-500/5' : ''}`}>
            <div className="flex items-start gap-3">
                {unread && <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />}
                <div className={unread ? '' : 'ml-5'}>
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="text-sm text-gray-400 line-clamp-1">{message}</p>
                    <p className="text-xs text-gray-500 mt-1">{time}</p>
                </div>
            </div>
        </div>
    );
}
