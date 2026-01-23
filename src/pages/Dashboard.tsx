import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { type Agent, AgentStatus, agentApi } from "../utils/agent-api"
import {
	type DashboardStats,
	type DashboardTabCounts,
	dashboardApi,
} from "../utils/dashboard-api"
import { type Job, JobStatus, jobApi } from "../utils/job-api"

const statusStyleMap: Record<string, string> = {
	生效中: "bg-emerald-50 text-emerald-700",
	待生效: "bg-amber-50 text-amber-700",
	已过期: "bg-slate-100 text-slate-500",
	已完成: "bg-blue-50 text-blue-700",
	争议中: "bg-rose-50 text-rose-700",
}

const defaultSignedMeta = {
	total: 0,
	page: 1,
	limit: 5,
	totalPages: 1,
}
const defaultJobsMeta = defaultSignedMeta

const statusLabelMap: Record<JobStatus, string> = {
	[JobStatus.OPEN]: "待生效",
	[JobStatus.MATCHED]: "生效中",
	[JobStatus.IN_PROGRESS]: "生效中",
	[JobStatus.SUBMITTED]: "生效中",
	[JobStatus.COMPLETED]: "已完成",
	[JobStatus.CANCELLED]: "已过期",
	[JobStatus.DISPUTED]: "争议中",
	[JobStatus.RESOLVED_COMPLETED]: "已完成",
	[JobStatus.RESOLVED_CANCELLED]: "已过期",
}

const agentStatusLabelMap: Record<AgentStatus, string> = {
	[AgentStatus.DRAFT]: "Draft",
	[AgentStatus.ACTIVE]: "Active",
	[AgentStatus.MINTED]: "Signed",
	[AgentStatus.PAUSED]: "Disputed",
	[AgentStatus.ARCHIVED]: "Archived",
}

const formatDate = (value?: string | null) => {
	if (!value) return "--"
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return "--"
	return date.toISOString().slice(0, 10)
}

const Dashboard = () => {
	const [activeTab, setActiveTab] = useState("jobs")
	const [signedPage, setSignedPage] = useState(1)
	const [disputesPage, setDisputesPage] = useState(1)
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [tabCounts, setTabCounts] = useState<DashboardTabCounts>({
		publishedJobs: 0,
		publishedAgents: 0,
		signedAgents: 0,
		disputedAgents: 0,
	})
	const [signedAgents, setSignedAgents] = useState<Agent[]>([])
	const [signedMeta, setSignedMeta] = useState(defaultSignedMeta)
	const [signedLoading, setSignedLoading] = useState(false)
	const [disputedAgents, setDisputedAgents] = useState<Agent[]>([])
	const [disputedMeta, setDisputedMeta] = useState(defaultSignedMeta)
	const [disputedLoading, setDisputedLoading] = useState(false)
	const [jobsPage, setJobsPage] = useState(1)
	const [publishedJobs, setPublishedJobs] = useState<Job[]>([])
	const [jobsMeta, setJobsMeta] = useState(defaultJobsMeta)
	const [jobsLoading, setJobsLoading] = useState(false)
	const [agentsPage, setAgentsPage] = useState(1)
	const [publishedAgents, setPublishedAgents] = useState<Agent[]>([])
	const [agentsMeta, setAgentsMeta] = useState(defaultJobsMeta)
	const [agentsLoading, setAgentsLoading] = useState(false)

	const cards = useMemo(
		() => [
			{
				title: "Published Agents",
				value: stats?.publishedAgents?.value ?? 0,
				note: stats?.publishedAgents?.note
					? `近一周新增${stats?.publishedAgents?.note}`
					: "",
				color: "from-blue-50 to-blue-100 border-blue-100",
				icon: "👥",
			},
			{
				title: "Active activeJobs",
				value: stats?.activeJobs.value ?? 0,
				note: stats?.activeJobs?.note
					? `近一周新增${stats?.activeJobs?.note}`
					: "",
				color: "from-emerald-50 to-emerald-100 border-emerald-100",
				icon: "📄",
			},
			{
				title: "Completed Jobs",
				value: stats?.completedJobs?.value ?? 0,
				note: stats?.completedJobs?.note
					? `近一周新增${stats?.completedJobs?.note}`
					: "",
				color: "from-violet-50 to-violet-100 border-violet-100",
				icon: "✅",
			},
			{
				title: "Total Earnings",
				value: stats?.totalEarnings?.value ?? "$0",
				note: stats?.totalEarnings?.note
					? `近一周新增${stats?.totalEarnings?.note}`
					: "",
				color: "from-amber-50 to-amber-100 border-amber-100",
				icon: "📈",
			},
			{
				title: "In Progress Jobs",
				value: stats?.inProgressJobs?.value ?? 0,
				note: stats?.inProgressJobs?.note
					? `近一周新增${stats?.inProgressJobs?.note}`
					: "",
				color: "from-sky-50 to-sky-100 border-sky-100",
				icon: "🕒",
			},
			{
				title: "Disputes",
				value: stats?.disputes.value ?? 0,
				note: stats?.disputes?.note ? `近一周新增${stats?.disputes?.note}` : "",
				color: "from-rose-50 to-rose-100 border-rose-100",
				icon: "⚠️",
			},
		],
		[stats],
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
	const disputesTotalPages = disputedMeta?.totalPages || 1
	const disputesStartLabel = disputedMeta?.total
		? `${(disputedMeta.page - 1) * disputedMeta.limit + 1} 到 ${Math.min(
				disputedMeta.page * disputedMeta.limit,
				disputedMeta.total,
			)}`
		: "0 到 0"
	const jobsTotalPages = jobsMeta?.totalPages || 1
	const jobsStartLabel = jobsMeta?.total
		? `${(jobsMeta.page - 1) * jobsMeta.limit + 1} 到 ${Math.min(jobsMeta.page * jobsMeta.limit, jobsMeta.total)}`
		: "0 到 0"
	const agentsTotalPages = agentsMeta?.totalPages || 1
	const agentsStartLabel = agentsMeta?.total
		? `${(agentsMeta.page - 1) * agentsMeta.limit + 1} 到 ${Math.min(
				agentsMeta.page * agentsMeta.limit,
				agentsMeta.total,
			)}`
		: "0 到 0"

	const loadStats = useCallback(async () => {
		try {
			const statsData = await dashboardApi.getStats()
			console.log("statsData-----", statsData)
			setStats(statsData)
		} catch (error) {
			console.error("Failed to load dashboard stats:", error)
		}
	}, [])

	const loadTabCounts = useCallback(async () => {
		try {
			const counts = await dashboardApi.getTabCounts()
			setTabCounts(counts)
		} catch (error) {
			console.error("Failed to load tab counts:", error)
		}
	}, [])

	useEffect(() => {
		loadStats()
		loadTabCounts()
	}, [loadStats, loadTabCounts])

	useEffect(() => {
		if (activeTab !== "signed") return
		const loadSignedAgents = async () => {
			try {
				setSignedLoading(true)
				const result = await dashboardApi.getSignedAgents(
					signedPage,
					signedMeta?.limit || defaultSignedMeta.limit,
				)
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

	useEffect(() => {
		if (activeTab !== "disputes") return
		const loadDisputedAgents = async () => {
			try {
				setDisputedLoading(true)
				const result = await agentApi.getAgents({
					page: disputesPage,
					limit: disputedMeta?.limit || defaultSignedMeta.limit,
					status: AgentStatus.PAUSED,
				})
				setDisputedAgents(result.data)
				setDisputedMeta(result.meta || defaultSignedMeta)
			} catch (error) {
				console.error("Failed to load disputed agents:", error)
				setDisputedMeta(defaultSignedMeta)
			} finally {
				setDisputedLoading(false)
			}
		}
		loadDisputedAgents()
	}, [activeTab, disputesPage, disputedMeta.limit])

	const loadPublishedJobs = useCallback(async () => {
		try {
			setJobsLoading(true)
			const result = await jobApi.getMyPublishedJobs({
				page: jobsPage,
				limit: jobsMeta?.limit || defaultJobsMeta.limit,
			})
			setPublishedJobs(result.data)
			setJobsMeta(result.meta || defaultJobsMeta)
		} catch (error) {
			console.error("Failed to load published jobs:", error)
			setJobsMeta(defaultJobsMeta)
		} finally {
			setJobsLoading(false)
		}
	}, [jobsPage, jobsMeta?.limit])

	useEffect(() => {
		if (activeTab !== "jobs") return
		loadPublishedJobs()
	}, [activeTab, loadPublishedJobs])

	const loadPublishedAgents = useCallback(async () => {
		try {
			setAgentsLoading(true)
			const result = await agentApi.getAgents({
				page: agentsPage,
				limit: agentsMeta?.limit || defaultJobsMeta.limit,
			})
			setPublishedAgents(result.data)
			setAgentsMeta(result.meta || defaultJobsMeta)
		} catch (error) {
			console.error("Failed to load published agents:", error)
			setAgentsMeta(defaultJobsMeta)
		} finally {
			setAgentsLoading(false)
		}
	}, [agentsPage, agentsMeta?.limit])

	useEffect(() => {
		if (activeTab !== "agents") return
		loadPublishedAgents()
	}, [activeTab, loadPublishedAgents])

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
									if (tab.id === "jobs") {
										setJobsPage(1)
									}
									if (tab.id === "agents") {
										setAgentsPage(1)
									}
									if (tab.id === "disputes") {
										setDisputesPage(1)
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
											onClick={loadPublishedJobs}
											className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
										>
											Refresh
										</button>
										<span>Total {jobsMeta.total} jobs</span>
									</div>
								</div>
								<div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
									<div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500">
										<span>JOB 信息</span>
										<span>状态</span>
										<span>预算</span>
										<span>截止时间</span>
										<span className="text-right">操作</span>
									</div>
									<div className="divide-y divide-slate-100 bg-white">
										{jobsLoading ? (
											<div className="px-6 py-10 text-center text-sm text-slate-500">
												加载中...
											</div>
										) : publishedJobs.length === 0 ? (
											<div className="px-6 py-10 text-center text-sm text-slate-500">
												暂无已发布任务
											</div>
										) : (
											publishedJobs.map((job) => {
												const statusLabel =
													statusLabelMap[job.status] || "生效中"
												return (
													<div
														key={job.id}
														className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-5 text-sm text-slate-600"
													>
														<div>
															<Link
																to={`/jobs/${job.id}`}
																className="font-semibold text-slate-900 hover:text-blue-600"
															>
																{job.title}
															</Link>
															<p className="text-xs text-slate-400">
																{job.description}
															</p>
														</div>
														<span
															className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs ${
																statusStyleMap[statusLabel] ||
																"bg-slate-100 text-slate-500"
															}`}
														>
															{statusLabel}
														</span>
														<div>
															<p className="text-slate-900">
																{job.currency}
																{job.budget}
															</p>
														</div>
														<div>
															<p className="text-slate-900">
																{formatDate(job.deadline)}
															</p>
														</div>
														<div className="text-right text-slate-400">
															<Link
																to={`/jobs/${job.id}`}
																className="hover:text-blue-600"
															>
																👁️
															</Link>
														</div>
													</div>
												)
											})
										)}
									</div>
								</div>
								<div className="mt-4 flex items-center justify-between text-sm text-slate-500">
									<span>
										显示 {jobsStartLabel} 条，共 {jobsMeta.total} 条记录
									</span>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() =>
												setJobsPage((prev) => Math.max(1, prev - 1))
											}
											disabled={jobsPage === 1}
											className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 disabled:opacity-40"
										>
											‹
										</button>
										{Array.from({ length: jobsTotalPages }).map((_, index) => {
											const page = index + 1
											return (
												<button
													key={page}
													type="button"
													onClick={() => setJobsPage(page)}
													className={`h-9 w-9 rounded-full border ${
														jobsPage === page
															? "border-blue-500 bg-blue-500 text-white"
															: "border-slate-200 text-slate-500"
													}`}
												>
													{page}
												</button>
											)
										})}
										<button
											type="button"
											onClick={() =>
												setJobsPage((prev) =>
													Math.min(jobsTotalPages, prev + 1),
												)
											}
											disabled={jobsPage === jobsTotalPages}
											className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 disabled:opacity-40"
										>
											›
										</button>
									</div>
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
											onClick={loadPublishedAgents}
											className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
										>
											Refresh
										</button>
										<span>Total {agentsMeta.total} agents</span>
									</div>
								</div>
								<div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
									<div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500">
										<span>AGENT 信息</span>
										<span>状态</span>
										<span>任务数</span>
										<span>评分</span>
										<span className="text-right">操作</span>
									</div>
									<div className="divide-y divide-slate-100 bg-white">
										{agentsLoading ? (
											<div className="px-6 py-10 text-center text-sm text-slate-500">
												加载中...
											</div>
										) : publishedAgents.length === 0 ? (
											<div className="px-6 py-10 text-center text-sm text-slate-500">
												暂无已发布 Agent
											</div>
										) : (
											publishedAgents.map((agent) => (
												<div
													key={agent.id}
													className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-5 text-sm text-slate-600"
												>
													<div>
														<p className="font-semibold text-slate-900">
															{agent.name}
														</p>
														<p className="text-xs text-slate-400">
															{agent.description}
														</p>
													</div>
													<span
														className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs ${
															agent.status === "ACTIVE"
																? "bg-emerald-50 text-emerald-700"
																: "bg-slate-100 text-slate-500"
														}`}
													>
														{agent.status}
													</span>
													<div>
														<p className="text-slate-900">{agent.jobCount}</p>
													</div>
													<div>
														<p className="text-slate-900">
															{agent.rating ?? "--"}
														</p>
													</div>
													<div className="text-right text-slate-400">👁️</div>
												</div>
											))
										)}
									</div>
								</div>
								<div className="mt-4 flex items-center justify-between text-sm text-slate-500">
									<span>
										显示 {agentsStartLabel} 条，共 {agentsMeta.total} 条记录
									</span>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() =>
												setAgentsPage((prev) => Math.max(1, prev - 1))
											}
											disabled={agentsPage === 1}
											className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 disabled:opacity-40"
										>
											‹
										</button>
										{Array.from({ length: agentsTotalPages }).map(
											(_, index) => {
												const page = index + 1
												return (
													<button
														key={page}
														type="button"
														onClick={() => setAgentsPage(page)}
														className={`h-9 w-9 rounded-full border ${
															agentsPage === page
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
												setAgentsPage((prev) =>
													Math.min(agentsTotalPages, prev + 1),
												)
											}
											disabled={agentsPage === agentsTotalPages}
											className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 disabled:opacity-40"
										>
											›
										</button>
									</div>
								</div>
							</div>
						) : null}

						{activeTab === "signed" ? (
							<div>
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold text-slate-900">
										已签署的 Agents
									</h3>
									<span className="text-sm text-slate-500">
										共 {signedMeta.total} 个 Agent
									</span>
								</div>
								<div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
									<div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500">
										<span>AGENT 信息</span>
										<span>状态</span>
										<span>任务数</span>
										<span>评分</span>
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
											signedAgents.map((agent) => (
												<div
													key={agent.id}
													className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-5 text-sm text-slate-600"
												>
													<div>
														<p className="font-semibold text-slate-900">
															{agent.name}
														</p>
														<p className="text-xs text-slate-400">
															{agent.description}
														</p>
														<p className="text-xs text-slate-400">
															发布者: {agent.owner?.name || "--"}
														</p>
													</div>
													<span
														className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs ${
															agent.status === "MINTED"
																? "bg-emerald-50 text-emerald-700"
																: "bg-slate-100 text-slate-500"
														}`}
													>
														{agentStatusLabelMap[agent.status]}
													</span>
													<div>
														<p className="text-slate-900">{agent.jobCount}</p>
													</div>
													<div>
														<p className="text-slate-900">
															{agent.rating ?? "--"}
														</p>
													</div>
													<div className="text-right text-slate-400">👁️</div>
												</div>
											))
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
										Disputed Agents
									</h3>
									<span className="text-sm text-slate-500">
										共 {disputedMeta.total} 个 Agent
									</span>
								</div>
								<div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
									<div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500">
										<span>AGENT 信息</span>
										<span>状态</span>
										<span>任务数</span>
										<span>评分</span>
										<span className="text-right">操作</span>
									</div>
									<div className="divide-y divide-slate-100 bg-white">
										{disputedLoading ? (
											<div className="px-6 py-10 text-center text-sm text-slate-500">
												加载中...
											</div>
										) : disputedAgents.length === 0 ? (
											<div className="px-6 py-10 text-center text-sm text-slate-500">
												暂无争议中的 Agent
											</div>
										) : (
											disputedAgents.map((agent) => (
												<div
													key={agent.id}
													className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-5 text-sm text-slate-600"
												>
													<div>
														<p className="font-semibold text-slate-900">
															{agent.name}
														</p>
														<p className="text-xs text-slate-400">
															{agent.description}
														</p>
														<p className="text-xs text-slate-400">
															发布者: {agent.owner?.name || "--"}
														</p>
													</div>
													<span className="inline-flex h-7 items-center justify-center rounded-full bg-rose-50 px-3 text-xs text-rose-700">
														{agentStatusLabelMap[agent.status]}
													</span>
													<div>
														<p className="text-slate-900">{agent.jobCount}</p>
													</div>
													<div>
														<p className="text-slate-900">
															{agent.rating ?? "--"}
														</p>
													</div>
													<div className="text-right text-slate-400">👁️</div>
												</div>
											))
										)}
									</div>
								</div>
								<div className="mt-4 flex items-center justify-between text-sm text-slate-500">
									<span>
										显示 {disputesStartLabel} 条，共 {disputedMeta.total} 条记录
									</span>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() =>
												setDisputesPage((prev) => Math.max(1, prev - 1))
											}
											disabled={disputesPage === 1}
											className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 disabled:opacity-40"
										>
											‹
										</button>
										{Array.from({ length: disputesTotalPages }).map(
											(_, index) => {
												const page = index + 1
												return (
													<button
														key={page}
														type="button"
														onClick={() => setDisputesPage(page)}
														className={`h-9 w-9 rounded-full border ${
															disputesPage === page
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
												setDisputesPage((prev) =>
													Math.min(disputesTotalPages, prev + 1),
												)
											}
											disabled={disputesPage === disputesTotalPages}
											className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 disabled:opacity-40"
										>
											›
										</button>
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
