import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { agentApi } from "@/utils/agentApi"
import type { AgentListQuery } from "@/types/agent"

const STALE_TIME_MS = 30 * 1000

export const useAgents = (query: AgentListQuery) => {
	return useQuery({
		queryKey: ["agents", query],
		queryFn: () => agentApi.listAgents(query),
		placeholderData: keepPreviousData,
		staleTime: STALE_TIME_MS,
	})
}
