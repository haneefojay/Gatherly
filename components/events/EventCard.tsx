import Link from 'next/link';
import { Event } from '@/lib/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn, formatDateTime } from '@/lib/utils';
import { Calendar, MapPin, Users } from 'lucide-react';

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    const availableSpots = event.capacity - event.current_attendees;
    const capacityPercentage = (event.current_attendees / event.capacity) * 100;

    return (
        <Link href={`/events/${event.id}`}>
            <Card hover className="h-full group">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                            <Badge variant="status" status={event.status} className="mb-3 px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-widest">
                                {event.status}
                            </Badge>
                            <h3 className="text-xl font-extrabold text-ash-900 line-clamp-2 leading-tight tracking-tight group-hover:text-primary-900 transition-colors">
                                {event.title}
                            </h3>
                        </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                        <p className="text-ash-500 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">
                            {event.description}
                        </p>
                    )}

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-ash-600 text-xs font-bold uppercase tracking-wider">
                            <Calendar className="w-4 h-4 text-primary-900" />
                            <span>{new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {event.location && (
                            <div className="flex items-center gap-3 text-ash-600 text-xs font-bold uppercase tracking-wider">
                                <MapPin className="w-4 h-4 text-primary-900" />
                                <span className="line-clamp-1">{event.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-ash-600 text-xs font-bold uppercase tracking-wider">
                            <Users className="w-4 h-4 text-primary-900" />
                            <span>
                                {event.current_attendees} / {event.capacity} Joined
                            </span>
                        </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="mt-auto pt-4 border-t border-ash-100">
                        <div className="flex items-center justify-between text-[10px] font-bold text-ash-400 uppercase tracking-widest mb-2">
                            <span>Capacity Usage</span>
                            <span>{Math.round(capacityPercentage)}%</span>
                        </div>
                        <div className="w-full bg-ash-100 rounded-full h-2 overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-700",
                                    capacityPercentage >= 100 ? "bg-red-500" : "bg-primary-900"
                                )}
                                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                            />
                        </div>
                        {availableSpots > 0 && availableSpots <= 5 && (
                            <p className="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-widest">Last {availableSpots} spots!</p>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
}
