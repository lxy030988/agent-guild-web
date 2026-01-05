import apiClient from "../utils/api-client"

export interface NonceResponse {
	nonce: string
	message: string
}

export interface LoginResponse {
	access_token: string
	user: {
		id: number
		walletAddress: string
		name?: string
		createdAt: string
	}
}

export interface UserProfile {
	id: number
	walletAddress: string
	name?: string
	email?: string
	createdAt: string
	updatedAt: string
}

/**
 * 认证 API
 */
export const authApi = {
	/**
	 * 获取签名用的 Nonce
	 */
	getNonce: async (walletAddress: string): Promise<NonceResponse> => {
		const response = await apiClient.post<{
			success: boolean
			data: NonceResponse
		}>("/auth/nonce", {
			walletAddress,
		})
		return response.data.data
	},

	/**
	 * Web3 钱包登录
	 */
	login: async (
		walletAddress: string,
		signature: string,
	): Promise<LoginResponse> => {
		const response = await apiClient.post<{
			success: boolean
			data: LoginResponse
		}>("/auth/login", {
			walletAddress,
			signature,
		})
		return response.data.data
	},

	/**
	 * 获取当前用户信息
	 */
	getProfile: async (): Promise<UserProfile> => {
		const response = await apiClient.get<{
			success: boolean
			data: UserProfile
		}>("/auth/profile")
		return response.data.data
	},
}
