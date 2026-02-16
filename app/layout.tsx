import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants"
import { ToastProvider } from "@/components/ui/toast"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: `${APP_NAME} - ${APP_DESCRIPTION}`,
    description: "Create, manage, and share unforgettable event experiences.",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
            </head>
            <body className={`${inter.className} min-h-screen bg-background-light antialiased`}>
                <AuthProvider>
                    <ThemeProvider defaultTheme="system" storageKey="gatherly-theme">
                        <ToastProvider>
                            {children}
                            <Toaster />
                        </ToastProvider>
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
