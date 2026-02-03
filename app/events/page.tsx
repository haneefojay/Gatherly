'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Event, PaginatedResponse } from '@/lib/types';
import EventCard from '@/components/events/EventCard';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Filter, X, Calendar, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [view, setView] = useState<'all' | 'mine'>('all');
    const [totalPages, setTotalPages] = useState(1);
    const [totalEvents, setTotalEvents] = useState(0);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        fetchEvents();
    }, [page, searchQuery, view]);

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

            const response = await api.get<PaginatedResponse<Event>>(`${endpoint}?${params}`);
            setEvents(response.data.items);
            setTotalPages(response.data.pages);
            setTotalEvents(response.data.total);
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

    return (
        <div className="min-h-screen bg-dark-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Discover <span className="text-gradient">Events</span>
                    </h1>
                    <p className="text-dark-400 text-lg">Find and join amazing events happening around you</p>
                </div>

                {/* View Toggles */}
                {isAuthenticated && (
                    <div className="flex bg-dark-800 p-1 rounded-xl w-fit mb-8 border border-dark-700">
                        <button
                            onClick={() => { setView('all'); setPage(1); }}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                view === 'all'
                                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                                    : "text-dark-400 hover:text-white"
                            )}
                        >
                            <Calendar className="w-4 h-4" />
                            All Events
                        </button>
                        <button
                            onClick={() => { setView('mine'); setPage(1); }}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                view === 'mine'
                                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                                    : "text-dark-400 hover:text-white"
                            )}
                        >
                            <UserIcon className="w-4 h-4" />
                            My Events
                        </button>
                    </div>
                )}

                {searchQuery && (
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-dark-300">
                            Found <span className="text-white font-bold">{totalEvents}</span> {totalEvents === 1 ? 'event' : 'events'} for "{searchQuery}"
                        </p>
                        <button
                            onClick={() => {
                                setSearchInput('');
                                setSearchQuery('');
                                setPage(1);
                            }}
                            className="text-sm text-primary-400 hover:text-primary-300 font-medium"
                        >
                            Clear search
                        </button>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative flex items-center">
                            <Input
                                type="text"
                                placeholder="Search events..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pr-20"
                            />
                            <div className="absolute right-2 flex items-center gap-1">
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchInput('');
                                            setSearchQuery('');
                                            setPage(1);
                                        }}
                                        className="p-1.5 text-dark-500 hover:text-white transition-colors"
                                        title="Clear search"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="p-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
                                    title="Search"
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </form>
                    <Button variant="secondary" className="sm:w-auto">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">
                            {searchQuery ? '�' : view === 'mine' ? '👤' : '�📅'}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {searchQuery
                                ? 'No events found'
                                : view === 'mine'
                                    ? 'You haven\'t created any events yet'
                                    : 'No events available'}
                        </h3>
                        <p className="text-dark-400">
                            {searchQuery
                                ? 'Try adjusting your search or filters'
                                : view === 'mine'
                                    ? 'Start by creating your first event to see it here!'
                                    : 'Check back later for new events!'}
                        </p>
                        {view === 'mine' && !searchQuery && (
                            <Button
                                className="mt-6"
                                onClick={() => window.location.href = '/events/create'}
                            >
                                Create Event
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {events.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-dark-300 px-4">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
