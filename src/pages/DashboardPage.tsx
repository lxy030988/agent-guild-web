import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
import { toast } from "sonner"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card"
import type { Agent } from "../utils/agent-api"
import { agentApi } from "../utils/agent-api"
import {
	type DashboardStats,
	type JobsBreakdown,
	type RevenueChartData,
	dashboardApi,
} from "../utils/dashboard-api"
import { type Job, JobStatus, jobApi } from "../utils/job-api"

export default function DashboardPage() {
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [revenueData, setRevenueData] = useState<RevenueChartData[]>([])
	const [jobsBreakdown, setJobsBreakdown] = useState<JobsBreakdown | null>(null)
	const [loading, setLoading] = useState(true)

	// 标签页状态
	const [activeTab, setActiveTab] = useState<
		"jobs" | "agents" | "signed" | "disputed"
	>("jobs")
	const [publishedJobs, setPublishedJobs] = useState<Job[]>([])
	const [publishedAgents, setPublishedAgents] = useState<Agent[]>([])
	const [tabLoading, setTabLoading] = useState(false)

	// 加载Dashboard数据
	const loadDashboardData = useCallback(async () => {
		try {
			setLoading(true)
			const [statsData, revenueChartData, breakdownData] = await Promise.all([
				dashboardApi.getStats(),
				dashboardApi.getRevenueChart(30),
				dashboardApi.getJobsBreakdown(),
			])

			console.log("Dashboard数据加载成功:", {
				statsData,
				revenueChartData,
				breakdownData,
			})

			setStats(statsData)
			setRevenueData(revenueChartData)
			setJobsBreakdown(breakdownData)
		} catch (error) {
			console.error("Failed to load dashboard data:", error)
			toast.error("加载仪表板数据失败")
		} finally {
			setLoading(false)
		}
	}, [])

	// 加载标签页数据
	const loadTabData = useCallback(async () => {
		if (activeTab === "jobs") {
			try {
				setTabLoading(true)
				const result = await jobApi.getMyPublishedJobs({ page: 1, limit: 10 })
				setPublishedJobs(result.data)
			} catch (error) {
				console.error("Failed to load published jobs:", error)
			} finally {
				setTabLoading(false)
			}
		} else if (activeTab === "agents") {
			try {
				setTabLoading(true)
				const result = await agentApi.getAgents({ page: 1, limit: 10 })
				setPublishedAgents(result.data)
			} catch (error) {
				console.error("Failed to load published agents:", error)
			} finally {
				setTabLoading(false)
			}
		} else if (activeTab === "signed") {
			// 加载已签约的任务（已匹配Agent的任务）
			try {
				setTabLoading(true)
				// 获取MATCHED, IN_PROGRESS, SUBMITTED, COMPLETED状态的任务
				const result = await jobApi.getMyPublishedJobs({
					page: 1,
					limit: 10,
				})
				// 过滤出已经分配了Agent的任务
				const signedJobs = result.data.filter(
					(job) => job.assignedAgentId !== null,
				)
				setPublishedJobs(signedJobs)
			} catch (error) {
				console.error("Failed to load signed jobs:", error)
			} finally {
				setTabLoading(false)
			}
		} else if (activeTab === "disputed") {
			// 加载争议中的任务
			try {
				setTabLoading(true)
				const result = await jobApi.getMyPublishedJobs({
					page: 1,
					limit: 10,
					status: JobStatus.DISPUTED, // DISPUTED状态的任务
				})
				setPublishedJobs(result.data)
			} catch (error) {
				console.error("Failed to load disputed jobs:", error)
			} finally {
				setTabLoading(false)
			}
		}
	}, [activeTab])

	useEffect(() => {
		loadDashboardData()
	}, [loadDashboardData])

	useEffect(() => {
		loadTabData()
	}, [loadTabData])

	// 准备饼图数据
	const getPieChartData = () => {
		if (!jobsBreakdown) return []
		return [
			{ name: "开放中", value: jobsBreakdown.open, color: "#3b82f6" },
			{ name: "已匹配", value: jobsBreakdown.matched, color: "#8b5cf6" },
			{ name: "进行中", value: jobsBreakdown.inProgress, color: "#f59e0b" },
			{ name: "已完成", value: jobsBreakdown.completed, color: "#10b981" },
			{ name: "已取消", value: jobsBreakdown.cancelled, color: "#ef4444" },
		].filter((item) => item.value > 0)
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 pt-20 pb-12 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 pt-20 pb-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Dashboard 仪表板</h1>
					<p className="mt-2 text-gray-600">查看您的活动统计和性能指标</p>
				</div>

				{/* 6个指标卡片 */}
				{stats && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
						{/* 已发布Agent */}
						<Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardDescription className="text-blue-700">
											已发布Agent
										</CardDescription>
										<CardTitle className="text-3xl text-blue-900">
											{stats.publishedAgents}
										</CardTitle>
									</div>
									<div className="text-4xl">🤖</div>
								</div>
							</CardHeader>
						</Card>

						{/* 活跃任务 */}
						<Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardDescription className="text-green-700">
											活跃任务
										</CardDescription>
										<CardTitle className="text-3xl text-green-900">
											{stats.activeJobs}
										</CardTitle>
									</div>
									<div className="text-4xl">📋</div>
								</div>
							</CardHeader>
						</Card>

						{/* 已完成任务 */}
						<Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardDescription className="text-purple-700">
											已完成任务
										</CardDescription>
										<CardTitle className="text-3xl text-purple-900">
											{stats.completedJobs}
										</CardTitle>
									</div>
									<div className="text-4xl">✅</div>
								</div>
							</CardHeader>
						</Card>

						{/* 总收益 */}
						<Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardDescription className="text-orange-700">
											总收益
										</CardDescription>
										<CardTitle className="text-3xl text-orange-900">
											{stats.totalEarnings} ETH
										</CardTitle>
									</div>
									<div className="text-4xl">💰</div>
								</div>
							</CardHeader>
						</Card>

						{/* 进行中任务 */}
						<Card className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardDescription className="text-yellow-700">
											进行中任务
										</CardDescription>
										<CardTitle className="text-3xl text-yellow-900">
											{stats.inProgressJobs}
										</CardTitle>
									</div>
									<div className="text-4xl">⏳</div>
								</div>
							</CardHeader>
						</Card>

						{/* 争议数 */}
						<Card className="bg-gradient-to-br from-red-100 to-red-200 border-red-300">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardDescription className="text-red-700">
											争议数
										</CardDescription>
										<CardTitle className="text-3xl text-red-900">
											{stats.disputes}
										</CardTitle>
									</div>
									<div className="text-4xl">⚠️</div>
								</div>
							</CardHeader>
						</Card>
					</div>
				)}

				{/* 图表区域 */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* 收益趋势折线图 */}
					<Card>
						<CardHeader>
							<CardTitle>收益趋势</CardTitle>
							<CardDescription>最近30天累计收益</CardDescription>
						</CardHeader>
						<CardContent>
							{revenueData.length > 0 ? (
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={revenueData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="date"
											tickFormatter={(value) => {
												const date = new Date(value)
												return `${date.getMonth() + 1}/${date.getDate()}`
											}}
										/>
										<YAxis />
										<Tooltip
											formatter={(value: number | string | undefined) =>
												`${Number(value || 0).toFixed(4)} ETH`
											}
											labelFormatter={(label) => `日期: ${label}`}
										/>
										<Legend />
										<Line
											type="monotone"
											dataKey="amount"
											stroke="#3b82f6"
											strokeWidth={2}
											name="累计收益"
											dot={{ fill: "#3b82f6" }}
										/>
									</LineChart>
								</ResponsiveContainer>
							) : (
								<div className="h-64 flex items-center justify-center text-gray-400">
									<p>暂无收益数据</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* 任务状态分布饼图 */}
					<Card>
						<CardHeader>
							<CardTitle>任务状态分布</CardTitle>
							<CardDescription>各状态任务占比</CardDescription>
						</CardHeader>
						<CardContent>
							{getPieChartData().length > 0 ? (
								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={getPieChartData()}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ name, percent }) =>
												`${name} ${((percent || 0) * 100).toFixed(0)}%`
											}
											outerRadius={80}
											dataKey="value"
										>
											{getPieChartData().map((entry) => (
												<Cell key={entry.name} fill={entry.color} />
											))}
										</Pie>
										<Tooltip />
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							) : (
								<div className="h-64 flex items-center justify-center text-gray-400">
									<p>暂无任务数据</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* 标签页列表 */}
				<Card>
					<CardHeader>
						<div className="flex space-x-4 border-b">
							<button
								type="button"
								onClick={() => setActiveTab("jobs")}
								className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
									activeTab === "jobs"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}
							>
								💼 我发布的任务
								{stats && stats.publishedAgents > 0 && (
									<span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
										{publishedJobs.length}
									</span>
								)}
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("agents")}
								className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
									activeTab === "agents"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}
							>
								👥 我发布的Agent
								{stats && stats.publishedAgents > 0 && (
									<span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs">
										{publishedAgents.length}
									</span>
								)}
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("signed")}
								className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
									activeTab === "signed"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}
							>
								📄 已签约合约
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("disputed")}
								className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
									activeTab === "disputed"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}
							>
								⚠️ 争议处理
								{stats && stats.disputes > 0 && (
									<span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
										{stats.disputes}
									</span>
								)}
							</button>
						</div>
					</CardHeader>

					<CardContent className="min-h-[300px]">
						{tabLoading ? (
							<div className="flex items-center justify-center h-64">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
							</div>
						) : (
							<>
								{/* My Published Jobs */}
								{activeTab === "jobs" && (
									<div className="space-y-4">
										{publishedJobs.length > 0 ? (
											publishedJobs.map((job) => (
												<Link
													key={job.id}
													to={`/jobs/${job.id}`}
													className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
												>
													<div className="flex items-start justify-between">
														<div>
															<h3 className="font-semibold text-gray-900">
																{job.title}
															</h3>
															<p className="text-sm text-gray-600 mt-1">
																预算: ${job.budget}
															</p>
														</div>
														<span
															className={`px-3 py-1 rounded-full text-xs font-medium ${
																job.status === "OPEN"
																	? "bg-blue-100 text-blue-700"
																	: job.status === "MATCHED"
																		? "bg-purple-100 text-purple-700"
																		: job.status === "IN_PROGRESS"
																			? "bg-yellow-100 text-yellow-700"
																			: job.status === "COMPLETED"
																				? "bg-green-100 text-green-700"
																				: "bg-gray-100 text-gray-700"
															}`}
														>
															{job.status}
														</span>
													</div>
												</Link>
											))
										) : (
											<div className="text-center py-12 text-gray-400">
												<p>暂无发布的任务</p>
												<Link
													to="/jobs/create"
													className="mt-4 inline-block text-blue-600 hover:text-blue-700"
												>
													发布新任务 →
												</Link>
											</div>
										)}
									</div>
								)}

								{/* My Published Agents */}
								{activeTab === "agents" && (
									<div className="space-y-4">
										{publishedAgents.length > 0 ? (
											publishedAgents.map((agent) => (
												<Link
													key={agent.id}
													to={`/agents/${agent.id}`}
													className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
												>
													<div className="flex items-start justify-between">
														<div>
															<h3 className="font-semibold text-gray-900">
																{agent.name}
															</h3>
															<p className="text-sm text-gray-600 mt-1">
																{agent.description}
															</p>
														</div>
														<span className="text-2xl">
															{agent.avatar || "🤖"}
														</span>
													</div>
												</Link>
											))
										) : (
											<div className="text-center py-12 text-gray-400">
												<p>暂无发布的Agent</p>
												<Link
													to="/agents/create"
													className="mt-4 inline-block text-blue-600 hover:text-blue-700"
												>
													创建新Agent →
												</Link>
											</div>
										)}
									</div>
								)}

								{/* Signed Agents - 显示已签约的任务 */}
								{activeTab === "signed" && (
									<div className="space-y-4">
										{publishedJobs.length > 0 ? (
											<>
												<div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
													<h3 className="font-semibold text-purple-900 flex items-center">
														📄 已签约合约
													</h3>
													<p className="text-sm text-purple-700 mt-1">
														以下任务已匹配Agent并开始执行
													</p>
												</div>
												{publishedJobs.map((job) => (
													<Link
														key={job.id}
														to={`/jobs/${job.id}`}
														className="block p-4 border border-purple-200 rounded-lg hover:shadow-md transition-shadow bg-purple-50/50"
													>
														<div className="flex items-start justify-between">
															<div className="flex-1">
																<h3 className="font-semibold text-gray-900">
																	{job.title}
																</h3>
																<p className="text-sm text-gray-600 mt-1">
																	预算: ${job.budget}
																</p>
																{job.assignedAgent && (
																	<div className="mt-2 flex items-center gap-2">
																		<span className="text-sm text-purple-700">
																			执行Agent:
																		</span>
																		<span className="text-sm font-medium">
																			{job.assignedAgent.avatar || "🤖"}{" "}
																			{job.assignedAgent.name}
																		</span>
																		{job.assignedAgent.rating && (
																			<span className="text-xs text-gray-500">
																				⭐{" "}
																				{Number(
																					job.assignedAgent.rating,
																				).toFixed(1)}
																			</span>
																		)}
																	</div>
																)}
															</div>
															<span
																className={`px-3 py-1 rounded-full text-xs font-medium ${
																	job.status === "MATCHED"
																		? "bg-purple-100 text-purple-700"
																		: job.status === "IN_PROGRESS"
																			? "bg-yellow-100 text-yellow-700"
																			: job.status === "SUBMITTED"
																				? "bg-orange-100 text-orange-700"
																				: job.status === "COMPLETED"
																					? "bg-green-100 text-green-700"
																					: "bg-gray-100 text-gray-700"
																}`}
															>
																{job.status}
															</span>
														</div>
													</Link>
												))}
											</>
										) : (
											<div className="text-center py-12 text-gray-400">
												<p className="text-4xl mb-4">📄</p>
												<p>暂无已签约合约</p>
												<p className="text-sm mt-2">
													发布任务并匹配Agent后将显示在这里
												</p>
											</div>
										)}
									</div>
								)}

								{/* Disputed Agents - 显示争议中的任务 */}
								{activeTab === "disputed" && (
									<div className="space-y-4">
										{publishedJobs.length > 0 ? (
											<>
												<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
													<h3 className="font-semibold text-red-900 flex items-center">
														⚠️ 争议解决中心
													</h3>
													<p className="text-sm text-red-700 mt-1">
														以下任务处于争议状态，请及时处理
													</p>
												</div>
												{publishedJobs.map((job) => (
													<Link
														key={job.id}
														to={`/jobs/${job.id}`}
														className="block p-4 border border-red-200 rounded-lg hover:shadow-md transition-shadow bg-red-50/50"
													>
														<div className="flex items-start justify-between">
															<div>
																<h3 className="font-semibold text-gray-900">
																	{job.title}
																</h3>
																<p className="text-sm text-gray-600 mt-1">
																	预算: ${job.budget}
																</p>
																{job.feedback && (
																	<p className="text-sm text-red-600 mt-2">
																		原因: {job.feedback}
																	</p>
																)}
															</div>
															<span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
																DISPUTED
															</span>
														</div>
													</Link>
												))}
											</>
										) : (
											<div className="text-center py-12 text-gray-400">
												<p className="text-4xl mb-4">⚠️</p>
												<p>暂无争议记录</p>
												<p className="text-sm mt-2">这是个好消息！</p>
											</div>
										)}
									</div>
								)}
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
