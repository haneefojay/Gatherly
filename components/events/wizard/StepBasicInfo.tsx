'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState, useCallback } from 'react';
import { EventWizardData, Category } from '@/lib/types';
import { fetchCategories, fetchPopularTags } from '@/lib/eventApi';
import {
    Type, X, Bold, Italic, Underline as UnderlineIcon,
    List, ListOrdered, Link as LinkIcon
} from 'lucide-react';

interface StepBasicInfoProps {
    data: EventWizardData;
    updateData: (partial: Partial<EventWizardData>) => void;
}

function ToolbarButton({ active, onClick, children, title }: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    title: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded transition-colors ${active
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
        >
            {children}
        </button>
    );
}

export default function StepBasicInfo({ data, updateData }: StepBasicInfoProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: false }),
            Placeholder.configure({
                placeholder: 'Describe your event details, agenda, and what attendees can expect...',
            }),
        ],
        content: data.description || '',
        editorProps: {
            attributes: {
                class: 'prose prose-slate dark:prose-invert max-w-none p-4 min-h-[180px] focus:outline-none text-slate-900 dark:text-white',
            },
        },
        onUpdate: ({ editor }) => {
            updateData({ description: editor.getHTML() });
        },
    });

    useEffect(() => {
        fetchCategories().then(setCategories).catch(() => { });
        fetchPopularTags().then((tags) => {
            setSuggestedTags(tags.map((t) => t.name));
        }).catch(() => { });
    }, []);

    const handleAddTag = useCallback((tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !data.tags.includes(trimmed)) {
            updateData({ tags: [...data.tags, trimmed] });
        }
        setTagInput('');
    }, [data.tags, updateData]);

    const handleRemoveTag = useCallback((tag: string) => {
        updateData({ tags: data.tags.filter((t) => t !== tag) });
    }, [data.tags, updateData]);

    const handleTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag(tagInput);
        }
    }, [tagInput, handleAddTag]);

    const charCount = data.description.replace(/<[^>]*>/g, '').length;

    return (
        <div className="space-y-8">
            {/* Title */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Basic Information
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Let&apos;s start with the core details about your event to get things rolling.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 lg:p-10 space-y-8">
                {/* Event Title */}
                <div className="space-y-2">
                    <label htmlFor="event-title" className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="event-title"
                        type="text"
                        value={data.title}
                        onChange={(e) => updateData({ title: e.target.value })}
                        placeholder="e.g. Annual Tech Conference 2024"
                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-base py-3 px-4 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-shadow"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Be clear and descriptive. This is the first thing people will see.
                    </p>
                </div>

                {/* Category & Event Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="category" className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="category"
                            value={data.category_id}
                            onChange={(e) => updateData({ category_id: e.target.value })}
                            className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-base py-3 px-4 transition-shadow cursor-pointer"
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="visibility" className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Event Type
                        </label>
                        <select
                            id="visibility"
                            value={data.visibility}
                            onChange={(e) => updateData({ visibility: e.target.value as EventWizardData['visibility'] })}
                            className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-base py-3 px-4 transition-shadow cursor-pointer"
                        >
                            <option value="public">Public Event</option>
                            <option value="private">Private (Invite Only)</option>
                            <option value="unlisted">Unlisted</option>
                        </select>
                    </div>
                </div>

                {/* Description with Rich Text Toolbar */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Description
                    </label>
                    <div className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 overflow-hidden focus-within:ring-1 focus-within:ring-primary-600 focus-within:border-primary-600 transition-shadow shadow-sm">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                            <ToolbarButton
                                title="Bold"
                                active={editor?.isActive('bold')}
                                onClick={() => editor?.chain().focus().toggleBold().run()}
                            >
                                <Bold className="w-4 h-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                title="Italic"
                                active={editor?.isActive('italic')}
                                onClick={() => editor?.chain().focus().toggleItalic().run()}
                            >
                                <Italic className="w-4 h-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                title="Underline"
                                active={editor?.isActive('underline')}
                                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                            >
                                <UnderlineIcon className="w-4 h-4" />
                            </ToolbarButton>
                            <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1" />
                            <ToolbarButton
                                title="Bullet List"
                                active={editor?.isActive('bulletList')}
                                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                            >
                                <List className="w-4 h-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                title="Numbered List"
                                active={editor?.isActive('orderedList')}
                                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                            >
                                <ListOrdered className="w-4 h-4" />
                            </ToolbarButton>
                            <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1" />
                            <ToolbarButton
                                title="Link"
                                active={editor?.isActive('link')}
                                onClick={() => {
                                    const url = window.prompt('URL');
                                    if (url) {
                                        editor?.chain().focus().setLink({ href: url }).run();
                                    }
                                }}
                            >
                                <LinkIcon className="w-4 h-4" />
                            </ToolbarButton>
                        </div>
                        {/* Editor */}
                        <EditorContent editor={editor} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-right">
                        {charCount} / 2000 characters
                    </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Tags (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2 items-center p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus-within:ring-1 focus-within:ring-primary-600 focus-within:border-primary-600 shadow-sm min-h-[50px]">
                        {data.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary-600/10 text-primary-600 text-sm font-medium"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-primary-800 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            onBlur={() => { if (tagInput) handleAddTag(tagInput); }}
                            placeholder="Add tags..."
                            className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm p-1"
                        />
                    </div>
                    {suggestedTags.length > 0 && data.tags.length < 5 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="text-xs text-slate-400">Suggested:</span>
                            {suggestedTags
                                .filter((t) => !data.tags.includes(t))
                                .slice(0, 6)
                                .map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleAddTag(tag)}
                                        className="text-xs px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-primary-600 hover:border-primary-600 transition-colors"
                                    >
                                        + {tag}
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
