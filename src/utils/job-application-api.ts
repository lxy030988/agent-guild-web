import type { BaseResponse } from "@/types/agent"
import apiClient from "./api-client"

interface PaginationMeta {
	total: number
	page: number
	limit: number
	totalPages: number
}

// ==================== JobApplication Types ====================

export interface JobApplication {
	id: number
	jobId: number
	agentId: number
	message?: string
	proposedPrice?: number
	estimatedTime?: number
	status: "PENDING" | "ACCEPTED" | "REJECTED"
	createdAt: Date
	agent?: {
		id: number
		name: string
		avatar?: string
		rating?: number
		owner?: {
			id: number
			walletAddress: string
			name?: string
		}
	}
	job?: {
		id: number
		title: string
		budget: number
		status: string
		owner?: {
			id: number
			walletAddress: string
			name?: string
		}
	}
}

export interface CreateApplicationDto {
	agentId: number
	message?: string
	proposedPrice?: number
	estimatedTime?: number
}

export interface QueryApplicationDto {
	page?: number
	limit?: number
	status?: "PENDING" | "ACCEPTED" | "REJECTED"
}

// ==================== Stats Types ====================

export interface JobStats {
	total: number
	open: number
	matched: number
	inProgress: number
	submitted: number
	completed: number
	cancelled: number
}

// ==================== API Methods ====================

export const jobApplicationApi = {
	/**
	 * Agent 申请 Job
	 */
	async applyToJob(
		jobId: number,
		data: CreateApplicationDto,
	): Promise<JobApplication> {
		const response = await apiClient.post<BaseResponse<JobApplication>>(
			`/jobs/${jobId}/apply`,
			data,
		)
		return response.data.data
	},

	/**
	 * 获取 Job 的所有申请（Job Owner）
	 */
	async getJobApplications(
		jobId: number,
		query?: QueryApplicationDto,
	): Promise<{ data: JobApplication[]; meta: PaginationMeta }> {
		const response = await apiClient.get<
			BaseResponse<{ data: JobApplication[]; meta: PaginationMeta }>
		>(`/jobs/${jobId}/applications`, { params: query })
		return response.data.data
	},

	/**
	 * 获取我的所有申请（Agent Owner）
	 */
	async getMyApplications(
		query?: QueryApplicationDto,
	): Promise<{ data: JobApplication[]; meta: PaginationMeta }> {
		const response = await apiClient.get<
			BaseResponse<{ data: JobApplication[]; meta: PaginationMeta }>
		>("/jobs/applications/my", { params: query })
		return response.data.data
	},

	/**
	 * 接受/拒绝申请
	 */
	async updateApplicationStatus(
		applicationId: number,
		status: "ACCEPTED" | "REJECTED",
	): Promise<JobApplication> {
		const response = await apiClient.put<BaseResponse<JobApplication>>(
			`/jobs/applications/${applicationId}`,
			{ status },
		)
		return response.data.data
	},

	/**
	 * 撤回申请
	 */
	async withdrawApplication(applicationId: number): Promise<void> {
		await apiClient.delete(`/jobs/applications/${applicationId}`)
	},

	/**
	 * 获取统计数据
	 */
	async getStats(): Promise<JobStats> {
		const response = await apiClient.get<BaseResponse<JobStats>>("/jobs/stats")
		return response.data.data
	},
}
