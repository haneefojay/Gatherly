'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Event } from '@/lib/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import EventForm from '@/components/events/EventForm';

export default function EditEventPage() {
    const router = useRouter();
    const { id } = useParams();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchEvent();
        }
    }, [id]);

    const fetchEvent = async () => {
        try {
            const response = await api.get<Event>(`/events/${id}`);
            setEvent(response.data);
        } catch (err: any) {
            setError(err.message || err.response?.data?.message || 'Failed to load event');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        setSaving(true);
        setError('');

        try {
            await api.put(`/events/${id}`, data);
            router.push(`/events/${id}`);
        } catch (err: any) {
            setError(err.message || err.response?.data?.message || 'Failed to update event');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center text-ash-900">
                Event not found
            </div>
        );
    }

    // Check permissions
    const isOrganizer = user && (event.organizer_ids.includes(user.id) || user.role === 'admin');

    if (!isOrganizer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-ash-900 mb-2">Access Denied</h1>
                    <p className="text-ash-400 mb-4">You do not have permission to edit this event.</p>
                    <Link href={`/events/${id}`}>
                        <Button variant="secondary">Go Back</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="max-w-4xl mx-auto px-2">
                <Link href={`/events/${id}`} className="inline-flex items-center text-ash-400 hover:text-primary-900 mb-6 transition-colors font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Event
                </Link>

                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-ash-900 mb-3 tracking-tight">
                        Edit Event
                    </h1>
                    <p className="text-ash-500 font-medium text-lg">Update the core details of your gathering.</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        {error}
                    </div>
                )}

                <Card className="rounded-[2.5rem] border border-ash-200 p-10 bg-white shadow-sm">
                    <EventForm
                        initialValues={event}
                        onSubmit={onSubmit}
                        isLoading={saving}
                        submitLabel="Save Changes"
                    />
                </Card>
            </div>
        </div>
    );
}
