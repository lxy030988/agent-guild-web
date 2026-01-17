import apiClient from "./api-client"
import type { BaseResponse, Job, PaginatedResult } from "./job-api"

export enum DisputeStatus {
	PENDING = "PENDING",
	VOTING = "VOTING",
	RESOLVED = "RESOLVED",
	EXPIRED = "EXPIRED",
}

export enum VoteChoice {
	APPROVE = "APPROVE",
	REJECT = "REJECT",
	ABSTAIN = "ABSTAIN",
}

export interface Dispute {
	id: number
	jobId: number
	creatorId: number
	reason: string
	evidence?: string
	status: DisputeStatus
	votingStartsAt?: string
	votingEndsAt?: string
	approveVotes: number
	rejectVotes: number
	abstainVotes: number
	resolution?: string
	resolvedAt?: string
	createdAt: string
	updatedAt: string
	chainDisputeId?: string
	job?: Job
	creator?: {
		id: number
		username: string
		walletAddress: string
	}
}

export interface CreateDisputeDto {
	jobId: number
	title: string
	reason: string
	evidence?: string
	chainDisputeId?: string
	votingEndsAt?: string
}

export interface SubmitVoteDto {
	choice: VoteChoice
	reason?: string
	tokenWeight: string
}

export interface DisputeStats {
	totalDisputes: number
	activeVoting: number
	resolvedDisputes: number
}

export const disputeApi = {
	/**
	 * 获取争议列表
	 */
	listDisputes: async (params?: {
		status?: DisputeStatus
	}): Promise<PaginatedResult<Dispute>> => {
		const response = await apiClient.get<
			BaseResponse<PaginatedResult<Dispute>>
		>("/disputes", { params })
		return response.data.data
	},

	/**
	 * 获取争议详情
	 */
	getDisputeById: async (id: number): Promise<Dispute> => {
		const response = await apiClient.get<BaseResponse<Dispute>>(
			`/disputes/${id}`,
		)
		return response.data.data
	},

	/**
	 * 创建争议
	 */
	createDispute: async (data: CreateDisputeDto): Promise<Dispute> => {
		const response = await apiClient.post<BaseResponse<Dispute>>(
			"/disputes",
			data,
		)
		return response.data.data
	},

	/**
	 * 提交投票
	 */
	submitVote: async (id: number, data: SubmitVoteDto) => {
		const response = await apiClient.post(`/disputes/${id}/vote`, data)
		return response.data
	},

	/**
	 * 解决争议（计算结果）
	 */
	resolveDispute: async (id: number) => {
		const response = await apiClient.post(`/disputes/${id}/resolve`)
		return response.data
	},

	/**
	 * 获取我的投票记录
	 */
	getMyVotes: async (): Promise<unknown[]> => {
		const response =
			await apiClient.get<BaseResponse<unknown[]>>("/disputes/my-votes")
		return response.data.data
	},

	/**
	 * 获取统计数据
	 */
	getStatistics: async (): Promise<DisputeStats> => {
		const response =
			await apiClient.get<BaseResponse<DisputeStats>>("/disputes/stats")
		return response.data.data
	},
}
