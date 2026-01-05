import { Workbox } from "workbox-window"

/**
 * 注册 Service Worker
 * 只在生产环境和支持 Service Worker 的浏览器中注册
 */
export function registerServiceWorker() {
	// 只在生产环境启用 Service Worker
	if (process.env.NODE_ENV !== "production") {
		console.log("[SW] 开发环境，跳过 Service Worker 注册")
		return null
	}

	// 检查浏览器是否支持 Service Worker
	if (!("serviceWorker" in navigator)) {
		console.log("[SW] 浏览器不支持 Service Worker")
		return null
	}

	const wb = new Workbox("/service-worker.js")

	// 监听 Service Worker 等待激活事件
	wb.addEventListener("waiting", () => {
		console.log("[SW] 新的 Service Worker 等待激活")

		// 提示用户刷新页面以激活新的 Service Worker
		const shouldUpdate = window.confirm(
			"有新版本可用！点击确定刷新页面以获取最新内容。",
		)

		if (shouldUpdate) {
			wb.messageSkipWaiting()
		}
	})

	// 监听 Service Worker 激活事件
	wb.addEventListener("activated", (event) => {
		// 如果这不是首次激活，说明是更新
		if (!event.isUpdate) {
			console.log("[SW] Service Worker 首次激活")
		} else {
			console.log("[SW] Service Worker 已更新")
			// 刷新页面以加载新内容
			window.location.reload()
		}
	})

	// 监听控制事件
	wb.addEventListener("controlling", () => {
		console.log("[SW] Service Worker 开始控制页面")
	})

	// 注册并激活
	wb.register()
		.then((registration) => {
			console.log("[SW] Service Worker 注册成功:", registration)

			// 每小时检查一次更新
			setInterval(
				() => {
					registration?.update()
				},
				60 * 60 * 1000,
			)
		})
		.catch((error) => {
			console.error("[SW] Service Worker 注册失败:", error)
		})

	return wb
}

/**
 * 注销 Service Worker (用于开发/调试)
 */
export async function unregisterServiceWorker() {
	if ("serviceWorker" in navigator) {
		const registrations = await navigator.serviceWorker.getRegistrations()
		for (const registration of registrations) {
			await registration.unregister()
		}
		console.log("[SW] Service Worker 已注销")
	}
}
