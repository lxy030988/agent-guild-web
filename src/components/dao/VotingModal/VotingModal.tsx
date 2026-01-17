import { useState } from "react"
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
import { useGovernanceStats } from "@/hooks/dao/useGovernanceStats"
import { VoteOptions } from "./VoteOptions"
import { VotingPowerDisplay } from "./VotingPowerDisplay"
import { VoteConfirmation } from "./VoteConfirmation"
import { Loader2 } from "lucide-react"

interface VotingModalProps {
	proposalId: number | null
	open: boolean
	onClose: () => void
}

export function VotingModal({ proposalId, open, onClose }: VotingModalProps) {
	const [voteChoice, setVoteChoice] = useState<"for" | "against" | "abstain">("for")
	const [showConfirmation, setShowConfirmation] = useState(false)
	const [voteSuccess, setVoteSuccess] = useState(false)
	const [voteTxHash, setVoteTxHash] = useState<string | undefined>()

	const { proposal, isLoading } = useProposal(proposalId || 0)
	const { castVote, isCastingVote, castVoteError } = useVote(proposalId || 0)
	const { stats } = useGovernanceStats()

	const handleVote = async () => {
		if (!proposalId || !stats) return

		try {
			castVote(
				{
					proposalId,
					choice: voteChoice,
					votingPower: stats.votingPower,
				},
				{
					onSuccess: (data) => {
						setVoteSuccess(true)
						setVoteTxHash(data.txHash)
						setShowConfirmation(true)
					},
					onError: () => {
						setVoteSuccess(false)
						setShowConfirmation(true)
					},
				},
			)
		} catch (_error) {
			setVoteSuccess(false)
			setShowConfirmation(true)
		}
	}

	const handleClose = () => {
		setShowConfirmation(false)
		setVoteSuccess(false)
		setVoteTxHash(undefined)
		setVoteChoice("for")
		onClose()
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl">
				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : showConfirmation ? (
					<VoteConfirmation
						success={voteSuccess}
						txHash={voteTxHash}
						error={castVoteError?.message}
						onClose={handleClose}
					/>
				) : proposal ? (
					<>
						<DialogHeader>
							<DialogTitle>Cast Your Vote</DialogTitle>
							<DialogDescription className="text-left">
								<span className="font-semibold">Proposal #{proposal.id}:</span>{" "}
								{proposal.title}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-6 mt-6">
							{/* Voting Power */}
							{stats && (
								<VotingPowerDisplay
									votingPower={stats.votingPower}
									multiplier={stats.multiplier}
									stakedAmount={stats.stakedAmount}
								/>
							)}

							{/* Vote Options */}
							<div className="space-y-3">
								<h3 className="font-semibold">Select Your Vote</h3>
								<VoteOptions value={voteChoice} onChange={setVoteChoice} />
							</div>

							{/* Warning */}
							<div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
								<p className="text-sm text-yellow-600">
									<span className="font-semibold">Note:</span> Once you cast your
									vote, it cannot be changed. Please review your selection
									carefully.
								</p>
							</div>

							{/* Actions */}
							<div className="flex gap-3">
								<Button
									variant="outline"
									className="flex-1"
									onClick={handleClose}
									disabled={isCastingVote}
								>
									Cancel
								</Button>
								<Button
									className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
									onClick={handleVote}
									disabled={isCastingVote || !stats}
								>
									{isCastingVote ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Submitting...
										</>
									) : (
										"Submit Vote"
									)}
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
