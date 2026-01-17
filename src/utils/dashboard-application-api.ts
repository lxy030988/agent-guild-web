import apiClient from "./api-client"
import type { BaseResponse, PaginatedResult } from "./job-api"

export interface DashboardSummary {
	publishedAgents: { value: number; note?: string }
	activeContracts: { value: number; note?: string }
	completedJobs: { value: number; note?: string }
	totalEarnings: { value: string; note?: string }
	inProgressJobs: { value: number; note?: string }
	disputes: { value: number; note?: string }
}

export interface DashboardTabCounts {
	publishedJobs: number
	publishedAgents: number
	signedAgents: number
	disputedAgents: number
}

export interface SignedAgent {
	id: number
	name: string
	description: string
	publisher: string
	status: string
	done: number
	total: number
	earnings: string
	average: string
	expireDate: string
	signedAt: string
	remaining: string
}

export interface SignedAgentsQuery {
	page?: number
	limit?: number
}

export const dashboardApplicationApi = {
	async getSummary(): Promise<DashboardSummary> {
		const response =
			await apiClient.get<BaseResponse<DashboardSummary>>("/dashboard/summary")
		return response.data.data
	},

	async getTabCounts(): Promise<DashboardTabCounts> {
		const response =
			await apiClient.get<BaseResponse<DashboardTabCounts>>("/dashboard/tabs")
		return response.data.data
	},

	async getSignedAgents(
		query: SignedAgentsQuery,
	): Promise<PaginatedResult<SignedAgent>> {
		const response = await apiClient.get<
			BaseResponse<PaginatedResult<SignedAgent>>
		>("/dashboard/signed-agents", { params: query })
		return response.data.data
	},
}
