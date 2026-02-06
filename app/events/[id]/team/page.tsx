'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Event, User } from '@/lib/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { ArrowLeft, UserPlus, Trash2, Shield, Mail, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const addOrganizerSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type AddOrganizerData = z.infer<typeof addOrganizerSchema>;

export default function TeamPage() {
    const router = useRouter();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<Event | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [potentialOrganizers, setPotentialOrganizers] = useState<User[]>([]);

    // Error state
    const [pageError, setPageError] = useState<string | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);

    // Confirmation Modal State
    const [showConfirmRemove, setShowConfirmRemove] = useState(false);
    const [organizerToRemove, setOrganizerToRemove] = useState<string | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    // Combobox state
    const [isComboboxOpen, setIsComboboxOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<AddOrganizerData>({
        resolver: zodResolver(addOrganizerSchema)
    });

    const emailValue = watch('email');

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    useEffect(() => {
        if (isAddModalOpen) {
            fetchPotentialOrganizers();
            setModalError(null);
        }
    }, [isAddModalOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsComboboxOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get<Event>(`/events/${id}`);
            setEvent(data);
            setPageError(null);
        } catch (error: any) {
            console.error('Failed to fetch event data', error);
            const msg = error.response?.data?.detail || 'Failed to load event data';
            setPageError(msg);
        } finally {
            setLoading(false);
        }
    };

    const fetchPotentialOrganizers = async () => {
        try {
            const { data } = await api.get<User[]>('/users?role=organizer');
            const currentIds = event?.organizers?.map(o => o.id) || [];
            const available = data.filter(u => !currentIds.includes(u.id));
            setPotentialOrganizers(available);
        } catch (error) {
            console.error('Failed to fetch potential organizers', error);
        }
    };

    const handleAddOrganizer = async (data: AddOrganizerData) => {
        setModalError(null);
        try {
            await api.post(`/events/${id}/organizers`, { email: data.email });
            setIsAddModalOpen(false);
            reset();
            fetchData();
        } catch (error: any) {
            console.error('Failed to add organizer', error);
            const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to add organizer';
            setModalError(Array.isArray(msg) ? msg[0].msg : msg);
        }
    };

    const initiateRemoveOrganizer = (organizerId: string) => {
        setOrganizerToRemove(organizerId);
        setShowConfirmRemove(true);
        setPageError(null);
    };

    const handleConfirmRemove = async () => {
        if (!organizerToRemove) return;
        setIsRemoving(true);
        try {
            await api.delete(`/events/${id}/organizers/${organizerToRemove}`);
            setShowConfirmRemove(false);
            setOrganizerToRemove(null);
            fetchData();
        } catch (error: any) {
            console.error('Failed to remove organizer', error);
            const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to remove organizer';
            setPageError(msg);
            setShowConfirmRemove(false); // Close modal even on error to show page error
        } finally {
            setIsRemoving(false);
        }
    };

    // Filter potential organizers based on input
    const filteredOptions = potentialOrganizers.filter(u =>
        !emailValue ||
        u.email.toLowerCase().includes(emailValue.toLowerCase()) ||
        u.full_name.toLowerCase().includes(emailValue.toLowerCase())
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

    const isOrganizer = user && event && (event.organizer_ids.includes(user.id) || user.role === 'admin');

    if (!isOrganizer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-ash-900 mb-2">Access Denied</h1>
                    <p className="text-ash-400 mb-4">Only organizers can manage the team.</p>
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

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-ash-900 mb-3 tracking-tight">
                            Manage Team
                        </h1>
                        <p className="text-ash-500 font-medium text-lg">
                            Organizers for <span className="text-primary-900 font-bold">{event?.title}</span>
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="rounded-xl px-8 h-12 shadow-primary"
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Add Organizer
                    </Button>
                </div>

                {pageError && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        {pageError}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {event?.organizers?.map(organizer => (
                        <Card key={organizer.id} className="flex items-center justify-between p-5 hover:border-primary-900/10 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-mint-100 flex items-center justify-center text-primary-900 border border-mint-200">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-ash-900 font-bold text-lg">{organizer.full_name}</h3>
                                    <p className="text-ash-500 text-sm flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" />
                                        {organizer.email}
                                    </p>
                                </div>
                            </div>

                            {organizer.id === event.created_by_id ? (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-900 text-white shadow-md">
                                    <Shield className="w-3 h-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Owner</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => initiateRemoveOrganizer(organizer.id)}
                                    className="p-3 text-ash-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    title="Remove Organizer"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </Card>
                    ))}
                </div>

                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Add Team Member"
                >
                    <div className="p-1">
                        {modalError && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(handleAddOrganizer)} className="space-y-8">
                            <div className="space-y-1.5 relative" ref={dropdownRef}>
                                <label className="block text-sm font-bold text-ash-900 mb-2 ml-1">Organizer Email</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        className="w-full h-12 pl-4 pr-12 rounded-xl bg-ash-50 border border-ash-200 text-ash-900 placeholder:text-ash-400 focus:outline-none focus:ring-4 focus:ring-primary-900/5 focus:border-primary-900 transition-all"
                                        placeholder="Enter email or search by name..."
                                        autoComplete="off"
                                        {...register('email')}
                                        onFocus={() => setIsComboboxOpen(true)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsComboboxOpen(!isComboboxOpen)}
                                        className="absolute right-0 top-0 h-full px-4 text-ash-400 hover:text-primary-900 transition-colors"
                                    >
                                        <ChevronDown className={cn("w-5 h-5 transition-transform", isComboboxOpen && "rotate-180")} />
                                    </button>
                                </div>

                                {isComboboxOpen && (
                                    <div className="absolute z-[60] w-full mt-2 bg-white border border-ash-200 rounded-2xl shadow-2xl max-h-72 overflow-y-auto animate-fade-in divide-y divide-ash-50">
                                        {filteredOptions.length > 0 ? (
                                            filteredOptions.map((u) => (
                                                <div
                                                    key={u.id}
                                                    onClick={() => {
                                                        setValue('email', u.email);
                                                        setIsComboboxOpen(false);
                                                    }}
                                                    className="px-5 py-4 hover:bg-mint-50 cursor-pointer flex items-center gap-4 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-ash-100 flex items-center justify-center text-ash-600 font-bold text-sm">
                                                        {u.full_name?.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-ash-900 font-bold block truncate">{u.full_name}</span>
                                                        <span className="text-ash-400 text-xs block truncate">{u.email}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center">
                                                <p className="text-ash-400 text-sm font-medium italic">No organizers found</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {errors.email && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.email.message}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-6 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    className="px-8 rounded-xl shadow-primary"
                                >
                                    Add Member
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>

                <ConfirmationModal
                    isOpen={showConfirmRemove}
                    onClose={() => setShowConfirmRemove(false)}
                    onConfirm={handleConfirmRemove}
                    title="Remove Team Member"
                    message="Are you sure you want to remove this organizer? They will lose all management access to this event."
                    confirmLabel="Remove Member"
                    isLoading={isRemoving}
                />
            </div>
        </div>
    );
}
