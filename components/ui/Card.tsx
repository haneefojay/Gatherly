import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
}

export default function Card({ children, className, hover = false, glass = true }: CardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl p-6 transition-all duration-300',
                glass
                    ? 'bg-white/80 backdrop-blur-md border border-ash-200 shadow-sm'
                    : 'bg-white border border-ash-200 shadow-sm',
                hover && 'hover:shadow-md hover:border-ash-300 cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
}
