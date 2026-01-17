import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import daoApi, { type CastVoteRequest } from "@/utils/dao/daoApi"

export function useVote(proposalId: number) {
	const queryClient = useQueryClient()
	const { address } = useAccount()

	// Get user's vote on this proposal
	const { data: userVote, isLoading: isLoadingVote } = useQuery({
		queryKey: ["userVote", proposalId, address],
		queryFn: () => daoApi.getUserVote(proposalId),
		enabled: !!proposalId && !!address,
	})

	// Get all votes for this proposal
	const { data: votes, isLoading: isLoadingVotes } = useQuery({
		queryKey: ["proposalVotes", proposalId],
		queryFn: () => daoApi.getProposalVotes(proposalId),
		enabled: !!proposalId,
	})

	// Cast vote mutation
	const castVoteMutation = useMutation({
		mutationFn: (data: CastVoteRequest) => daoApi.castVote(data),
		onSuccess: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ["userVote", proposalId] })
			queryClient.invalidateQueries({ queryKey: ["proposalVotes", proposalId] })
			queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] })
			queryClient.invalidateQueries({ queryKey: ["proposals"] })
		},
	})

	return {
		userVote,
		votes,
		isLoadingVote,
		isLoadingVotes,
		hasVoted: !!userVote,
		castVote: castVoteMutation.mutate,
		isCastingVote: castVoteMutation.isPending,
		castVoteError: castVoteMutation.error,
	}
}
