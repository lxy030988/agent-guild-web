import { Zap, TrendingUp, Lock } from "lucide-react"
import type { UserGovernanceStats } from "@/stores/daoStore"

interface UserVotingPowerProps {
	stats: UserGovernanceStats
}

export function UserVotingPower({ stats }: UserVotingPowerProps) {
	const isLocked = stats.lockEndTime && new Date(stats.lockEndTime) > new Date()

	return (
		<div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20">
			<div className="space-y-4">
				{/* Main Voting Power */}
				<div className="text-center space-y-2">
					<p className="text-sm text-muted-foreground uppercase tracking-wide">
						Your Voting Power
					</p>
					<div className="flex items-center justify-center gap-2">
						<h3 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
							{stats.votingPower.toLocaleString()}
						</h3>
						{stats.multiplier > 1 && (
							<div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
								<Zap className="h-4 w-4 text-purple-600 fill-current" />
								<span className="text-sm font-bold text-purple-600">
									{stats.multiplier}x
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
					<div className="text-center">
						<p className="text-sm text-muted-foreground mb-1">Staked</p>
						<p className="text-xl font-bold">
							{stats.stakedAmount.toLocaleString()}
						</p>
						{isLocked && (
							<div className="flex items-center justify-center gap-1 mt-1">
								<Lock className="h-3 w-3 text-yellow-600" />
								<span className="text-xs text-yellow-600">Locked</span>
							</div>
						)}
					</div>

					<div className="text-center">
						<p className="text-sm text-muted-foreground mb-1">Rank</p>
						<div className="flex items-center justify-center gap-1">
							<p className="text-xl font-bold">#{stats.rank}</p>
							<TrendingUp className="h-4 w-4 text-green-600" />
						</div>
						<p className="text-xs text-muted-foreground">
							of {stats.totalStakers.toLocaleString()}
						</p>
					</div>
				</div>

				{/* Lock End Time */}
				{isLocked && stats.lockEndTime && (
					<div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
						<p className="text-xs text-yellow-600 text-center">
							Locked until{" "}
							{new Date(stats.lockEndTime).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
