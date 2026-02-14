"use client"

import { useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Lock,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Eye,
    EyeOff,
    ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { APP_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { resetPassword } = useAuth()

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange"
    })

    // Watch password for real-time validation
    const password = watch("password", "")

    // Calculate strength and requirements
    const requirements = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "One uppercase letter", met: /[A-Z]/.test(password) },
        { label: "One number", met: /[0-9]/.test(password) },
        { label: "One special character (!@#$)", met: /[^A-Za-z0-9]/.test(password) },
    ]

    const strengthScore = requirements.filter(r => r.met).length

    const getStrengthLabel = (score: number) => {
        if (score === 0) return { label: "", color: "bg-slate-200 dark:bg-slate-700" }
        if (score < 2) return { label: "Weak", color: "bg-orange-500", textColor: "text-orange-500" }
        if (score < 4) return { label: "Medium", color: "bg-yellow-500", textColor: "text-yellow-500" }
        return { label: "Strong", color: "bg-green-500", textColor: "text-green-500" }
    }

    const strengthInfo = getStrengthLabel(strengthScore)

    const onSubmit = async (data: ResetPasswordValues) => {
        if (!token) {
            setError("Invalid or missing reset token. Please request a new reset link.")
            return
        }
        setIsLoading(true)
        setError(null)
        try {
            await resetPassword(token, data.password)
            setIsSubmitted(true)
        } catch (err: any) {
            setError(err.message || "Failed to reset password. The link may have expired.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[45rem] h-[45rem] bg-purple-500/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[45rem] h-[45rem] bg-primary-600/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 relative">

                    {/* Decorative Top Bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary-600 to-blue-400"></div>

                    <div className="p-8 md:p-10">
                        <AnimatePresence mode="wait">
                            {!isSubmitted ? (
                                <motion.div
                                    key="input-form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-50 dark:bg-primary-900/20 mb-6 text-primary-600 dark:text-primary-400">
                                            <Lock className="h-8 w-8" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h1>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Create a strong, unique password for your Event Dashboard account.</p>
                                    </div>

                                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                        {/* Error Alert */}
                                        {error && (
                                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg text-sm text-red-700 dark:text-red-300 font-medium">
                                                {error}
                                            </div>
                                        )}

                                        {/* New Password Field */}
                                        <div className="relative group">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2" htmlFor="password">New Password</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                                    <Lock className="h-4 w-4" />
                                                </div>
                                                <input
                                                    {...register("password")}
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••••••"
                                                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all duration-200 text-slate-900 dark:text-white sm:text-sm placeholder-slate-400"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>

                                            {/* Password Strength Meter */}
                                            <div className="mt-4 space-y-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Strength</span>
                                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors duration-300", strengthInfo.textColor)}>
                                                        {strengthInfo.label}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1.5 h-1.5 w-full">
                                                    {[1, 2, 3, 4].map((step) => (
                                                        <div
                                                            key={step}
                                                            className={cn(
                                                                "h-full w-1/4 rounded-full transition-all duration-500 ease-out",
                                                                strengthScore >= step
                                                                    ? strengthInfo.color
                                                                    : "bg-slate-100 dark:bg-slate-800"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Validation Checklist */}
                                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-5 border border-slate-100 dark:border-slate-800/60">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Requirements</h4>
                                            <ul className="space-y-2.5">
                                                {requirements.map((req, index) => (
                                                    <li key={index} className="flex items-center text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
                                                        {req.met ? (
                                                            <CheckCircle2 className="h-4 w-4 mr-2.5 text-green-500 shrink-0" />
                                                        ) : (
                                                            <div className="h-4 w-4 mr-2.5 rounded-full border-[1.5px] border-slate-300 dark:border-slate-600 shrink-0" />
                                                        )}
                                                        <span className={cn(req.met && "text-slate-900 dark:text-slate-200 font-medium")}>{req.label}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Confirm Password Field */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2" htmlFor="confirmPassword">Confirm Password</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                                    <ShieldCheck className="h-4 w-4" />
                                                </div>
                                                <input
                                                    {...register("confirmPassword")}
                                                    id="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••••••"
                                                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all duration-200 text-slate-900 dark:text-white sm:text-sm placeholder-slate-400"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-wide">{errors.confirmPassword.message}</p>}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="pt-2">
                                            <Button
                                                type="submit"
                                                disabled={isLoading || strengthScore < 4}
                                                className="w-full h-auto py-4 px-4 border border-transparent rounded-lg shadow-xl text-base font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-primary-600/20 hover:shadow-primary-600/30 active:scale-[0.98]"
                                            >
                                                {isLoading ? "Resetting Password..." : "Reset Password"}
                                            </Button>
                                        </div>

                                        <div className="text-center">
                                            <Link
                                                href="/auth/login"
                                                className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary-600 dark:text-slate-500 dark:hover:text-white transition-colors group"
                                            >
                                                <ArrowLeft className="h-3 w-3 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
                                                Back to Login
                                            </Link>
                                        </div>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success-message"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-center py-6"
                                >
                                    <div className="mx-auto w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-8 relative">
                                        <div className="absolute inset-0 bg-green-100 dark:bg-green-800/20 rounded-xl animate-pulse"></div>
                                        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 relative z-10" />
                                    </div>

                                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Password Reset!</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-xs mx-auto text-base">
                                        Your password has been successfully updated. You can now use your new credentials.
                                    </p>

                                    <Link href="/auth/login">
                                        <Button className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-xl shadow-primary-600/20 hover:shadow-primary-600/30 transition-all duration-300 flex items-center justify-center gap-2 group text-base active:scale-[0.98]">
                                            Continue to Login
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>

                                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                            Secure Account Recovery
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">
                    Secure Event Platform © 2024
                </div>
            </motion.div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordContent />
        </Suspense>
    )
}
