"use client"

import { useAuth } from "@/contexts/AuthContext"
import {
    Bell,
    Search,
    Compass,
    Ticket,
    Bookmark,
    Calendar,
    Video,
    QrCode,
    Heart,
    UserCog,
    Check,
    MessageSquare,
    User,
    ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { CalendarView } from "./CalendarView"

export function UserDashboard() {
    const { user } = useAuth()
    const [view, setView] = useState<'list' | 'calendar'>('list')

    // Hardcoded stats based on design
    const stats = [
        { icon: Ticket, label: "Attended", value: "12", color: "bg-primary-600/10 text-primary-600" },
        { icon: Bookmark, label: "Saved", value: "5", color: "bg-primary-600/10 text-primary-600" },
        { icon: Calendar, label: "Upcoming", value: "3", color: "bg-primary-600/10 text-primary-600" },
    ]

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-sans text-slate-900 dark:text-slate-100 selection:bg-primary-600/20 selection:text-primary-600">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo & Search */}
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2">
                                <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold text-lg">E</div>
                                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Eventify</span>
                            </Link>
                            <div className="hidden md:block w-64 lg:w-96 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition duration-150 ease-in-out"
                                    placeholder="Search events, speakers..."
                                    type="text"
                                />
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-600 transition-colors relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
                            </button>
                            <div className="relative ml-3">
                                <div className="flex items-center gap-3 cursor-pointer">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.full_name || "User"}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Attendee</p>
                                    </div>
                                    <div className="h-9 w-9 rounded-full border-2 border-slate-100 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        {user?.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt={`Profile picture of ${user.full_name || "User"}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8 bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
                    <div className="absolute bottom-0 right-20 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Good morning, {user?.full_name?.split(' ')[0] || "Alex"}! 👋</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">You have <span className="font-semibold text-primary-600">2 events</span> happening this week. Check your schedule below.</p>
                        </div>
                        <Button className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2">
                            <Compass className="h-4 w-4" /> Browse Events
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Upcoming Events */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${stat.color}`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Upcoming Events Grid Section */}
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {view === 'list' ? 'Upcoming Events' : 'Event Calendar'}
                                </h2>
                                <button
                                    onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
                                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-2 transition-colors"
                                >
                                    <Calendar className="h-4 w-4" />
                                    {view === 'list' ? 'View Calendar' : 'View List'}
                                </button>
                            </div>

                            {view === 'calendar' ? (
                                <CalendarView />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Event Card 1 */}
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                                        <div className="relative h-40 overflow-hidden">
                                            <img
                                                alt="Tech conference auditorium with stage lights"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6v9_05n5z56XLPC1K4-ZQtdTpBKWk7MzQEIdH57A3RPvRO1akiV_pEIC4eNrZMG5P7G2MkATiJQhlVQsljF7IiF9I40yrxPQ1dw3NVOr_qoplVMQnVLTlBo1Rb-qBC8O6JSL8MmhCcgIHP3yo29YC8yMbmSY02fXfJiiPdN0584ibIQ7lm2uX6TcxBkDWv5uTLBEI98ZCatj7Q694TOeZyVQY4-kECsCFUigPjpdrE1G4NHEZF5XBGvpUDT9t4FcSr22qRM_qpw"
                                            />
                                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm text-slate-800 dark:text-slate-200">
                                                IN 2 DAYS
                                            </div>
                                            <div className="absolute bottom-3 right-3 bg-primary-600 text-white p-1.5 rounded-full shadow-lg">
                                                <Video className="h-4 w-4" />
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2 space-x-2">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">Technology</span>
                                                <span>•</span>
                                                <span>Oct 12, 10:00 AM</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-tight">React Conf 2024: The Future of UI</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">Join us for a deep dive into React Server Components and the new compiler architecture.</p>
                                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                <div className="flex -space-x-2">
                                                    <img alt="Speaker" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnP_VRV9K5MNyVv0Y-KpkCzQvE7HX4yCqNPY--o4qiniveLEtOGdlUyorUF1jOY8MzEzJNCP0syYLiTf2RC1zBbiawGg4uDYI0vKNAXeWygfhqR2UjpPgz_egxlspkdm4gudzWXHqelWZo0394J6CB6EfagNGWg9NRr6GtstQJB4Fe43-JpHRZBUYB-qfTlapzIyZbJg1xxQORn9O_tu2paVfk5scNQ_9mIBpjHg6A2IH-CLIMka8gr2HZAvRzBG6kRi0xB2ZVjQ" />
                                                    <img alt="Speaker" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-XV7LVJ_xg2Ceot8gWpr8Lp2ptMcRFzQfl0yAeghdKol4uwT8imneSMovoyc4MpTgIS5XpxVPPUNN-pc2mhgcQLK8AtXIn83Vsd7DkHr8dR0ewvhHFvgkCp_G258op9QkyCSFeLPSzrCI2fpd2tnUzNjgTbg56THa4odeTwTHAQYNwX_y3kl2qku3x-vcAf2U-dFDO6l3A-K6hO9019In_11cl6JZugZqPDxgUhg0JNFhpKBYT82noOLmVp1BdsJBEHQMNddNBg" />
                                                    <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-medium">+42</div>
                                                </div>
                                                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">View Ticket</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Event Card 2 */}
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                                        <div className="relative h-40 overflow-hidden">
                                            <img
                                                alt="Design workshop with sticky notes"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9_k8mDcEDe13WFJJujUGglqb505inKVl5ds4DMFztwtlcmNdlIrw2M3jQhWg1JG9GFMuvg-0kIfblDuzYx68b5uiVjbHA_weugezsUhi-ujI-ToaTeavTHnwux-3V1Nu8diPQ5DTN3zczWqLRx_pOKjIR9cq3ViekRC85pLjJ3hAN94RjS0BM4fPXTEzAA_guPG0D-wQ4bICyhff05gVRaCCuG070FUz0Tq4nPOF1s9FKAyMMXbfg2lPfDnUVfPS8CB-GSKVe7Q"
                                            />
                                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm text-slate-800 dark:text-slate-200">
                                                THIS WEEK
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2 space-x-2">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">Design</span>
                                                <span>•</span>
                                                <span>Oct 15, 2:00 PM</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-tight">Advanced UX Design Workshop</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">Learn practical strategies for conducting user research and building inclusive interfaces.</p>
                                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                <div className="text-xs text-slate-500">Online Event</div>
                                                <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">Join Stream</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Event Card 3 */}
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow md:col-span-2 lg:col-span-2 xl:col-span-1">
                                        <div className="flex flex-col sm:flex-row h-full">
                                            <div className="relative w-full sm:w-48 h-40 sm:h-auto overflow-hidden flex-shrink-0">
                                                <img
                                                    alt="Networking mixer event crowd"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBEtgPzlKfLvWnqf_v79xoZ7pLp96IbZsRj5556Rxpax9fE2jTRx76dH542aXKA5p4ZcCum5LaEFpB8nCHrOz7ZEull7e69diaZRe7NrFzVbXAprPDYwC9gpIY5OumuUNPuHiUWRVvq7YH5Gxytp-Ye-jk7Kzzkya8e9VHOPuM2KtoDdLIekgDk8FWilARKmely40nw0JpnF9DTmaWNzAGJM7UiGe3X53D4M3aLfxsWblQsNhG3nXwKdaFsGxHcoNq44UXAqAirg"
                                                />
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col justify-center">
                                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2 space-x-2">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">Networking</span>
                                                    <span>•</span>
                                                    <span>Nov 01, 6:00 PM</span>
                                                </div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Quarterly Networking Mixer</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Meet industry leaders in downtown San Francisco.</p>
                                                <div className="flex items-center gap-2">
                                                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                                                        Event Details <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sidebar & Activity */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Quick Actions Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Link href="#" className="block w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors flex items-center gap-3">
                                    <QrCode className="h-5 w-5 text-slate-400" /> My Tickets
                                </Link>
                                <Link href="#" className="block w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors flex items-center gap-3">
                                    <Heart className="h-5 w-5 text-slate-400" /> Saved Events
                                </Link>
                                <Link href="#" className="block w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors flex items-center gap-3">
                                    <UserCog className="h-5 w-5 text-slate-400" /> Edit Profile
                                </Link>
                            </div>
                        </div>

                        {/* Recent Activity Feed */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                            </div>
                            <div className="relative">
                                {/* Timeline Line */}
                                <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
                                <div className="space-y-6">
                                    {/* Item 1 */}
                                    <div className="relative pl-10">
                                        <div className="absolute left-0 top-1 w-7 h-7 bg-green-100 dark:bg-green-900/30 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Registration Confirmed</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">You're going to <span className="font-medium text-slate-700 dark:text-slate-300">React Conf 2024</span>.</p>
                                            <span className="text-[10px] text-slate-400 mt-1">2 hours ago</span>
                                        </div>
                                    </div>
                                    {/* Item 2 */}
                                    <div className="relative pl-10">
                                        <div className="absolute left-0 top-1 w-7 h-7 bg-primary-600/10 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                            <Bookmark className="h-3.5 w-3.5 text-primary-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Event Saved</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">You bookmarked <span className="font-medium text-slate-700 dark:text-slate-300">AI for Beginners</span>.</p>
                                            <span className="text-[10px] text-slate-400 mt-1">Yesterday</span>
                                        </div>
                                    </div>
                                    {/* Item 3 */}
                                    <div className="relative pl-10">
                                        <div className="absolute left-0 top-1 w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                            <MessageSquare className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">New Comment</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sarah replied to your question in <span className="font-medium text-slate-700 dark:text-slate-300">UX Discussion</span>.</p>
                                            <span className="text-[10px] text-slate-400 mt-1">2 days ago</span>
                                        </div>
                                    </div>
                                    {/* Item 4 */}
                                    <div className="relative pl-10">
                                        <div className="absolute left-0 top-1 w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                            <User className="h-3.5 w-3.5 text-slate-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Profile Updated</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">You updated your bio information.</p>
                                            <span className="text-[10px] text-slate-400 mt-1">3 days ago</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <button className="text-xs font-medium text-primary-600 hover:text-primary-700 uppercase tracking-wide">View All Activity</button>
                                </div>
                            </div>
                        </div>

                        {/* Suggested Speakers Mini */}
                        <div className="bg-gradient-to-br from-primary-600 to-blue-700 rounded-xl shadow-lg shadow-primary-600/30 p-5 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                            <h3 className="font-bold mb-3 relative z-10">Complete Your Profile</h3>
                            <p className="text-blue-100 text-sm mb-4 relative z-10">Add your interests to get better event recommendations.</p>
                            <div className="w-full bg-white/20 h-1.5 rounded-full mb-4">
                                <div className="bg-white h-1.5 rounded-full w-3/5"></div>
                            </div>
                            <button className="w-full py-2 bg-white text-primary-600 font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors relative z-10">
                                Continue Setup
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
