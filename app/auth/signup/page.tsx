"use client"

import { useState, useEffect } from "react"
import { SignupHeader } from "@/components/auth/signup-header"
import { StepTracker } from "@/components/auth/step-tracker"
import { SignupStep1 } from "@/components/auth/signup-step-1"
import { SignupStep2 } from "@/components/auth/signup-step-2"
import { SignupStep3 } from "@/components/auth/signup-step-3"
import { SignupSuccessView } from "@/components/auth/signup-success-view"
import { APP_NAME } from "@/lib/constants"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, ArrowLeft, Star, Quote } from "lucide-react"
import { cn } from "@/lib/utils"


const STORAGE_KEY = "gatherly_signup_progress"
const EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours

export default function SignupPage() {
    const router = useRouter()
    const steps = ["Account", "Profile", "Confirm"]
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        username: "",
        phone: "",
        location: "",
        bio: "",
        interests: ["Tech", "Music", "Arts"],
    })

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const { data, step, expiresAt } = JSON.parse(saved)
                if (Date.now() < expiresAt) {
                    setFormData(data)
                    // If they were already done, don't jump to Step 4 automatically from load
                    // unless you want that behavior. Usually best to restart at 1 or step they left.
                    setCurrentStep(step > 3 ? 1 : step)
                } else {
                    localStorage.removeItem(STORAGE_KEY)
                }
            } catch (e) {
                console.error("Failed to parse saved progress", e)
            }
        }
    }, [])

    // Save to localStorage when state changes
    useEffect(() => {
        const progress = {
            data: formData,
            step: currentStep,
            expiresAt: Date.now() + EXPIRATION_TIME
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    }, [formData, currentStep])

    const nextStep = (data: any) => {
        setFormData(prev => ({ ...prev, ...data }))
        setCurrentStep(prev => prev + 1)
    }

    const prevStep = () => {
        setCurrentStep(prev => prev - 1)
    }

    const handleComplete = () => {
        localStorage.removeItem(STORAGE_KEY)
        setCurrentStep(4) // Move to "Check Email" step
    }

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
            <SignupHeader />

            {/* Step Tracker - Centered below header - Hidden on success step */}
            {currentStep <= 3 && (
                <div className="w-full bg-white dark:bg-slate-950 pt-12 pb-8 px-6 border-b border-slate-50 dark:border-slate-900/50">
                    <StepTracker currentStep={currentStep} steps={steps} />
                </div>
            )}

            <main className={cn(
                "flex-grow flex items-center justify-center p-4 lg:p-12",
                currentStep === 4 && "lg:p-6"
            )}>
                <div className={cn(
                    "bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-blue-500/5 overflow-hidden w-full max-w-6xl flex flex-col lg:flex-row min-h-[680px]",
                    currentStep === 4 && "max-w-4xl min-h-[500px]"
                )}>

                    {/* Left Column - Marketing/Visual - Hidden on success step */}
                    {currentStep <= 3 && (
                        <div className="hidden lg:flex w-5/12 bg-primary-600 relative flex-col justify-between p-12 overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>

                            <div className="relative z-10">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl font-bold leading-tight mb-6 text-white"
                                >
                                    Start your journey <br /> with us.
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-blue-100 text-lg leading-relaxed font-light max-w-sm"
                                >
                                    The all-in-one platform to manage, promote, and grow your event community.
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="relative z-10 mt-auto flex justify-center"
                            >
                                <img
                                    alt="Event Management Preview"
                                    className="rounded-lg shadow-2xl border border-white/20 w-full object-cover h-72 transition-transform hover:scale-[1.02] duration-500"
                                    src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800"
                                />
                            </motion.div>

                            <div className="relative z-10 mt-10 pt-8 border-t border-white/20 flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <img
                                            key={i}
                                            alt={`User ${i}`}
                                            className="w-10 h-10 rounded-full border-2 border-primary-600 bg-slate-200"
                                            src={`https://i.pravatar.cc/100?img=${i + 15}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm font-semibold text-white">Join 10,000+ organizers</p>
                            </div>
                        </div>
                    )}

                    {/* Right Column - Form Steps */}
                    <div className={cn(
                        "w-full p-8 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-900",
                        currentStep <= 3 ? "lg:w-7/12" : "w-full"
                    )}>
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <SignupStep1 onNext={nextStep} initialData={formData} />
                                </motion.div>
                            )}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <SignupStep2 onNext={nextStep} onBack={prevStep} initialData={formData} />
                                </motion.div>
                            )}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <SignupStep3 data={formData} onBack={prevStep} onComplete={handleComplete} />
                                </motion.div>
                            )}
                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                >
                                    <SignupSuccessView email={formData.email} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {currentStep <= 3 && (
                <footer className="w-full py-8 px-6 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="text-sm text-slate-400">© 2024 {APP_NAME} Inc. All rights reserved.</p>
                    </div>
                </footer>
            )}
        </div>
    )
}
