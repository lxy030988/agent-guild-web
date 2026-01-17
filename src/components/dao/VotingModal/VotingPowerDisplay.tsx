import { Zap } from "lucide-react"

interface VotingPowerDisplayProps {
	votingPower: number
	multiplier?: number
	stakedAmount?: number
}

export function VotingPowerDisplay({
	votingPower,
	multiplier = 1,
	stakedAmount,
}: VotingPowerDisplayProps) {
	return (
		<div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-muted-foreground mb-1">Your Voting Power</p>
					<div className="flex items-baseline gap-2">
						<p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
							{votingPower.toLocaleString()}
						</p>
						{multiplier > 1 && (
							<span className="text-sm font-semibold text-purple-600 flex items-center gap-1">
								<Zap className="h-4 w-4 fill-current" />
								{multiplier}x
							</span>
						)}
					</div>
					{stakedAmount && (
						<p className="text-xs text-muted-foreground mt-1">
							{stakedAmount.toLocaleString()} tokens staked
						</p>
					)}
				</div>
				<div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
					<Zap className="h-8 w-8 text-white fill-current" />
				</div>
			</div>
		</div>
	)
}
