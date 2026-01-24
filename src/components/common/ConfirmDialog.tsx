import type * as React from "react"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

export interface ConfirmDialogProps {
	open: boolean
	onOpenChange?: (open: boolean) => void
	title?: string
	description?: string
	confirmText?: string
	cancelText?: string
	onConfirm?: () => void | Promise<void>
	onCancel?: () => void
	variant?: "default" | "destructive"
	loading?: boolean
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	open,
	onOpenChange,
	title = "确认操作",
	description = "您确定要执行此操作吗？",
	confirmText = "确认",
	cancelText = "取消",
	onConfirm,
	onCancel,
	variant = "default",
	loading = false,
}) => {
	const handleCancel = () => {
		onCancel?.()
		onOpenChange?.(false)
	}

	const handleConfirm = async () => {
		await onConfirm?.()
		onOpenChange?.(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="sm">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel} disabled={loading}>
						{cancelText}
					</Button>
					<Button
						variant={variant === "destructive" ? "destructive" : "default"}
						onClick={handleConfirm}
						loading={loading}
					>
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default ConfirmDialog
