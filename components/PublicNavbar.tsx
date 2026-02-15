"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function PublicNavbar() {
    const { user } = useAuth();

    // Logic for Initials
    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : '';

    return (
        <nav className="bg-white dark:bg-[#15192b] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-primary font-bold text-2xl tracking-tighter">EventFlow</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-slate-500 hover:text-primary dark:text-slate-400 transition-colors">
                            <span className="material-icons">notifications</span>
                        </button>
                        {user ? (
                            <Link href="/profile" className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm hover:bg-primary/20 transition-colors">
                                {initials || 'US'}
                            </Link>
                        ) : (
                            <div className="flex gap-4">
                                <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                                    Login
                                </Link>
                                <Link href="/register" className="text-sm font-medium text-primary hover:text-primary-700 transition-colors">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
