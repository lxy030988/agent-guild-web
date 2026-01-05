/* eslint-disable no-restricted-globals */
/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core"
import { ExpirationPlugin } from "workbox-expiration"
import { createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching"
import { registerRoute } from "workbox-routing"
import {
	CacheFirst,
	NetworkFirst,
	StaleWhileRevalidate,
} from "workbox-strategies"

declare const self: ServiceWorkerGlobalScope

// 立即控制所有客户端
clientsClaim()

// 预缓存 webpack 生成的资源
// self.__WB_MANIFEST 会被 WorkboxPlugin 自动替换
precacheAndRoute(self.__WB_MANIFEST)

// 设置应用 shell 路由（用于 SPA）
const fileExtensionRegexp = /\/[^/?]+\.[^/]+$/
registerRoute(
	// 返回 false 表示不是文件请求，而是导航请求
	({ request, url }: { request: Request; url: URL }) => {
		if (request.mode !== "navigate") {
			return false
		}

		if (url.pathname.startsWith("/_")) {
			return false
		}

		if (url.pathname.match(fileExtensionRegexp)) {
			return false
		}

		return true
	},
	createHandlerBoundToURL("/index.html"),
)

// 缓存策略 1: JS/CSS 静态资源 - Cache First
registerRoute(
	({ request }) =>
		request.destination === "script" || request.destination === "style",
	new CacheFirst({
		cacheName: "static-resources",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 60,
				maxAgeSeconds: 30 * 24 * 60 * 60, // 30 天
			}),
		],
	}),
)

// 缓存策略 2: 图片资源 - Cache First
registerRoute(
	({ request }) => request.destination === "image",
	new CacheFirst({
		cacheName: "images",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 100,
				maxAgeSeconds: 30 * 24 * 60 * 60, // 30 天
			}),
		],
	}),
)

// 缓存策略 3: 字体资源 - Cache First (永久缓存)
registerRoute(
	({ request }) => request.destination === "font",
	new CacheFirst({
		cacheName: "fonts",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 30,
				maxAgeSeconds: 365 * 24 * 60 * 60, // 1 年
			}),
		],
	}),
)

// 缓存策略 4: API 请求 - Network First
registerRoute(
	({ url }) => url.pathname.startsWith("/api/"),
	new NetworkFirst({
		cacheName: "api-cache",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 5 * 60, // 5 分钟
			}),
		],
		networkTimeoutSeconds: 10, // 10 秒超时
	}),
)

// 缓存策略 5: CDN 资源 - Stale While Revalidate
registerRoute(
	({ url }) =>
		url.origin === "https://unpkg.com" ||
		url.origin === "https://cdn.jsdelivr.net",
	new StaleWhileRevalidate({
		cacheName: "cdn-cache",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 7 * 24 * 60 * 60, // 7 天
			}),
		],
	}),
)

// 监听消息事件（用于跳过等待）
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting()
	}
})

// Service Worker 激活时清理旧缓存
self.addEventListener("activate", (event) => {
	console.log("[SW] Service Worker 已激活")
})

// Service Worker 安装时
self.addEventListener("install", (event) => {
	console.log("[SW] Service Worker 已安装")
	// 强制跳过等待，立即激活
	self.skipWaiting()
})
