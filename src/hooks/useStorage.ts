import type localforage from "localforage"
import { useCallback, useEffect, useState } from "react"
import { appStorage } from "@/utils/storage"

/**
 * 像 useState 一样使用，但数据持久化到 IndexedDB
 *
 * @example
 * const [name, setName] = useStorage('user-name', 'Guest')
 * const [settings, setSettings] = useStorage('app-settings', { theme: 'dark' })
 */
export function useStorage<T>(
	key: string,
	initialValue: T,
	storage: typeof localforage = appStorage,
): [T, (value: T | ((val: T) => T)) => void, boolean] {
	const [storedValue, setStoredValue] = useState<T>(initialValue)
	const [isLoading, setIsLoading] = useState(true)

	// 初始化：从存储中读取
	useEffect(() => {
		let isMounted = true

		storage
			.getItem<T>(key)
			.then((value) => {
				if (isMounted) {
					setStoredValue(value !== null ? value : initialValue)
					setIsLoading(false)
				}
			})
			.catch((error) => {
				console.error(`[useStorage] Error loading ${key}:`, error)
				if (isMounted) {
					setIsLoading(false)
				}
			})

		return () => {
			isMounted = false
		}
	}, [key, initialValue, storage])

	// 更新值
	const setValue = useCallback(
		(value: T | ((val: T) => T)) => {
			try {
				// 如果是函数，先计算新值
				const valueToStore =
					value instanceof Function ? value(storedValue) : value

				// 更新 state
				setStoredValue(valueToStore)

				// 持久化到存储
				storage.setItem(key, valueToStore).catch((error) => {
					console.error(`[useStorage] Error saving ${key}:`, error)
				})
			} catch (error) {
				console.error(`[useStorage] Error:`, error)
			}
		},
		[key, storedValue, storage],
	)

	return [storedValue, setValue, isLoading]
}

/**
 * 批量存储 Hook
 * 用于一次性管理多个存储项
 */
export function useBatchStorage<T extends Record<string, any>>(
	keys: string[],
	storage: typeof localforage = appStorage,
): [T | null, (data: Partial<T>) => void, boolean] {
	const [data, setData] = useState<T | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	// 加载所有数据
	useEffect(() => {
		let isMounted = true

		Promise.all(keys.map((key) => storage.getItem(key))).then((values) => {
			if (isMounted) {
				const result = keys.reduce((acc, key, index) => {
					acc[key] = values[index]
					return acc
				}, {} as any)
				setData(result)
				setIsLoading(false)
			}
		})

		return () => {
			isMounted = false
		}
	}, [storage, keys.map, keys.reduce])

	// 更新多个值
	const updateData = useCallback(
		(updates: Partial<T>) => {
			const promises = Object.entries(updates).map(([key, value]) =>
				storage.setItem(key, value),
			)

			Promise.all(promises).then(() => {
				setData((prev) => ({ ...prev, ...updates }) as T)
			})
		},
		[storage],
	)

	return [data, updateData, isLoading]
}
