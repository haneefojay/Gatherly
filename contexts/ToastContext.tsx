'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useToast, ToastType, Toast } from '@/hooks/useToast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ToastContextType {
    addToast: (props: { type: ToastType; message: string; duration?: number }) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToastContext must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const { toasts, addToast, removeToast } = useToast();

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-primary-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    const borders = {
        success: 'border-l-primary-500',
        error: 'border-l-red-500',
        warning: 'border-l-yellow-500',
        info: 'border-l-blue-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`pointer-events-auto bg-white shadow-lg rounded-lg p-4 flex items-start gap-3 w-80 border-l-4 ${borders[toast.type]} border-ash-100/50 backdrop-blur-sm bg-white/95`}
        >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1">
                <p className={`text-sm font-medium text-ash-800`}>{toast.message}</p>
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-ash-400 hover:text-ash-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};
