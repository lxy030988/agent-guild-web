import apiClient from "./api-client"

/**
 * 基础响应接口
 */
export interface BaseResponse<T> {
	success: boolean
	data: T
	message?: string
}

// Bill
export interface Bill {
	id: number
	billNumber: string
	type: "INCOME" | "EXPENSE" | "PLATFORM_FEE"
	amount: string
	currency: string
	description: string
	job?: {
		id: number
		title: string
	}
	isPaid: boolean
	createdAt: string
}

export interface BillDetail extends Bill {
	userId: number
	jobId?: number
	details?: Record<string, unknown>
	paidAt?: string
}

export interface BillListResponse {
	items: Bill[]
	total: number
	page: number
	limit: number
}

/**
 * Bills API 客户端
 */
export const billsApi = {
	/**
	 * 获取账单列表
	 */
	async getBills(params: {
		type?: string
		startDate?: string
		endDate?: string
		page?: number
		limit?: number
	}): Promise<BillListResponse> {
		const response = await apiClient.get<BaseResponse<BillListResponse>>(
			"/bills",
			{ params },
		)
		return response.data.data
	},

	/**
	 * 获取账单详情
	 */
	async getBillDetail(id: number): Promise<BillDetail> {
		const response = await apiClient.get<BaseResponse<BillDetail>>(
			`/bills/${id}`,
		)
		return response.data.data
	},
}
