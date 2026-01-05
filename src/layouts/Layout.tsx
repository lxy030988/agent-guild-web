import { memo } from "react"
import { Outlet } from "react-router-dom"
import Header from "@/components/common/Header"
import { useQuicklink } from "@/hooks/useQuicklink"

const MainLayout = () => {
	// 启用 Quicklink 预加载
	// 自动预加载可视区域内的链接，提升导航性能
	useQuicklink({
		limit: 3, // 最多同时预加载 3 个资源
		timeout: 2000, // 2 秒超时
		throttle: 0, // 不节流，立即预加载
		threshold: 0, // 链接进入视口立即触发
	})

	return (
		<>
			<Header />
			<main className="mx-auto px-4">
				<Outlet />
			</main>
		</>
	)
}
// MainLayout.whyDidYouRender = true;
export default memo(MainLayout)
