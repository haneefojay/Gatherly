"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/Footer";

const sidebarNavigation = [
    { name: "Profile", href: "/profile/edit", icon: "person" },
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

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-10">
                    <aside className="py-6 lg:col-span-3">
                        <nav className="space-y-1">
                            {sidebarNavigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`${
                                            isActive
                                                ? "bg-primary/10 text-primary border-primary"
                                                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-transparent dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                                        } group rounded-md px-3 py-2 flex items-center text-sm font-medium border-l-4 transition-all`}
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        <span
                                            className={`${
                                                isActive
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
                    <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                        {children}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
