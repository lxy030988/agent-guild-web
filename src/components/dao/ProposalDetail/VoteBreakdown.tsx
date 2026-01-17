import { ProgressBar } from "../Common/ProgressBar"
import type { Proposal } from "@/stores/daoStore"

interface VoteBreakdownProps {
	proposal: Proposal
}

export function VoteBreakdown({ proposal }: VoteBreakdownProps) {
	const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain

	const stats = [
		{
			label: "For",
			value: proposal.votesFor,
			percentage: totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0,
			color: "green" as const,
		},
		{
			label: "Against",
			value: proposal.votesAgainst,
			percentage: totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0,
			color: "red" as const,
		},
		{
			label: "Abstain",
			value: proposal.votesAbstain,
			percentage: totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0,
			color: "gray" as const,
		},
	]

	return (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold">Vote Breakdown</h3>

			{/* Overall stats */}
			<div className="grid grid-cols-3 gap-4">
				{stats.map((stat) => (
					<div key={stat.label} className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
						<p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
						<p className="text-2xl font-bold">{stat.percentage.toFixed(1)}%</p>
						<p className="text-xs text-muted-foreground mt-1">
							{stat.value.toLocaleString()} votes
						</p>
					</div>
				))}
			</div>

			{/* Progress bars */}
			<div className="space-y-4">
				{stats.map((stat) => (
					<ProgressBar
						key={stat.label}
						value={stat.value}
						max={totalVotes}
						color={stat.color}
						height="lg"
						showLabel
						label={stat.label}
					/>
				))}
			</div>

			{/* Quorum status */}
			<div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium">Quorum Status</span>
					<span className="text-sm font-semibold">
						{totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()}
					</span>
				</div>
				<ProgressBar
					value={totalVotes}
					max={proposal.quorum}
					color="purple"
					height="md"
				/>
				<p className="text-xs text-muted-foreground mt-2">
					{totalVotes >= proposal.quorum
						? "Quorum has been reached"
						: `${(proposal.quorum - totalVotes).toLocaleString()} more votes needed`}
				</p>
			</div>
		</div>
	)
}
