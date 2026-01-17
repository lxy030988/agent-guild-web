/*
 * @Author: shasha0102 970284297@qq.com
 * @Date: 2026-01-10 23:45:55
 * @LastEditors: shasha0102 970284297@qq.com
 * @LastEditTime: 2026-01-13 23:17:15
 * @FilePath: /agent-guild-web/src/layouts/Layout.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Header from "@/components/common/Header"
import Toaster from "@/components/common/Toaster"
import { useQuicklink } from "@/hooks/useQuicklink"
import { memo } from "react"
import { Outlet } from "react-router-dom"

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
			<main className="mx-auto">
				<Outlet />
			</main>
			<Toaster />
		</>
	)
}
// MainLayout.whyDidYouRender = true;
export default memo(MainLayout)
