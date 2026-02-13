import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

export function formatDateTime(date: string | Date): string {
    const d = new Date(date)
    return d.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        draft: "bg-neutral-500",
        upcoming: "bg-primary-500",
        ongoing: "bg-primary-400",
        completed: "bg-success-600",
        cancelled: "bg-danger-600",
        registered: "bg-success-600",
        waitlisted: "bg-warning-500",
    }
    return colors[status.toLowerCase()] || "bg-neutral-500"
}

export function getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
        draft: "bg-neutral-100 text-neutral-700 border-neutral-200",
        upcoming: "bg-primary-50 text-primary-700 border-primary-200",
        ongoing: "bg-primary-100 text-primary-800 border-primary-200",
        completed: "bg-success-50 text-success-700 border-success-200",
        cancelled: "bg-danger-50 text-danger-700 border-danger-200",
        registered: "bg-success-50 text-success-700 border-success-200",
        waitlisted: "bg-warning-50 text-warning-700 border-warning-200",
    }
    return classes[status.toLowerCase()] || "bg-neutral-100 text-neutral-700 border-neutral-200"
}
