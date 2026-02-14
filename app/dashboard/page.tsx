"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { UserDashboard } from "@/components/dashboard/UserDashboard"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
    const { user, loading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/auth/login")
        }
    }, [loading, isAuthenticated, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        )
    }

    if (!user) {
        return null // Will redirect in useEffect
    }

    if (user.role === "user") {
        return <UserDashboard />
    }

    // Placeholder for other roles
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-lg shadow-md max-w-md">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Welcome, {user.full_name}!
                    <br />
                    You are logged in as an <strong>{user.role}</strong>.
                </p>
                <p className="text-sm text-slate-500">
                    The {user.role} dashboard is currently under development.
                </p>
            </div>
        </div>
    )
}
