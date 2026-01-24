import type {
	Agent,
	AgentListQuery,
	AgentListResponse,
	CreateAgentDTO,
	UpdateAgentDTO,
} from "@/types/agent"
import type { ReviewListResponse } from "@/types/review"
import { buildAgentQueryParams } from "@/utils/agentQuery"
import apiClient from "@/utils/api-client"

export const agentApi = {
	listAgents: async (query: AgentListQuery): Promise<AgentListResponse> => {
		const response = await apiClient.get<AgentListResponse>("/agents", {
			params: buildAgentQueryParams(query),
		})
		return response.data
	},
	getAgent: async (id: number): Promise<Agent> => {
		const response = await apiClient.get<Agent>(`/agents/${id}`)
		return response.data
	},
	createAgent: async (payload: CreateAgentDTO): Promise<Agent> => {
		const response = await apiClient.post<Agent>("/agents", payload)
		return response.data
	},
	updateAgent: async (id: number, payload: UpdateAgentDTO): Promise<Agent> => {
		const response = await apiClient.patch<Agent>(`/agents/${id}`, payload)
		return response.data
	},
	getAgentReviews: async (
		id: number,
		params: { page?: number; limit?: number; sortBy?: "recent" | "rating" },
	): Promise<ReviewListResponse> => {
		const response = await apiClient.get<ReviewListResponse>(
			`/agents/${id}/reviews`,
			{ params },
		)
		return response.data
	},
}
