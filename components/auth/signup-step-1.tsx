"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordStrength } from "@/components/auth/password-strength"
import { APP_NAME } from "@/lib/constants"
import Link from "next/link"

const accountSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms and privacy policy"),
})

type AccountValues = z.infer<typeof accountSchema>

interface Step1Props {
  onNext: (data: AccountValues) => void
  initialData?: any
}

export function SignupStep1({ onNext, initialData }: Step1Props) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    mode: "onChange",
    defaultValues: {
      email: initialData?.email || "",
      password: initialData?.password || "",
      terms: false
    }
  })

  const passwordValue = watch("password", "")

  const calculateStrength = (pass: string) => {
    if (!pass) return 0
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }

  const strength = useMemo(() => calculateStrength(passwordValue), [passwordValue])

  return (
    <div className="w-full max-w-md mx-auto lg:mx-0">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create your account</h2>
        <p className="text-slate-500 dark:text-slate-400">Step 1: Provide your basic account credentials.</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
            Email address
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors">
              <Mail className="h-4 w-4" />
            </div>
            <input
              {...register("email")}
              className={z.string().email().safeParse(watch("email")).success ? "form-input block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none bg-slate-50 dark:bg-slate-800 transition-all sm:text-sm focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600" : "form-input block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none bg-slate-50 dark:bg-slate-800 transition-all sm:text-sm focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"}
              placeholder="name@company.com"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
            Password
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors">
              <Lock className="h-4 w-4" />
            </div>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className="form-input block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none bg-slate-50 dark:bg-slate-800 transition-all sm:text-sm focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength strength={strength} />
          {errors.password && <p className="mt-2 text-xs text-red-500 font-medium leading-relaxed">{errors.password.message}</p>}
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              {...register("terms")}
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-600 border-slate-300 dark:border-slate-700 rounded cursor-pointer transition-all"
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="text-slate-600 dark:text-slate-400" htmlFor="terms">
              I agree to the <Link href="/terms" className="text-primary-600 font-semibold hover:underline transition-all">Terms</Link> and <Link href="/privacy" className="text-primary-600 font-semibold hover:underline transition-all">Privacy Policy</Link>.
            </label>
          </div>
        </div>
        {errors.terms && <p className="text-xs text-red-500 font-medium">{errors.terms.message}</p>}

        <Button
          type="submit"
          className="w-full py-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xl shadow-primary-600/20 transition-all active:scale-[0.98] text-base"
        >
          Continue to Profile
        </Button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
            <span className="px-3 bg-white dark:bg-slate-900 text-slate-400">Or continue with</span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-[0.97]">
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Google</span>
          </button>
          <button className="flex items-center justify-center py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-[0.97]">
            <svg className="h-5 w-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8.05 9.77v-6.91H7.54v-2.86h2.51V9.82c0-2.48 1.48-3.85 3.73-3.85 1.08 0 2.2.19 2.2.19v2.42h-1.24c-1.23 0-1.61.76-1.61 1.54v1.85h2.72l-.43 2.86h-2.29V21.8c4.61-.9 8.05-4.93 8.05-9.8z"></path>
            </svg>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Facebook</span>
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-bold text-primary-600 hover:underline transition-all">
          Sign In
        </Link>
      </p>
    </div>
  )
}
