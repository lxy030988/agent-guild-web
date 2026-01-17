import { Zap, TrendingUp } from "lucide-react"

interface MultiplierDisplayProps {
	lockPeriod: number
	amount: number
}

const getMultiplier = (lockPeriod: number) => {
	switch (lockPeriod) {
		case 30:
			return 1.2
		case 90:
			return 1.5
		case 180:
			return 2
		default:
			return 1
	}
}

export function MultiplierDisplay({ lockPeriod, amount }: MultiplierDisplayProps) {
	const multiplier = getMultiplier(lockPeriod)
	const votingPower = amount * multiplier

	return (
		<div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20">
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">Staking Amount</span>
					<span className="font-semibold">{amount.toLocaleString()} tokens</span>
				</div>

				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground flex items-center gap-1">
						<Zap className="h-4 w-4" />
						Multiplier
					</span>
					<span className="font-semibold text-purple-600">{multiplier}x</span>
				</div>

				<div className="pt-3 border-t border-border/50">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium flex items-center gap-1">
							<TrendingUp className="h-4 w-4 text-green-600" />
							Voting Power
						</span>
						<span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
							{votingPower.toLocaleString()}
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}
