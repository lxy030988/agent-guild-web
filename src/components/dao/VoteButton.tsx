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
						"ring-2 ring-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600",
					icon: <Check className="w-4 h-4 mr-2" />,
					label: "赞成",
				}
			case VoteChoice.REJECT:
				return {
					base: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
					active:
						"ring-2 ring-rose-500 bg-rose-600 text-white hover:bg-rose-700 border-rose-600",
					icon: <X className="w-4 h-4 mr-2" />,
					label: "反对",
				}
			case VoteChoice.ABSTAIN:
				return {
					base: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
					active:
						"ring-2 ring-slate-400 bg-slate-600 text-white hover:bg-slate-700 border-slate-600",
					icon: <Minus className="w-4 h-4 mr-2" />,
					label: "弃权",
				}
		}
	}

	const style = getStyles()

	return (
		<Button
			variant="outline"
			onClick={() => onClick(choice)}
			disabled={disabled || loading}
			className={`h-12 flex-1 text-sm font-medium transition-all duration-200 rounded-lg ${
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
