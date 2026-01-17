import apiClient from "./api-client"

/**
 * 基础响应接口
 */
export interface BaseResponse<T> {
	success: boolean
	data: T
	message?: string
}

// Wallet Overview
export interface WalletOverview {
	totalEarnings: string
	pendingEarnings: string
	totalJobs: number
	averageRating: string
}

// Wallet Earnings (三个钱包)
export interface WalletEarnings {
	agentEarnings: string
	jobEscrow: string
	stakingRewards: string
}

// Transaction
export interface Transaction {
	id: number
	type: string
	amount: string
	currency: string
	description: string
	txHash?: string
	createdAt: string
}

export interface TransactionListResponse {
	items: Transaction[]
	total: number
	page: number
	limit: number
}

// Asset Trend
export interface AssetTrend {
	date: string
	amount: string
}

/**
 * Wallet API 客户端
 */
export const walletApi = {
	/**
	 * 获取资产概览
	 */
	async getOverview(): Promise<WalletOverview> {
		const response =
			await apiClient.get<BaseResponse<WalletOverview>>("/wallet/overview")
		return response.data.data
	},

	/**
	 * 获取三个钱包余额
	 */
	async getEarnings(): Promise<WalletEarnings> {
		const response =
			await apiClient.get<BaseResponse<WalletEarnings>>("/wallet/earnings")
		return response.data.data
	},

	/**
	 * 获取交易历史
	 */
	async getTransactions(
		page = 1,
		limit = 20,
	): Promise<TransactionListResponse> {
		const response = await apiClient.get<BaseResponse<TransactionListResponse>>(
			"/wallet/transactions",
			{ params: { page, limit } },
		)
		return response.data.data
	},

	/**
	 * 获取资产趋势
	 */
	async getTrends(days = 30): Promise<AssetTrend[]> {
		const response = await apiClient.get<BaseResponse<AssetTrend[]>>(
			"/wallet/trends",
			{ params: { days } },
		)
		return response.data.data
	},
}
