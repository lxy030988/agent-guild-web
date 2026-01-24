import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { AgentListQuery } from "@/types/agent"
import { agentApi } from "@/utils/agentApi"

const STALE_TIME_MS = 30 * 1000

export const useAgents = (query: AgentListQuery) => {
	return useQuery({
		queryKey: ["agents", "list", query],
		queryFn: () => agentApi.listAgents(query),
		placeholderData: keepPreviousData,
		staleTime: STALE_TIME_MS,
	})
}
