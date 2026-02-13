"use client"

import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "danger" | "warning" | "info"
    isLoading?: boolean
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    isLoading = false,
}: ConfirmationModalProps) {
    const handleConfirm = async () => {
        await onConfirm()
    }

    const iconMap = {
        danger: <AlertCircle className="h-6 w-6 text-danger-600" />,
        warning: <AlertTriangle className="h-6 w-6 text-warning-500" />,
        info: <Info className="h-6 w-6 text-primary-600" />,
    }

    const bgMap = {
        danger: "bg-danger-50 dark:bg-danger-950/20",
        warning: "bg-warning-50 dark:bg-warning-950/20",
        info: "bg-primary-50 dark:bg-primary-950/20",
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <div className={cn("flex items-start gap-4 p-4 rounded-lg", bgMap[variant])}>
                    <div className="flex-shrink-0 mt-0.5">
                        {iconMap[variant]}
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {message}
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === "danger" ? "destructive" : "default"}
                        onClick={handleConfirm}
                        loading={isLoading}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
