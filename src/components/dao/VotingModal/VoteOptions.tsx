import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react"

interface VoteOptionsProps {
	value: "for" | "against" | "abstain"
	onChange: (value: "for" | "against" | "abstain") => void
}

const options = [
	{
		value: "for" as const,
		label: "For",
		description: "I support this proposal",
		icon: CheckCircle2,
		color: "green",
		gradient: "from-green-500 to-emerald-500",
		borderColor: "border-green-500/50",
		bgColor: "bg-green-500/10",
	},
	{
		value: "against" as const,
		label: "Against",
		description: "I oppose this proposal",
		icon: XCircle,
		color: "red",
		gradient: "from-red-500 to-orange-500",
		borderColor: "border-red-500/50",
		bgColor: "bg-red-500/10",
	},
	{
		value: "abstain" as const,
		label: "Abstain",
		description: "I neither support nor oppose",
		icon: MinusCircle,
		color: "gray",
		gradient: "from-gray-500 to-gray-600",
		borderColor: "border-gray-500/50",
		bgColor: "bg-gray-500/10",
	},
]

export function VoteOptions({ value, onChange }: VoteOptionsProps) {
	return (
		<RadioGroup value={value} onValueChange={onChange}>
			<div className="space-y-3">
				{options.map((option) => {
					const Icon = option.icon
					const isSelected = value === option.value
					return (
						<label
							key={option.value}
							htmlFor={option.value}
							className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
								isSelected
									? `${option.borderColor} ${option.bgColor}`
									: "border-border/50 hover:border-border"
							}`}
						>
							<RadioGroupItem value={option.value} id={option.value} />
							<div
								className={`h-12 w-12 rounded-full bg-gradient-to-br ${option.gradient} flex items-center justify-center`}
							>
								<Icon className="h-6 w-6 text-white" />
							</div>
							<div className="flex-1">
								<p className="font-semibold">{option.label}</p>
								<p className="text-sm text-muted-foreground">
									{option.description}
								</p>
							</div>
						</label>
					)
				})}
			</div>
		</RadioGroup>
	)
}
