import { memo, useEffect, useMemo, useState } from "react"
import { dashboardApplicationApi } from "../utils/dashboard-application-api"
import type {
	DashboardSummary,
	DashboardTabCounts,
	SignedAgent,
} from "../utils/dashboard-application-api"

const statusStyleMap: Record<string, string> = {
	生效中: "bg-emerald-50 text-emerald-700",
	待生效: "bg-amber-50 text-amber-700",
	已过期: "bg-slate-100 text-slate-500",
	已完成: "bg-blue-50 text-blue-700",
}

const defaultSignedMeta = {
	total: 0,
	page: 1,
	limit: 5,
	totalPages: 1,
}

const Dashboard = () => {
	const [activeTab, setActiveTab] = useState("jobs")
	const [signedPage, setSignedPage] = useState(1)
	const [summary, setSummary] = useState<DashboardSummary | null>(null)
	const [tabCounts, setTabCounts] = useState<DashboardTabCounts>({
		publishedJobs: 0,
		publishedAgents: 0,
		signedAgents: 0,
		disputedAgents: 0,
	})
	const [signedAgents, setSignedAgents] = useState<SignedAgent[]>([])
	const [signedMeta, setSignedMeta] = useState(defaultSignedMeta)
	const [signedLoading, setSignedLoading] = useState(false)

	const cards = useMemo(
		() => [
			{
				title: "Published Agents",
				value: summary?.publishedAgents?.value ?? 0,
				note: summary?.publishedAgents?.note,
				color: "from-blue-50 to-blue-100 border-blue-100",
				icon: "👥",
			},
			{
				title: "Active Contracts",
				value: summary?.activeContracts?.value ?? 0,
				note: summary?.activeContracts?.note,
				color: "from-emerald-50 to-emerald-100 border-emerald-100",
				icon: "📄",
			},
			{
				title: "Completed Jobs",
				value: summary?.completedJobs?.value ?? 0,
				note: summary?.completedJobs?.note,
				color: "from-violet-50 to-violet-100 border-violet-100",
				icon: "✅",
			},
			{
				title: "Total Earnings",
				value: summary?.totalEarnings?.value ?? "$0",
				note: summary?.totalEarnings?.note,
				color: "from-amber-50 to-amber-100 border-amber-100",
				icon: "📈",
			},
			{
				title: "In Progress Jobs",
				value: summary?.inProgressJobs?.value ?? 0,
				note: summary?.inProgressJobs?.note,
				color: "from-sky-50 to-sky-100 border-sky-100",
				icon: "🕒",
			},
			{
				title: "Disputes",
				value: summary?.disputes?.value ?? 0,
				note: summary?.disputes?.note,
				color: "from-rose-50 to-rose-100 border-rose-100",
				icon: "⚠️",
			},
		],
		[summary],
	)

	const tabs = useMemo(
		() => [
			{
				id: "jobs",
				label: "My Published Jobs",
				count: tabCounts.publishedJobs,
			},
			{
				id: "agents",
				label: "My Published Agents",
				count: tabCounts.publishedAgents,
			},
			{ id: "signed", label: "Signed Agents", count: tabCounts.signedAgents },
			{
				id: "disputes",
				label: "Disputed Agents",
				count: tabCounts.disputedAgents,
			},
		],
		[tabCounts],
	)

	const signedTotalPages = signedMeta?.totalPages || 1
	const signedStartLabel = signedMeta?.total
		? `${(signedMeta.page - 1) * signedMeta.limit + 1} 到 ${Math.min(
				signedMeta.page * signedMeta.limit,
				signedMeta.total,
			)}`
		: "0 到 0"

	useEffect(() => {
		const loadSummary = async () => {
			try {
				const [summaryData, tabData] = await Promise.all([
					dashboardApplicationApi.getSummary(),
					dashboardApplicationApi.getTabCounts(),
				])
				setSummary(summaryData)
				setTabCounts(tabData)
			} catch (error) {
				console.error("Failed to load dashboard summary:", error)
			}
		}
		loadSummary()
	}, [])

	useEffect(() => {
		if (activeTab !== "signed") return
		const loadSignedAgents = async () => {
			try {
				setSignedLoading(true)
				const result = await dashboardApplicationApi.getSignedAgents({
					page: signedPage,
					limit: signedMeta?.limit || defaultSignedMeta.limit,
				})
				setSignedAgents(result.data)
				setSignedMeta(result.meta || defaultSignedMeta)
			} catch (error) {
				console.error("Failed to load signed agents:", error)
				setSignedMeta(defaultSignedMeta)
			} finally {
				setSignedLoading(false)
			}
		}
		loadSignedAgents()
	}, [activeTab, signedPage, signedMeta.limit])

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
			<section className="dashboard-banner w-full" />
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
				<section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{cards.map((card) => (
						<div
							key={card.title}
							className={`rounded-2xl border bg-gradient-to-br p-6 shadow-sm ${card.color}`}
						>
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm text-slate-500">{card.title}</p>
									<p className="text-2xl font-semibold text-slate-900 mt-2">
										{card.value}
									</p>
									{card.note ? (
										<p className="text-xs text-emerald-600 mt-2">{card.note}</p>
									) : null}
								</div>
								<div className="h-12 w-12 rounded-2xl bg-white/80 flex items-center justify-center text-xl shadow-sm">
									{card.icon}
								</div>
							</div>
						</div>
					))}
				</section>

				<section className="mt-10 rounded-2xl border border-slate-100 bg-white/80 shadow-sm">
					<div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => {
									setActiveTab(tab.id)
									if (tab.id === "signed") {
										setSignedPage(1)
									}
								}}
								className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
									activeTab === tab.id
										? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"
										: "text-slate-500"
								}`}
							>
								<span>{tab.label}</span>
								<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
									{tab.count}
								</span>
							</button>
						))}
					</div>

					<div className="px-6 py-6">
						{activeTab === "jobs" ? (
							<div>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold text-slate-900">
											My Published Jobs
										</h3>
										<p className="text-sm text-slate-500 mt-1">
											Wallet: 0x1Be3...1b2e
										</p>
									</div>
									<div className="flex items-center gap-4 text-sm text-slate-500">
										<button
											type="button"
											className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
										>
											Refresh
										</button>
										<span>Total 0 jobs</span>
									</div>
								</div>
								<div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
									<p className="text-2xl">🧳</p>
									<p className="mt-3 font-semibold">No published jobs</p>
									<p className="text-sm">Go publish your first job!</p>
								</div>
							</div>
						) : null}

						{activeTab === "agents" ? (
							<div>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold text-slate-900">
											My Published Agents
										</h3>
										<p className="text-sm text-slate-500 mt-1">
											Wallet: 0x1Be3...1b2e
										</p>
									</div>
									<div className="flex items-center gap-4 text-sm text-slate-500">
										<button
											type="button"
											className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
										>
											Refresh
										</button>
										<span>Total 0 agents</span>
									</div>
								</div>
								<div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
									<p className="text-2xl">👤</p>
									<p className="mt-3 font-semibold">No published agents</p>
									<p className="text-sm">Go publish your first agent!</p>
								</div>
							</div>
						) : null}

						{activeTab === "signed" ? (
							<div>
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold text-slate-900">
										已签署的 Agents 合约
									</h3>
									<span className="text-sm text-slate-500">
										共 {signedMeta.total} 个合约
									</span>
								</div>
								<div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
									<div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
										<p className="text-sm text-emerald-700">生效合约</p>
										<p className="text-2xl font-semibold text-emerald-900 mt-1">
											4
										</p>
									</div>
									<div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
										<p className="text-sm text-amber-700">待生效</p>
										<p className="text-2xl font-semibold text-amber-900 mt-1">
											2
										</p>
									</div>
									<div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
										<p className="text-sm text-sky-700">总收益</p>
										<p className="text-2xl font-semibold text-sky-900 mt-1">
											¥12,450
										</p>
									</div>
									<div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
										<p className="text-sm text-violet-700">可对话</p>
										<p className="text-2xl font-semibold text-violet-900 mt-1">
											4
										</p>
									</div>
								</div>
								<div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
									<div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500">
										<span>AGENT 信息</span>
										<span>合约状态</span>
										<span>任务进度</span>
										<span>收益</span>
										<span>合约期限</span>
										<span className="text-right">操作</span>
									</div>
									<div className="divide-y divide-slate-100 bg-white">
										{signedLoading ? (
											<div className="px-6 py-10 text-center text-sm text-slate-500">
												加载中...
											</div>
										) : signedAgents.length === 0 ? (
											<div className="px-6 py-10 text-center text-sm text-slate-500">
												暂无已签署合约
											</div>
										) : (
											signedAgents.map((item) => {
												const progress =
													item.total > 0
														? Math.round((item.done / item.total) * 100)
														: 0
												return (
													<div
														key={`${item.id}-${item.name}`}
														className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-5 text-sm text-slate-600"
													>
														<div>
															<p className="font-semibold text-slate-900">
																{item.name}
															</p>
															<p className="text-xs text-slate-400">
																{item.description}
															</p>
															<p className="text-xs text-slate-400">
																发布者: {item.publisher}
															</p>
														</div>
														<span
															className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs ${
																statusStyleMap[item.status] ||
																"bg-slate-100 text-slate-500"
															}`}
														>
															{item.status}
														</span>
														<div>
															<p className="text-slate-900">
																{item.done} / {item.total} 完成
															</p>
															<div className="mt-2 h-2 rounded-full bg-slate-100">
																<div
																	className="h-2 rounded-full bg-emerald-500"
																	style={{ width: `${progress}%` }}
																/>
															</div>
															<p className="text-xs text-slate-400 mt-1">
																{progress}% 完成率
															</p>
														</div>
														<div>
															<p className="text-slate-900">{item.earnings}</p>
															<p className="text-xs text-slate-400">
																平均: {item.average}
															</p>
														</div>
														<div>
															<p className="text-slate-900">
																{item.expireDate}
															</p>
															<p className="text-xs text-slate-400">
																签署于: {item.signedAt}
															</p>
															<p className="text-xs text-emerald-600">
																剩余 {item.remaining}
															</p>
														</div>
														<div className="flex items-center justify-end gap-3 text-slate-400">
															<button type="button" className="text-lg">
																💬
															</button>
															<button type="button" className="text-lg">
																👁️
															</button>
															<button type="button" className="text-lg">
																⋯
															</button>
														</div>
													</div>
												)
											})
										)}
									</div>
								</div>
								<div className="mt-4 flex items-center justify-between text-sm text-slate-500">
									<span>
										显示 {signedStartLabel} 条，共 {signedMeta.total} 条记录
									</span>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() =>
												setSignedPage((prev) => Math.max(1, prev - 1))
											}
											disabled={signedPage === 1}
											className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 disabled:opacity-40"
										>
											‹
										</button>
										{Array.from({ length: signedTotalPages }).map(
											(_, index) => {
												const page = index + 1
												return (
													<button
														key={page}
														type="button"
														onClick={() => setSignedPage(page)}
														className={`h-9 w-9 rounded-full border ${
															signedPage === page
																? "border-blue-500 bg-blue-500 text-white"
																: "border-slate-200 text-slate-500"
														}`}
													>
														{page}
													</button>
												)
											},
										)}
										<button
											type="button"
											onClick={() =>
												setSignedPage((prev) =>
													Math.min(signedTotalPages, prev + 1),
												)
											}
											disabled={signedPage === signedTotalPages}
											className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 disabled:opacity-40"
										>
											›
										</button>
									</div>
								</div>
							</div>
						) : null}

						{activeTab === "disputes" ? (
							<div>
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold text-slate-900">
										Dispute Resolution Center
									</h3>
									<span className="text-sm text-slate-500">
										Total 1 dispute case
									</span>
								</div>
								<div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
									<div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500">
										<span>DISPUTE INFORMATION</span>
										<span>TYPE/STATUS</span>
										<span>AMOUNT</span>
										<span>REPORTER</span>
										<span>PROGRESS</span>
										<span className="text-right">ACTIONS</span>
									</div>
									<div className="bg-white px-6 py-5 text-sm text-slate-600">
										<div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4">
											<div>
												<p className="font-semibold text-slate-900">
													DataMaster AI
												</p>
												<p className="text-xs text-slate-400">
													Job: AI Data Analysis Report Generation
												</p>
											</div>
											<span className="inline-flex h-7 items-center justify-center rounded-full bg-amber-50 px-3 text-xs text-amber-700">
												Investigating
											</span>
											<span className="text-slate-900">$500</span>
											<div>
												<p className="text-slate-900">TechCorp</p>
												<p className="text-xs text-slate-400">2025-01-01</p>
											</div>
											<div>
												<p className="text-blue-600">Mediator John Smith</p>
												<div className="mt-2 h-2 rounded-full bg-slate-100">
													<div className="h-2 w-1/2 rounded-full bg-amber-500" />
												</div>
											</div>
											<div className="text-right text-slate-400">👁️</div>
										</div>
										<div className="mt-3 flex items-center gap-2 text-xs">
											<span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">
												Quality Issue
											</span>
											<span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700">
												High
											</span>
										</div>
									</div>
								</div>
							</div>
						) : null}
					</div>
				</section>
			</div>
		</div>
	)
}

export default memo(Dashboard)
