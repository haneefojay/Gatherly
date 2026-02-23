"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Calendar,
    BarChart3,
    Settings,
    Bell,
    Search,
    UserCircle,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const sidebarItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Events", href: "/admin/events", icon: Calendar },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="w-64 bg-white dark:bg-[#151a30] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 transition-all duration-300">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold text-lg">E</div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">GatherlyAdmin</span>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                                isActive
                                    ? "bg-primary-600/10 text-primary-600"
                                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group">
                    <div className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle className="h-5 w-5 text-slate-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.full_name || "Admin User"}</p>
                        <p className="text-xs text-slate-500 truncate capitalize">{user?.role || "Super Admin"}</p>
                    </div>
                </div>
                <button
                    onClick={() => logout()}
                    className="mt-2 w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-lg font-medium transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
