import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Clock, Zap } from "lucide-react"

interface LockPeriodSelectorProps {
	value: number
	onChange: (value: number) => void
}

const lockPeriods = [
	{
		days: 0,
		label: "No Lock",
		description: "Flexible, unlock anytime",
		multiplier: 1,
		gradient: "from-gray-500 to-gray-600",
	},
	{
		days: 30,
		label: "30 Days",
		description: "Earn 1.2x voting power",
		multiplier: 1.2,
		gradient: "from-blue-500 to-cyan-500",
	},
	{
		days: 90,
		label: "90 Days",
		description: "Earn 1.5x voting power",
		multiplier: 1.5,
		gradient: "from-purple-500 to-pink-500",
	},
	{
		days: 180,
		label: "180 Days",
		description: "Earn 2x voting power",
		multiplier: 2,
		gradient: "from-orange-500 to-red-500",
	},
]

export function LockPeriodSelector({ value, onChange }: LockPeriodSelectorProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">Lock Period</h3>
				<div className="flex items-center gap-1 text-sm text-muted-foreground">
					<Clock className="h-4 w-4" />
					<span>Choose lock duration</span>
				</div>
			</div>

			<RadioGroup
				value={value.toString()}
				onValueChange={(v) => onChange(Number.parseInt(v, 10))}
			>
				<div className="grid grid-cols-2 gap-3">
					{lockPeriods.map((period) => {
						const isSelected = value === period.days
						return (
							<label
								key={period.days}
								htmlFor={`lock-${period.days}`}
								className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
									isSelected
										? "border-purple-500/50 bg-purple-500/10"
										: "border-border/50 hover:border-border"
								}`}
							>
								<div className="flex items-start gap-3">
									<RadioGroupItem
										value={period.days.toString()}
										id={`lock-${period.days}`}
									/>
									<div className="flex-1 space-y-2">
										<div className="flex items-center gap-2">
											<div
												className={`h-8 w-8 rounded-lg bg-gradient-to-br ${period.gradient} flex items-center justify-center`}
											>
												<Clock className="h-4 w-4 text-white" />
											</div>
											<div>
												<p className="font-semibold text-sm">{period.label}</p>
											</div>
										</div>
										<p className="text-xs text-muted-foreground">
											{period.description}
										</p>
										{period.multiplier > 1 && (
											<div className="flex items-center gap-1 text-purple-600">
												<Zap className="h-3 w-3 fill-current" />
												<span className="text-xs font-bold">
													{period.multiplier}x boost
												</span>
											</div>
										)}
									</div>
								</div>
							</label>
						)
					})}
				</div>
			</RadioGroup>
		</div>
	)
}
