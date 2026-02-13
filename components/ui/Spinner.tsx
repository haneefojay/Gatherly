import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg"
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
    const sizes = {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-3",
        lg: "h-12 w-12 border-4",
    }

    return (
        <div className={cn("flex items-center justify-center", className)} {...props}>
            <div
                className={cn(
                    sizes[size],
                    "animate-spin rounded-full border-slate-200 border-t-primary-600 dark:border-slate-800 dark:border-t-primary-400"
                )}
            />
        </div>
    )
}
