'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Calendar, Users, CheckSquare } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();

    if (!isAuthenticated) return null;

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-ash-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-.1283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gradient">Gatherly</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/events"
                            className="flex items-center gap-2 text-ash-600 hover:text-primary-600 transition-colors"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Events</span>
                        </Link>
                        {user?.role !== 'user' && (
                            <Link
                                href="/events/create"
                                className="flex items-center gap-2 text-ash-600 hover:text-primary-600 transition-colors"
                            >
                                <CheckSquare className="w-4 h-4" />
                                <span>Create Event</span>
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href={`/users/${user?.username}`} className="text-right hidden sm:block hover:opacity-80 transition-opacity">
                            <p className="text-sm font-medium text-ash-900">{user?.full_name}</p>
                            <p className="text-xs text-ash-500 capitalize">{user?.role}</p>
                        </Link>

                        <NotificationBell />

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-ash-600 hover:text-error hover:bg-error/5 transition-all"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
