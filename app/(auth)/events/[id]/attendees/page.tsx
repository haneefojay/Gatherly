'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Event } from '@/lib/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ArrowLeft, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface AttendeeUser {
    id: string;
    email: string;
    full_name: string;
}

interface AttendeeResponse {
    id: string;
    status: string;
    registered_at: string;
    user: AttendeeUser;
}

export default function AttendeesPage() {
    const router = useRouter();
    const { id } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [attendees, setAttendees] = useState<AttendeeResponse[]>([]);
    const [waitlist, setWaitlist] = useState<AttendeeResponse[]>([]);
    const [activeTab, setActiveTab] = useState<'attendees' | 'waitlist'>('attendees');
    const [search, setSearch] = useState('');
    const [event, setEvent] = useState<Event | null>(null);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventRes, attendeesRes, waitlistRes] = await Promise.all([
                api.get<Event>(`/events/${id}`),
                api.get<AttendeeResponse[]>(`/events/${id}/attendees`),
                api.get<AttendeeResponse[]>(`/events/${id}/waitlist`)
            ]);
            setEvent(eventRes.data);
            setAttendees(attendeesRes.data);
            setWaitlist(waitlistRes.data);
            setError(null);
        } catch (error: any) {
            console.error('Failed to fetch data', error);
            setError(error.response?.data?.detail || 'Failed to load attendee data');
        } finally {
            setLoading(false);
        }
    };

    const filteredList = (activeTab === 'attendees' ? attendees : waitlist).filter(item =>
        item.user?.full_name.toLowerCase().includes(search.toLowerCase()) ||
        item.user?.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
    }

    // Permission check
    const isOrganizer = user && (event?.organizer_ids.includes(user.id) || user.role === 'admin');

    if (!isOrganizer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-ash-900 mb-2">Access Denied</h1>
                    <p className="text-ash-400 mb-4">You do not have permission to view attendees for this event.</p>
                    <Link href={`/events/${id}`}>
                        <Button variant="secondary">Go Back</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="max-w-6xl mx-auto px-2">
                <Link href={`/events/${id}`} className="inline-flex items-center text-ash-400 hover:text-primary-900 mb-6 transition-colors font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Event
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-ash-900 mb-3 tracking-tight">
                            Manage Attendees
                        </h1>
                        <p className="text-ash-500 font-medium text-lg">
                            Manage registrations for <span className="text-primary-900 font-bold">{event?.title}</span>
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        {error}
                    </div>
                )}

                <Card className="rounded-[2.5rem] border border-ash-200 p-8 bg-white shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-8">
                        <div className="flex bg-ash-50 p-1.5 rounded-2xl border border-ash-200">
                            <button
                                onClick={() => setActiveTab('attendees')}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                    activeTab === 'attendees'
                                        ? "bg-primary-900 text-white shadow-lg"
                                        : "text-ash-400 hover:text-ash-900 hover:bg-white"
                                )}
                            >
                                Attendees ({attendees.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('waitlist')}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                    activeTab === 'waitlist'
                                        ? "bg-primary-900 text-white shadow-lg"
                                        : "text-ash-400 hover:text-ash-900 hover:bg-white"
                                )}
                            >
                                Waitlist ({waitlist.length})
                            </button>
                        </div>

                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ash-400 group-focus-within:text-primary-900 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search attendees..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-11 bg-ash-50 border border-ash-200 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900/10 focus:border-primary-900 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-ash-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-ash-50/50 border-b border-ash-100">
                                    <th className="py-4 px-6 text-[10px] font-bold text-ash-400 uppercase tracking-widest">User</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-ash-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-ash-400 uppercase tracking-widest text-right">Registration Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ash-50">
                                {filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-50">
                                                <Users className="w-8 h-8 text-ash-300" />
                                                <p className="text-ash-500 font-bold text-xs uppercase tracking-widest">No matching records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map((item) => {
                                        const isUserOrganizer = event?.organizer_ids.includes(item.user.id);
                                        return (
                                            <tr key={item.id} className="group hover:bg-ash-50/50 transition-colors">
                                                <td className="py-5 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center text-primary-900 font-black text-sm border border-mint-200">
                                                            {item.user?.full_name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-ash-900 truncate block">{item.user?.full_name}</span>
                                                                {isUserOrganizer && (
                                                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-bold text-[8px] uppercase tracking-widest h-4 flex items-center">
                                                                        Organizer
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-ash-500 block truncate">{item.user?.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div className="flex justify-center">
                                                        <Badge variant="status" status={item.status} className="px-3 py-1 font-bold text-[9px] uppercase tracking-[0.15em]">
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <span className="text-xs font-bold text-ash-900">
                                                        {new Date(item.registered_at).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
