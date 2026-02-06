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
        draft: 'bg-ash-600',
        upcoming: 'bg-primary-500',
        ongoing: 'bg-secondary-400',
        completed: 'bg-success',
        cancelled: 'bg-error',
        registered: 'bg-success',
        waitlisted: 'bg-warning',
    };
    return colors[status.toLowerCase()] || 'bg-ash-600';
}

export function getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
        draft: 'bg-ash-100 text-ash-700 border-ash-200',
        upcoming: 'bg-mint-100 text-primary-900 border-mint-200',
        ongoing: 'bg-blue-50 text-blue-700 border-blue-100',
        completed: 'bg-green-50 text-green-700 border-green-100',
        cancelled: 'bg-red-50 text-red-700 border-red-100',
        registered: 'bg-primary-50 text-primary-900 border-primary-200',
        waitlisted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    };
    return classes[status.toLowerCase()] || 'bg-ash-100 text-ash-700 border-ash-200';
}
