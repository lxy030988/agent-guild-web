import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useStorage } from "@/hooks/useStorage"
import { appStorage, cacheStorage, StorageManager } from "@/utils/storage"

/**
 * Storage Demo 页面
 * 演示 localForage 的使用（IndexedDB优先，自动降级）
 */
const StorageDemo = () => {
	const [storageInfo, setStorageInfo] = useState({
		driver: "Loading...",
		totalKeys: 0,
		cacheKeys: 0,
	})

	// 使用 useStorage Hook（类似 useState，但持久化）
	const [username, setUsername] = useStorage("demo-username", "")
	const [email, setEmail] = useStorage("demo-email", "")
	const [preferences, setPreferences] = useStorage("demo-preferences", {
		theme: "light",
		notifications: true,
		fontSize: 14,
	})

	// API 缓存模拟
	const [cachedData, setCachedData] = useState<unknown>(null)

	// 获取存储信息
	useEffect(() => {
		async function updateStorageInfo() {
			const driver = await StorageManager.getDriver(appStorage)
			const totalKeys = await appStorage.length()
			const cacheKeys = await cacheStorage.length()

			setStorageInfo({ driver, totalKeys, cacheKeys })
		}

		updateStorageInfo()

		// 每秒更新一次
		const interval = setInterval(updateStorageInfo, 1000)
		return () => clearInterval(interval)
	}, [])

	// 模拟 API 调用并缓存
	const handleFetchData = async () => {
		const cached = await cacheStorage.getItem("api-users")

		if (cached) {
			console.log("📦 从缓存加载数据")
			setCachedData(cached)
			return
		}

		console.log("🌐 从网络请求数据")
		// 模拟 API 请求
		const fakeData = {
			id: Date.now(),
			users: ["Alice", "Bob", "Charlie"],
			timestamp: new Date().toISOString(),
		}

		// 缓存 5 分钟
		await cacheStorage.setItem("api-users", fakeData)
		setCachedData(fakeData)
	}

	// 清空缓存
	const handleClearCache = async () => {
		await cacheStorage.clear()
		setCachedData(null)
		console.log("🗑️ 缓存已清空")
	}

	// 清空所有存储
	const handleClearAll = async () => {
		if (confirm("确定要清空所有存储数据吗？")) {
			await appStorage.clear()
			await cacheStorage.clear()
			window.location.reload()
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="mx-auto max-w-4xl">
				<h1 className="mb-8 text-4xl font-bold text-gray-900">
					💾 本地缓存演示
				</h1>

				{/* 存储引擎信息 */}
				<div className="mb-8 rounded-lg bg-blue-50 p-6 shadow">
					<h2 className="mb-4 text-2xl font-semibold text-blue-900">
						📊 存储引擎信息
					</h2>
					<div className="space-y-2 text-blue-800">
						<p>
							<strong>当前引擎:</strong>{" "}
							<span className="font-mono text-blue-600">
								{storageInfo.driver}
							</span>
						</p>
						<p>
							<strong>应用数据:</strong> {storageInfo.totalKeys} 项
						</p>
						<p>
							<strong>缓存数据:</strong> {storageInfo.cacheKeys} 项
						</p>
						<p className="text-sm text-blue-600">
							✨ 优先使用 IndexedDB，自动降级到 WebSQL 或 localStorage
						</p>
					</div>
				</div>

				{/* useStorage Hook 演示 */}
				<div className="mb-8 rounded-lg bg-white p-6 shadow">
					<h2 className="mb-4 text-2xl font-semibold text-gray-900">
						🪝 useStorage Hook 演示
					</h2>
					<p className="mb-4 text-gray-600">
						类似 useState，但数据自动持久化到 IndexedDB
					</p>

					<div className="space-y-4">
						<div>
							<label className="mb-2 block text-sm font-medium text-gray-700">
								用户名
								<input
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									className="mt-2 w-full rounded border border-gray-300 px-4 py-2"
									placeholder="输入用户名..."
								/>
							</label>
						</div>

						<div>
							<label className="mb-2 block text-sm font-medium text-gray-700">
								邮箱
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="mt-2 w-full rounded border border-gray-300 px-4 py-2"
									placeholder="输入邮箱..."
								/>
							</label>
						</div>

						<div>
							<div className="mb-2 text-sm font-medium text-gray-700">
								偏好设置
							</div>
							<div className="space-y-2 rounded border border-gray-200 p-4">
								<label className="flex items-center">
									<span className="mr-2">主题:</span>
									<select
										value={preferences.theme}
										onChange={(e) =>
											setPreferences({ ...preferences, theme: e.target.value })
										}
										className="rounded border px-2 py-1"
									>
										<option value="light">浅色</option>
										<option value="dark">深色</option>
									</select>
								</label>

								<label className="flex items-center">
									<input
										type="checkbox"
										checked={preferences.notifications}
										onChange={(e) =>
											setPreferences({
												...preferences,
												notifications: e.target.checked,
											})
										}
										className="mr-2"
									/>
									启用通知
								</label>

								<label className="flex items-center">
									<span className="mr-2">字体大小:</span>
									<input
										type="number"
										value={preferences.fontSize}
										onChange={(e) =>
											setPreferences({
												...preferences,
												fontSize: Number(e.target.value),
											})
										}
										className="w-20 rounded border px-2 py-1"
									/>
									px
								</label>
							</div>
						</div>

						<p className="text-sm text-green-600">✅ 刷新页面数据不会丢失！</p>
					</div>
				</div>

				{/* API 缓存演示 */}
				<div className="mb-8 rounded-lg bg-white p-6 shadow">
					<h2 className="mb-4 text-2xl font-semibold text-gray-900">
						🌐 API 缓存演示
					</h2>
					<p className="mb-4 text-gray-600">
						模拟 API 请求并缓存响应（独立的 cacheStorage）
					</p>

					<div className="mb-4 flex gap-4">
						<button
							type="button"
							onClick={handleFetchData}
							className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
						>
							📥 获取数据 (带缓存)
						</button>
						<button
							type="button"
							onClick={handleClearCache}
							className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
						>
							🗑️ 清空缓存
						</button>
					</div>

					{cachedData && (
						<div className="rounded border border-green-200 bg-green-50 p-4">
							<p className="mb-2 font-semibold text-green-800">缓存的数据：</p>
							<pre className="overflow-auto rounded bg-white p-3 text-sm">
								{JSON.stringify(cachedData, null, 2)}
							</pre>
							<p className="mt-2 text-xs text-green-600">
								第二次点击"获取数据"会从缓存加载（查看 Console）
							</p>
						</div>
					)}
				</div>

				{/* 高级操作 */}
				<div className="rounded-lg bg-white p-6 shadow">
					<h2 className="mb-4 text-2xl font-semibold text-gray-900">
						⚙️ 高级操作
					</h2>

					<div className="flex gap-4">
						<button
							type="button"
							onClick={async () => {
								const keys = await appStorage.keys()
								console.log("所有键:", keys)
								toast.info(`共有 ${keys.length} 个键:\n${keys.join(", ")}`)
							}}
							className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
						>
							📋 查看所有键
						</button>

						<button
							type="button"
							onClick={handleClearAll}
							className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
						>
							💣 清空所有数据
						</button>
					</div>

					<div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-4">
						<p className="text-sm text-yellow-800">
							💡 <strong>提示:</strong> 可以在 Chrome DevTools → Application →
							IndexedDB 中查看存储的数据
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StorageDemo
