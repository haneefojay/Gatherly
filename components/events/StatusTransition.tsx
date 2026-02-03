'use client';

import { useState } from 'react';
import { Event } from '@/lib/types';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import api from '@/lib/api';
import { Play, CheckCircle, XCircle, Send } from 'lucide-react';

interface StatusTransitionProps {
    event: Event;
    onUpdate: () => void;
}

const ALLOWED_TRANSITIONS: Record<string, { target: string; label: string; icon: any; color: string; message: string; variant?: 'info' | 'warning' | 'danger' }[]> = {
    'draft': [
        {
            target: 'upcoming',
            label: 'Publish Event',
            icon: Send,
            color: 'text-blue-400',
            message: 'Are you sure you want to publish this event? It will become visible to all users.',
            variant: 'info'
        },
        {
            target: 'cancelled',
            label: 'Cancel Event',
            icon: XCircle,
            color: 'text-red-400',
            message: 'Are you sure you want to cancel this draft? This action cannot be undone.',
            variant: 'danger'
        }
    ],
    'upcoming': [
        {
            target: 'ongoing',
            label: 'Start Event',
            icon: Play,
            color: 'text-green-400',
            message: 'Start the event? This usually means checking in has begun or the program is live.',
            variant: 'warning'
        },
        {
            target: 'cancelled',
            label: 'Cancel Event',
            icon: XCircle,
            color: 'text-red-400',
            message: 'Are you sure you want to cancel this upcoming event? All registered attendees will be notified.',
            variant: 'danger'
        }
    ],
    'ongoing': [
        {
            target: 'completed',
            label: 'Complete Event',
            icon: CheckCircle,
            color: 'text-purple-400',
            message: 'Mark this event as completed? This will close registration and archival details will be set.',
            variant: 'info'
        },
        {
            target: 'cancelled',
            label: 'Cancel Event',
            icon: XCircle,
            color: 'text-red-400',
            message: 'Are you sure you want to cancel this ongoing event?',
            variant: 'danger'
        }
    ],
    'completed': [],
    'cancelled': []
};

export default function StatusTransition({ event, onUpdate }: StatusTransitionProps) {
    const transitions = ALLOWED_TRANSITIONS[event.status] || [];
    const [selectedTransition, setSelectedTransition] = useState<typeof transitions[0] | null>(null);
    const [loading, setLoading] = useState(false);

    if (transitions.length === 0) return null;

    const handleTransition = async () => {
        if (!selectedTransition) return;

        setLoading(true);
        try {
            await api.put(`/events/${event.id}`, { status: selectedTransition.target });
            setSelectedTransition(null);
            onUpdate();
        } catch (error) {
            console.error('Failed to transition event status:', error);
            alert('Failed to update event status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-4 mt-4 border-t border-dark-700/50">
            <h3 className="text-xs uppercase tracking-wider text-dark-500 font-bold mb-3">Change Status</h3>
            <div className="flex flex-col gap-2">
                {transitions.map((t) => (
                    <button
                        key={t.target}
                        onClick={() => setSelectedTransition(t)}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-md bg-dark-800/50 border border-dark-700 hover:border-dark-600 transition-all text-sm group`}
                    >
                        <t.icon className={`w-4 h-4 ${t.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-dark-200 group-hover:text-white transition-colors">{t.label}</span>
                    </button>
                ))}
            </div>

            {selectedTransition && (
                <ConfirmationModal
                    isOpen={!!selectedTransition}
                    onClose={() => setSelectedTransition(null)}
                    onConfirm={handleTransition}
                    title={selectedTransition.label}
                    message={selectedTransition.message}
                    confirmLabel={selectedTransition.label.split(' ')[0]}
                    variant={selectedTransition.variant}
                    isLoading={loading}
                />
            )}
        </div>
    );
}
