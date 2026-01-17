import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./StatusBadge"
import { ParticipantAvatars } from "../Common/ParticipantAvatars"
import { CountdownTimer } from "../Common/CountdownTimer"
import { ProgressBar } from "../Common/ProgressBar"
import type { Proposal } from "@/stores/daoStore"
import { ArrowRight, Eye, Vote } from "lucide-react"

interface ProposalCardProps {
	proposal: Proposal
	onVote?: (proposalId: number) => void
	onView: (proposalId: number) => void
}

export function ProposalCard({ proposal, onVote, onView }: ProposalCardProps) {
	const isActive = proposal.status === "active"
	const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain

	const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0
	const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0

	const quorumPercentage = Math.min((totalVotes / proposal.quorum) * 100, 100)

	// Determine card border color based on status
	const getBorderStyle = () => {
		switch (proposal.status) {
			case "active":
				return "border-purple-500/30 hover:border-purple-500/60"
			case "passed":
				return "border-green-500/30 hover:border-green-500/60"
			case "failed":
				return "border-red-500/30 hover:border-red-500/60"
			case "executed":
				return "border-blue-500/30 hover:border-blue-500/60"
			default:
				return "border-border/50 hover:border-purple-500/50"
		}
	}

	return (
		<Card className={`relative overflow-hidden bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-purple-500/10 group ${getBorderStyle()}`}>
			{/* Top Gradient Bar */}
			{isActive && (
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
			)}

			<div className="p-6 space-y-4">
				{/* Header */}
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 space-y-2">
						<div className="flex items-center gap-2">
							<StatusBadge status={proposal.status} />
							<span className="text-xs font-mono text-muted-foreground">
								#{proposal.id.toString().padStart(4, "0")}
							</span>
						</div>
						<h3 className="text-lg font-semibold group-hover:text-purple-400 transition-colors line-clamp-2">
							{proposal.title}
						</h3>
					</div>
				</div>

				{/* Description */}
				<p className="text-sm text-muted-foreground line-clamp-2">
					{proposal.description}
				</p>

				{/* Vote Progress */}
				<div className="space-y-3 pt-2">
					{/* For/Against combined bar */}
					<div className="space-y-2">
						<div className="flex items-center justify-between text-xs">
							<div className="flex items-center gap-2">
								<span className="text-green-500 font-medium">For {forPercentage.toFixed(0)}%</span>
								<span className="text-muted-foreground">•</span>
								<span className="text-red-500 font-medium">Against {againstPercentage.toFixed(0)}%</span>
							</div>
							<span className="text-muted-foreground">
								{totalVotes.toLocaleString()} votes
							</span>
						</div>

						{/* Combined progress bar */}
						<div className="flex h-2 rounded-full overflow-hidden bg-muted/30">
							<div
								className="bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
								style={{ width: `${forPercentage}%` }}
							/>
							<div
								className="bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
								style={{ width: `${againstPercentage}%` }}
							/>
						</div>
					</div>

					{/* Quorum Progress */}
					<div className="flex items-center gap-3">
						<span className="text-xs text-muted-foreground min-w-[50px]">Quorum</span>
						<div className="flex-1">
							<ProgressBar value={totalVotes} max={proposal.quorum} color="purple" height="xs" />
						</div>
						<span className={`text-xs font-medium ${quorumPercentage >= 100 ? 'text-green-500' : 'text-muted-foreground'}`}>
							{quorumPercentage.toFixed(0)}%
						</span>
					</div>
				</div>

				{/* Divider */}
				<div className="border-t border-border/30" />

				{/* Footer */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<ParticipantAvatars participants={proposal.participants} maxDisplay={3} size="sm" />
						{isActive && <CountdownTimer endTime={proposal.endTime} />}
					</div>

					{/* Actions */}
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onView(proposal.id)}
							className="text-muted-foreground hover:text-foreground gap-1"
						>
							<Eye className="h-4 w-4" />
							<span className="hidden sm:inline">View</span>
						</Button>
						{isActive && onVote && (
							<Button
								size="sm"
								onClick={() => onVote(proposal.id)}
								className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-1"
							>
								<Vote className="h-4 w-4" />
								Vote
							</Button>
						)}
						{!isActive && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => onView(proposal.id)}
								className="gap-1"
							>
								Details
								<ArrowRight className="h-3 w-3" />
							</Button>
						)}
					</div>
				</div>
			</div>
		</Card>
	)
}
