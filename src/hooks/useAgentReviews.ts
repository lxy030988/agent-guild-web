import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { agentApi } from "@/utils/agentApi"

const STALE_TIME_MS = 5 * 60 * 1000

export const useAgentReviews = (
	agentId?: number,
	params: { page?: number; limit?: number; sortBy?: "recent" | "rating" } = {},
) => {
	return useQuery({
		queryKey: [
			"agents",
			"reviews",
			agentId,
			params.page ?? 1,
			params.limit ?? 10,
			params.sortBy ?? "recent",
		],
		queryFn: () => {
			if (!agentId) {
				throw new Error("Agent id is required")
			}
			return agentApi.getAgentReviews(agentId, params)
		},
		enabled: Boolean(agentId),
		placeholderData: keepPreviousData,
		staleTime: STALE_TIME_MS,
	})
}
