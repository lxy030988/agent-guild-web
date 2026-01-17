import apiClient from "./api-client"

/**
 * Dashboard 统计数据接口
 */
export interface DashboardStats {
	publishedAgents: number
	activeJobs: number
	completedJobs: number
	totalEarnings: string
	inProgressJobs: number
	disputes: number
}

/**
 * 收益图表数据点
 */
export interface RevenueChartData {
	date: string
	amount: string
}

/**
 * 任务状态分布
 */
export interface JobsBreakdown {
	open: number
	matched: number
	inProgress: number
	completed: number
	cancelled: number
}

/**
 * 活动动态项
 */
export interface ActivityItem {
	id: number
	type: "job" | "agent" | "bill" | "dispute"
	action: string
	description: string
	relatedId?: number
	createdAt: string
}

/**
 * 活动列表响应
 */
export interface ActivityListResponse {
	items: ActivityItem[]
	total: number
	page: number
	limit: number
}

/**
 * Dashboard API 客户端
 */
export const dashboardApi = {
	/**
	 * 获取Dashboard统计数据
	 */
	getStats: async (): Promise<DashboardStats> => {
		const response = await apiClient.get("/dashboard/stats")
		return response.data.data || response.data
	},

	/**
	 * 获取收益图表数据
	 * @param days 查询最近N天的数据，默认30天
	 */
	getRevenueChart: async (days: number = 30): Promise<RevenueChartData[]> => {
		const response = await apiClient.get("/dashboard/charts/revenue", {
			params: { days },
		})
		return response.data.data || response.data
	},

	/**
	 * 获取任务状态分布
	 */
	getJobsBreakdown: async (): Promise<JobsBreakdown> => {
		const response = await apiClient.get("/dashboard/charts/jobs-breakdown")
		return response.data.data || response.data
	},

	/**
	 * 获取活动动态列表
	 * @param page 页码
	 * @param limit 每页数量
	 */
	getActivity: async (
		page: number = 1,
		limit: number = 20,
	): Promise<ActivityListResponse> => {
		const response = await apiClient.get("/dashboard/activity", {
			params: { page, limit },
		})
		return response.data.data || response.data
	},
}
