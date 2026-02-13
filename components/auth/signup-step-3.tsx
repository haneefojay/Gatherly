"use client"

import { CheckCircle2, ChevronRight, ArrowLeft, Mail, Star, MapPin, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

interface Step3Props {
    data: any
    onBack: () => void
    onComplete: () => void
}

export function SignupStep3({ data, onBack, onComplete }: Step3Props) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFinish = async () => {
        setIsSubmitting(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        onComplete()
    }

    // Fallback for demo if data is empty (e.g. direct access)
    const displayData = {
        fullName: data.fullName || "Sarah Jenkins",
        email: data.email || "sarah.jenkins@example.com",
        interests: data.interests || ["Tech Conferences", "Networking", "Workshops"],
        avatar: data.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
        location: data.location || "San Francisco, CA"
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 mb-6 ring-8 ring-success-500/5">
                    <CheckCircle2 className="h-10 w-10 shrink-0" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Everything looks good!</h1>
                <p className="text-slate-500 dark:text-slate-400">Take a moment to review your details before you confirm.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-3xl border border-slate-100 dark:border-slate-800 p-8 md:p-10 transition-all">
                <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
                    {/* User profile section */}
                    <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
                        <div className="relative group">
                            <img
                                alt="User profile avatar"
                                className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform"
                                src={displayData.avatar}
                            />
                            <button
                                onClick={onBack}
                                className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg text-white"
                            >
                                <Edit3 className="h-3 w-3" />
                            </button>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900 dark:text-white leading-tight">{displayData.fullName}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Event Organizer</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-3 items-center">
                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Email</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-200 col-span-2 truncate">{displayData.email}</span>
                        </div>

                        <div className="grid grid-cols-3 items-start">
                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px] mt-1.5">Interests</span>
                            <div className="col-span-2 flex flex-wrap gap-2">
                                {displayData.interests.map((interest: string) => (
                                    <span key={interest} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-600/10 text-primary-600 dark:bg-primary-600/20 dark:text-primary-400 transition-colors">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 items-center">
                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Location</span>
                            <div className="col-span-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-200">
                                <MapPin className="h-3.5 w-3.5 text-primary-600" />
                                {displayData.location}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <Button
                        onClick={handleFinish}
                        disabled={isSubmitting}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-7 rounded-xl shadow-xl shadow-primary-600/30 transition-all duration-300 flex items-center justify-center gap-2 group text-base active:scale-[0.98]"
                    >
                        {isSubmitting ? "Creating your account..." : (
                            <>
                                <span>Confirm & Join</span>
                                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                    <button
                        onClick={onBack}
                        className="text-center text-sm font-bold text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all flex items-center justify-center gap-2 group py-2"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Go back to edit
                    </button>
                </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-10 mb-2 max-w-sm mx-auto leading-relaxed">
                By joining, you agree to our <Link href="#" className="underline font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms of Service</Link> and <Link href="#" className="underline font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy Policy</Link>.
            </p>
        </div>
    )
}