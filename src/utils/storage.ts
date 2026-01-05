import localforage from "localforage"

/**
 * 应用数据存储
 * 用于存储应用状态、用户偏好等
 * 自动使用最佳存储引擎：IndexedDB > WebSQL > localStorage
 */
export const appStorage = localforage.createInstance({
	name: "react-template",
	storeName: "app_storage",
	description: "Application data storage",
	driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
})

/**
 * API 缓存存储
 * 用于缓存 API 响应数据
 */
export const cacheStorage = localforage.createInstance({
	name: "react-template",
	storeName: "api_cache",
	description: "API response cache",
	driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
})

/**
 * 用户数据存储
 * 用于存储用户相关数据
 */
export const userStorage = localforage.createInstance({
	name: "react-template",
	storeName: "user_data",
	description: "User data storage",
	driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
})

/**
 * 存储工具类
 */
export class StorageManager {
	/**
	 * 获取当前使用的存储引擎
	 */
	static async getDriver(storage = appStorage): Promise<string> {
		const driver = storage.driver()
		const driverNames = {
			[localforage.INDEXEDDB]: "IndexedDB",
			[localforage.WEBSQL]: "WebSQL",
			[localforage.LOCALSTORAGE]: "localStorage",
		}
		return driverNames[driver] || driver
	}

	/**
	 * 获取存储的所有键
	 */
	static async keys(storage = appStorage): Promise<string[]> {
		return storage.keys()
	}

	/**
	 * 获取存储的长度
	 */
	static async length(storage = appStorage): Promise<number> {
		return storage.length()
	}

	/**
	 * 清空存储
	 */
	static async clear(storage = appStorage): Promise<void> {
		return storage.clear()
	}

	/**
	 * 批量设置数据
	 */
	static async setItems<T = unknown>(
		items: Record<string, T>,
		storage = appStorage,
	): Promise<void> {
		const promises = Object.entries(items).map(([key, value]) =>
			storage.setItem(key, value),
		)
		await Promise.all(promises)
	}

	/**
	 * 批量获取数据
	 */
	static async getItems<T = unknown>(
		keys: string[],
		storage = appStorage,
	): Promise<Record<string, T | null>> {
		const promises = keys.map(async (key) => ({
			key,
			value: await storage.getItem<T>(key),
		}))
		const results = await Promise.all(promises)
		return results.reduce(
			(acc, { key, value }) => {
				acc[key] = value
				return acc
			},
			{} as Record<string, T | null>,
		)
	}
}

export default appStorage
