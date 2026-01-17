import { useAtom } from "jotai"
import { useCallback } from "react"
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
	const login = useCallback(
		(accessToken: string, userData: User) => {
			setToken(accessToken)
			setUser(userData)
		},
		[setToken, setUser],
	)

	/**
	 * 退出登录
	 */
	const logout = useCallback(() => {
		setToken(null)
		setUser(null)
		localStorage.removeItem("access_token")
		localStorage.removeItem("user")
	}, [setToken, setUser])

	/**
	 * 获取用户信息
	 */
	const fetchProfile = useCallback(async () => {
		try {
			const profile = await authApi.getProfile()
			setUser(profile)
			return profile
		} catch (error) {
			logout()
			throw error
		}
	}, [setUser, logout])

	return {
		token,
		user,
		isAuthenticated,
		login,
		logout,
		fetchProfile,
	}
}
