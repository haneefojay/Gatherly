"use client";

import { useState, useEffect } from "react";
import { getUserPreferences, updateUserPreferences } from "@/lib/profile-service";
import { useToast } from "@/components/ui/use-toast";
import { UserPreferences } from "@/lib/types";

export default function PrivacySettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);

    useEffect(() => {
        async function fetchPreferences() {
            try {
                const data = await getUserPreferences();
                setPreferences(data);
            } catch (error) {
                console.error("Failed to fetch preferences:", error);
                toast({
                    title: "Error",
                    description: "Failed to load privacy settings.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }
        fetchPreferences();
    }, [toast]);

    const handleToggle = (key: keyof UserPreferences) => {
        if (!preferences) return;
        setPreferences({
            ...preferences,
            [key]: !preferences[key],
        });
    };

    const handleSelectChange = (key: keyof UserPreferences, value: string) => {
        if (!preferences) return;
        setPreferences({
            ...preferences,
            [key]: value,
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!preferences) return;

        setSaving(true);
        try {
            await updateUserPreferences(preferences);
            toast({
                title: "Settings saved",
                description: "Your privacy preferences have been updated.",
            });
        } catch (error) {
            console.error("Failed to update preferences:", error);
            toast({
                title: "Error",
                description: "Failed to save privacy settings.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !preferences) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1a1f36] shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy & Visibility</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage who can see your profile, contact details, and event activity.</p>
                </div>
                <div className="hidden sm:block">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${preferences.is_profile_public ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/30' : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:ring-yellow-400/30'}`}>
                        Profile Status: {preferences.is_profile_public ? 'Public' : 'Private'}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-8">
                {/* Profile Visibility Section */}
                <section>
                    <div className="flex items-start justify-between">
                        <div className="flex-1 pr-8">
                            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">Profile Visibility</h2>
                            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">Control the visibility of your main profile card. When disabled, your profile is hidden from public directories.</p>
                        </div>
                        <div className="flex-shrink-0 flex items-center pt-1">
                            <button
                                type="button"
                                onClick={() => handleToggle('is_profile_public')}
                                className={`${preferences.is_profile_public ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
                                role="switch"
                                aria-checked={preferences.is_profile_public}
                            >
                                <span className={`${preferences.is_profile_public ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                            </button>
                        </div>
                    </div>

                    {preferences.is_profile_public && (
                        <div className="mt-6 pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-5 animate-in slide-in-from-left-2 duration-200">
                            <div className="relative flex items-start">
                                <div className="flex h-6 items-center">
                                    <input
                                        id="search-indexing"
                                        type="checkbox"
                                        checked={preferences.allow_search_indexing}
                                        onChange={() => handleToggle('allow_search_indexing')}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                                    />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                    <label htmlFor="search-indexing" className="font-medium text-gray-900 dark:text-white">Allow search engine indexing</label>
                                    <p className="text-gray-500 dark:text-gray-400">Let Google and Bing show your profile in search results.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <hr className="border-gray-200 dark:border-gray-700/50" />

                {/* Contact Information Section */}
                <section>
                    <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email Visibility */}
                        <div className="relative flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700/60 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                                    <span className="material-icons text-[20px]">mail</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email Address</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Show on public profile</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle('show_email')}
                                className={`${preferences.show_email ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
                                role="switch"
                                aria-checked={preferences.show_email}
                            >
                                <span className={`${preferences.show_email ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                            </button>
                        </div>

                        {/* Phone Visibility */}
                        <div className="relative flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700/60 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                                    <span className="material-icons text-[20px]">call</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Phone Number</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Show on public profile</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle('show_phone')}
                                className={`${preferences.show_phone ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
                                role="switch"
                                aria-checked={preferences.show_phone}
                            >
                                <span className={`${preferences.show_phone ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                            </button>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-200 dark:border-gray-700/50" />

                {/* Activity & Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Activity Settings */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">Event Activity</h2>
                            <span className="material-icons text-gray-400 text-[18px] cursor-help" title="Determines who can see which events you have RSVP'd to.">info</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Who can see my event attendance?</label>
                                <select
                                    value={preferences.attendance_visibility}
                                    onChange={(e) => handleSelectChange('attendance_visibility', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="Everyone (Public)">Everyone (Public)</option>
                                    <option value="Friends & Connections">Friends & Connections</option>
                                    <option value="Only Me">Only Me</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Past Events History</label>
                                <button
                                    type="button"
                                    onClick={() => handleToggle('past_events_visible')}
                                    className={`${preferences.past_events_visible ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
                                    role="switch"
                                >
                                    <span className={`${preferences.past_events_visible ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Data Usage */}
                    <section>
                        <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white mb-4">Data Sharing</h2>
                        <div className="space-y-4">
                            <div className="relative flex items-start">
                                <div className="flex h-6 items-center">
                                    <input
                                        id="third-party"
                                        type="checkbox"
                                        checked={preferences.share_data_third_party}
                                        onChange={() => handleToggle('share_data_third_party')}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                                    />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                    <label htmlFor="third-party" className="font-medium text-gray-900 dark:text-white">Third-party partners</label>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">Allow event sponsors to contact you via platform messaging.</p>
                                </div>
                            </div>
                            <div className="relative flex items-start">
                                <div className="flex h-6 items-center">
                                    <input
                                        id="analytics"
                                        type="checkbox"
                                        checked={preferences.share_analytics}
                                        onChange={() => handleToggle('share_analytics')}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                                    />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                    <label htmlFor="analytics" className="font-medium text-gray-900 dark:text-white">Usage Analytics</label>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">Help us improve by sharing anonymous usage data.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Action Bar */}
                <div className="bg-gray-50 dark:bg-[#15192b] -mx-6 -mb-6 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-800 gap-4 mt-8">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:underline order-2 sm:order-1"
                    >
                        Reset to defaults
                    </button>
                    <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="flex-1 sm:flex-none rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 shadow-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 sm:flex-none rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
