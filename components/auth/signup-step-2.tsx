"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { User, Smartphone, Type, Tag, X, CheckCircle2, ArrowLeft, Camera, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    phone: z.string().regex(/^\+?[\d\s-]{10,}$/, "Please enter a valid phone number"),
    location: z.string().min(2, "Location is required"),
    bio: z.string().max(250, "Bio must be at least 250 characters or less"),
    interests: z.array(z.string()).min(1, "Please select at least one interest"),
    avatar: z.string().optional(),
})

type ProfileValues = z.infer<typeof profileSchema>

interface Step2Props {
    onNext: (data: ProfileValues) => void
    onBack: () => void
    initialData?: any
}

const CATEGORIES = ["Tech", "Music", "Arts", "Business", "Health", "Social", "Cooking", "Sports"]

export function SignupStep2({ onNext, onBack, initialData }: Step2Props) {
    const [interestInput, setInterestInput] = useState("")
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        mode: "onChange",
        defaultValues: {
            fullName: initialData?.fullName || "",
            phone: initialData?.phone || "",
            location: initialData?.location || "",
            bio: initialData?.bio || "",
            interests: initialData?.interests || ["Tech", "Music", "Arts"],
            avatar: initialData?.avatar || "",
        }
    })

    const interests = watch("interests")
    const bioValue = watch("bio")
    const avatar = watch("avatar")

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setValue("avatar", reader.result as string, { shouldValidate: true })
            }
            reader.readAsDataURL(file)
        }
    }

    const removeInterest = (tag: string) => {
        setValue("interests", interests.filter(i => i !== tag), { shouldValidate: true })
    }

    const addInterest = (tag: string) => {
        if (tag && !interests.includes(tag)) {
            setValue("interests", [...interests, tag], { shouldValidate: true })
            setInterestInput("")
        }
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Tell us about yourself</h1>
                <p className="text-slate-500 dark:text-slate-400">Your profile information helps us suggest events you&apos;ll love.</p>
            </div>

            <form onSubmit={handleSubmit(onNext)} className="space-y-6">
                <div className="space-y-5">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all group-hover:scale-105 group-hover:border-primary-600/20">
                                {avatar ? (
                                    <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-slate-400" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg text-white">
                                <Camera className="w-4 h-4" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-3 font-medium">Click to upload profile picture (optional)</p>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                <User className="h-4 w-4" />
                            </div>
                            <input
                                {...register("fullName")}
                                className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all duration-200 text-slate-900 dark:text-white sm:text-sm placeholder-slate-400"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        {errors.fullName && <p className="text-xs text-red-500 font-medium mt-1">{errors.fullName.message}</p>}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                <Smartphone className="h-4 w-4" />
                            </div>
                            <input
                                {...register("phone")}
                                type="tel"
                                className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all duration-200 text-slate-900 dark:text-white sm:text-sm placeholder-slate-400"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                        {errors.phone && <p className="text-xs text-red-500 font-medium mt-1">{errors.phone.message}</p>}
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <input
                                {...register("location")}
                                className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all duration-200 text-slate-900 dark:text-white sm:text-sm placeholder-slate-400"
                                placeholder="e.g. San Francisco, CA"
                            />
                        </div>
                        {errors.location && <p className="text-xs text-red-500 font-medium mt-1">{errors.location.message}</p>}
                    </div>

                    {/* Short Bio */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Short Bio</label>
                        <textarea
                            {...register("bio")}
                            rows={3}
                            className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all duration-200 text-slate-900 dark:text-white resize-none sm:text-sm placeholder-slate-400"
                            placeholder="Tell us what you're passionate about..."
                        />
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-red-500 font-medium">{errors.bio?.message}</span>
                            <span className={cn(
                                "text-xs font-medium",
                                bioValue.length > 250 ? "text-red-500" : "text-slate-400"
                            )}>
                                {bioValue.length}/250 characters
                            </span>
                        </div>
                    </div>

                    {/* Primary Interests */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Primary Interests</label>
                        <div className="min-h-[50px] w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-wrap gap-2 items-center transition-all focus-within:ring-2 focus-within:ring-primary-600/20 focus-within:border-primary-600">
                            {interests.map((tag) => (
                                <div key={tag} className="flex items-center bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold animate-in fade-in zoom-in-95 duration-200">
                                    {tag}
                                    <button
                                        onClick={() => removeInterest(tag)}
                                        className="ml-1.5 hover:text-white/80 transition-colors focus:outline-none"
                                        type="button"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <input
                                value={interestInput}
                                onChange={(e) => setInterestInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        addInterest(interestInput.trim())
                                    }
                                }}
                                className="flex-grow min-w-[100px] bg-transparent border-none focus:ring-0 p-1 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                                placeholder={interests.length === 0 ? "Search..." : ""}
                                type="text"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-slate-400">Select categories that interest you.</p>
                            {errors.interests && <p className="text-[10px] text-red-500 font-medium">{errors.interests.message}</p>}
                        </div>

                        {/* Quick Suggestions */}
                        {interestInput && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {CATEGORIES.filter(c => c.toLowerCase().includes(interestInput.toLowerCase()) && !interests.includes(c)).map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => addInterest(c)}
                                        className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 rounded-md transition-colors"
                                    >
                                        + {c}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-8 mt-2 gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors duration-200"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </button>
                    <Button
                        type="submit"
                        className="w-full lg:w-auto px-8 py-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-xl shadow-primary-600/20 transition-all active:scale-[0.98] text-base gap-2 flex items-center justify-center"
                    >
                        Complete Signup
                        <CheckCircle2 className="h-5 w-5" />
                    </Button>
                </div>
            </form>

            <div className="mt-8 flex items-center justify-center space-x-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-success-500" />
                    Your data is secure
                </div>
                <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors">
                    <Type className="h-3.5 w-3.5 mr-1.5" />
                    Need help?
                </div>
            </div>
        </div>
    )
}