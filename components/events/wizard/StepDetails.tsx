'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { EventWizardData } from '@/lib/types';
import { Calendar, Clock, Globe, MapPin } from 'lucide-react';

const MapContainer = dynamic(
    () => import('react-leaflet').then(m => m.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then(m => m.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then(m => m.Marker),
    { ssr: false }
);

interface StepDetailsProps {
    data: EventWizardData;
    updateData: (partial: Partial<EventWizardData>) => void;
}

const TIMEZONES = [
    { value: 'America/New_York', label: 'Eastern Time (US & Canada) (GMT-05:00)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada) (GMT-06:00)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada) (GMT-07:00)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada) (GMT-08:00)' },
    { value: 'America/Anchorage', label: 'Alaska (GMT-09:00)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii (GMT-10:00)' },
    { value: 'Europe/London', label: 'London (GMT+00:00)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+01:00)' },
    { value: 'Europe/Berlin', label: 'Berlin (GMT+01:00)' },
    { value: 'Africa/Lagos', label: 'Lagos (GMT+01:00)' },
    { value: 'Africa/Cairo', label: 'Cairo (GMT+02:00)' },
    { value: 'Asia/Dubai', label: 'Dubai (GMT+04:00)' },
    { value: 'Asia/Kolkata', label: 'India (GMT+05:30)' },
    { value: 'Asia/Shanghai', label: 'China (GMT+08:00)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+09:00)' },
    { value: 'Australia/Sydney', label: 'Sydney (GMT+11:00)' },
];

export default function StepDetails({ data, updateData }: StepDetailsProps) {
    const [mapReady, setMapReady] = useState(false);
    const mapPosition: [number, number] = [
        data.latitude || 40.7128,
        data.longitude || -74.0060,
    ];

    useEffect(() => {
        // Load leaflet CSS
        if (typeof window !== 'undefined') {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
            setMapReady(true);
        }
    }, []);

    const handleLocationSearch = async (query: string) => {
        updateData({ location: query });
        if (query.length < 3) return;

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
            );
            const results = await res.json();
            if (results.length > 0) {
                updateData({
                    latitude: parseFloat(results[0].lat),
                    longitude: parseFloat(results[0].lon),
                });
            }
        } catch {
            // geocode failed, ignore
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Schedule & Location
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Configure the time and place for your upcoming event.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 lg:p-10 space-y-10">
                {/* Date & Time Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <Calendar className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-bold">Date & Time</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Start */}
                        <div className="rounded-xl border border-primary-200 dark:border-primary-800/40 bg-primary-50/30 dark:bg-primary-900/10 p-5 space-y-4">
                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                                Starts
                            </span>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Date</label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => updateData({ start_date: e.target.value })}
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm py-2.5 px-3 focus:border-primary-600 focus:ring-primary-600"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Time</label>
                                    <input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => updateData({ start_time: e.target.value })}
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm py-2.5 px-3 focus:border-primary-600 focus:ring-primary-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* End */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-5 space-y-4">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Ends
                            </span>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Date</label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => updateData({ end_date: e.target.value })}
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm py-2.5 px-3 focus:border-primary-600 focus:ring-primary-600"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Time</label>
                                    <input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => updateData({ end_time: e.target.value })}
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm py-2.5 px-3 focus:border-primary-600 focus:ring-primary-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timezone */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <label htmlFor="timezone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Timezone
                            </label>
                        </div>
                        <select
                            id="timezone"
                            value={data.timezone}
                            onChange={(e) => updateData({ timezone: e.target.value })}
                            className="block w-full md:w-1/2 rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-600 focus:ring-primary-600 text-sm py-2.5 px-3 cursor-pointer"
                        >
                            {TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Location Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <MapPin className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-bold">Location</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="venue" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Venue Name
                                </label>
                                <input
                                    id="venue"
                                    type="text"
                                    value={data.venue_name}
                                    onChange={(e) => updateData({ venue_name: e.target.value })}
                                    placeholder="e.g. Convention Center Hall A"
                                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-600 focus:ring-primary-600 text-sm py-2.5 px-3 placeholder:text-slate-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="address" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Address
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="address"
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => handleLocationSearch(e.target.value)}
                                        placeholder="Search address..."
                                        className="block w-full pl-9 rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-600 focus:ring-primary-600 text-sm py-2.5 px-3 placeholder:text-slate-400"
                                    />
                                </div>
                                <p className="text-xs text-slate-400">Start typing to see suggestions.</p>
                            </div>
                            <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/30">
                                <p className="text-xs text-primary-700 dark:text-primary-300 flex items-start gap-2">
                                    <span className="w-3 h-3 rounded-full bg-primary-500 mt-0.5 flex-shrink-0" />
                                    The map will automatically update based on the selected address.
                                </p>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-[300px] bg-slate-100 dark:bg-slate-900">
                            {mapReady && typeof window !== 'undefined' && (
                                <MapContainer
                                    center={mapPosition}
                                    zoom={13}
                                    className="h-full w-full z-0"
                                    scrollWheelZoom={false}
                                    key={`${mapPosition[0]}-${mapPosition[1]}`}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={mapPosition} />
                                </MapContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
