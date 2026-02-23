"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
    UserCheck,
    UserPlus,
    AlertCircle,
    TrendingUp,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    ExternalLink,
    Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { adminService, AdminUserStats, UserGrowthResponse, AdminUserListItem } from "@/lib/admin-service";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminUserStats | null>(null);
    const [growth, setGrowth] = useState<UserGrowthResponse | null>(null);
    const [recentUsers, setRecentUsers] = useState<AdminUserListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, growthData, userListData] = await Promise.all([
                    adminService.getStats(),
                    adminService.getGrowth(30),
                    adminService.listUsers({ page_size: 5, sort_by: "created_at", sort_order: "desc" })
                ]);
                setStats(statsData);
                setGrowth(growthData);
                setRecentUsers(userListData.users);
            } catch (error) {
                console.error("Failed to fetch admin dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const metricCards = [
        {
            label: "Total Users",
            value: stats?.total_users.toLocaleString() || "0",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            trend: "+12%",
            positive: true
        },
        {
            label: "Active Users (MAU)",
            value: stats?.mau.toLocaleString() || "0",
            icon: UserCheck,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-900/20",
            subtitle: "Active in last 30d"
        },
        {
            label: "New Today",
            value: stats?.new_today.toLocaleString() || "0",
            icon: UserPlus,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            trend: "+8",
            positive: true,
            trendLabel: "vs yesterday"
        },
        {
            label: "Pending Verification",
            value: (stats?.by_status?.pending || 0).toLocaleString(),
            icon: AlertCircle,
            color: "text-yellow-600",
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
            border: "border-l-4 border-l-yellow-500",
            status: "Needs attention"
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((card, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "bg-white dark:bg-[#151a30] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group",
                            card.border
                        )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{card.value}</h3>
                            </div>
                            <div className={cn("p-2 rounded-lg", card.bg, card.color)}>
                                <card.icon className="h-6 w-6" />
                            </div>
                        </div>
                        {card.trend && (
                            <div className="flex items-center text-sm">
                                <span className={cn(
                                    "flex items-center font-medium px-2 py-0.5 rounded mr-2",
                                    card.positive ? "text-green-600 bg-green-50 dark:bg-green-900/20" : "text-red-600 bg-red-50 dark:bg-red-900/20"
                                )}>
                                    {card.positive ? <TrendingUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                                    {card.trend}
                                </span>
                                <span className="text-slate-400">{card.trendLabel || "vs last month"}</span>
                            </div>
                        )}
                        {card.subtitle && (
                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                                <Clock className="h-4 w-4 mr-1 text-slate-400" />
                                {card.subtitle}
                            </div>
                        )}
                        {card.status && (
                            <div className="flex items-center text-sm text-yellow-600 font-medium">
                                {card.status}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Growth Chart Placeholder */}
                    <div className="bg-white dark:bg-[#151a30] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">User Growth</h3>
                            <select className="bg-slate-50 dark:bg-slate-800 border-none text-sm text-slate-600 dark:text-slate-300 rounded-lg focus:ring-1 focus:ring-primary-600/50">
                                <option>Last 30 Days</option>
                                <option>Last Quarter</option>
                                <option>Last Year</option>
                            </select>
                        </div>

                        {/* Custom SVG Growth Chart */}
                        <div className="relative h-64 w-full flex items-end justify-between gap-2 pt-8">
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                                {[0, 1, 2, 3].map((_, i) => (
                                    <div key={i} className="border-b border-slate-100 dark:border-slate-800 w-full h-0"></div>
                                ))}
                            </div>

                            {growth && growth.data_points.length > 0 ? (
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="growthGradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#1337ec" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#1337ec" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Line Path Generation */}
                                    {(() => {
                                        const points = growth.data_points;
                                        const max = Math.max(...points.map(p => p.cumulative)) || 1;
                                        const pathData = points.map((p, i) => {
                                            const x = (i / (points.length - 1)) * 800;
                                            const y = 180 - (p.cumulative / max) * 160;
                                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                        }).join(' ');

                                        return (
                                            <>
                                                <path d={`${pathData} V 200 H 0 Z`} fill="url(#growthGradient)" />
                                                <path d={pathData} fill="none" stroke="#1337ec" strokeWidth="3" strokeLinecap="round" />
                                                {/* Dots for some key points */}
                                                {points.filter((_, i) => i % Math.ceil(points.length / 5) === 0 || i === points.length - 1).map((p, i, arr) => {
                                                    const idx = growth.data_points.indexOf(p);
                                                    const x = (idx / (points.length - 1)) * 800;
                                                    const y = 180 - (p.cumulative / max) * 160;
                                                    return <circle key={idx} cx={x} cy={y} r="4" className="fill-white stroke-primary-600 stroke-2" />;
                                                })}
                                            </>
                                        );
                                    })()}
                                </svg>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">No data available</div>
                            )}
                        </div>
                        <div className="flex justify-between mt-4 text-xs text-slate-400">
                            {growth?.data_points.filter((_, i) => i % Math.ceil(growth.data_points.length / 5) === 0 || i === growth.data_points.length - 1).map((p, i) => (
                                <span key={i}>{format(new Date(p.date), 'MMM d')}</span>
                            ))}
                        </div>
                    </div>

                    {/* Users by Role Pie Chart Simulation */}
                    <div className="bg-white dark:bg-[#151a30] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Users by Role</h3>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Donut Chart Visual */}
                            <div className="relative w-40 h-40 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="4" />
                                    {/* This is simplified for the demo, would need dynamic calculation based on stats.by_role */}
                                    <circle
                                        cx="18" cy="18" r="15.9155" fill="none"
                                        className="stroke-primary-600" strokeWidth="4"
                                        strokeDasharray="70, 100"
                                    />
                                    <circle
                                        cx="18" cy="18" r="15.9155" fill="none"
                                        className="stroke-blue-400" strokeWidth="4"
                                        strokeDasharray="20, 100" strokeDashoffset="-70"
                                    />
                                    <circle
                                        cx="18" cy="18" r="15.9155" fill="none"
                                        className="stroke-blue-200" strokeWidth="4"
                                        strokeDasharray="10, 100" strokeDashoffset="-90"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {((stats?.total_users || 0) >= 1000 ? `${((stats?.total_users || 0) / 1000).toFixed(1)}k` : stats?.total_users) || "0"}
                                    </span>
                                    <span className="text-xs text-slate-500">Total</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex-1 w-full space-y-3">
                                {Object.entries(stats?.by_role || {}).map(([role, count], idx) => {
                                    const colors = ["bg-primary-600", "bg-blue-400", "bg-blue-200"];
                                    const percentage = Math.round((count / (stats?.total_users || 1)) * 100);
                                    return (
                                        <div key={role} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                                                <div className={cn("w-3 h-3 rounded-full", colors[idx % colors.length])}></div>
                                                <span className="text-sm font-medium capitalize">{role}s</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-400">{count}</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Area (1/3) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Flagged Users Alert */}
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4 text-red-700 dark:text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            <h3 className="font-bold text-lg">Flagged Users</h3>
                        </div>
                        <div className="space-y-3">
                            {/* Mock flagged users for demo */}
                            <div className="bg-white dark:bg-[#151a30] p-3 rounded-lg shadow-sm border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">User #449</p>
                                        <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded font-medium">Spam</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">Reported 3 times for unsolicited messages.</p>
                                    <button className="text-xs text-primary-600 font-medium mt-2 hover:underline">Review Details</button>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#151a30] p-3 rounded-lg shadow-sm border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">User #882</p>
                                        <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded font-medium">Fake Profile</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">Profile image match found in deny-list.</p>
                                    <button className="text-xs text-primary-600 font-medium mt-2 hover:underline">Review Details</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Registrations List */}
                    <div className="bg-white dark:bg-[#151a30] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Registrations</h3>
                            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</button>
                        </div>
                        <div className="space-y-4">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-3 pb-3 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0">
                                    <div className="h-10 w-10 rounded-full bg-primary-600/10 flex items-center justify-center text-primary-600 font-medium text-xs border border-primary-600/10">
                                        {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.full_name}</p>
                                        <p className="text-xs text-slate-500 truncate capitalize">Registered as {user.role}</p>
                                    </div>
                                    <div className="text-[10px] text-slate-400 whitespace-nowrap">
                                        {format(new Date(user.created_at), 'MMM d')}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Export Recent Data
                        </button>
                    </div>
                </div>
            </div>

            <footer className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 pb-2 text-center text-xs text-slate-400">
                © {new Date().getFullYear()} Gatherly Admin Platform. All rights reserved.
            </footer>
        </motion.div>
    );
}
