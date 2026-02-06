'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Event } from '@/lib/types';
import Card from '@/components/ui/Card';
import { Calendar, Users, CheckSquare, TrendingUp, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatDateTime } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface DashboardStats {
    upcoming_events_count: number;
    registered_events: number;
    organized_events: number;
    total_attendees: number;
    pending_tasks: number;
    total_users?: number;
    admin_events_upcoming?: number;
    admin_events_ongoing?: number;
    admin_events_completed?: number;
    admin_events_cancelled?: number;
    admin_events_draft?: number;
    admin_tasks_pending?: number;
    admin_tasks_completed?: number;
}

interface DashboardData {
    stats: DashboardStats;
    upcoming_events: Event[];
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get<DashboardData>('/dashboard');
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ash-50">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Financial/Stats Feel */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Portfolio Card (Equivalent to Balance Card) */}
                    <Card className="bg-primary-900 border-none shadow-primary-lg relative overflow-hidden min-h-[280px] flex flex-col justify-between p-8 group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-mint-400/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />

                        <div className="relative">
                            <p className="text-mint-100/70 text-sm font-semibold uppercase tracking-widest mb-2">Portfolio Overview</p>
                            <h2 className="text-white text-5xl font-extrabold tracking-tight flex items-baseline gap-2">
                                {data?.stats.upcoming_events_count || 0}
                                <span className="text-xl font-normal text-mint-200/60 uppercase">Active</span>
                            </h2>
                        </div>

                        <div className="relative flex items-end justify-between gap-4">
                            <div className="flex gap-2">
                                <Link href="/events/create" className="flex-1">
                                    <Button className="bg-white text-primary-900 hover:bg-mint-50 w-full rounded-xl py-2.5">
                                        + New Event
                                    </Button>
                                </Link>
                                <Link href="/events" className="flex-1">
                                    <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20 border-white/10 rounded-xl py-2.5">
                                        Explore →
                                    </Button>
                                </Link>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-mint-200/50 uppercase font-bold">{user?.full_name}</p>
                                <p className="text-[10px] text-mint-200/30 font-mono tracking-widest uppercase">{user?.id.slice(0, 8)}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-5 flex flex-col justify-between hover:border-primary-900/20 transition-colors cursor-default">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                                    <Users className="w-5 h-5 text-orange-600" />
                                </div>
                                <p className="text-ash-500 text-xs font-bold uppercase tracking-wider">Registrations</p>
                                <p className="text-2xl font-bold text-ash-900 mt-1">{data?.stats.registered_events || 0}</p>
                            </div>
                        </Card>
                        <Card className="p-5 flex flex-col justify-between hover:border-primary-900/20 transition-colors cursor-default">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-ash-500 text-xs font-bold uppercase tracking-wider">Pending Tasks</p>
                                <p className="text-2xl font-bold text-ash-900 mt-1">{data?.stats.pending_tasks || 0}</p>
                            </div>
                        </Card>
                    </div>

                    <Card className="p-8">
                        <h3 className="text-lg font-bold text-ash-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary-900" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <Link href="/events">
                                <Button variant="secondary" className="w-full justify-between group">
                                    <span>Manage Event Team</span>
                                    <ArrowRight className="w-4 h-4 text-ash-300 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/notifications">
                                <Button variant="secondary" className="w-full justify-between group">
                                    <span>View Notifications</span>
                                    <ArrowRight className="w-4 h-4 text-ash-300 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Transaction Style List */}
                <div className="lg:col-span-7">
                    <Card className="p-0 overflow-hidden border-none shadow-none bg-transparent">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h2 className="text-xl font-extrabold text-ash-900 tracking-tight">Upcoming Events</h2>
                            <Link href="/events" className="text-sm font-bold text-primary-900 hover:underline">View All</Link>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-ash-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-ash-50/50 border-b border-ash-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-bold text-ash-400 uppercase tracking-widest">Event Detail</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-ash-400 uppercase tracking-widest">Date & Time</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-ash-400 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-ash-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-ash-100">
                                        {data?.upcoming_events && data.upcoming_events.length > 0 ? (
                                            data.upcoming_events.map(event => (
                                                <tr key={event.id} className="hover:bg-ash-50 transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center text-primary-900 group-hover:scale-110 transition-transform">
                                                                <Calendar className="w-5 h-5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-ash-900 truncate">{event.title}</p>
                                                                <p className="text-[10px] text-ash-400 truncate mt-0.5">{event.location || 'Remote/TBD'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm font-semibold text-ash-700 underline decoration-ash-200 underline-offset-4 decoration-dashed">{new Date(event.start_date).toLocaleDateString()}</p>
                                                        <p className="text-[10px] text-ash-400 mt-1 uppercase font-medium">{new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <Badge variant="status" status={event.status} className="px-3 py-1 font-bold text-[10px] uppercase tracking-tighter">
                                                            {event.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <Link href={`/events/${event.id}`}>
                                                            <button className="p-2 rounded-xl bg-ash-100 text-ash-600 hover:bg-primary-900 hover:text-white transition-all shadow-sm">
                                                                <ArrowRight className="w-4 h-4" />
                                                            </button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-20 text-center">
                                                    <Calendar className="w-12 h-12 text-ash-200 mx-auto mb-4" />
                                                    <p className="text-ash-500 font-medium">No upcoming events found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

