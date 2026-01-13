import { Check, Loader2, Minus, X } from "lucide-react"
import type React from "react"
import { VoteChoice } from "../../utils/disputeApi"
import { Button } from "../ui/button"

interface VoteButtonProps {
	choice: VoteChoice
	selected: boolean
	disabled: boolean
	loading: boolean
	onClick: (choice: VoteChoice) => void
}

export const VoteButton: React.FC<VoteButtonProps> = ({
	choice,
	selected,
	disabled,
	loading,
	onClick,
}) => {
	const getStyles = () => {
		switch (choice) {
			case VoteChoice.APPROVE:
				return {
					base: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
					active:
						"ring-2 ring-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700 border-none",
					icon: <Check className="w-5 h-5 mr-2" />,
					label: "Approve",
				}
			case VoteChoice.REJECT:
				return {
					base: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
					active:
						"ring-2 ring-rose-500 bg-rose-600 text-white hover:bg-rose-700 border-none",
					icon: <X className="w-5 h-5 mr-2" />,
					label: "Reject",
				}
			case VoteChoice.ABSTAIN:
				return {
					base: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
					active:
						"ring-2 ring-slate-400 bg-slate-600 text-white hover:bg-slate-700 border-none",
					icon: <Minus className="w-5 h-5 mr-2" />,
					label: "Abstain",
				}
		}
	}

	const style = getStyles()

	return (
		<Button
			variant="outline"
			onClick={() => onClick(choice)}
			disabled={disabled || loading}
			className={`h-16 flex-1 text-lg font-bold transition-all duration-300 rounded-2xl ${
				selected ? style.active : style.base
			}`}
		>
			{loading && selected ? (
				<Loader2 className="w-5 h-5 animate-spin mr-2" />
			) : (
				style.icon
			)}
			{style.label}
		</Button>
	)
}
