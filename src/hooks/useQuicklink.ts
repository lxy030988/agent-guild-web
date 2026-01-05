import { listen } from "quicklink"
import { useEffect } from "react"

/**
 * Quicklink 预加载 Hook
 * 自动预加载可视区域内的链接，提升页面导航性能
 */
interface UseQuicklinkOptions {
	/** 容器元素选择器，默认监听整个文档 */
	el?: HTMLElement
	/** 需要预加载的 URL 列表（可选） */
	urls?: string[]
	/** 请求超时时间（毫秒），默认 2000ms */
	timeout?: number
	/** 节流时间（毫秒），默认 0 */
	throttle?: number
	/** 并发预加载数量限制，默认 Infinity */
	limit?: number
	/** Intersection Observer 阈值，0-1 之间，默认 0 */
	threshold?: number
	/** 是否只在空闲时预加载，默认 false */
	priority?: boolean
	/** 允许的域名列表（可选） */
	origins?: string[]
	/** 需要忽略的 URL 正则列表（可选） */
	ignores?: Array<RegExp | ((uri: string, elem: Element) => boolean)>
}

/**
 * 使用 Quicklink 进行智能预加载
 *
 * @example
 * ```tsx
 * // 在布局组件中使用
 * function Layout() {
 *   useQuicklink({
 *     limit: 3,              // 最多同时预加载 3 个资源
 *     throttle: 500,         // 500ms 节流
 *     timeout: 2000,         // 2 秒超时
 *   });
 *
 *   return <div>...</div>
 * }
 * ```
 */
export const useQuicklink = (options: UseQuicklinkOptions = {}) => {
	useEffect(() => {
		// 检测网络状态，慢速网络下禁用预加载
		const connection = (
			navigator as Navigator & {
				connection?: { effectiveType?: string; saveData?: boolean }
			}
		).connection
		if (connection) {
			// 2G 或慢速连接下禁用
			if (
				connection.effectiveType === "slow-2g" ||
				connection.effectiveType === "2g"
			) {
				console.log("[Quicklink] 检测到慢速网络，跳过预加载")
				return
			}

			// 开启省流模式下禁用
			if (connection.saveData) {
				console.log("[Quicklink] 检测到省流模式，跳过预加载")
				return
			}
		}

		// 默认配置
		const defaultOptions: UseQuicklinkOptions = {
			timeout: 2000, // 2 秒超时
			throttle: 0, // 不节流
			limit: 3, // 最多同时预加载 3 个
			threshold: 0, // 链接进入视口立即预加载
			priority: false, // 使用低优先级 fetch
			...options,
		}

		try {
			// 启动 quicklink 监听
			listen(defaultOptions)
			console.log("[Quicklink] 预加载已启用", defaultOptions)
		} catch (error) {
			console.error("[Quicklink] 初始化失败:", error)
		}

		// 清理函数（quicklink 没有提供 unlisten，但会自动清理）
		return () => {
			// Quicklink 会在组件卸载时自动清理监听器
		}
	}, [
		options.limit,
		options.timeout,
		options.throttle,
		options.threshold,
		options,
	]) // 添加依赖

	return null
}
