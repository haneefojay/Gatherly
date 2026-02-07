'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { Event, PaginatedResponse } from '@/lib/types';
import EventCard from '@/components/events/EventCard';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { Search, Filter, X, Calendar, User as UserIcon, MapPin, Info, CheckSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import Link from "next/link";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [view, setView] = useState<'all' | 'mine'>('all');
    const [totalPages, setTotalPages] = useState(1);
    const [totalEvents, setTotalEvents] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Detailed Filters
    const [filters, setFilters] = useState({
        status: '',
        location: '',
        dateFrom: '',
        dateTo: '',
        hasCapacity: false,
    });

    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        fetchEvents();
    }, [page, searchQuery, view, filters]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const endpoint = view === 'mine' ? '/events/my-events' : '/events';
            const params = new URLSearchParams({
                page: page.toString(),
                size: '12',
            });

            if (searchQuery) {
                params.append('search', searchQuery);
            }

            // Apply filters
            if (filters.status) params.append('status', filters.status);
            if (filters.location) params.append('location', filters.location);
            if (filters.dateFrom) params.append('start_date_from', new Date(filters.dateFrom).toISOString());
            if (filters.dateTo) params.append('start_date_to', new Date(filters.dateTo).toISOString());
            if (filters.hasCapacity) params.append('has_capacity', 'true');

            const response = await api.get<PaginatedResponse<Event>>(`${endpoint}?${params}`);
            setEvents(response.data.items);
            setTotalPages(response.data.pages);
            setTotalEvents(response.data.total);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearchQuery(searchInput);
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            location: '',
            dateFrom: '',
            dateTo: '',
            hasCapacity: false,
        });
        setPage(1);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="px-2">
                <h1 className="text-4xl md:text-5xl font-extrabold text-ash-900 mb-2 tracking-tight">
                    Discover <span className="text-primary-900">Events</span>
                </h1>
                <p className="text-ash-500 font-medium text-lg italic opacity-80">Find and join amazing events happening around you</p>
            </div>

            {/* View Toggles & Rapid Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                {isAuthenticated && (
                    <div className="flex bg-white p-1.5 rounded-2xl w-fit border border-ash-200 shadow-sm">
                        <button
                            onClick={() => { setView('all'); setPage(1); }}
                            className={cn(
                                "flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300",
                                view === 'all'
                                    ? "bg-primary-900 text-white shadow-lg shadow-primary-900/20"
                                    : "text-ash-400 hover:text-ash-900 hover:bg-ash-50"
                            )}
                        >
                            <Calendar className="w-4 h-4" />
                            All Explorer
                        </button>
                        <button
                            onClick={() => { setView('mine'); setPage(1); }}
                            className={cn(
                                "flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300",
                                view === 'mine'
                                    ? "bg-primary-900 text-white shadow-lg shadow-primary-900/20"
                                    : "text-ash-400 hover:text-ash-900 hover:bg-ash-50"
                            )}
                        >
                            <UserIcon className="w-4 h-4" />
                            My Events
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <form onSubmit={handleSearch} className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ash-400 group-focus-within:text-primary-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full h-12 bg-white border border-ash-200 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary-900/5 focus:border-primary-900 transition-all font-medium"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => { setSearchInput(''); setSearchQuery(''); setPage(1); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-ash-300 hover:text-ash-900"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </form>
                    <Button
                        variant="secondary"
                        className={cn("h-12 rounded-2xl px-6 border-ash-200 transition-all", isFilterOpen && "bg-primary-900 text-white border-primary-900 hover:bg-primary-950")}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        <Filter className={cn("w-4 h-4", !isFilterOpen && "mr-2")} />
                        {!isFilterOpen && "Filters"}
                    </Button>
                </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, y: -20 }}
                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -20 }}
                        className="overflow-hidden"
                    >
                        <Card className="rounded-[2rem] border-ash-200 bg-white p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-extrabold text-ash-900 tracking-tight">Advanced Discovery</h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline"
                                >
                                    Reset Filters
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Select
                                    label="Status"
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    options={[
                                        { value: '', label: 'Any Status' },
                                        { value: 'draft', label: 'Draft' },
                                        { value: 'upcoming', label: 'Upcoming' },
                                        { value: 'ongoing', label: 'Ongoing' },
                                        { value: 'completed', label: 'Completed' },
                                        { value: 'cancelled', label: 'Cancelled' },
                                    ]}
                                    className="h-12"
                                />

                                <Input
                                    label="Location"
                                    placeholder="City or Venue"
                                    value={filters.location}
                                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                                    icon={<MapPin className="w-5 h-5" />}
                                />

                                <Input
                                    label="After Date"
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                                    icon={<Calendar className="w-5 h-5" />}
                                />

                                <Input
                                    label="Before Date"
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                                    icon={<Calendar className="w-5 h-5" />}
                                />
                            </div>

                            <div className="mt-8 pt-6 border-t border-ash-100 flex items-center justify-between">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={filters.hasCapacity}
                                            onChange={(e) => setFilters(prev => ({ ...prev, hasCapacity: e.target.checked }))}
                                        />
                                        <div className="w-6 h-6 border-2 border-ash-200 rounded-lg group-hover:border-primary-900 transition-colors peer-checked:bg-primary-900 peer-checked:border-primary-900" />
                                        <CheckSquare className="absolute inset-0 w-6 h-6 text-white p-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-sm font-bold text-ash-600 group-hover:text-ash-900 transition-colors uppercase tracking-tight">Available Spots Only</span>
                                </label>

                                <Button className="px-10 rounded-xl" onClick={() => setIsFilterOpen(false)}>
                                    Apply Optimization
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Events Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Spinner size="lg" />
                    <p className="text-xs font-bold text-ash-400 uppercase tracking-[0.2em] animate-pulse">Syncing events...</p>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-ash-200 border-dashed">
                    <div className="w-20 h-20 bg-ash-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-ash-300" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-ash-900 mb-2 tracking-tight">
                        {searchQuery ? 'No results found' : 'Empty Explorer'}
                    </h3>
                    <p className="text-ash-500 font-medium max-w-xs mx-auto mb-8">
                        {searchQuery ? 'We couldn\'t find any events matching your criteria.' : 'Create your first event to start the journey or explore other filters.'}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Button variant="secondary" className="rounded-xl px-8" onClick={clearFilters}>Clear Filters</Button>
                        <Link href="/events/create">
                            <Button className="rounded-xl px-8">Create Event</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-12">
                    <div className="px-2">
                        <p className="text-[10px] font-black text-ash-300 uppercase tracking-[0.3em] mb-4">Discovery Stream ({totalEvents})</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-10 border-t border-ash-100">
                            <Button
                                variant="secondary"
                                className="rounded-xl px-8 border-ash-200"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-ash-400 uppercase tracking-widest">Page</span>
                                <span className="text-lg font-black text-primary-900">{page}</span>
                                <span className="text-xs font-bold text-ash-400 uppercase tracking-widest">of {totalPages}</span>
                            </div>
                            <Button
                                variant="secondary"
                                className="rounded-xl px-8 border-ash-200"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


