import apiClient from "./api-client"

/**
 * 基础响应接口
 */
export interface BaseResponse<T> {
	success: boolean
	data: T
	message?: string
}

/**
 * Agent 分类枚举
 */
export enum AgentCategory {
	PRODUCTIVITY_TOOLS = "PRODUCTIVITY_TOOLS",
	CREATIVE_ASSISTANTS = "CREATIVE_ASSISTANTS",
	DEVELOPER_TOOLS = "DEVELOPER_TOOLS",
	OTHERS = "OTHERS",
}

/**
 * Agent 状态枚举
 */
export enum AgentStatus {
	DRAFT = "DRAFT",
	ACTIVE = "ACTIVE",
	MINTED = "MINTED",
	PAUSED = "PAUSED",
	ARCHIVED = "ARCHIVED",
}

/**
 * Agent 类型定义
 */
export interface Agent {
	id: number
	name: string
	description: string
	shortDesc: string | null
	avatar: string | null
	category: AgentCategory
	tags: string[]
	status: AgentStatus
	capabilities: string[]
	configuration: any
	endpointUrl: string
	endpointAuthType: string
	healthCheckUrl: string | null
	timeoutMs: number
	viewCount: number
	reviewCount: number
	jobCount: number
	rating: number | null
	isVerified: boolean
	healthStatus: string
	lastHealthCheck: Date | null
	ownerId: number
	owner?: {
		id: number
		walletAddress: string
		name: string | null
	}
	createdAt: Date
	updatedAt: Date
}

/**
 * 创建 Agent DTO
 */
export interface CreateAgentDto {
	name: string
	description: string
	shortDesc?: string
	avatar?: string
	category: AgentCategory
	tags: string[]
	capabilities?: string[]
	endpointUrl: string
	endpointAuthType?: "public" | "bearer" | "api-key"
	healthCheckUrl?: string
	timeoutMs?: number
	configuration?: any
	inputSchema?: any
	outputSchema?: any
}

/**
 * 更新 Agent DTO
 */
export interface UpdateAgentDto extends Partial<CreateAgentDto> {
	status?: AgentStatus
}

/**
 * 查询 Agent 参数
 */
export interface QueryAgentParams {
	page?: number
	limit?: number
	category?: AgentCategory
	tags?: string
	search?: string
	status?: AgentStatus
	sortBy?: "createdAt" | "viewCount" | "rating" | "jobCount"
	order?: "asc" | "desc"
	verifiedOnly?: boolean
}

/**
 * Agent 列表响应
 */
export interface AgentListResponse {
	data: Agent[]
	meta: {
		total: number
		page: number
		limit: number
		totalPages: number
	}
}

/**
 * 分类统计
 */
export interface CategoryStats {
	[key: string]: number
}

/**
 * 标签响应
 */
export interface TagsResponse {
	tags: string[]
	total: number
}

/**
 * Agent API Client
 */
export const agentApi = {
	async getAgents(params?: QueryAgentParams): Promise<AgentListResponse> {
		const response = await apiClient.get<BaseResponse<AgentListResponse>>(
			"/agents",
			{
				params,
			},
		)
		return response.data.data
	},

	async getFeaturedAgents(): Promise<Record<AgentCategory, Agent[]>> {
		const response =
			await apiClient.get<BaseResponse<Record<AgentCategory, Agent[]>>>(
				"/agents/featured",
			)
		return response.data.data
	},

	async getPopularAgents(limit: number = 10): Promise<Agent[]> {
		const response = await apiClient.get<BaseResponse<Agent[]>>(
			"/agents/popular",
			{
				params: { limit },
			},
		)
		return response.data.data
	},

	async getCategoryStats(): Promise<CategoryStats> {
		const response = await apiClient.get<BaseResponse<CategoryStats>>(
			"/agents/categories/stats",
		)
		return response.data.data
	},

	async getAllTags(): Promise<TagsResponse> {
		const response =
			await apiClient.get<BaseResponse<TagsResponse>>("/agents/tags")
		return response.data.data
	},

	async getAgent(id: number): Promise<Agent> {
		const response = await apiClient.get<BaseResponse<Agent>>(`/agents/${id}`)
		return response.data.data
	},

	async createAgent(data: CreateAgentDto): Promise<Agent> {
		const response = await apiClient.post<BaseResponse<Agent>>("/agents", data)
		return response.data.data
	},

	async updateAgent(id: number, data: UpdateAgentDto): Promise<Agent> {
		const response = await apiClient.put<BaseResponse<Agent>>(
			`/agents/${id}`,
			data,
		)
		return response.data.data
	},

	async deleteAgent(id: number): Promise<{ message: string }> {
		const response = await apiClient.delete<BaseResponse<{ message: string }>>(
			`/agents/${id}`,
		)
		return response.data.data
	},
}
