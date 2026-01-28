import axios, {
	type AxiosError,
	type AxiosInstance,
	type InternalAxiosRequestConfig,
} from "axios"

// API 基础 URL（根据环境变量配置）
const BASE_URL = process.env.BASE_URL

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
		let token = localStorage.getItem("access_token")

		if (token && token !== "null" && config.headers) {
			// 如果 token 包含在引号中（Jotai atomWithStorage 存入时会 JSON 序列化），需要去引号
			if (token.startsWith('"') && token.endsWith('"')) {
				token = token.slice(1, -1)
			}
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

			// 触发全局事件，让 UI 弹出登录提示
			window.dispatchEvent(
				new CustomEvent("app:unauthorized", {
					detail: { message: "Session expired. Please sign in again." },
				}),
			)
		}

		return Promise.reject(error)
	},
)

export default apiClient
