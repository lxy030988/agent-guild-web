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
 * Job 分类枚举
 */
export enum JobCategory {
	CODE_REVIEW = "CODE_REVIEW",
	CONTENT_CREATION = "CONTENT_CREATION",
	DATA_ANALYSIS = "DATA_ANALYSIS",
	TRANSLATION = "TRANSLATION",
	TESTING = "TESTING",
	RESEARCH = "RESEARCH",
	OTHER = "OTHER",
}

/**
 * Job 状态枚举
 */
export enum JobStatus {
	OPEN = "OPEN",
	MATCHED = "MATCHED",
	IN_PROGRESS = "IN_PROGRESS",
	SUBMITTED = "SUBMITTED",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
	DISPUTED = "DISPUTED",
}

/**
 * Job 匹配模式枚举
 */
export enum MatchingMode {
	SMART = "SMART",
	MANUAL = "MANUAL",
	APPLICATION = "APPLICATION",
	OPEN_MARKET = "OPEN_MARKET",
}

/**
 * Job 类型定义
 */
export interface Job {
	id: number
	title: string
	description: string
	category: JobCategory
	tags: string[]
	requiredCapabilities: string[]
	inputData: Record<string, unknown>
	expectedOutput: string | null
	budget: string
	currency: string
	escrowAmount: string
	deadline: string | null
	estimatedDuration: number | null
	status: JobStatus
	matchingMode: MatchingMode
	ownerId: number
	assignedAgentId: number | null
	startedAt: string | null
	completedAt: string | null
	submittedAt: string | null
	approvedAt: string | null
	resultData: Record<string, unknown> | null
	feedback: string | null
	rating: number | null
	metadata: Record<string, unknown> | null
	// 区块链相关字段
	chainJobId: string | null
	chainTxHash: string | null
	chainDeadline: string | null
	owner: {
		id: number
		walletAddress: string
		name: string | null
	}
	assignedAgent?: {
		id: number
		name: string
		avatar: string | null
		rating: number | null
		jobCount: number
		owner?: {
			id: number
			walletAddress: string
			name: string | null
		}
	}
	createdAt: string
	updatedAt: string
}

/**
 * Agent 匹配推荐
 */
export interface JobAgentMatch {
	id: number
	jobId: number
	agentId: number
	matchScore: number
	reason: string
	agent: {
		id: number
		name: string
		description: string
		avatar: string | null
		capabilities: string[]
		rating: number | null
		jobCount: number
		reviewCount: number
		healthStatus: string
		owner: {
			id: number
			walletAddress: string
			name: string | null
		}
	}
	createdAt: string
}

/**
 * 创建 Job DTO
 */
export interface CreateJobDto {
	title: string
	description: string
	category: JobCategory
	tags?: string[]
	requiredCapabilities: string[]
	inputData: Record<string, unknown>
	expectedOutput?: string
	budget: number
	currency?: string
	estimatedDuration?: number
	deadline?: string
	matchingMode?: MatchingMode
	// 智能合约字段（创建任务后从链上获取）
	chainJobId?: string
	chainTxHash?: string
	chainDeadline?: string
}

/**
 * 更新 Job DTO
 */
export interface UpdateJobDto {
	title?: string
	description?: string
	budget?: number
	tags?: string[]
	deadline?: string
	expectedOutput?: string
	assignedAgentId?: number
	status?: JobStatus
}

/**
 * 查询参数
 */
export interface QueryJobParams {
	page?: number
	limit?: number
	category?: JobCategory
	status?: JobStatus
	search?: string
	sortBy?: "createdAt" | "budget"
	order?: "asc" | "desc"
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
	data: T[]
	meta: {
		total: number
		page: number
		limit: number
		totalPages: number
	}
}

/**
 * Jobs API 客户端
 */
export const jobApi = {
	/**
	 * 获取 Jobs 列表
	 */
	async getJobs(params: QueryJobParams = {}): Promise<PaginatedResult<Job>> {
		const response = await apiClient.get<BaseResponse<PaginatedResult<Job>>>(
			"/jobs",
			{ params },
		)
		return response.data.data
	},

	/**
	 * 获取 Job 详情
	 */
	async getJob(id: number): Promise<Job> {
		const response = await apiClient.get<BaseResponse<Job>>(`/jobs/${id}`)
		return response.data.data
	},

	/**
	 * 创建 Job
	 */
	async createJob(data: CreateJobDto): Promise<Job> {
		const response = await apiClient.post<BaseResponse<Job>>("/jobs", data)
		return response.data.data
	},

	/**
	 * 更新 Job
	 */
	async updateJob(id: number, data: UpdateJobDto): Promise<Job> {
		const response = await apiClient.put<BaseResponse<Job>>(`/jobs/${id}`, data)
		return response.data.data
	},

	/**
	 * 取消 Job
	 */
	async cancelJob(id: number): Promise<Job> {
		const response = await apiClient.delete<BaseResponse<Job>>(`/jobs/${id}`)
		return response.data.data
	},

	/**
	 * 获取推荐 Agents
	 */
	async getRecommendations(id: number): Promise<JobAgentMatch[]> {
		const response = await apiClient.get<BaseResponse<JobAgentMatch[]>>(
			`/jobs/${id}/recommendations`,
		)
		return response.data.data
	},

	/**
	 * 获取我发布的 Jobs
	 */
	async getMyPublishedJobs(
		params: QueryJobParams = {},
	): Promise<PaginatedResult<Job>> {
		const response = await apiClient.get<BaseResponse<PaginatedResult<Job>>>(
			"/jobs/my/published",
			{ params },
		)
		return response.data.data
	},

	/**
	 * 获取分配给我的 Jobs
	 */
	async getMyAssignedJobs(
		params: QueryJobParams = {},
	): Promise<PaginatedResult<Job>> {
		const response = await apiClient.get<BaseResponse<PaginatedResult<Job>>>(
			"/jobs/my/assigned",
			{ params },
		)
		return response.data.data
	},

	/**
	 * 接受 Job (Agent 所有者)
	 */
	async acceptJob(id: number): Promise<Job> {
		const response = await apiClient.post<BaseResponse<Job>>(
			`/jobs/${id}/accept`,
		)
		return response.data.data
	},

	/**
	 * 开始执行 Job
	 */
	async startJob(id: number): Promise<{ message: string }> {
		const response = await apiClient.post<BaseResponse<{ message: string }>>(
			`/jobs/${id}/start`,
		)
		return response.data.data
	},

	/**
	 * 提交 Job 结果
	 */
	async submitResult(
		id: number,
		resultData: Record<string, unknown>,
	): Promise<Job> {
		const response = await apiClient.post<BaseResponse<Job>>(
			`/jobs/${id}/submit`,
			{ resultData },
		)
		return response.data.data
	},

	/**
	 * 验收通过
	 */
	async approveJob(
		id: number,
		rating?: number,
		feedback?: string,
	): Promise<Job> {
		const response = await apiClient.post<BaseResponse<Job>>(
			`/jobs/${id}/approve`,
			{ rating, feedback },
		)
		return response.data.data
	},

	/**
	 * 验收拒绝
	 */
	async rejectJob(id: number, reason: string): Promise<Job> {
		const response = await apiClient.post<BaseResponse<Job>>(
			`/jobs/${id}/reject`,
			{ reason },
		)
		return response.data.data
	},

	/**
	 * 手动分配 Agent
	 */
	async assignAgent(jobId: number, agentId: number): Promise<Job> {
		const response = await apiClient.post<BaseResponse<Job>>(
			`/jobs/${jobId}/assign`,
			{ agentId },
		)
		return response.data.data
	},
}

/**
 * Job 分类显示名称映射
 */
export const JobCategoryLabels: Record<JobCategory, string> = {
	[JobCategory.CODE_REVIEW]: "代码审查",
	[JobCategory.CONTENT_CREATION]: "内容创作",
	[JobCategory.DATA_ANALYSIS]: "数据分析",
	[JobCategory.TRANSLATION]: "翻译服务",
	[JobCategory.TESTING]: "测试服务",
	[JobCategory.RESEARCH]: "研究分析",
	[JobCategory.OTHER]: "其他",
}

/**
 * Job 状态显示名称映射
 */
export const JobStatusLabels: Record<JobStatus, string> = {
	[JobStatus.OPEN]: "待接受",
	[JobStatus.MATCHED]: "已匹配",
	[JobStatus.IN_PROGRESS]: "进行中",
	[JobStatus.SUBMITTED]: "已提交",
	[JobStatus.COMPLETED]: "已完成",
	[JobStatus.CANCELLED]: "已取消",
	[JobStatus.DISPUTED]: "争议中",
}

/**
 * Job 状态颜色映射
 */
export const JobStatusColors: Record<
	JobStatus,
	"blue" | "purple" | "yellow" | "orange" | "green" | "gray" | "red"
> = {
	[JobStatus.OPEN]: "blue",
	[JobStatus.MATCHED]: "purple",
	[JobStatus.IN_PROGRESS]: "yellow",
	[JobStatus.SUBMITTED]: "orange",
	[JobStatus.COMPLETED]: "green",
	[JobStatus.CANCELLED]: "gray",
	[JobStatus.DISPUTED]: "red",
}

/**
 * 匹配模式显示名称映射
 */
export const MatchingModeLabels: Record<MatchingMode, string> = {
	[MatchingMode.SMART]: "智能匹配",
	[MatchingMode.MANUAL]: "手动选择",
	[MatchingMode.APPLICATION]: "申请制",
	[MatchingMode.OPEN_MARKET]: "开放市场",
}

/**
 * 匹配模式描述映射
 */
export const MatchingModeDescriptions: Record<MatchingMode, string> = {
	[MatchingMode.SMART]: "系统自动匹配并分配最佳 Agent",
	[MatchingMode.MANUAL]: "从系统推荐列表中手动选择 Agent",
	[MatchingMode.APPLICATION]: "Agent owners 主动申请，您审核后选择",
	[MatchingMode.OPEN_MARKET]: "同时支持推荐和申请两种方式",
}
