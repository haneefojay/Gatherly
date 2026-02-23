'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TaskCreateRequest, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input, InputProps } from '@/components/ui/input';

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    assignee_id: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
    assignees: User[];
    onSubmit: (data: TaskCreateRequest) => Promise<void>;
    isLoading: boolean;
    initialValues?: Partial<TaskFormData>;
    submitLabel?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, InputProps & { label: string; error?: string }>(
    ({ label, error, className, ...props }, ref) => (
        <div className="space-y-1.5 w-full">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            <Input ref={ref} className={className} {...props} />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    )
);
FormInput.displayName = "FormInput";

export default function TaskForm({ assignees, onSubmit, isLoading, initialValues, submitLabel = 'Create Task' }: TaskFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: initialValues?.title || '',
            description: initialValues?.description || '',
            assignee_id: initialValues?.assignee_id || '',
        },
    });

    const onFormSubmit = async (data: TaskFormData) => {
        // If assignee_id is empty string, make it undefined
        const cleanData = {
            ...data,
            assignee_id: data.assignee_id === '' ? undefined : data.assignee_id
        };
        await onSubmit(cleanData);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <FormInput
                label="Task Title"
                placeholder="e.g. Set up projector"
                error={errors.title?.message}
                {...register('title')}
            />

            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                    className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all min-h-[100px]"
                    placeholder="Details about the task..."
                    {...register('description')}
                />
            </div>

            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign To (Organizers Only)</label>
                <select
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                    {...register('assignee_id')}
                >
                    <option value="">Unassigned</option>
                    {assignees.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.full_name} ({user.email})
                        </option>
                    ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                    Only event organizers can be assigned tasks. Add organizers in Event Details page.
                </p>
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" loading={isLoading}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
