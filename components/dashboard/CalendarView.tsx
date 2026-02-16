"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Video, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventItem {
    id: string;
    title: string;
    date: Date;
    type: string;
}

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 12)); // October 2023 as per design

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Adjust for Monday start
    };

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Mock events for demonstration as per design
    const events: EventItem[] = [
        { id: "1", title: "Tech M...", date: new Date(2023, 9, 3), type: "Technology" },
        { id: "2", title: "Charity ...", date: new Date(2023, 9, 6), type: "Community" },
        { id: "3", title: "Worksh...", date: new Date(2023, 9, 12), type: "Design" },
    ];

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const days = [];
    // Previous month padding
    const prevDaysInMonth = getDaysInMonth(year, month - 1);
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        days.push({ day: prevDaysInMonth - i, currentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, currentMonth: true });
    }
    // Next month padding
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
        days.push({ day: i, currentMonth: false });
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
            {/* Calendar Header */}
            <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {monthNames[month]} {year}
                </h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <Button
                        variant="outline"
                        onClick={goToToday}
                        className="hidden sm:inline-flex bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        Today
                    </Button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                {daysOfWeek.map((day) => (
                    <div key={day} className="py-4 text-center text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {days.map((d, index) => {
                    const isToday = d.currentMonth && d.day === 12 && month === 9 && year === 2023; // Highlighting 12th Oct 2023 for demo
                    const dayEvents = events.filter(e =>
                        e.date.getDate() === d.day &&
                        e.date.getMonth() === month &&
                        e.date.getFullYear() === year &&
                        d.currentMonth
                    );

                    return (
                        <div
                            key={index}
                            className={`min-h-[100px] sm:min-h-[120px] p-2 border-r border-b border-slate-100 dark:border-slate-800 last:border-r-0 relative hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${!d.currentMonth ? 'bg-slate-50/30 dark:bg-slate-950/20' : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`text-sm font-medium ${!d.currentMonth ? 'text-slate-300 dark:text-slate-700' : 'text-slate-700 dark:text-slate-300'} ${isToday ? 'bg-primary-600 text-white w-7 h-7 rounded-full flex items-center justify-center -mt-1 -ml-1 shadow-md shadow-primary-600/30' : ''}`}>
                                    {d.day}
                                </span>
                            </div>

                            <div className="mt-2 space-y-1">
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className={`group relative px-2 py-1 rounded text-[10px] sm:text-xs font-medium truncate cursor-pointer transition-all hover:scale-[1.02] ${event.type === 'Technology' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                event.type === 'Community' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                    'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                            }`}
                                    >
                                        {event.title}
                                        {/* Activity Tooltip/Indicator could go here */}
                                    </div>
                                ))}
                            </div>

                            {isToday && (
                                <div className="absolute inset-0 bg-primary-600/5 dark:bg-primary-600/10 pointer-events-none"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
