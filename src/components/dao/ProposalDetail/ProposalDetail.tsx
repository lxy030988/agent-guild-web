import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useProposal } from "@/hooks/dao/useProposal"
import { useVote } from "@/hooks/dao/useVote"
import { VoteBreakdown } from "./VoteBreakdown"
import { VotersList } from "./VotersList"
import { StatusBadge } from "../ProposalsGrid/StatusBadge"
import { CountdownTimer } from "../Common/CountdownTimer"
import { Loader2 } from "lucide-react"

interface ProposalDetailProps {
	proposalId: number | null
	open: boolean
	onClose: () => void
	onVote: (proposalId: number) => void
}

export function ProposalDetail({
	proposalId,
	open,
	onClose,
	onVote,
}: ProposalDetailProps) {
	const { proposal, isLoading } = useProposal(proposalId || 0)
	const { votes, isLoadingVotes, hasVoted } = useVote(proposalId || 0)

	const isActive = proposal?.status === "active"

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : proposal ? (
					<>
						<DialogHeader>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 space-y-2">
									<div className="flex items-center gap-2">
										<span className="text-sm font-mono text-muted-foreground">
											#{proposal.id.toString().padStart(3, "0")}
										</span>
										<StatusBadge status={proposal.status} />
									</div>
									<DialogTitle className="text-2xl">{proposal.title}</DialogTitle>
								</div>
								<CountdownTimer endTime={proposal.endTime} />
							</div>
							<DialogDescription className="text-left">
								Created by{" "}
								<span className="font-mono">
									{proposal.createdBy.slice(0, 6)}...{proposal.createdBy.slice(-4)}
								</span>{" "}
								on {new Date(proposal.createdAt).toLocaleDateString()}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-6 mt-6">
							{/* Description */}
							<div className="space-y-2">
								<h3 className="text-lg font-semibold">Description</h3>
								<div className="prose prose-sm max-w-none">
									<p className="text-muted-foreground whitespace-pre-wrap">
										{proposal.description}
									</p>
								</div>
							</div>

							{/* Vote Breakdown */}
							<VoteBreakdown proposal={proposal} />

							{/* Voters List */}
							{!isLoadingVotes && votes && votes.length > 0 && (
								<VotersList votes={votes} />
							)}

							{/* Actions */}
							<div className="flex gap-3 pt-4 border-t">
								{isActive && !hasVoted && (
									<Button
										className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
										onClick={() => {
											onVote(proposal.id)
											onClose()
										}}
									>
										Cast Your Vote
									</Button>
								)}
								{hasVoted && (
									<div className="flex-1 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
										<p className="text-sm font-semibold text-green-600">
											You have already voted on this proposal
										</p>
									</div>
								)}
								<Button variant="outline" onClick={onClose}>
									Close
								</Button>
							</div>
						</div>
					</>
				) : (
					<div className="py-20 text-center">
						<p className="text-muted-foreground">Proposal not found</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
