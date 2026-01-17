import apiClient from "@/utils/api-client"
import type { AgentListQuery, AgentListResponse } from "@/types/agent"
import { buildAgentQueryParams } from "@/utils/agentQuery"

export const agentApi = {
	listAgents: async (query: AgentListQuery): Promise<AgentListResponse> => {
		const response = await apiClient.get<AgentListResponse>("/agents", {
			params: buildAgentQueryParams(query),
		})
		return response.data
	},
}
