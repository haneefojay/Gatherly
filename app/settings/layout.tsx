"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown } from "lucide-react";

const sidebarNavigation = [
    { name: "Profile", href: "/profile/edit", icon: "person" },
    { name: "Privacy & Visibility", href: "/settings/privacy", icon: "lock" },
    { name: "Preferences", href: "/settings/preferences", icon: "tune" },
    { name: "Security", href: "/settings/security", icon: "lock" },
    { name: "Notifications", href: "/settings/notifications", icon: "notifications" },
    { name: "Billing", href: "/settings/billing", icon: "credit_card" },
];

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const activeItem = sidebarNavigation.find((item) => item.href === pathname) || sidebarNavigation[0];

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Mobile Navigation Toggle */}
                <div className="lg:hidden mb-6">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="flex items-center justify-between w-full p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-icons text-primary">{activeItem.icon}</span>
                            <span>{activeItem.name}</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isMobileMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isMobileMenuOpen && (
                        <div className="mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-40">
                            <nav className="p-2 space-y-1">
                                {sidebarNavigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`${isActive
                                                ? "bg-primary-light text-primary dark:bg-primary/20"
                                                : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                                } group rounded-lg px-3 py-3 flex items-center text-sm font-medium transition-all`}
                                        >
                                            <span className={`material-icons mr-3 text-lg ${isActive ? "text-primary" : "text-neutral-400"}`}>
                                                {item.icon}
                                            </span>
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    )}
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-10">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block py-2 lg:col-span-3">
                        <nav className="space-y-1">
                            {sidebarNavigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`${isActive
                                            ? "bg-primary-light text-primary border-primary dark:bg-primary/20"
                                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-transparent dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                                            } group rounded-md px-3 py-2.5 flex items-center text-sm font-medium border-l-4 transition-all`}
                                    >
                                        <span
                                            className={`${isActive
                                                ? "text-primary"
                                                : "text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-300"
                                                } material-icons mr-3 text-lg transition-colors`}
                                        >
                                            {item.icon}
                                        </span>
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    <div className="space-y-6 lg:col-span-9">
                        {children}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
