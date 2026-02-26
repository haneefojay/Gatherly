'use client';

import { useState, useCallback, useRef } from 'react';
import { EventWizardData } from '@/lib/types';
import { Upload, X, Image as ImageIcon, Film, Play } from 'lucide-react';

interface StepMediaProps {
    data: EventWizardData;
    updateData: (partial: Partial<EventWizardData>) => void;
}

export default function StepMedia({ data, updateData }: StepMediaProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [dragOver, setDragOver] = useState(false);

    const handleCoverSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) return;
        updateData({ cover_image: file });
        const reader = new FileReader();
        reader.onload = (e) => setCoverPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    }, [updateData]);

    const handleCoverDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleCoverSelect(file);
    }, [handleCoverSelect]);

    const handleGallerySelect = useCallback((files: FileList) => {
        const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 6 - data.gallery_images.length);
        updateData({ gallery_images: [...data.gallery_images, ...newFiles] });

        newFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setGalleryPreviews((prev) => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    }, [data.gallery_images, updateData]);

    const removeGalleryImage = useCallback((index: number) => {
        updateData({ gallery_images: data.gallery_images.filter((_, i) => i !== index) });
        setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    }, [data.gallery_images, updateData]);

    const removeCover = useCallback(() => {
        updateData({ cover_image: null });
        setCoverPreview(null);
    }, [updateData]);

    const getVideoThumbnail = (url: string) => {
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
        return null;
    };

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Upload Event Media
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Add visuals to make your event stand out. High-quality images attract more attendees.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 lg:p-10 space-y-10">
                {/* Cover Image */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cover Image</h2>
                        <span className="text-xs font-medium text-slate-400 uppercase">Required</span>
                    </div>

                    {coverPreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[2/1]">
                            <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={removeCover}
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleCoverDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dragOver
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <Upload className="w-10 h-10 text-primary-500 mb-3" />
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                <span className="text-primary-600 font-semibold cursor-pointer">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                SVG, PNG, JPG or GIF (MAX. 800×400px)
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleCoverSelect(e.target.files[0])}
                                className="hidden"
                            />
                        </div>
                    )}
                </div>

                {/* Gallery Images */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gallery Images</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Upload up to 6 additional photos for the event gallery.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryPreviews.map((preview, i) => (
                            <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                <img src={preview} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeGalleryImage(i)}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        {galleryPreviews.length < 6 && (
                            <button
                                type="button"
                                onClick={() => galleryInputRef.current?.click()}
                                className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-400 transition-colors"
                            >
                                <ImageIcon className="w-6 h-6 mb-1" />
                                <span className="text-xs">Add Photo</span>
                            </button>
                        )}
                        <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => e.target.files && handleGallerySelect(e.target.files)}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Video Teaser */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Video Teaser</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Video URL (YouTube or Vimeo)
                            </label>
                            <div className="relative">
                                <Film className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="url"
                                    value={data.video_url}
                                    onChange={(e) => updateData({ video_url: e.target.value })}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="block w-full pl-9 rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-600 focus:ring-primary-600 text-sm py-2.5 px-3 placeholder:text-slate-400"
                                />
                            </div>
                            <p className="text-xs text-slate-400">Paste the full URL of your promotional video.</p>
                        </div>
                        {data.video_url && getVideoThumbnail(data.video_url) && (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-900 group cursor-pointer">
                                <img
                                    src={getVideoThumbnail(data.video_url)!}
                                    alt="Video thumbnail"
                                    className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Play className="w-6 h-6 text-slate-900 ml-1" />
                                    </div>
                                </div>
                                <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-0.5 rounded">
                                    Preview
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
