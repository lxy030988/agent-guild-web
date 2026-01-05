import { useAtom } from "jotai"
import {
	isAuthenticatedAtom,
	tokenAtom,
	type User,
	userAtom,
} from "../stores/authStore"
import { authApi } from "../utils/authApi"

/**
 * 认证相关的 Hook
 */
export const useAuth = () => {
	const [token, setToken] = useAtom(tokenAtom)
	const [user, setUser] = useAtom(userAtom)
	const [isAuthenticated] = useAtom(isAuthenticatedAtom)

	/**
	 * 登录成功后保存 Token 和用户信息
	 */
	const login = (accessToken: string, userData: User) => {
		setToken(accessToken)
		setUser(userData)
	}

	/**
	 * 退出登录
	 */
	const logout = () => {
		setToken(null)
		setUser(null)
		localStorage.removeItem("access_token")
		localStorage.removeItem("user")
	}

	/**
	 * 获取用户信息
	 */
	const fetchProfile = async () => {
		try {
			const profile = await authApi.getProfile()
			setUser(profile)
			return profile
		} catch (error) {
			logout()
			throw error
		}
	}

	return {
		token,
		user,
		isAuthenticated,
		login,
		logout,
		fetchProfile,
	}
}
