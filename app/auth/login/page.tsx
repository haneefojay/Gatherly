"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    CalendarCheck,
    ArrowRight,
    ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { APP_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    rememberMe: z.boolean().default(false),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { login } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            rememberMe: false
        }
    })

    const onSubmit = async (data: LoginValues) => {
        setIsLoading(true)
        setError(null)
        try {
            await login({ email: data.email, password: data.password })
        } catch (err: any) {
            setError(err.message || "Login failed. Please check your credentials.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-[30rem] h-[30rem] bg-primary-600/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay"></div>
                <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <div className="bg-white dark:bg-slate-900 py-10 px-6 shadow-2xl shadow-slate-200/50 dark:shadow-none sm:rounded-xl sm:px-12 border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-medium">Please enter your details to sign in.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Error Alert */}
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg text-sm text-red-700 dark:text-red-300 font-medium">
                                {error}
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 tracking-widest text-[10px]" htmlFor="email">
                                Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <input
                                    {...register("email")}
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all duration-200 text-slate-900 dark:text-white sm:text-sm placeholder-slate-400"
                                />
                            </div>
                            {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1 tracking-wider">{errors.email.message}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 tracking-widest text-[10px]" htmlFor="password">
                                    Password
                                </label>
                                <Link href="/auth/forgot-password" className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    {...register("password")}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all duration-200 text-slate-900 dark:text-white sm:text-sm placeholder-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">{errors.password.message}</p>}
                        </div>

                        {/* Action Row */}
                        <div className="flex items-center">
                            <input
                                {...register("rememberMe")}
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-600/20 border-slate-300 dark:border-slate-700 rounded tracking-wider bg-slate-50 dark:bg-slate-800"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-widest cursor-pointer">
                                Remember me
                            </label>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-lg shadow-xl shadow-primary-600/20 hover:shadow-primary-600/30 transition-all duration-300 flex items-center justify-center gap-2 group text-base active:scale-[0.98]"
                            >
                                {isLoading ? "Signing in..." : "Sign in"}
                                {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
                            <span className="px-4 bg-white dark:bg-slate-900 text-slate-400">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center py-3.5 px-4 border border-slate-100 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-800 text-[10px] font-black tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
                            </svg>
                            Google
                        </button>
                        <button className="flex items-center justify-center py-3.5 px-4 border border-slate-100 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-800 text-[10px] font-black tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                            <svg className="h-4 w-4 mr-2 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                            </svg>
                            LinkedIn
                        </button>
                    </div>
                </div>
                <p className="mt-10 text-center text-xs font-bold text-slate-400 tracking-widest">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 transition-colors">
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
