import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatDateTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        draft: 'bg-gray-500',
        upcoming: 'bg-blue-500',
        ongoing: 'bg-green-500',
        completed: 'bg-purple-500',
        cancelled: 'bg-red-500',
    };
    return colors[status.toLowerCase()] || 'bg-gray-500';
}

export function getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
        draft: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        upcoming: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        ongoing: 'bg-green-500/20 text-green-300 border-green-500/30',
        completed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return classes[status.toLowerCase()] || classes.draft;
}
