'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle2, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { Notification, PaginatedResponse } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const bellRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const [notifsRes, countRes] = await Promise.all([
                api.get<PaginatedResponse<Notification>>('/notifications?size=5'),
                api.get<{ count: number }>('/notifications/unread-count')
            ]);
            setNotifications(notifsRes.data.items);
            setUnreadCount(countRes.data.count);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        // Fetch initial state once for this user/retry
        fetchNotifications();

        // Setup WebSocket for real-time updates
        const token = localStorage.getItem('access_token');
        if (!token) return;

        // Construct WS URL reliably
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const wsBase = apiUrl.replace(/^http/, 'ws');
        const cleanWsBase = wsBase.endsWith('/') ? wsBase.slice(0, -1) : wsBase;
        const wsUrl = `${cleanWsBase}/notifications/ws/${user.id}?token=${token}`;

        let socket: WebSocket | null = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'new_notification') {
                    setNotifications(prev => [data.notification, ...prev].slice(0, 10));
                    setUnreadCount(data.unread_count);
                }
            } catch (err) {
                console.error('Failed to parse websocket message', err);
            }
        };

        socket.onclose = () => {
            socket = null;
            setTimeout(() => {
                setRetryCount(prev => prev + 1); // This triggers the effect to re-run
            }, 5000);
        };

        socket.onerror = (error) => {
            console.error('Notification WebSocket error:', error);
            // socket.close() will trigger onclose
        };

        return () => {
            if (socket) {
                socket.onclose = null; // Prevent reconnection on manual cleanup
                socket.close();
            }
        };
    }, [user, retryCount]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
        setIsOpen(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'task_assigned':
                return <ListTodo className="w-5 h-5 text-blue-400" />;
            case 'event_status_change':
                return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case 'registration_update':
                return <CheckCircle2 className="w-5 h-5 text-green-400" />;
            default:
                return <Info className="w-5 h-5 text-primary-400" />;
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-ash-600 hover:text-primary-600 transition-colors rounded-full hover:bg-ash-100"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-600 text-[10px] items-center justify-center text-white font-bold">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-ash-200 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                        <div className="p-4 border-b border-ash-200 flex items-center justify-between bg-ash-50">
                            <h3 className="font-bold text-ash-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium transition-colors"
                                >
                                    <Check className="w-3 h-3" />
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-ash-100">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={cn(
                                                "p-4 flex gap-4 cursor-pointer transition-colors hover:bg-ash-50 relative group",
                                                !n.is_read && "bg-primary-50"
                                            )}
                                        >
                                            {!n.is_read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600" />
                                            )}
                                            <div className="mt-1 flex-shrink-0">
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <p className={cn(
                                                        "text-sm font-semibold truncate",
                                                        n.is_read ? "text-ash-600" : "text-ash-900"
                                                    )}>
                                                        {n.title}
                                                    </p>
                                                    <span className="text-[10px] text-ash-400 whitespace-nowrap">
                                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-ash-500 line-clamp-2">
                                                    {n.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center">
                                    <div className="w-16 h-16 bg-ash-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bell className="w-8 h-8 text-ash-400" />
                                    </div>
                                    <p className="text-ash-700 font-medium">All caught up!</p>
                                    <p className="text-xs text-ash-500 mt-1">No new notifications.</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <Link
                                href="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="block p-3 text-center text-xs text-ash-500 hover:text-ash-900 hover:bg-ash-50 transition-colors border-t border-ash-200 font-medium"
                            >
                                View all notifications
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
