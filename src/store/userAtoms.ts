import { atom } from "jotai"

/**
 * 用户信息类型
 */
export interface User {
	id: number
	walletAddress: string
	name: string | null
	email: string | null
	createdAt: Date
	updatedAt: Date
}

/**
 * 当前用户状态
 */
export const userAtom = atom<User | null>(null)

/**
 * 用户是否已连接钱包
 */
export const isConnectedAtom = atom<boolean>(false)
