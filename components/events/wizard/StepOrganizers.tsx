'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { EventWizardData, User } from '@/lib/types';
import { searchUsers } from '@/lib/eventApi';
import { Search, X, Crown, UserPlus } from 'lucide-react';

interface StepOrganizersProps {
    data: EventWizardData;
    updateData: (partial: Partial<EventWizardData>) => void;
}

export default function StepOrganizers({ data, updateData }: StepOrganizersProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = useCallback((value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length < 2) {
            setResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const users = await searchUsers(value);
                setResults(users.filter(u => !data.organizer_emails.includes(u.email)));
            } catch {
                setResults([]);
            }
            setSearching(false);
        }, 400);
    }, [data.organizer_emails]);

    const addOrganizer = useCallback((email: string) => {
        if (!data.organizer_emails.includes(email)) {
            updateData({ organizer_emails: [...data.organizer_emails, email] });
        }
        setQuery('');
        setResults([]);
    }, [data.organizer_emails, updateData]);

    const removeOrganizer = useCallback((email: string) => {
        updateData({ organizer_emails: data.organizer_emails.filter(e => e !== email) });
    }, [data.organizer_emails, updateData]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(query)) {
                addOrganizer(query);
            }
        }
    }, [query, addOrganizer]);

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Event Organizers
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Add co-organizers to help manage your event details, attendees, and check-in process.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 lg:p-10 space-y-8">
                {/* Search */}
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Find Co-organizers</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search users by name or email address..."
                            className="block w-full pl-10 rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-600 focus:ring-primary-600 text-sm py-3 px-4 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {(results.length > 0 || searching) && (
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                            {searching && (
                                <div className="px-4 py-3 text-sm text-slate-400">Searching...</div>
                            )}
                            {results.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => addOrganizer(user.email)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                                >
                                    <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 text-sm font-bold flex-shrink-0">
                                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                            {user.full_name || user.username}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                    </div>
                                    <UserPlus className="w-4 h-4 text-slate-400 ml-auto flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Current Organizers */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Current Organizers</h2>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 text-xs font-bold">
                            {data.organizer_emails.length + 1}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {/* Owner (current user) */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                                <Crown className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">You (Owner)</p>
                                <p className="text-xs text-primary-600">Event creator</p>
                            </div>
                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">
                                Owner
                            </span>
                        </div>

                        {/* Added organizers */}
                        {data.organizer_emails.map((email) => (
                            <div key={email} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm flex-shrink-0">
                                    {email.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{email}</p>
                                    <p className="text-xs text-slate-500">Invited co-organizer</p>
                                </div>
                                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    Can Edit
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeOrganizer(email)}
                                    className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
