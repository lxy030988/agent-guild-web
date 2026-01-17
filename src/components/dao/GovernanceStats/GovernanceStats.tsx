import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGovernanceStats } from "@/hooks/dao/useGovernanceStats"
import { UserVotingPower } from "./UserVotingPower"
import { UserActivity } from "./UserActivity"
import { Loader2, Wallet } from "lucide-react"

interface GovernanceStatsProps {
	onStakeClick: () => void
}

export function GovernanceStats({ onStakeClick }: GovernanceStatsProps) {
	const { stats, isLoading } = useGovernanceStats()

	if (isLoading) {
		return (
			<Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
				<div className="flex items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			</Card>
		)
	}

	if (!stats) {
		return (
			<Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
				<div className="text-center space-y-4">
					<Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
					<div>
						<p className="font-semibold">Connect Wallet</p>
						<p className="text-sm text-muted-foreground">
							Connect your wallet to view governance stats
						</p>
					</div>
				</div>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
				<UserVotingPower stats={stats} />
			</Card>

			<Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
				<UserActivity stats={stats} />
			</Card>

			<Button
				onClick={onStakeClick}
				className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
			>
				Manage Staking
			</Button>
		</div>
	)
}
