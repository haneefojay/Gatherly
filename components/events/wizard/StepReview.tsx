'use client';

import { useState } from 'react';
import { EventWizardData } from '@/lib/types';
import { createDraftEvent, updateDraftEvent, publishEvent, uploadEventImage, addVideoEmbed, addTagsToEvent, addOrganizerToEvent } from '@/lib/eventApi';
import {
    Calendar, MapPin, Users, Image, Settings, Tag,
    Check, Loader2, Edit3, Rocket, Eye, EyeOff, Link2, ShieldCheck
} from 'lucide-react';

interface StepReviewProps {
    data: EventWizardData;
    draftEventId: string | null;
    setDraftEventId: (id: string) => void;
    clearDraft: () => void;
    onStepClick: (step: number) => void;
}

function SectionCard({ title, icon: Icon, stepNumber, onEdit, children }: {
    title: string;
    icon: React.ElementType;
    stepNumber: number;
    onEdit: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                    <Icon className="w-4.5 h-4.5 text-primary-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
                </div>
                <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
                {children}
            </div>
        </div>
    );
}

function InfoRow({ label, value, className }: { label: string; value: string; className?: string }) {
    return (
        <div className={`flex items-start justify-between gap-4 ${className || ''}`}>
            <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">{label}</span>
            <span className="text-slate-900 dark:text-white font-medium text-right">{value || '—'}</span>
        </div>
    );
}

export default function StepReview({ data, draftEventId, setDraftEventId, clearDraft, onStepClick }: StepReviewProps) {
    const [publishing, setPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const visibilityLabels: Record<string, string> = { public: 'Public', private: 'Private', unlisted: 'Unlisted' };

    const handlePublish = async () => {
        setPublishing(true);
        setError(null);

        try {
            let eventId = draftEventId;

            if (!eventId) {
                const draft = await createDraftEvent(data);
                eventId = draft.id;
                setDraftEventId(eventId);
            } else {
                await updateDraftEvent(eventId, data);
            }

            if (data.cover_image) {
                await uploadEventImage(eventId, data.cover_image, true);
            }
            for (const file of data.gallery_images) {
                await uploadEventImage(eventId, file, false);
            }
            if (data.video_url) {
                await addVideoEmbed(eventId, data.video_url);
            }
            if (data.tags.length > 0) {
                await addTagsToEvent(eventId, data.tags);
            }
            for (const email of data.organizer_emails) {
                try {
                    await addOrganizerToEvent(eventId, email);
                } catch {
                    // organizer invite failed, continue
                }
            }

            await publishEvent(eventId);
            setPublished(true);
            clearDraft();
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to publish event. Please try again.';
            setError(errorMsg);
        } finally {
            setPublishing(false);
        }
    };

    if (published) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                    <Check className="w-10 h-10 text-success-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Event Published! 🎉</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md">
                    Your event is now live and ready for attendees. Share the link to start getting registrations.
                </p>
                <div className="flex gap-4">
                    <a
                        href="/dashboard"
                        className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Go to Dashboard
                    </a>
                    <a
                        href={`/events/${draftEventId}`}
                        className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold shadow-lg shadow-primary-600/30 hover:bg-primary-700 transition-all"
                    >
                        View Event
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Review & Publish
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Review all the details before publishing your event. Click &quot;Edit&quot; to make changes.
                </p>
            </div>

            <div className="space-y-4">
                {/* Basic Info */}
                <SectionCard title="Basic Information" icon={Tag} stepNumber={1} onEdit={() => onStepClick(1)}>
                    <InfoRow label="Title" value={data.title} />
                    <InfoRow label="Tags" value={data.tags.join(', ')} />
                    {data.description && (
                        <div>
                            <span className="text-slate-500 dark:text-slate-400 text-sm">Description</span>
                            <div
                                className="mt-1 text-sm text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: data.description }}
                            />
                        </div>
                    )}
                </SectionCard>

                {/* Schedule & Location */}
                <SectionCard title="Schedule & Location" icon={Calendar} stepNumber={2} onEdit={() => onStepClick(2)}>
                    <InfoRow label="Starts" value={data.start_date && data.start_time ? `${data.start_date} at ${data.start_time}` : ''} />
                    <InfoRow label="Ends" value={data.end_date && data.end_time ? `${data.end_date} at ${data.end_time}` : ''} />
                    <InfoRow label="Timezone" value={data.timezone} />
                    <InfoRow label="Venue" value={data.venue_name} />
                    <InfoRow label="Address" value={data.location} />
                </SectionCard>

                {/* Capacity */}
                <SectionCard title="Capacity" icon={Users} stepNumber={3} onEdit={() => onStepClick(3)}>
                    <InfoRow label="Max Attendees" value={data.capacity ? String(data.capacity) : 'Unlimited'} />
                    <InfoRow label="Waitlist" value={data.enable_waitlist ? 'Enabled' : 'Disabled'} />
                    {data.enable_waitlist && data.waitlist_limit && (
                        <InfoRow label="Waitlist Limit" value={String(data.waitlist_limit)} />
                    )}
                </SectionCard>

                {/* Media */}
                <SectionCard title="Media" icon={Image} stepNumber={4} onEdit={() => onStepClick(4)}>
                    <InfoRow label="Cover Image" value={data.cover_image ? '✓ Uploaded' : 'Not uploaded'} />
                    <InfoRow label="Gallery Images" value={`${data.gallery_images.length} photo(s)`} />
                    <InfoRow label="Video URL" value={data.video_url || 'None'} />
                </SectionCard>

                {/* Organizers */}
                <SectionCard title="Organizers" icon={Users} stepNumber={5} onEdit={() => onStepClick(5)}>
                    <InfoRow label="You" value="Owner" />
                    {data.organizer_emails.map((email) => (
                        <InfoRow key={email} label={email} value="Co-organizer" />
                    ))}
                    {data.organizer_emails.length === 0 && (
                        <p className="text-slate-400 text-sm italic">No co-organizers added</p>
                    )}
                </SectionCard>

                {/* Settings */}
                <SectionCard title="Settings" icon={Settings} stepNumber={6} onEdit={() => onStepClick(6)}>
                    <InfoRow label="Visibility" value={visibilityLabels[data.visibility]} />
                    <InfoRow label="Approval Required" value={data.approval_required ? 'Yes' : 'No'} />
                </SectionCard>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* Publish Button */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    type="button"
                    onClick={() => onStepClick(1)}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Eye className="w-4 h-4" />
                    Preview Before Publish
                </button>
                <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing || !data.title}
                    className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary-600 text-white font-bold shadow-lg shadow-primary-600/30 hover:bg-primary-700 hover:shadow-primary-600/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                    {publishing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Publishing...
                        </>
                    ) : (
                        <>
                            Publish Event
                            <Rocket className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
