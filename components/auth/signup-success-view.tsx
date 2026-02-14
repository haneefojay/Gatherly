"use client"

import { Mail, ExternalLink, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { APP_NAME } from "@/lib/constants"
import { useState } from "react"

interface SignupSuccessViewProps {
    email: string
}

export function SignupSuccessView({ email }: SignupSuccessViewProps) {
    const [isResending, setIsResending] = useState(false)
    const [resent, setResent] = useState(false)

    const handleResend = async () => {
        setIsResending(true)
        // Simulate resend
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsResending(false)
        setResent(true)
        setTimeout(() => setResent(false), 3000)
    }

    const openEmailApp = () => {
        // Attempt to open common email providers or just the mail app
        window.open("mailto:", "_blank")
    }

    return (
        <div className="w-full max-w-lg mx-auto text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="mx-auto w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-primary-100 dark:bg-primary-800/20 rounded-xl animate-pulse"></div>
                    <Mail className="h-12 w-12 text-primary-600 dark:text-primary-400 relative z-10" />
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Check your email</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-light text-lg">
                    We&apos;ve sent a verification link to <br />
                    <span className="font-bold text-slate-900 dark:text-white underline decoration-primary-600/30">{email}</span>. <br />
                    Please click the link to activate your account.
                </p>

                <div className="space-y-4">
                    <Button
                        onClick={openEmailApp}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-7 rounded-lg shadow-xl shadow-primary-600/20 hover:shadow-primary-600/30 transition-all duration-300 flex items-center justify-center gap-3 group text-base active:scale-[0.98]"
                    >
                        <span>Open Email App</span>
                        <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="pt-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Didn&apos;t receive it?{" "}
                            <button
                                onClick={handleResend}
                                disabled={isResending}
                                className="font-bold text-primary-600 hover:text-primary-700 transition-all focus:outline-none disabled:opacity-50"
                            >
                                {isResending ? (
                                    <RefreshCw className="h-4 w-4 animate-spin inline mr-1" />
                                ) : resent ? (
                                    <CheckCircle2 className="h-4 w-4 inline mr-1 text-success-500" />
                                ) : null}
                                {resent ? "Sent!" : "Resend Link"}
                            </button>
                        </p>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-6">
                    <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-success-500" />
                        No Spam Guaranteed
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                    <Link href="/auth/login" className="text-slate-400 text-[10px] font-bold uppercase tracking-wider hover:text-primary-600 transition-colors">
                        Support
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
