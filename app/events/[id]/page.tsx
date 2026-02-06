'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Event, Attendee, EventStats } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import RegistrationButton from '@/components/attendees/RegistrationButton';
import StatusTransition from '@/components/events/StatusTransition';
import Button from '@/components/ui/Button';
import { Calendar, MapPin, Users, ArrowLeft, Clock, Shield, CheckCircle2, ListTodo, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function EventDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [attendee, setAttendee] = useState<Attendee | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState<EventStats | null>(null);

    const fetchEventDetails = async () => {
        try {
            // Fetch event data
            const eventRes = await api.get<Event>(`/events/${id}`);
            setEvent(eventRes.data);

            // Check registration status if logged in
            if (user) {
                try {
                    const statusRes = await api.get<Attendee>(`/events/${id}/my-status`);
                    setAttendee(statusRes.data || undefined);
                } catch (e) {
                    // Ignore errors, assume not registered
                    console.log('Failed to fetch validation status', e);
                    setAttendee(undefined);
                }

                // Check if user is organizer or admin to fetch stats
                const isOrganizer = eventRes.data.organizer_ids.includes(user.id) || user.role === 'admin';
                if (isOrganizer) {
                    try {
                        const statsRes = await api.get<EventStats>(`/events/${id}/stats`);
                        setStats(statsRes.data);
                    } catch (e) {
                        console.error('Failed to fetch event stats', e);
                    }
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load event');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchEventDetails();
        }
    }, [id, user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-ash-900 mb-2">Event not found</h1>
                <p className="text-ash-400 mb-6">{error || "The event you're looking for doesn't exist."}</p>
                <Link href="/events" className="text-primary-400 hover:text-primary-300 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Events
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Page Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <Link href="/events" className="inline-flex items-center text-ash-400 hover:text-primary-900 mb-4 transition-colors font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Events
                    </Link>
                    <div className="flex items-center gap-3 mb-3">
                        <Badge variant="status" status={event.status} className="px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                            {event.status}
                        </Badge>
                        {event.organizer_ids.includes(user?.id || '') && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-bold text-[10px] uppercase tracking-widest">
                                Organizer
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-ash-900 mb-2 tracking-tight">
                        {event.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-ash-500 font-medium text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-900" />
                            <span>{formatDateTime(event.start_date)}</span>
                        </div>
                        {event.location && (
                            <div className="flex items-center gap-2 border-l border-ash-200 pl-6 h-5">
                                <MapPin className="w-5 h-5 text-primary-900" />
                                <span>{event.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <RegistrationButton event={event} attendee={attendee} onUpdate={fetchEventDetails} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="rounded-[2.5rem] border border-ash-200 p-10 bg-white">
                        <h2 className="text-2xl font-extrabold text-ash-900 mb-6 tracking-tight">About the Event</h2>
                        <div className="prose prose-ash max-w-none text-ash-600 leading-relaxed text-lg">
                            <p className="whitespace-pre-wrap">{event.description || 'No description provided.'}</p>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border border-ash-200 p-10 bg-white">
                        <h2 className="text-2xl font-extrabold text-ash-900 mb-6 tracking-tight">Schedule & Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-start gap-4 p-6 rounded-3xl bg-ash-50 border border-ash-100">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-900">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-ash-400 uppercase tracking-widest mb-1">Starts At</p>
                                    <p className="font-bold text-ash-900">{formatDateTime(event.start_date)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-6 rounded-3xl bg-ash-50 border border-ash-100">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-900">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-ash-400 uppercase tracking-widest mb-1">Ends At</p>
                                    <p className="font-bold text-ash-900">{formatDateTime(event.end_date)}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Organizer Actions Card */}
                    {(user?.role === 'admin' || (event.organizer_ids && event.organizer_ids.includes(user?.id || ''))) && (
                        <Card className="rounded-[2.5rem] border-primary-900/10 bg-primary-900/5 p-8 border-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-900 flex items-center justify-center text-white">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-extrabold text-ash-900 tracking-tight">Organizer Tools</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <Link href={`/events/${id}/edit`}>
                                    <Button variant="secondary" className="w-full justify-start rounded-xl">
                                        Edit Event Details
                                    </Button>
                                </Link>
                                <Link href={`/events/${id}/attendees`}>
                                    <Button variant="secondary" className="w-full justify-start rounded-xl">
                                        Manage Attendees
                                    </Button>
                                </Link>
                                <Link href={`/events/${id}/tasks`}>
                                    <Button variant="secondary" className="w-full justify-start rounded-xl">
                                        Manage Tasks
                                    </Button>
                                </Link>
                                <Link href={`/events/${id}/team`}>
                                    <Button variant="secondary" className="w-full justify-start rounded-xl">
                                        Manage Team
                                    </Button>
                                </Link>
                                <div className="pt-4 border-t border-primary-900/10 mt-2">
                                    <p className="text-[10px] font-bold text-primary-900 uppercase tracking-widest mb-3 px-1">Rapid Status Update</p>
                                    <StatusTransition event={event} onUpdate={fetchEventDetails} />
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card className="rounded-[2.5rem] border border-ash-200 p-8 bg-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-mint-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
                        <h2 className="text-xl font-extrabold text-ash-900 mb-6 tracking-tight relative">Event Stats</h2>

                        <div className="space-y-6 relative">
                            {/* Attendance Segment */}
                            <div className="p-6 rounded-3xl bg-ash-50 border border-ash-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-900">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-ash-400 uppercase tracking-widest leading-none mb-1">Attendance</p>
                                            <p className="text-sm font-bold text-ash-900 leading-none">Registration</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-primary-900">{event.current_attendees}</span>
                                        <span className="text-xs font-bold text-ash-400 ml-1">/ {event.capacity}</span>
                                    </div>
                                </div>
                                <div className="relative pt-1">
                                    <div className="overflow-hidden h-2.5 flex rounded-full bg-ash-200">
                                        <div
                                            style={{ width: `${Math.min((event.current_attendees / event.capacity) * 100, 100)}%` }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-900 transition-all duration-1000 ease-out"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-bold text-ash-400 uppercase tracking-widest mt-2 px-1">
                                        <span>Fullness</span>
                                        <span className="text-primary-900">{Math.round((event.current_attendees / event.capacity) * 100)}%</span>
                                    </div>
                                </div>
                            </div>

                            {stats ? (
                                <div className="space-y-4">
                                    {/* Tasks Section */}
                                    <div className="p-6 rounded-3xl bg-ash-50 border border-ash-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-900">
                                                    <ListTodo className="w-5 h-5" />
                                                </div>
                                                <p className="text-sm font-bold text-ash-900">Task Management</p>
                                            </div>
                                            <span className="text-primary-900 font-black text-lg">{stats.task_completion_percentage}%</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            <div className="text-center p-2 rounded-2xl bg-white/50">
                                                <p className="text-[9px] font-bold text-ash-400 uppercase tracking-widest">Total</p>
                                                <p className="text-sm font-black text-ash-900">{stats.total_tasks}</p>
                                            </div>
                                            <div className="text-center p-2 rounded-2xl bg-white/50">
                                                <p className="text-[9px] font-bold text-ash-400 uppercase tracking-widest">Done</p>
                                                <p className="text-sm font-black text-green-600">{stats.completed_tasks}</p>
                                            </div>
                                            <div className="text-center p-2 rounded-2xl bg-white/50">
                                                <p className="text-[9px] font-bold text-ash-400 uppercase tracking-widest">To Do</p>
                                                <p className="text-sm font-black text-orange-600">{stats.pending_tasks}</p>
                                            </div>
                                        </div>

                                        <div className="overflow-hidden h-1.5 flex rounded-full bg-ash-200">
                                            <div
                                                style={{ width: `${stats.task_completion_percentage}%` }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-mint-500 transition-all duration-700 ease-out"
                                            />
                                        </div>
                                    </div>

                                    {/* Team & Waitlist Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 rounded-3xl bg-ash-50 border border-ash-100">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-900 mb-3">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <p className="text-[10px] font-bold text-ash-400 uppercase tracking-widest mb-1">Organizers</p>
                                            <p className="text-xl font-black text-ash-900">{stats.total_organizers}</p>
                                        </div>
                                        <div className="p-5 rounded-3xl bg-ash-50 border border-ash-100">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-900 mb-3">
                                                <UserCheck className="w-4 h-4" />
                                            </div>
                                            <p className="text-[10px] font-bold text-ash-400 uppercase tracking-widest mb-1">Waitlist</p>
                                            <p className="text-xl font-black text-ash-900">{stats.waitlisted_attendees}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-5 rounded-3xl border border-dashed border-ash-200 text-ash-400 text-xs font-bold uppercase tracking-wider text-center flex-col py-10">
                                    <Shield className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="max-w-[200px]">Advanced event metrics are visible to the organizing team</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
