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
 * Endpoint 认证类型
 */
export type EndpointAuthType = "public" | "bearer" | "api-key"

/**
 * 健康状态
 */
export type HealthStatus = "HEALTHY" | "UNHEALTHY" | "UNKNOWN"

/**
 * Agent Owner 信息
 */
export interface AgentOwner {
	id: number
	walletAddress: string
	name: string | null
}

/**
 * Agent 类型定义
 */
export interface Agent {
	// 基础字段
	id: number
	name: string
	description: string
	shortDesc: string | null
	avatar: string | null
	category: AgentCategory
	tags: string[]
	status: AgentStatus

	// 能力配置
	capabilities: string[]
	configuration: Record<string, unknown> | null

	// Endpoint 配置
	endpointUrl: string
	endpointAuthType: EndpointAuthType
	healthCheckUrl: string | null
	timeoutMs: number

	// 规范定义
	inputSchema: Record<string, unknown> | null
	outputSchema: Record<string, unknown> | null

	// 统计信息
	viewCount: number
	reviewCount: number
	jobCount: number
	rating: number | null

	// 验证状态
	isVerified: boolean
	lastHealthCheck: string | null
	healthStatus: HealthStatus

	// 第三阶段预留字段（Jobs 市场）
	minPrice: number | null
	maxPrice: number | null
	availability: boolean

	// 第四阶段预留字段（NFT 与财务）
	tokenId: string | null
	contractAddress: string | null
	metadataURI: string | null
	totalEarnings: number
	pendingEarnings: number

	// 关联关系
	ownerId: number
	owner?: AgentOwner

	// 时间戳
	createdAt: string
	updatedAt: string
}

/**
 * 排序字段
 */
export type AgentSortBy = "createdAt" | "viewCount" | "rating" | "jobCount"

/**
 * 排序顺序
 */
export type SortOrder = "asc" | "desc"

/**
 * Agent 筛选参数
 */
export interface AgentFilters {
	category?: AgentCategory
	tags?: string
	search?: string
	status?: AgentStatus
	sortBy?: AgentSortBy
	order?: SortOrder
	verifiedOnly?: boolean
}

/**
 * Agent 列表查询参数
 */
export interface AgentListQuery extends AgentFilters {
	page: number
	limit: number
}

/**
 * 分页元数据
 */
export interface PaginationMeta {
	total: number
	page: number
	limit: number
	totalPages: number
}

/**
 * Agent 列表响应
 */
export interface AgentListResponse {
	data: Agent[]
	meta: PaginationMeta
}

/**
 * 创建 Agent DTO
 */
export interface CreateAgentDTO {
	name: string
	description: string
	shortDesc?: string
	avatar?: string
	category: AgentCategory
	tags: string[]
	capabilities?: string[]
	endpointUrl: string
	endpointAuthType?: EndpointAuthType
	healthCheckUrl?: string
	timeoutMs?: number
	configuration?: Record<string, unknown>
	inputSchema?: Record<string, unknown>
	outputSchema?: Record<string, unknown>
}

/**
 * 更新 Agent DTO
 */
export interface UpdateAgentDTO extends Partial<CreateAgentDTO> {
	status?: AgentStatus
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
 * 基础响应接口
 */
export interface BaseResponse<T> {
	success: boolean
	data: T
	message?: string
}
