"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    Mail,
    Fingerprint,
    History,
    AlertTriangle,
    KeyRound,
    Headset,
    Loader2,
    CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"

const adminLoginSchema = z.object({
    email: z.string().email("Please enter a valid admin email"),
    password: z.string().min(1, "Password is required"),
    code: z.string().length(6, "Please enter the complete 6-digit code"),
})

type AdminLoginValues = z.infer<typeof adminLoginSchema>

export default function AdminLoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const otpInputs = useRef<(HTMLInputElement | null)[]>([])
    const { adminLogin } = useAuth()

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<AdminLoginValues>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: {
            email: "",
            password: "",
            code: ""
        }
    })

    // Handle OTP input changes
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        setValue("code", newOtp.join(""), { shouldValidate: true })

        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus()
        }
    }

    // Handle Backspace key for OTP
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus()
        }
    }

    const onSubmit = async (data: AdminLoginValues) => {
        setIsLoading(true)
        setError(null)
        try {
            await adminLogin({
                email: data.email,
                password: data.password,
                totp_code: data.code,
            })
        } catch (err: any) {
            setError(err.message || "Authentication failed. Please verify your credentials and 2FA code.")
        } finally {
            setIsLoading(false)
        }
    }

    const currentYear = new Date().getFullYear()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#101322] text-slate-900 dark:text-slate-100 font-sans flex flex-col relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.4] pointer-events-none z-0"
                style={{
                    backgroundImage: `radial-gradient(#1337ec 0.5px, transparent 0.5px), radial-gradient(#1337ec 0.5px, transparent 0.5px)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 10px 10px'
                }}
            ></div>

            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

            {/* Top Navigation Bar */}
            <nav className="w-full px-8 py-4 flex justify-between items-center bg-white/80 dark:bg-[#1a1f33]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 fixed top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-600/20">
                        E
                    </div>
                    <span className="font-semibold text-lg tracking-tight flex items-center gap-2">
                        {APP_NAME} <span className="text-slate-400 font-normal border-l border-slate-300 dark:border-slate-700 pl-2 ml-1 text-sm uppercase tracking-wider">Admin Portal</span>
                    </span>
                </div>
                <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/10 rounded-full border border-green-100 dark:border-green-900/20">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        <span className="text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider">System Operational</span>
                    </div>
                    <Link href="#" className="hover:text-primary-600 transition-colors">Help Center</Link>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center p-6 relative mt-20 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-5xl bg-white dark:bg-[#15192b] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row border border-slate-100 dark:border-slate-800"
                >
                    {/* Left Side: Visual/Context */}
                    <div className="hidden md:flex flex-col justify-between w-2/5 bg-slate-50 dark:bg-[#1a1f33] p-10 border-r border-slate-100 dark:border-slate-800 relative overflow-hidden">
                        {/* Abstract Design Element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-600/10 to-transparent rounded-bl-full translate-x-16 -translate-y-16"></div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Platform Security</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Access to the {APP_NAME} administration panel is restricted. All login attempts are geolocated and logged for security audit purposes.
                            </p>
                        </div>

                        <div className="relative z-10 mt-auto space-y-5">
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 group hover:text-primary-600 transition-colors">
                                <ShieldCheck className="w-5 h-5 text-primary-600" />
                                <span>256-bit SSL Encryption</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 group hover:text-primary-600 transition-colors">
                                <Fingerprint className="w-5 h-5 text-primary-600" />
                                <span>Biometric Ready</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 group hover:text-primary-600 transition-colors">
                                <History className="w-5 h-5 text-primary-600" />
                                <span>Session Timeout: 15m</span>
                            </div>
                        </div>

                        {/* Map Visualization Placeholder */}
                        <div className="mt-8 rounded-xl overflow-hidden h-40 relative border border-slate-200 dark:border-slate-700 shadow-sm opacity-90 group cursor-default">
                            {/* Assuming the image is accessible or we use a placeholder color */}
                            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse group-hover:animate-none transition-all duration-700"></div>
                            {/* We can use a Next.js Image component if configured, prioritizing standardimg for compatibility with unknown domains */}
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAl1YMNuUZcbWvj2VJaieAFb2b4EUfqc9n8iTBBiyuke-PwEfFijnHGkdCiqAq6EwKK0LjSZlOnozg4ZfGd6__aSBz0dfcvn6LhGZDKd61jN8myDj_fIJQN3vz7HC6KMrCTgu9C_9EfuMtrbTE4WpB1NvgcR7nAHJ7K_gkdIFM0wTQ-Y2HOcRnuRpT_AvSdMYQQt_IiLQ1a0nc-oJNZcuRi1RnIDGqQE5Mc-U5yyhOBxC95apF5dY9iIrotzK_J6D6cCe2gmBTf8w"
                                alt="Security Map Visualization"
                                className="w-full h-full object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-primary-600/20 mix-blend-overlay"></div>
                            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white font-mono border border-white/10 shadow-lg">
                                SERVER_NODE_US_EAST
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Login Form */}
                    <div className="w-full md:w-3/5 p-8 md:p-12 lg:p-16 bg-white dark:bg-[#15192b]">
                        <div className="flex justify-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold uppercase tracking-wider shadow-sm">
                                <Lock className="w-3 h-3" />
                                Secure Administrator Access
                            </div>
                        </div>

                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Authentication</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-medium">Please verify your identity to proceed.</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl text-red-700 dark:text-red-300 text-sm">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                                <p className="leading-relaxed font-medium">{error}</p>
                            </div>
                        )}

                        {/* Warning Alert */}
                        <div className="mb-8 flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl text-amber-800 dark:text-amber-200 text-sm shadow-sm">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                            <p className="leading-relaxed font-medium">Authorized Personnel Only. Unauthorized access is a violation of company policy and acts will be logged and reported to security operations.</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                                    Administrator Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        {...register("email")}
                                        id="email"
                                        type="email"
                                        className={cn(
                                            "block w-full pl-11 pr-3 py-3 border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all sm:text-sm bg-slate-50 dark:bg-slate-800/50",
                                            errors.email
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
                                        )}
                                        placeholder="admin@eventhorizon.com"
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
                                        Password
                                    </label>
                                    <Link href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                        <KeyRound className="h-5 w-5" />
                                    </div>
                                    <input
                                        {...register("password")}
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className={cn(
                                            "block w-full pl-11 pr-10 py-3 border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all sm:text-sm bg-slate-50 dark:bg-slate-800/50",
                                            errors.password
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
                                        )}
                                        placeholder="••••••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>}
                            </div>

                            {/* 2FA Section */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 text-xs font-bold border border-primary-200 dark:border-primary-800">2</span>
                                    <label className="block text-sm font-semibold text-slate-900 dark:text-white">Two-Factor Verification Code</label>
                                    <span className="ml-auto text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">Auth App / SMS</span>
                                </div>

                                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => {
                                                otpInputs.current[index] = el
                                            }}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="text-center w-full aspect-square border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none transition-all shadow-sm focus:shadow-md focus:-translate-y-0.5"
                                        />
                                    ))}
                                </div>
                                {errors.code && <p className="text-xs text-red-500 font-medium mt-2 ml-1">{errors.code.message}</p>}
                                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    Open your authenticator app to view your temporary code.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-xl shadow-primary-600/20 hover:shadow-primary-600/30 transition-all active:scale-[0.98] mt-8 text-base flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        Authenticate & Access Portal
                                    </>
                                )}
                            </Button>

                            <div className="mt-6 text-center">
                                <Link
                                    href="#"
                                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-primary-600 transition-colors group px-3 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <Headset className="w-3.5 h-3.5 group-hover:text-primary-600 transition-colors" />
                                    Contact Security Operations
                                </Link>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="absolute bottom-6 w-full text-center">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                        © {currentYear} {APP_NAME} Inc. All rights reserved. | <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacy Policy</span>
                    </p>
                </footer>
            </main>
        </div>
    )
}
