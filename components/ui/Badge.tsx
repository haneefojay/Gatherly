import React from 'react';
import { cn, getStatusBadgeClass } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'status';
    status?: string;
    className?: string;
}

export default function Badge({ children, variant = 'default', status, className }: BadgeProps) {
    if (variant === 'status' && status) {
        return (
            <span
                className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    getStatusBadgeClass(status),
                    className
                )}
            >
                {children}
            </span>
        );
    }

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                'bg-primary-50 text-primary-700 border border-primary-200',
                className
            )}
        >
            {children}
        </span>
    );
}
