'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus } from 'lucide-react';
import NotificationBell from './NotificationBell';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface HeaderProps {
    isSidebarCollapsed: boolean;
}

export default function Header({ isSidebarCollapsed }: HeaderProps) {
    const { user } = useAuth();

    return (
        <header className="h-20 flex items-center justify-between px-8 bg-transparent">
            {/* Greeting */}
            <div>
                <h1 className="text-xl font-bold text-ash-900">
                    HI, {user?.full_name?.split(' ')[0]} 👋
                </h1>
                <p className="text-xs text-ash-500 font-medium">Welcome back</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="relative group w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ash-400 group-focus-within:text-primary-900 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search events, organizers..."
                        className="w-full h-11 bg-white border border-ash-200 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900/10 focus:border-primary-900 transition-all shadow-sm"
                    />
                </div>

                {/* Notifications */}
                <NotificationBell />

                {/* Primary Action */}
                {(user?.role === 'organizer' || user?.role === 'admin') && (
                    <Link href="/events/create">
                        <Button className="bg-primary-900 hover:bg-primary-950 text-white rounded-xl px-6 h-11 flex items-center gap-2 shadow-primary">
                            <Plus className="w-5 h-5" />
                            Create Event
                        </Button>
                    </Link>
                )}
            </div>
        </header>
    );
}
