'use client';

import React, { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    Bell,
    User,
    LogOut,
    HelpCircle,
    ShieldCheck,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Settings', href: '/profile', icon: User },
];

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export default function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 bg-white border-r border-ash-200 flex flex-col z-50 transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-20 w-6 h-6 bg-white border border-ash-200 rounded-full flex items-center justify-center text-ash-400 hover:text-primary-900 shadow-sm z-50 transition-colors"
            >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Logo */}
            <div className={cn("p-6", isCollapsed && "px-4")}>
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-900 rounded-lg flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <svg className="w-5 h-5 text-mint-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-.1283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in whitespace-nowrap">
                            <span className="text-xl font-bold text-primary-900 block leading-none">Gatherly.</span>
                            <span className="text-[10px] text-ash-400 font-medium uppercase tracking-wider">Secure. Simple. Events.</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className={cn("flex-1 px-4 py-4 space-y-1", isCollapsed && "px-3")}>
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            title={isCollapsed ? link.name : undefined}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                                isActive
                                    ? 'bg-mint-100 text-primary-900'
                                    : 'text-ash-500 hover:bg-ash-100 hover:text-ash-900',
                                isCollapsed && "px-3 justify-center"
                            )}
                        >
                            <link.icon className={cn(
                                'w-5 h-5 transition-colors flex-shrink-0',
                                isActive ? 'text-primary-900' : 'text-ash-400 group-hover:text-ash-900'
                            )} />
                            {!isCollapsed && <span className="animate-fade-in whitespace-nowrap">{link.name}</span>}
                        </Link>
                    );
                })}

                <button
                    onClick={logout}
                    title={isCollapsed ? "Logout" : undefined}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200 mt-4 group",
                        isCollapsed && "px-3 justify-center"
                    )}
                >
                    <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500 flex-shrink-0" />
                    {!isCollapsed && <span className="animate-fade-in whitespace-nowrap">Logout</span>}
                </button>
            </nav>

            {/* Support / Footer */}
            <div className={cn("p-4 space-y-4", isCollapsed && "px-3")}>
                {!isCollapsed && (
                    <div className="bg-ash-50 rounded-2xl p-4 border border-ash-100 animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-ash-200">
                                <HelpCircle className="w-4 h-4 text-primary-900" />
                            </div>
                            <span className="text-sm font-bold text-ash-900">Need support?</span>
                        </div>
                        <p className="text-xs text-ash-500 leading-relaxed mb-3">
                            Contact with one of our experts to get support.
                        </p>
                    </div>
                )}

                {/* User Profile Summary */}
                <div className={cn(
                    "flex items-center gap-3 px-2 py-2 border-t border-ash-100 pt-4",
                    isCollapsed && "px-1 justify-center border-none"
                )}>
                    <div className="w-10 h-10 rounded-full bg-ash-200 overflow-hidden border border-ash-200 flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-900 font-bold">
                            {user?.full_name?.charAt(0)}
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 animate-fade-in">
                            <p className="text-sm font-bold text-ash-900 truncate">{user?.full_name}</p>
                            <p className="text-[10px] text-ash-500 truncate uppercase tracking-tighter">{user?.email}</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
