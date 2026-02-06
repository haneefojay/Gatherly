import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-bold text-ash-800 mb-2 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            'w-full px-4 py-3 rounded-2xl appearance-none text-sm transition-all duration-300',
                            'bg-white border border-ash-200',
                            'text-ash-900',
                            'focus:outline-none focus:ring-4 focus:ring-primary-900/5 focus:border-primary-900',
                            'disabled:opacity-50 disabled:bg-ash-50 disabled:cursor-not-allowed',
                            error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500',
                            className
                        )}
                        {...props}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ash-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p className="mt-2 text-xs font-medium text-red-500 ml-1">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
