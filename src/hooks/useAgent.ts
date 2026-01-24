import { useQuery } from "@tanstack/react-query"
import { agentApi } from "@/utils/agent-api"

const STALE_TIME_MS = 10 * 60 * 1000

export const useAgent = (id?: number) => {
	return useQuery({
		queryKey: ["agents", "detail", id],
		queryFn: () => {
			if (!id) {
				throw new Error("Agent id is required")
			}
			return agentApi.getAgent(id)
		},
		enabled: Boolean(id),
		staleTime: STALE_TIME_MS,
	})
}
