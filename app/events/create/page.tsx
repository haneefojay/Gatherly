'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEventWizard } from '@/hooks/useEventWizard';
import WizardProgress from '@/components/events/wizard/WizardProgress';
import StepBasicInfo from '@/components/events/wizard/StepBasicInfo';
import StepDetails from '@/components/events/wizard/StepDetails';
import StepCapacity from '@/components/events/wizard/StepCapacity';
import StepMedia from '@/components/events/wizard/StepMedia';
import StepOrganizers from '@/components/events/wizard/StepOrganizers';
import StepSettings from '@/components/events/wizard/StepSettings';
import StepReview from '@/components/events/wizard/StepReview';
import { createDraftEvent, updateDraftEvent } from '@/lib/eventApi';
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const stepVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 60 : -60,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -60 : 60,
        opacity: 0,
    }),
};

export default function CreateEventPage() {
    const wizard = useEventWizard();
    const [direction, setDirection] = useState(1);
    const [saving, setSaving] = useState(false);

    const completedSteps = useMemo(() => {
        const completed: number[] = [];
        if (wizard.data.title) completed.push(1);
        if (wizard.data.start_date && wizard.data.start_time) completed.push(2);
        if (wizard.data.capacity > 0) completed.push(3);
        if (wizard.data.cover_image) completed.push(4);
        completed.push(5); // organizers always "valid" (you're the owner)
        completed.push(6); // settings always have defaults
        return completed;
    }, [wizard.data]);

    const handleNext = () => {
        setDirection(1);
        wizard.nextStep();
    };

    const handlePrev = () => {
        setDirection(-1);
        wizard.prevStep();
    };

    const handleStepClick = (step: number) => {
        setDirection(step > wizard.currentStep ? 1 : -1);
        wizard.setStep(step);
    };

    const handleSaveDraft = async () => {
        setSaving(true);
        try {
            wizard.saveDraft(); // save to localStorage first

            if (wizard.data.title) {
                if (wizard.draftEventId) {
                    await updateDraftEvent(wizard.draftEventId, wizard.data);
                } else {
                    const draft = await createDraftEvent(wizard.data);
                    wizard.setDraftEventId(draft.id);
                }
            }
        } catch {
            // API save failed, localStorage save still succeeded
        }
        setSaving(false);
    };

    const renderStep = () => {
        switch (wizard.currentStep) {
            case 1: return <StepBasicInfo data={wizard.data} updateData={wizard.updateData} />;
            case 2: return <StepDetails data={wizard.data} updateData={wizard.updateData} />;
            case 3: return <StepCapacity data={wizard.data} updateData={wizard.updateData} />;
            case 4: return <StepMedia data={wizard.data} updateData={wizard.updateData} />;
            case 5: return <StepOrganizers data={wizard.data} updateData={wizard.updateData} />;
            case 6: return <StepSettings data={wizard.data} updateData={wizard.updateData} />;
            case 7: return (
                <StepReview
                    data={wizard.data}
                    draftEventId={wizard.draftEventId}
                    setDraftEventId={wizard.setDraftEventId}
                    clearDraft={wizard.clearDraft}
                    onStepClick={handleStepClick}
                />
            );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Top Bar */}
            <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <header className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                Create Event
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            {wizard.lastSaved && (
                                <span className="hidden sm:block text-xs text-slate-400">
                                    Draft saved {formatDistanceToNow(wizard.lastSaved, { addSuffix: true })}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={saving}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Draft
                            </button>
                        </div>
                    </header>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
                <WizardProgress
                    currentStep={wizard.currentStep}
                    onStepClick={handleStepClick}
                    completedSteps={completedSteps}
                />

                {/* Step Content */}
                <div className="w-full max-w-[960px]">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={wizard.currentStep}
                            custom={direction}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Footer */}
                {wizard.currentStep < 7 && (
                    <div className="w-full max-w-[960px] mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            {wizard.currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={saving}
                                className="sm:hidden flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Draft
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleNext}
                            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary-600 text-white font-semibold shadow-lg shadow-primary-600/30 hover:bg-primary-700 hover:shadow-primary-600/40 transition-all flex items-center justify-center gap-2"
                        >
                            Next Step
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Bottom spacer */}
                <div className="h-20" />
            </div>
        </div>
    );
}
