'use client';

import { motion } from 'framer-motion';

interface Step {
    number: number;
    label: string;
}

const STEPS: Step[] = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Details' },
    { number: 3, label: 'Capacity' },
    { number: 4, label: 'Media' },
    { number: 5, label: 'Organizers' },
    { number: 6, label: 'Settings' },
    { number: 7, label: 'Review' },
];

interface WizardProgressProps {
    currentStep: number;
    onStepClick: (step: number) => void;
    completedSteps: number[];
}

export default function WizardProgress({ currentStep, onStepClick, completedSteps }: WizardProgressProps) {
    const progress = (currentStep / STEPS.length) * 100;

    return (
        <div className="w-full max-w-[960px] mb-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm font-medium mb-6 overflow-x-auto pb-2 scrollbar-none">
                {STEPS.map((step, i) => {
                    const isActive = step.number === currentStep;
                    const isCompleted = completedSteps.includes(step.number);
                    const isAccessible = step.number <= currentStep || isCompleted;

                    return (
                        <div key={step.number} className="flex items-center gap-2">
                            {i > 0 && (
                                <span className="text-slate-300 dark:text-slate-600">/</span>
                            )}
                            <button
                                onClick={() => isAccessible && onStepClick(step.number)}
                                disabled={!isAccessible}
                                className={`whitespace-nowrap flex items-center gap-1.5 transition-colors ${isActive
                                        ? 'text-primary-600'
                                        : isCompleted
                                            ? 'text-success-600 hover:text-primary-600 cursor-pointer'
                                            : isAccessible
                                                ? 'text-slate-500 dark:text-slate-400 hover:text-primary-600 cursor-pointer'
                                                : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                {isActive && (
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold">
                                        {step.number}
                                    </span>
                                )}
                                {isCompleted && !isActive && (
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-success-500 text-white">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                )}
                                {step.label}
                            </button>
                        </div>
                    );
                })}
            </nav>

            {/* Progress bar */}
            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}
