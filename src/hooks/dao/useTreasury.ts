import { useQuery } from "@tanstack/react-query"
import { useSetAtom } from "jotai"
import { treasuryAtom, treasuryLoadingAtom } from "@/stores/daoStore"
import daoApi from "@/utils/dao/daoApi"

export function useTreasury() {
	const setTreasury = useSetAtom(treasuryAtom)
	const setLoading = useSetAtom(treasuryLoadingAtom)

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["treasury"],
		queryFn: () => daoApi.getTreasury(),
		refetchInterval: 60000, // Refetch every minute
	})

	// Sync with atom
	if (data) {
		setTreasury(data)
	}
	setLoading(isLoading)

	return {
		treasury: data,
		isLoading,
		error,
		refetch,
	}
}
