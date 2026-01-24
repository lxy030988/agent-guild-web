import type {
	Agent,
	AgentCategory,
	AgentListQuery,
	AgentListResponse,
	AgentStatus,
	BaseResponse,
	CategoryStats,
	CreateAgentDTO,
	TagsResponse,
	UpdateAgentDTO,
} from "@/types/agent"
import type { ReviewListResponse } from "@/types/review"
import apiClient from "./api-client"

// 重新导出类型和枚举，方便外部使用
export type {
	Agent,
	AgentCategory,
	AgentListQuery,
	AgentListResponse,
	AgentStatus,
	CategoryStats,
	CreateAgentDTO,
	TagsResponse,
	UpdateAgentDTO,
}

/**
 * 构建查询参数
 */
const buildQueryParams = (query: AgentListQuery): Record<string, unknown> => {
	const params: Record<string, unknown> = {}

	if (query.page) params.page = query.page
	if (query.limit) params.limit = query.limit
	if (query.category) params.category = query.category
	if (query.tags) params.tags = query.tags
	if (query.search) params.search = query.search
	if (query.status) params.status = query.status
	if (query.sortBy) params.sortBy = query.sortBy
	if (query.order) params.order = query.order
	if (query.verifiedOnly !== undefined) params.verifiedOnly = query.verifiedOnly

	return params
}

/**
 * Agent API Client
 */
export const agentApi = {
	/**
	 * 获取 Agent 列表
	 */
	async getAgents(params?: AgentListQuery): Promise<AgentListResponse> {
		const response = await apiClient.get<BaseResponse<AgentListResponse>>(
			"/agents",
			{
				params: params ? buildQueryParams(params) : undefined,
			},
		)
		return response.data.data
	},

	/**
	 * 获取精选 Agents（按分类分组）
	 */
	async getFeaturedAgents(): Promise<Record<AgentCategory, Agent[]>> {
		const response =
			await apiClient.get<BaseResponse<Record<AgentCategory, Agent[]>>>(
				"/agents/featured",
			)
		return response.data.data
	},

	/**
	 * 获取热门 Agents
	 */
	async getPopularAgents(limit: number = 10): Promise<Agent[]> {
		const response = await apiClient.get<BaseResponse<Agent[]>>(
			"/agents/popular",
			{
				params: { limit },
			},
		)
		return response.data.data
	},

	/**
	 * 获取分类统计
	 */
	async getCategoryStats(): Promise<CategoryStats> {
		const response = await apiClient.get<BaseResponse<CategoryStats>>(
			"/agents/categories/stats",
		)
		return response.data.data
	},

	/**
	 * 获取所有标签
	 */
	async getAllTags(): Promise<TagsResponse> {
		const response =
			await apiClient.get<BaseResponse<TagsResponse>>("/agents/tags")
		return response.data.data
	},

	/**
	 * 获取 Agent 详情
	 */
	async getAgent(id: number): Promise<Agent> {
		const response = await apiClient.get<BaseResponse<Agent>>(`/agents/${id}`)
		return response.data.data
	},

	/**
	 * 创建 Agent
	 */
	async createAgent(data: CreateAgentDTO): Promise<Agent> {
		const response = await apiClient.post<BaseResponse<Agent>>("/agents", data)
		return response.data.data
	},

	/**
	 * 更新 Agent
	 */
	async updateAgent(id: number, data: UpdateAgentDTO): Promise<Agent> {
		const response = await apiClient.put<BaseResponse<Agent>>(
			`/agents/${id}`,
			data,
		)
		return response.data.data
	},

	/**
	 * 删除 Agent
	 */
	async deleteAgent(id: number): Promise<void> {
		await apiClient.delete(`/agents/${id}`)
	},

	/**
	 * 获取 Agent 评论
	 */
	async getAgentReviews(
		id: number,
		params: { page?: number; limit?: number; sortBy?: "recent" | "rating" },
	): Promise<ReviewListResponse> {
		const response = await apiClient.get<ReviewListResponse>(
			`/agents/${id}/reviews`,
			{ params },
		)
		return response.data
	},
}
