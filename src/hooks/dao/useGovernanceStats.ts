import { useQuery } from "@tanstack/react-query"
import { useSetAtom } from "jotai"
import { userGovernanceStatsAtom, statsLoadingAtom } from "@/stores/daoStore"
import daoApi from "@/utils/dao/daoApi"

export function useGovernanceStats() {
	const setStats = useSetAtom(userGovernanceStatsAtom)
	const setLoading = useSetAtom(statsLoadingAtom)

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["governanceStats"],
		queryFn: () => daoApi.getGovernanceStats(),
		refetchInterval: 30000,
	})

	// Sync with atom
	if (data) {
		setStats(data)
	}
	setLoading(isLoading)

	return {
		stats: data,
		isLoading,
		error,
		refetch,
	}
}
