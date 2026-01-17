import { useQuery } from "@tanstack/react-query"
import { useAtom, useSetAtom } from "jotai"
import {
	proposalsAtom,
	proposalsLoadingAtom,
	proposalFilterAtom,
} from "@/stores/daoStore"
import daoApi from "@/utils/dao/daoApi"

export function useProposals() {
	const [proposals, setProposals] = useAtom(proposalsAtom)
	const setLoading = useSetAtom(proposalsLoadingAtom)
	const [filter] = useAtom(proposalFilterAtom)

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["proposals", filter],
		queryFn: () => daoApi.getProposals(filter),
		refetchInterval: 30000, // Refetch every 30 seconds
	})

	// Sync with atom
	if (data && data !== proposals) {
		setProposals(data)
	}
	setLoading(isLoading)

	return {
		proposals: data || proposals,
		isLoading,
		error,
		refetch,
	}
}
