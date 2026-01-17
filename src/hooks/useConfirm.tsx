import { useState } from "react"
import { Button } from "../components/ui/button"

interface ConfirmDialogProps {
	open: boolean
	title: string
	message: string
	onConfirm: () => void
	onCancel: () => void
}

export function ConfirmDialog({
	open,
	title,
	message,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
				<h3 className="text-lg font-semibold mb-2">{title}</h3>
				<p className="text-gray-600 mb-6">{message}</p>
				<div className="flex items-center gap-3 justify-end">
					<Button variant="outline" onClick={onCancel}>
						取消
					</Button>
					<Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
						确定
					</Button>
				</div>
			</div>
		</div>
	)
}

export function useConfirm() {
	const [state, setState] = useState<{
		open: boolean
		title: string
		message: string
		resolve: ((value: boolean) => void) | null
	}>({
		open: false,
		title: "",
		message: "",
		resolve: null,
	})

	const confirm = (title: string, message: string): Promise<boolean> => {
		return new Promise((resolve) => {
			setState({ open: true, title, message, resolve })
		})
	}

	const handleConfirm = () => {
		state.resolve?.(true)
		setState({ open: false, title: "", message: "", resolve: null })
	}

	const handleCancel = () => {
		state.resolve?.(false)
		setState({ open: false, title: "", message: "", resolve: null })
	}

	const ConfirmDialogComponent = () => (
		<ConfirmDialog
			open={state.open}
			title={state.title}
			message={state.message}
			onConfirm={handleConfirm}
			onCancel={handleCancel}
		/>
	)

	return { confirm, ConfirmDialog: ConfirmDialogComponent }
}
