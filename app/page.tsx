import { Button } from "@/components/ui/button"
import { APP_NAME, APP_CONFIG } from "@/lib/constants"
import Link from "next/link"

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <div className="space-y-6 max-w-2xl">
                <h1 className="text-5xl font-bold tracking-tight text-neutral-900 sm:text-7xl">
                    Welcome to <span className="text-primary-600">{APP_NAME}</span>
                </h1>
                <p className="text-xl text-neutral-600 leading-relaxed">
                    {APP_CONFIG.description}. Join thousands of event organizers who trust us to manage their conferences, workshops, and social gatherings effortlessly.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Link href="/auth/signup">
                        <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary-600/20">
                            Get Started for Free
                        </Button>
                    </Link>
                    <Link href="/auth/login">
                        <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full">
                            Sign In
                        </Button>
                    </Link>
                </div>
                <div className="pt-12 text-sm text-neutral-500 font-medium">
                    {APP_CONFIG.socialProof}
                </div>
            </div>
        </main>
    )
}
