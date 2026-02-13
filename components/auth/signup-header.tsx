import { APP_NAME } from "@/lib/constants"
import { ShieldCheck } from "lucide-react"
import Link from "next/link"

export function SignupHeader() {
    return (
        <header className="w-full bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary-600 p-1.5 rounded-lg text-white group-hover:bg-primary-700 transition-colors">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {APP_NAME}
                    </span>
                </Link>
                <div className="hidden sm:block">
                    <Link href="/auth/login" className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors">
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </header>
    )
}
