"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { APP_NAME } from "@/lib/constants"
import {
    CheckCircle2,
    ArrowRight,
    RefreshCw,
    Mail,
    History,
    CalendarCheck,
    ArrowLeft,
    Loader2,
    ShieldCheck,
    TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [status, setStatus] = useState<"loading" | "success" | "error" | "resending">("loading")
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        const validateToken = async () => {
            // If no token provided, it's an error immediately
            if (!token) {
                // Wait a bit to show loading state for demo
                await new Promise(resolve => setTimeout(resolve, 2000))
                setStatus("error")
                return
            }

            try {
                // Simulate API call for validation
                await new Promise(resolve => setTimeout(resolve, 2500))

                // Happy path logic: Assume success for any non-empty token in this simulation
                setStatus("success")
            } catch (error) {
                setStatus("error")
            }
        }

        validateToken()
    }, [token])

    // Automatic redirect logic
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (status === "success" && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        } else if (status === "success" && countdown === 0) {
            router.push("/dashboard")
        }
        return () => clearTimeout(timer)
    }, [status, countdown, router])

    const handleResend = async () => {
        setStatus("resending")
        // Simulate resend API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        setStatus("error")
        // Note: In a real app, we'd stay in error state but show a success toast
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-950 font-sans antialiased min-h-screen flex flex-col relative overflow-hidden text-slate-900 dark:text-slate-100">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-[30rem] h-[30rem] bg-primary-600/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay animate-pulse"></div>
                <div className="absolute top-1/2 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay"></div>
                <div className="absolute -bottom-24 left-1/3 w-[35rem] h-[35rem] bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay"></div>
            </div>

            {/* Navigation Bar */}
            <nav className="w-full relative z-20 px-8 py-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary-600/20 group-hover:scale-105 transition-all duration-300">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight uppercase tracking-[0.2em]">{APP_NAME}</span>
                </Link>
                <div className="hidden md:flex items-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                    <Link href="#" className="hover:text-primary-600 transition-colors">Documentation</Link>
                    <Link href="#" className="hover:text-primary-600 transition-colors">Support</Link>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center p-6 relative z-10 w-full max-w-7xl mx-auto gap-12 lg:gap-32 flex-col lg:flex-row">

                {/* Left Side: Visual Context */}
                <div className="hidden lg:flex flex-col justify-center max-w-xl">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-5xl xl:text-6xl font-extrabold mb-8 leading-[1.1] tracking-tight"
                    >
                        Manage your events <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500">with confidence.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-500 dark:text-slate-400 mb-12 leading-relaxed font-light max-w-lg"
                    >
                        Verify your email to unlock powerful dashboard features, real-time analytics, and seamless attendee management.
                    </motion.p>

                    {/* Abstract decorative card stack */}
                    <div className="relative h-56 w-full mt-4">
                        <motion.div
                            initial={{ opacity: 0, rotate: -15, scale: 0.9 }}
                            animate={{ opacity: 1, rotate: -8, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="absolute top-0 left-0 w-72 h-40 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-10 transform-gpu"
                        >
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <CalendarCheck className="h-5 w-5" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                                    <div className="h-2 w-20 bg-slate-50 dark:bg-slate-800/50 rounded-full"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 w-full bg-slate-50 dark:bg-slate-800/30 rounded-full"></div>
                                <div className="h-2 w-4/5 bg-slate-50 dark:bg-slate-800/30 rounded-full"></div>
                                <div className="h-2 w-3/5 bg-slate-50 dark:bg-slate-800/30 rounded-full"></div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, rotate: 15, scale: 0.9, x: 30 }}
                            animate={{ opacity: 1, rotate: 5, scale: 1, x: 20 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="absolute top-12 left-24 w-72 h-40 bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 p-6 z-20 transform-gpu"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary-600" />
                                    <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                </div>
                                <div className="text-primary-600 text-sm font-black tracking-tighter">+24%</div>
                            </div>
                            <div className="flex items-end gap-2 h-16">
                                <div className="w-full bg-primary-600/10 h-1/2 rounded-t-xl"></div>
                                <div className="w-full bg-primary-600/30 h-3/4 rounded-t-xl"></div>
                                <div className="w-full bg-primary-600/50 h-2/3 rounded-t-xl"></div>
                                <div className="w-full bg-primary-600/70 h-[90%] rounded-t-xl"></div>
                                <div className="w-full bg-primary-600 h-full rounded-t-xl"></div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Side: Status Cards Container */}
                <div className="w-full max-w-md">
                    <AnimatePresence mode="wait">
                        {status === "loading" && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-12 text-center backdrop-blur-md relative overflow-hidden"
                            >
                                <div className="mx-auto w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-primary-600 animate-spin" />
                                    <Mail className="h-10 w-10 text-primary-600" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4 tracking-tight">Verifying Email</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                                    Please wait while we validate your secure token...
                                </p>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "0%" }}
                                        transition={{ duration: 2.5, ease: "easeInOut" }}
                                        className="h-full bg-primary-600 w-full"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {status === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-12 text-center backdrop-blur-md relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-primary-600 whitespace-nowrap"></div>

                                {/* Success Icon */}
                                <div className="mx-auto w-28 h-28 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-10 relative">
                                    <div className="absolute inset-0 bg-green-100 dark:bg-green-800/20 rounded-full animate-ping opacity-30 duration-[3000ms]"></div>
                                    <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400 relative z-10" />
                                </div>

                                <h2 className="text-4xl font-black mb-4 tracking-tight">Verified!</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-light text-lg">
                                    Thanks for verifying your email. Your account is now active and you&apos;re ready to start hosting.
                                </p>

                                <div className="space-y-6">
                                    <Button
                                        onClick={() => router.push("/dashboard")}
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-8 rounded-[1.5rem] shadow-2xl shadow-primary-600/30 transition-all duration-300 flex items-center justify-center gap-3 group text-lg active:scale-[0.98]"
                                    >
                                        Continue to Dashboard
                                        <ArrowRight className="h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
                                    </Button>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                                        Redirecting in <span className="font-mono text-primary-600 text-sm">{countdown}s</span>
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {(status === "error" || status === "resending") && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-12 text-center backdrop-blur-md relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-500 whitespace-nowrap"></div>

                                {/* Error Icon */}
                                <div className="mx-auto w-28 h-28 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-10">
                                    <History className="h-14 w-14 text-orange-500 dark:text-orange-400" />
                                </div>

                                <h2 className="text-4xl font-black mb-4 tracking-tight">Expired</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-light text-lg">
                                    For security, verification links are only valid for 24 hours. Don&apos;t worry, we can send a new one.
                                </p>

                                <div className="space-y-6">
                                    <Button
                                        onClick={handleResend}
                                        disabled={status === "resending"}
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-8 rounded-[1.5rem] shadow-2xl shadow-primary-600/30 transition-all duration-300 flex items-center justify-center gap-3 group text-lg active:scale-[0.98]"
                                    >
                                        {status === "resending" ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-6 w-6 group-hover:rotate-180 transition-transform duration-700" />
                                        )}
                                        Resend Link
                                    </Button>
                                    <Link
                                        href="/auth/login"
                                        className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-[0.3em] mt-2 group"
                                    >
                                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                                        Back to Login
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 w-full py-10 text-center border-t border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                    © 2024 {APP_NAME} Platform. Built for success.
                </p>
            </footer>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    )
}
