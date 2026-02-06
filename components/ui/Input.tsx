import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, type = 'text', icon, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-bold text-ash-800 mb-2 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    <input
                        type={inputType}
                        ref={ref}
                        className={cn(
                            'w-full px-4 py-3 rounded-2xl text-sm transition-all duration-300',
                            'bg-white border border-ash-200',
                            'text-ash-900 placeholder:text-ash-400',
                            'focus:outline-none focus:ring-4 focus:ring-primary-900/5 focus:border-primary-900',
                            'disabled:opacity-50 disabled:bg-ash-50 disabled:cursor-not-allowed',
                            isPassword && 'pr-12',
                            icon && 'pl-12',
                            error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500',
                            className
                        )}
                        {...props}
                    />
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-colors text-ash-400 group-focus-within:text-primary-900">
                            {icon}
                        </div>
                    )}
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-ash-400 hover:text-ash-900 focus:outline-none transition-colors p-1"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="mt-2 text-xs font-medium text-red-500 ml-1">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-2 text-xs font-medium text-ash-500 ml-1">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
