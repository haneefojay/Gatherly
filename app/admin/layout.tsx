"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { Search, Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        if (isLoginPage) return;

        if (!loading) {
            if (!user) {
                router.push("/admin/login");
            } else if (!isAdmin) {
                router.push("/dashboard");
            }
        }
    }, [user, loading, isAdmin, router, isLoginPage]);

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (loading || !user || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 min-h-screen flex">
            <AdminSidebar />

            <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-8 sticky top-0 z-20">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Portal</h1>
                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-600/50 w-64 text-slate-600 dark:text-slate-300"
                                placeholder="Search users, events..."
                                type="text"
                            />
                        </div>
                        <button className="relative p-2 text-slate-500 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
