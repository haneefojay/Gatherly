'use client';

import { EventWizardData } from '@/lib/types';
import { Users, ListChecks } from 'lucide-react';

interface StepCapacityProps {
    data: EventWizardData;
    updateData: (partial: Partial<EventWizardData>) => void;
}

export default function StepCapacity({ data, updateData }: StepCapacityProps) {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Capacity & Attendance
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Define the limits of your event to manage crowd control.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 lg:p-10 space-y-8">
                {/* Maximum Attendees */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Maximum Attendees</h2>
                    </div>
                    <div className="relative max-w-md">
                        <input
                            type="number"
                            min={1}
                            value={data.capacity || ''}
                            onChange={(e) => updateData({ capacity: parseInt(e.target.value) || 0 })}
                            placeholder="e.g. 500"
                            className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-600 focus:ring-primary-600 text-lg py-4 px-4 pr-20 placeholder:text-slate-400 transition-shadow"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                            people
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Set the hard limit for registrations. Leave blank for unlimited.
                    </p>
                </div>

                {/* Waitlist Toggle */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600">
                                <ListChecks className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Enable Waitlist</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Automatically add attendees to a waitlist when the maximum capacity is reached.
                                    We&apos;ll notify you when spots open up.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={data.enable_waitlist}
                            onClick={() => updateData({ enable_waitlist: !data.enable_waitlist })}
                            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${data.enable_waitlist ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.enable_waitlist ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Conditional Waitlist Limit */}
                    {data.enable_waitlist && (
                        <div className="ml-11 space-y-2 animate-in slide-in-from-top-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Waitlist Limit (Optional)
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={data.waitlist_limit || ''}
                                onChange={(e) => updateData({ waitlist_limit: parseInt(e.target.value) || undefined })}
                                placeholder="e.g. 50"
                                className="block w-48 rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-600 focus:ring-primary-600 text-sm py-2.5 px-3 placeholder:text-slate-400"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
