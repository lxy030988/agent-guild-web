import { useQuery } from "@tanstack/react-query"
import { useSetAtom } from "jotai"
import { selectedProposalAtom } from "@/stores/daoStore"
import daoApi from "@/utils/dao/daoApi"

export function useProposal(id: number) {
	const setSelectedProposal = useSetAtom(selectedProposalAtom)

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["proposal", id],
		queryFn: () => daoApi.getProposal(id),
		enabled: !!id,
		refetchInterval: 15000, // Refetch every 15 seconds
	})

	// Sync with atom
	if (data) {
		setSelectedProposal(data)
	}

	return {
		proposal: data,
		isLoading,
		error,
		refetch,
	}
}
