import axios, {
	type AxiosError,
	type AxiosInstance,
	type InternalAxiosRequestConfig,
} from "axios"

// API 基础 URL（根据环境变量配置）
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

/**
 * 创建 Axios 实例
 */
const apiClient: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
})

/**
 * 请求拦截器 - 自动添加 JWT Token
 */
apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = localStorage.getItem("access_token")

		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`
		}

		return config
	},
	(error: AxiosError) => {
		return Promise.reject(error)
	},
)

/**
 * 响应拦截器 - 处理错误和 Token 过期
 */
apiClient.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		// Token 过期或无效
		if (error.response?.status === 401) {
			localStorage.removeItem("access_token")
			localStorage.removeItem("user")
			// 可以在这里触发跳转到登录页
			window.location.href = "/login"
		}

		return Promise.reject(error)
	},
)

export default apiClient
