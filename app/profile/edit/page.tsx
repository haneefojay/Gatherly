"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, uploadAvatar, uploadCover } from '@/lib/profile-service';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { User } from '@/lib/types';
import Link from 'next/link';

interface SocialLink {
    platform: string;
    url: string;
}

export default function EditProfilePage() {
    const { user, updateUser, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [displayName, setDisplayName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

    // File Upload Refs
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setDisplayName(user.full_name || '');
            setJobTitle(user.job_title || '');
            setLocation(user.location || '');
            setBio(user.bio || '');

            if (user.social_links) {
                const links = Object.entries(user.social_links).map(([platform, url]) => ({
                    platform,
                    url: url as string
                }));
                setSocialLinks(links);
            } else {
                setSocialLinks([{ platform: 'website', url: '' }]);
            }
        }
    }, [user]);

    const handleAvatarClick = () => {
        avatarInputRef.current?.click();
    };

    const handleCoverClick = () => {
        coverInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsLoading(true);
            let response;
            if (type === 'avatar') {
                response = await uploadAvatar(file);
                // Update local user state immediately to reflect change
                if (user) {
                    updateUser({ ...user, avatar_url: response.avatar_url });
                }
            } else {
                response = await uploadCover(file);
                if (user) {
                    updateUser({ ...user, cover_photo_url: response.cover_photo_url });
                }
            }
        } catch (error) {
            console.error(`Failed to upload ${type}`, error);
            alert(`Failed to upload ${type}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
        const newLinks = [...socialLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setSocialLinks(newLinks);
    };

    const addSocialLink = () => {
        setSocialLinks([...socialLinks, { platform: 'website', url: '' }]);
    };

    const removeSocialLink = (index: number) => {
        const newLinks = socialLinks.filter((_, i) => i !== index);
        setSocialLinks(newLinks);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Convert array back to object
            const socialLinksObj = socialLinks.reduce((acc, link) => {
                if (link.url.trim()) {
                    acc[link.platform] = link.url;
                }
                return acc;
            }, {} as Record<string, string>);

            const updatedUser = await updateProfile({
                full_name: displayName,
                job_title: jobTitle,
                location: location,
                bio: bio,
                social_links: socialLinksObj
            });

            updateUser(updatedUser);
            // Show success message or toast
            alert('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || !user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-sans text-slate-600">
            <Navbar />

            <main className="flex-grow py-8 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your public persona and manage your social presence.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={`/users/${user.username || 'me'}`} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                View Public Profile
                            </Link>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Visual Branding Card */}
                        <div className="bg-white dark:bg-[#15192b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {/* Cover Photo */}
                            <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-800 group">
                                <img
                                    src={user.cover_photo_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDw08O0CahAje7qd2wUNt94pNlhSE1QGKIVrmnkf-cZatf3iRCqNXztZwIkKC15R8QTA4gOM3K5gLvnlvy7VmUV6yF5B7fkFX7tn00JZjMi7h9eYbKXf2jYgSaRJ_SjNjACPKbmgMOB1E0a_q6JkWBn6Iqj__LlwfvLaJbda--l00eHcZLdbopz6LNVhyCXGl1B4imb2gI_o8o7WS6AgNjaS5EnMIpsKpek0ujxNAfr59-bjz7rjo2fgqw3Lz9L0_CEztzxCS7ZhA"}
                                    alt="Cover Background"
                                    className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-75"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                    <button
                                        type="button"
                                        onClick={handleCoverClick}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-900 shadow-lg hover:bg-white transition-all transform hover:scale-105"
                                    >
                                        <span className="material-icons text-lg">crop_original</span>
                                        Change Cover
                                    </button>
                                    <input
                                        type="file"
                                        ref={coverInputRef}
                                        onChange={(e) => handleFileChange(e, 'cover')}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            <div className="px-6 pb-6 pt-2 relative">
                                {/* Avatar */}
                                <div className="absolute -top-16 left-6">
                                    <div className="relative group w-32 h-32 rounded-full border-4 border-white dark:border-[#15192b] bg-white dark:bg-[#15192b] shadow-md overflow-hidden">
                                        <img
                                            src={user.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDzcTLoMYN7F4KX8LsDk7uDOdniE0WqyPWW1OEmUiW5VK3_-jrbatqy8-2xGWFx1w3d6uUSOP86Oz83opVkBJbBuULYhiMQzlWz_7WKb2gEu8CG8UC7wUoCs6xE4l01jxzIi5s2C7IgyG1wqRuFxxtaDoJ7ZhdMNKSyGahsaO60o7AQeBmn3FlO8kBQml4WoQxwnsK60Dfr6fNhNFJuQrQfi7TsuvG1cNmC-uXStOBtx8S7hUvhprfa0IxrR2b7OTjltqHY6S-vhg"}
                                            alt="Profile Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                        <div
                                            className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={handleAvatarClick}
                                        >
                                            <span className="material-icons text-white text-2xl">photo_camera</span>
                                            <span className="text-white text-xs mt-1 font-medium">Edit</span>
                                        </div>
                                        <input
                                            type="file"
                                            ref={avatarInputRef}
                                            onChange={(e) => handleFileChange(e, 'avatar')}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                                {/* Basic Text Inputs */}
                                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Display Name */}
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5" htmlFor="display-name">Display Name</label>
                                        <input
                                            id="display-name"
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3"
                                        />
                                    </div>

                                    {/* Job Title */}
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5" htmlFor="job-title">Job Title</label>
                                        <input
                                            id="job-title"
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3"
                                        />
                                    </div>

                                    {/* Location */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5" htmlFor="location">Location</label>
                                        <div className="relative rounded-lg shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-icons text-slate-400 text-lg">place</span>
                                            </div>
                                            <input
                                                id="location"
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pl-10 focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio & Rich Text */}
                        <div className="bg-white dark:bg-[#15192b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-lg font-semibold text-slate-900 dark:text-white">Biography</label>
                                <span className="text-xs text-slate-400">Markdown supported</span>
                            </div>
                            <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-shadow">
                                {/* Toolbar */}
                                <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                    {['format_bold', 'format_italic', 'format_underlined', 'link', 'format_list_bulleted'].map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                        >
                                            <span className="material-icons text-sm">{icon}</span>
                                        </button>
                                    ))}
                                </div>
                                {/* Text Area */}
                                <textarea
                                    className="w-full border-none p-4 text-sm text-slate-900 dark:text-white bg-transparent focus:ring-0 min-h-[120px] resize-y"
                                    placeholder="Tell us about yourself..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                ></textarea>
                            </div>
                            <p className="mt-2 text-xs text-slate-500 text-right">{bio.length}/500 characters</p>
                        </div>

                        {/* Social Links Manager */}
                        <div className="bg-white dark:bg-[#15192b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Social Profiles</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Add your social media links to display on your profile.</p>
                            </div>

                            <div className="space-y-4">
                                {socialLinks.map((link, index) => (
                                    <div key={index} className="flex items-start sm:items-center gap-3 group">
                                        <div className="cursor-move text-slate-300 dark:text-slate-600 hover:text-slate-500 mt-2 sm:mt-0">
                                            <span className="material-icons">drag_indicator</span>
                                        </div>
                                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="col-span-1 relative">
                                                <select
                                                    value={link.platform}
                                                    onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                                                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-primary focus:ring-primary py-2.5 px-3"
                                                >
                                                    <option value="linkedin">LinkedIn</option>
                                                    <option value="twitter">Twitter / X</option>
                                                    <option value="instagram">Instagram</option>
                                                    <option value="website">Website</option>
                                                    <option value="github">GitHub</option>
                                                    <option value="facebook">Facebook</option>
                                                </select>
                                            </div>
                                            <div className="col-span-1 sm:col-span-2">
                                                <input
                                                    type="text"
                                                    placeholder="URL"
                                                    value={link.url}
                                                    onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                                                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-primary focus:ring-primary py-2.5 px-3"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSocialLink(index)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-0.5 sm:mt-0"
                                            title="Remove"
                                        >
                                            <span className="material-icons">delete_outline</span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={addSocialLink}
                                    className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-700 dark:text-primary-200 dark:hover:text-primary-100 transition-colors px-2 py-1.5 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/20"
                                >
                                    <span className="material-icons text-lg">add_circle_outline</span>
                                    Add another link
                                </button>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="sticky bottom-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 py-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:border-none sm:bg-transparent sm:dark:bg-transparent sm:static flex flex-col sm:flex-row items-center justify-end gap-3 z-20">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-full sm:w-auto px-6 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold rounded-lg transition-all dark:bg-neutral-800 dark:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full sm:w-auto px-8 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
