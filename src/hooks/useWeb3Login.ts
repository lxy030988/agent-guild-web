import { useCallback, useState } from "react"
import { useAccount, useSignMessage } from "wagmi"
import { authApi } from "../utils/authApi"
import { useAuth } from "./useAuth"

/**
 * Web3 登录 Hook - 使用 wagmi useSignMessage
 */
export const useWeb3Login = () => {
	const { address, isConnected } = useAccount()
	const { signMessageAsync } = useSignMessage()
	const { login } = useAuth()

	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	/**
	 * 执行 Web3 流程
	 */
	const web3Login = useCallback(
		async (explicitAddress?: string) => {
			const targetAddress = explicitAddress || address
			console.log("Web3Login: Triggered", {
				isConnected,
				hookAddress: address,
				explicitAddress,
				targetAddress,
			})

			if (!isConnected || !targetAddress) {
				console.log("Web3Login: Aborted - wallet not ready", {
					isConnected,
					targetAddress,
				})
				return
			}

			setIsLoading(true)
			setError(null)

			try {
				// 1. 获取 Nonce
				console.log("Web3Login: Fetching nonce for", targetAddress)
				const { message } = await authApi.getNonce(targetAddress)

				// 2. 签名
				console.log("Web3Login: Requesting signature...")
				const signature = await signMessageAsync({ message })
				console.log("Web3Login: signature obtained")

				// 3. 登录
				const response = await authApi.login(targetAddress, signature)

				// 4. 保存状态
				login(response.access_token, response.user)
				console.log("Web3Login: Success")

				return response
			} catch (err: unknown) {
				const error = err as any
				const errorMessage =
					error?.response?.data?.message || error?.message || "Login failed"
				setError(errorMessage)
				console.error("Web3 login error:", err)
				throw err
			} finally {
				setIsLoading(false)
			}
		},
		[isConnected, address, signMessageAsync, login],
	)

	return {
		web3Login,
		isLoading,
		error,
		isConnected,
		address,
	}
}
