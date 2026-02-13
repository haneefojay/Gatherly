import { APP_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface StepTrackerProps {
    currentStep: number
    steps: string[]
}

export function StepTracker({ currentStep, steps }: StepTrackerProps) {
    return (
        <div className="w-full max-w-lg mx-auto">
            <ul className="flex items-center w-full justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1
                    const isActive = currentStep === stepNumber
                    const isCompleted = currentStep > stepNumber

                    return (
                        <li key={step} className="flex flex-col items-center relative w-1/3">
                            <div className="flex items-center w-full">
                                {index > 0 && (
                                    <div
                                        className={cn(
                                            "h-[2px] w-full mr-2",
                                            isCompleted || isActive ? "bg-primary-600" : "bg-slate-200 dark:bg-slate-700"
                                        )}
                                    />
                                )}
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm z-10 shrink-0 shadow-md transition-all duration-300",
                                        isActive
                                            ? "bg-primary-600 text-white ring-4 ring-blue-50 dark:ring-slate-800"
                                            : isCompleted
                                                ? "bg-primary-600 text-white"
                                                : "border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-400"
                                    )}
                                >
                                    {isCompleted ? "✓" : stepNumber}
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "h-[2px] w-full ml-2",
                                            isCompleted ? "bg-primary-600" : "bg-slate-200 dark:bg-slate-700"
                                        )}
                                    />
                                )}
                            </div>
                            <span
                                className={cn(
                                    "absolute top-10 text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors duration-300",
                                    isActive ? "text-primary-600" : "text-slate-400"
                                )}
                            >
                                {step}
                            </span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
