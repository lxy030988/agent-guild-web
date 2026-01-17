import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSetAtom } from "jotai"
import { stakingInfoAtom } from "@/stores/daoStore"
import daoApi, { type StakeRequest, type UnstakeRequest } from "@/utils/dao/daoApi"

export function useStaking() {
	const queryClient = useQueryClient()
	const setStakingInfo = useSetAtom(stakingInfoAtom)

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["stakingInfo"],
		queryFn: () => daoApi.getStakingInfo(),
		refetchInterval: 30000,
	})

	// Sync with atom
	if (data) {
		setStakingInfo(data)
	}

	const stakeMutation = useMutation({
		mutationFn: (data: StakeRequest) => daoApi.stake(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["stakingInfo"] })
			queryClient.invalidateQueries({ queryKey: ["governanceStats"] })
		},
	})

	const unstakeMutation = useMutation({
		mutationFn: (data: UnstakeRequest) => daoApi.unstake(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["stakingInfo"] })
			queryClient.invalidateQueries({ queryKey: ["governanceStats"] })
		},
	})

	return {
		stakingInfo: data,
		isLoading,
		error,
		refetch,
		stake: stakeMutation.mutate,
		unstake: unstakeMutation.mutate,
		isStaking: stakeMutation.isPending,
		isUnstaking: unstakeMutation.isPending,
		stakeError: stakeMutation.error,
		unstakeError: unstakeMutation.error,
	}
}
