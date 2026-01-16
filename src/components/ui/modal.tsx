import React from "react"

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	subtitle?: string
	children: React.ReactNode
}

export function Modal({
	isOpen,
	onClose,
	title,
	subtitle,
	children,
}: ModalProps) {
	if (!isOpen) return null

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			onClose()
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center outline-none"
			onKeyDown={handleKeyDown}
			tabIndex={-1}
		>
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
				onClick={onClose}
			/>
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
				<div className="flex items-center justify-between p-4 border-b">
					<div>
						<h3 className="text-lg font-semibold">{title}</h3>
						{subtitle && (
							<p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
						)}
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div className="p-4">{children}</div>
			</div>
		</div>
	)
}
