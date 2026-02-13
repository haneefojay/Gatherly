import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
    strength: number // 0-4
}

export function PasswordStrength({ strength }: PasswordStrengthProps) {
    const getStrengthLabel = () => {
        switch (strength) {
            case 0: return "Very Weak"
            case 1: return "Weak"
            case 2: return "Medium"
            case 3: return "Strong"
            case 4: return "Very Strong"
            default: return "Very Weak"
        }
    }

    const getColorClass = (index: number) => {
        if (index >= strength) return "bg-slate-200 dark:bg-slate-800"

        if (strength <= 1) return "bg-red-500"
        if (strength === 2) return "bg-yellow-500"
        if (strength >= 3) return "bg-success-500"
        return "bg-slate-200"
    }

    return (
        <div className="mt-3">
            <div className="flex gap-1.5 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-1/4 h-full transition-all duration-500",
                            getColorClass(i)
                        )}
                    />
                ))}
            </div>
            <p className="text-[10px] mt-1.5 text-slate-500 uppercase font-bold tracking-wider">
                Strength: <span className={cn(
                    strength <= 1 && "text-red-500",
                    strength === 2 && "text-yellow-600",
                    strength >= 3 && "text-success-600"
                )}>{getStrengthLabel()}</span>
            </p>
        </div>
    )
}
