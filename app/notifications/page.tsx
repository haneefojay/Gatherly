'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, ListTodo, AlertTriangle, CheckCircle2, ChevronLeft, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Notification, PaginatedResponse } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { user } = useAuth();

    const fetchNotifications = async (pageNumber: number) => {
        try {
            const res = await api.get<PaginatedResponse<Notification>>(`/notifications?page=${pageNumber}&size=20`);
            if (pageNumber === 1) {
                setNotifications(res.data.items);
            } else {
                setNotifications(prev => [...prev, ...res.data.items]);
            }
            setTotalPages(res.data.pages);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications(1);
        }
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'task_assigned':
                return <ListTodo className="w-6 h-6 text-blue-400" />;
            case 'event_status_change':
                return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
            case 'registration_update':
                return <CheckCircle2 className="w-6 h-6 text-green-400" />;
            default:
                return <Bell className="w-6 h-6 text-primary-400" />;
        }
    };

    if (loading && page === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <Link href="/dashboard" className="text-ash-500 hover:text-ash-900 flex items-center gap-2 text-sm mb-2 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-ash-900">Notifications</h1>
                </div>

                {notifications.some(n => !n.is_read) && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={markAllAsRead}
                        className="flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map((n, index) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={cn(
                                "relative overflow-hidden transition-all duration-300",
                                !n.is_read ? "border-primary-500/30 bg-primary-500/5" : "hover:border-ash-600"
                            )}>
                                {!n.is_read && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-500" />
                                )}
                                <div className="flex gap-4 sm:gap-6">
                                    <div className={cn(
                                        "p-3 rounded-xl h-fit",
                                        !n.is_read ? "bg-primary-500/10" : "bg-ash-50"
                                    )}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <h3 className={cn(
                                                "font-bold text-lg",
                                                !n.is_read ? "text-ash-900" : "text-ash-900"
                                            )}>
                                                {n.title}
                                            </h3>
                                            <span className="text-xs text-ash-500">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-ash-600 mb-4 leading-relaxed">
                                            {n.message}
                                        </p>
                                        <div className="flex items-center gap-4">
                                            {n.link && (
                                                <Link href={n.link} onClick={() => !n.is_read && markAsRead(n.id)}>
                                                    <Button variant="primary" size="sm">
                                                        View Details
                                                    </Button>
                                                </Link>
                                            )}
                                            {!n.is_read && (
                                                <button
                                                    onClick={() => markAsRead(n.id)}
                                                    className="text-xs text-ash-500 hover:text-primary-400 transition-colors uppercase tracking-wider font-bold"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}

                    {page < totalPages && (
                        <div className="pt-4 text-center">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    const nextPage = page + 1;
                                    setPage(nextPage);
                                    fetchNotifications(nextPage);
                                }}
                            >
                                Load More
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <Card className="text-center py-20 bg-ash-50/20 border-dashed border-ash-200">
                    <div className="w-20 h-20 bg-ash-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Inbox className="w-10 h-10 text-ash-9500" />
                    </div>
                    <h2 className="text-xl font-bold text-ash-900 mb-2">Your inbox is empty</h2>
                    <p className="text-ash-500 max-w-xs mx-auto">
                        When you receive updates about your events or tasks, they'll appear here.
                    </p>
                    <Link href="/dashboard" className="inline-block mt-8">
                        <Button variant="secondary">Go to Dashboard</Button>
                    </Link>
                </Card>
            )}
        </div>
    );
}

