"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { getUserPreferences, updateUserPreferences } from "@/lib/profile-service";
import { useToast } from "@/components/ui/use-toast";
import { UserPreferences } from "@/lib/types";

export default function PreferencesPage() {
    const { setTheme: setContextTheme, theme: currentTheme } = useTheme();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<UserPreferences>({
        language: "en-US",
        theme: "system",
        timezone: "UTC",
        currency: "USD",
    });

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const data = await getUserPreferences();
                setFormData(data);
                // Sync context theme with backend preference on load if it's different?
                // Actually, backend pref dictates initial state, but local storage acts as cache.
                // For now, we trust the backend data.
                if (data.theme) {
                    setContextTheme(data.theme);
                }
            } catch (error) {
                console.error("Failed to load preferences", error);
                toast({
                    title: "Error",
                    description: "Failed to load preferences.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [setContextTheme, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await updateUserPreferences(formData);
            setFormData(updated);
            setContextTheme(updated.theme); // Update global theme context
            toast({
                title: "Settings saved",
                description: "Your preferences have been updated successfully.",
            });
        } catch (error) {
            console.error("Failed to save preferences", error);
            toast({
                title: "Error",
                description: "Failed to save preferences.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <div className="p-8 text-center text-neutral-500">Loading preferences...</div>;
    }

    return (
        <div className="bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 rounded-xl">
            <div className="px-6 py-6 border-b border-neutral-200 dark:border-neutral-800">
                <h1 className="text-2xl font-bold leading-7 text-neutral-900 dark:text-white sm:text-3xl sm:truncate">User Preferences</h1>
                <p className="mt-2 max-w-2xl text-sm text-neutral-500">Manage your regional settings and interface appearance.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="px-6 py-8 space-y-10">
                    {/* Regional Settings */}
                    <section>
                        <div className="md:grid md:grid-cols-3 md:gap-6">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-medium leading-6 text-neutral-900 dark:text-white">Regional Settings</h3>
                                <p className="mt-1 text-sm text-neutral-500">Set your language, timezone, and currency formats.</p>
                            </div>
                            <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
                                {/* Language */}
                                <div>
                                    <label htmlFor="language" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Interface Language
                                    </label>
                                    <select
                                        id="language"
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className="mt-2 block w-full pl-3 pr-10 py-3 text-base border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white shadow-sm"
                                    >
                                        <option value="en-US">English (United States)</option>
                                        <option value="en-GB">English (UK)</option>
                                        <option value="es-ES">Spanish (Español)</option>
                                        <option value="fr-FR">French (Français)</option>
                                        <option value="de-DE">German (Deutsch)</option>
                                        <option value="ja-JP">Japanese (日本語)</option>
                                    </select>
                                    <p className="mt-2 text-sm text-neutral-500">This will change the language of the entire platform.</p>
                                </div>

                                {/* Timezone */}
                                <div>
                                    <label htmlFor="timezone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Timezone
                                    </label>
                                    <select
                                        id="timezone"
                                        name="timezone"
                                        value={formData.timezone}
                                        onChange={handleChange}
                                        className="mt-2 block w-full pl-3 pr-10 py-3 text-base border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white shadow-sm"
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">(GMT-05:00) Eastern Time (US & Canada)</option>
                                        <option value="America/Los_Angeles">(GMT-08:00) Pacific Time (US & Canada)</option>
                                        <option value="Europe/London">(GMT+00:00) London</option>
                                        <option value="Europe/Paris">(GMT+01:00) Paris</option>
                                        <option value="Asia/Tokyo">(GMT+09:00) Tokyo</option>
                                    </select>
                                </div>

                                {/* Currency */}
                                <div>
                                    <label htmlFor="currency" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Default Currency
                                    </label>
                                    <select
                                        id="currency"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        className="mt-2 block w-full pl-3 pr-10 py-3 text-base border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white shadow-sm"
                                    >
                                        <option value="USD">USD - United States Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="JPY">JPY - Japanese Yen</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-neutral-200 dark:border-neutral-800"></div>

                    {/* Appearance */}
                    <section>
                        <div className="md:grid md:grid-cols-3 md:gap-6">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-medium leading-6 text-neutral-900 dark:text-white">Appearance</h3>
                                <p className="mt-1 text-sm text-neutral-500">Customize how EventFlow looks on your device.</p>
                            </div>
                            <div className="mt-5 md:mt-0 md:col-span-2">
                                <div className="space-y-4">
                                    <div className="text-sm text-neutral-500 mb-4">Choose your preferred theme mode.</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Light */}
                                        <label className="cursor-pointer group relative block">
                                            <input
                                                type="radio"
                                                name="theme"
                                                value="light"
                                                className="sr-only peer"
                                                checked={formData.theme === 'light'}
                                                onChange={handleChange}
                                            />
                                            <div className="rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-1 peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary transition-all hover:border-neutral-300">
                                                <div className="h-28 bg-neutral-100 rounded-lg mb-2 overflow-hidden border border-neutral-100 relative">
                                                    <div className="absolute top-2 left-2 right-2 h-2 bg-white rounded-sm shadow-sm"></div>
                                                    <div className="absolute top-6 left-2 w-1/3 h-2 bg-white rounded-sm shadow-sm"></div>
                                                </div>
                                                <div className="flex items-center justify-between px-2 pb-1">
                                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">Light</span>
                                                    {formData.theme === 'light' && <span className="material-icons text-primary text-lg">check_circle</span>}
                                                </div>
                                            </div>
                                        </label>

                                        {/* Dark */}
                                        <label className="cursor-pointer group relative block">
                                            <input
                                                type="radio"
                                                name="theme"
                                                value="dark"
                                                className="sr-only peer"
                                                checked={formData.theme === 'dark'}
                                                onChange={handleChange}
                                            />
                                            <div className="rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-1 peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary transition-all hover:border-neutral-300">
                                                <div className="h-28 bg-neutral-900 rounded-lg mb-2 overflow-hidden border border-neutral-800 relative">
                                                    <div className="absolute top-2 left-2 right-2 h-2 bg-neutral-700 rounded-sm"></div>
                                                    <div className="absolute top-6 left-2 w-1/3 h-2 bg-neutral-700 rounded-sm"></div>
                                                </div>
                                                <div className="flex items-center justify-between px-2 pb-1">
                                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">Dark</span>
                                                    {formData.theme === 'dark' && <span className="material-icons text-primary text-lg">check_circle</span>}
                                                </div>
                                            </div>
                                        </label>

                                        {/* System */}
                                        <label className="cursor-pointer group relative block">
                                            <input
                                                type="radio"
                                                name="theme"
                                                value="system"
                                                className="sr-only peer"
                                                checked={formData.theme === 'system'}
                                                onChange={handleChange}
                                            />
                                            <div className="rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-1 peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary transition-all hover:border-neutral-300">
                                                <div className="h-28 bg-gradient-to-br from-neutral-100 to-neutral-900 rounded-lg mb-2 overflow-hidden border border-neutral-200 dark:border-neutral-700 relative">
                                                    <div className="absolute inset-0 flex">
                                                        <div className="w-1/2 h-full bg-neutral-100"></div>
                                                        <div className="w-1/2 h-full bg-neutral-900"></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between px-2 pb-1">
                                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">System</span>
                                                    {formData.theme === 'system' && <span className="material-icons text-primary text-lg">check_circle</span>}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-b-xl border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                        type="button"
                        className="w-full sm:w-auto px-6 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold rounded-lg transition-all dark:bg-neutral-800 dark:text-white"
                        onClick={() => window.location.reload()}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto inline-flex justify-center px-8 py-2.5 border border-transparent shadow-lg text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
