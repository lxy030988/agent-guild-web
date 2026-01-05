import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export interface User {
	id: number
	walletAddress: string
	name?: string
	email?: string
	createdAt: string
}

/**
 * JWT Token（持久化到 localStorage）
 */
export const tokenAtom = atomWithStorage<string | null>("access_token", null)

/**
 * 用户信息（持久化到 localStorage）
 */
export const userAtom = atomWithStorage<User | null>("user", null)

/**
 * 是否已认证（派生状态）
 */
export const isAuthenticatedAtom = atom((get) => {
	const token = get(tokenAtom)
	const user = get(userAtom)
	return !!(token && user)
})
