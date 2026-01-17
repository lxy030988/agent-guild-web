import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { CreateAgentDTO, UpdateAgentDTO } from "@/types/agent"
import { agentApi } from "@/utils/agentApi"

export const useCreateAgent = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (payload: CreateAgentDTO) => agentApi.createAgent(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents", "list"] })
		},
	})
}

export const useUpdateAgent = (id: number) => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (payload: UpdateAgentDTO) => agentApi.updateAgent(id, payload),
		onSuccess: (agent) => {
			queryClient.setQueryData(["agents", "detail", id], agent)
			queryClient.invalidateQueries({ queryKey: ["agents", "list"] })
		},
	})
}
