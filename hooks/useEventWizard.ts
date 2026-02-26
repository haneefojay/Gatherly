'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { EventWizardData } from '@/lib/types';

const STORAGE_KEY = 'gatherly_event_draft';
const AUTOSAVE_INTERVAL = 30000;

const DEFAULT_DATA: EventWizardData = {
    title: '',
    description: '',
    category_id: '',
    tags: [],
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    venue_name: '',
    location: '',
    latitude: undefined,
    longitude: undefined,
    capacity: 100,
    enable_waitlist: false,
    waitlist_limit: undefined,
    cover_image: null,
    gallery_images: [],
    video_url: '',
    organizer_emails: [],
    visibility: 'public',
    approval_required: false,
};

interface UseEventWizardReturn {
    data: EventWizardData;
    currentStep: number;
    totalSteps: number;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    updateData: (partial: Partial<EventWizardData>) => void;
    saveDraft: () => void;
    clearDraft: () => void;
    hasDraft: boolean;
    lastSaved: Date | null;
    draftEventId: string | null;
    setDraftEventId: (id: string) => void;
}

export function useEventWizard(): UseEventWizardReturn {
    const totalSteps = 7;
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState<EventWizardData>(DEFAULT_DATA);
    const [hasDraft, setHasDraft] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [draftEventId, setDraftEventId] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                const { _step, _eventId, _savedAt, ...formData } = parsed;
                setData((prev) => ({ ...prev, ...formData, cover_image: null, gallery_images: [] }));
                if (_step) setCurrentStep(_step);
                if (_eventId) setDraftEventId(_eventId);
                setHasDraft(true);
                setLastSaved(_savedAt ? new Date(_savedAt) : null);
            }
        } catch {
            // ignore corrupt data
        }
    }, []);

    const saveDraft = useCallback(() => {
        try {
            const { cover_image, gallery_images, ...serializable } = data;
            const payload = {
                ...serializable,
                _step: currentStep,
                _eventId: draftEventId,
                _savedAt: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            setLastSaved(new Date());
            setHasDraft(true);
        } catch {
            // storage full, ignore
        }
    }, [data, currentStep, draftEventId]);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            if (data.title) {
                saveDraft();
            }
        }, AUTOSAVE_INTERVAL);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [saveDraft, data.title]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setData(DEFAULT_DATA);
        setCurrentStep(1);
        setDraftEventId(null);
        setHasDraft(false);
        setLastSaved(null);
    }, []);

    const updateData = useCallback((partial: Partial<EventWizardData>) => {
        setData((prev) => ({ ...prev, ...partial }));
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStep((s) => Math.min(s + 1, totalSteps));
    }, []);

    const prevStep = useCallback(() => {
        setCurrentStep((s) => Math.max(s - 1, 1));
    }, []);

    return {
        data,
        currentStep,
        totalSteps,
        setStep: setCurrentStep,
        nextStep,
        prevStep,
        updateData,
        saveDraft,
        clearDraft,
        hasDraft,
        lastSaved,
        draftEventId,
        setDraftEventId,
    };
}
