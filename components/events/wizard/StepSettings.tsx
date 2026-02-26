'use client';

import { EventWizardData } from '@/lib/types';
import { Eye, EyeOff, Link2, ShieldCheck } from 'lucide-react';

interface StepSettingsProps {
    data: EventWizardData;
    updateData: (partial: Partial<EventWizardData>) => void;
}

const VISIBILITY_OPTIONS = [
    {
        value: 'public' as const,
        label: 'Public',
        description: 'Anyone can search for and view this event. It will appear in public directories and search engines.',
        icon: Eye,
    },
    {
        value: 'private' as const,
        label: 'Private',
        description: 'Only people with the link or invitation can view this event. It will not be indexed.',
        icon: EyeOff,
    },
    {
        value: 'unlisted' as const,
        label: 'Unlisted',
        description: 'Hidden from search results, but anyone with the link can view.',
        icon: Link2,
    },
];

export default function StepSettings({ data, updateData }: StepSettingsProps) {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Step 6 of 7</p>
                    <span className="bg-primary-600/10 text-primary-600 px-2.5 py-1 rounded text-xs font-bold">Draft</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    Final Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Configure visibility, approval settings, and review before going live.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Visibility Section */}
                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <Eye className="w-6 h-6 text-primary-600" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Event Visibility</h3>
                    </div>
                    <div className="grid gap-4">
                        {VISIBILITY_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            const isSelected = data.visibility === option.value;
                            return (
                                <label
                                    key={option.value}
                                    className={`group relative flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all ${isSelected
                                            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 dark:border-primary-700'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-primary-400/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="flex h-6 items-center">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value={option.value}
                                            checked={isSelected}
                                            onChange={() => updateData({ visibility: option.value })}
                                            className="h-5 w-5 border-2 border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-600 focus:ring-offset-0 dark:focus:ring-offset-slate-800 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-900 dark:text-white font-semibold text-base mb-1 flex items-center gap-2">
                                            {option.label}
                                            <Icon className="w-4 h-4 text-slate-400" />
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                                            {option.description}
                                        </span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Approval Section */}
                <div className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="hidden sm:flex items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 shrink-0 w-12 h-12">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-900 dark:text-white text-base font-bold mb-1">
                                    Require Attendee Approval
                                </span>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
                                    If enabled, you must manually approve each attendee before they receive a
                                    ticket or confirmation.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={data.approval_required}
                            onClick={() => updateData({ approval_required: !data.approval_required })}
                            className={`relative inline-flex h-[30px] w-[52px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${data.approval_required ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-[26px] w-[26px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.approval_required ? 'translate-x-[22px]' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
