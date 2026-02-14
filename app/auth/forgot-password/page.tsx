"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Mail,
    ArrowLeft,
    CheckCircle2,
    Lock,
    ExternalLink,
    ShieldCheck,
    RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { APP_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [resent, setResent] = useState(false)
    const [emailSentTo, setEmailSentTo] = useState("")

    const { forgotPassword } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordValues) => {
        setIsLoading(true)
        try {
            await forgotPassword(data.email)
            setEmailSentTo(data.email)
            setIsSubmitted(true)
        } catch (err) {
            // Backend always returns 200 for security, but handle edge cases
            setEmailSentTo(data.email)
            setIsSubmitted(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        setIsResending(true)
        try {
            await forgotPassword(emailSentTo)
        } catch (err) {
            // Silently handle — always show success for security
        } finally {
            setIsResending(false)
            setResent(true)
            setTimeout(() => setResent(false), 3000)
        }
    }

    const openEmailApp = () => {
        window.location.href = "mailto:"
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary-600/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-400/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay"></div>
            </div>

            {/* <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary-600/20 group-hover:scale-105 transition-all duration-300">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight uppercase tracking-[0.2em]">{APP_NAME}</span>
                </Link>
            </div> */}

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none sm:rounded-xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm overflow-hidden min-h-[500px] flex items-center">

                    <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                            <motion.div
                                key="input-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full px-6 py-12 sm:px-10"
                            >
                                <div className="text-center mb-10">
                                    <div className="mx-auto w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400">
                                        <Lock className="h-8 w-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Forgot Password?</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        No worries, we&apos;ll send you reset instructions.
                                    </p>
                                </div>

                                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest" htmlFor="email">
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <input
                                                {...register("email")}
                                                id="email"
                                                type="email"
                                                placeholder="name@company.com"
                                                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all duration-200 text-slate-900 dark:text-white sm:text-sm placeholder-slate-400"
                                            />
                                        </div>
                                        {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">{errors.email.message}</p>}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-lg shadow-xl shadow-primary-600/20 hover:shadow-primary-600/30 transition-all duration-300 flex items-center justify-center gap-2 group text-base active:scale-[0.98]"
                                    >
                                        {isLoading ? "Sending..." : "Reset Password"}
                                    </Button>
                                </form>

                                <div className="mt-8 text-center">
                                    <Link
                                        href="/auth/login"
                                        className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-600 transition-colors uppercase tracking-widest group"
                                    >
                                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                                        Back to log in
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success-message"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full px-6 py-12 sm:px-10 text-center"
                            >
                                <div className="mx-auto w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 bg-green-100 dark:bg-green-800/20 rounded-xl animate-pulse"></div>
                                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 relative z-10" />
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Check your email</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
                                    We sent a password reset link to <br />
                                    <span className="font-bold text-slate-900 dark:text-white underline decoration-primary-600/30">{emailSentTo}</span>
                                </p>

                                <Button
                                    onClick={openEmailApp}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-lg shadow-xl shadow-primary-600/20 hover:shadow-primary-600/30 transition-all duration-300 flex items-center justify-center gap-2 group text-base active:scale-[0.98] mb-6"
                                >
                                    Open Email App
                                    <ExternalLink className="h-4 w-4" />
                                </Button>

                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    Didn&apos;t receive the email?{" "}
                                    <button
                                        onClick={handleResend}
                                        disabled={isResending}
                                        className="font-bold text-primary-600 hover:text-primary-700 transition-all focus:outline-none disabled:opacity-50 inline-flex items-center gap-1"
                                    >
                                        {isResending && <RefreshCw className="h-3 w-3 animate-spin" />}
                                        {resent ? "Sent!" : "Click to resend"}
                                    </button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <Link
                                        href="/auth/login"
                                        className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-600 transition-colors uppercase tracking-widest group"
                                    >
                                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                                        Back to log in
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* App Footer */}
            <div className="mt-auto py-8 text-center text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em] relative z-10 w-full">
                <div className="flex items-center justify-center gap-6 mb-2">
                    <Link href="#" className="hover:text-primary-600 transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-primary-600 transition-colors">Support</Link>
                </div>
                © 2024 {APP_NAME} Platform
            </div>
        </div>
    )
}
