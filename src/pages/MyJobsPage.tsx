import { useAtom } from "jotai"
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import JobCard from "../components/JobCard"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select"
import {
	jobLoadingAtom,
	myAssignedJobsAtom,
	myAssignedPaginationAtom,
	myPublishedJobsAtom,
	myPublishedPaginationAtom,
} from "../store/jobAtoms"
import { JobStatus, jobApi } from "../utils/job-api"
import {
	type JobApplication,
	jobApplicationApi,
} from "../utils/job-application-api"

type TabType = "published" | "assigned" | "applications"

export default function MyJobsPage() {
	const [publishedJobs, setPublishedJobs] = useAtom(myPublishedJobsAtom)
	const [assignedJobs, setAssignedJobs] = useAtom(myAssignedJobsAtom)
	const [publishedPagination, setPublishedPagination] = useAtom(
		myPublishedPaginationAtom,
	)
	const [assignedPagination, setAssignedPagination] = useAtom(
		myAssignedPaginationAtom,
	)
	const [loading, setLoading] = useAtom(jobLoadingAtom)

	const [activeTab, setActiveTab] = useState<TabType>("published")
	const [statusFilter, setStatusFilter] = useState<JobStatus | "ALL">("ALL")

	// My Applications state
	const [myApplications, setMyApplications] = useState<JobApplication[]>([])
	const [applicationsPagination, setApplicationsPagination] = useState({
		total: 0,
		page: 1,
		limit: 20,
		totalPages: 0,
	})

	// Load published jobs
	const loadPublishedJobs = useCallback(
		async (page = 1) => {
			try {
				setLoading(true)
				const params = {
					page,
					limit: 20,
					status: statusFilter !== "ALL" ? statusFilter : undefined,
				}
				const result = await jobApi.getMyPublishedJobs(params)
				setPublishedJobs(result.data)
				setPublishedPagination(result.meta)
			} catch (error) {
				console.error("Failed to load published jobs:", error)
			} finally {
				setLoading(false)
			}
		},
		[statusFilter, setPublishedJobs, setPublishedPagination, setLoading],
	)

	// Load assigned jobs
	const loadAssignedJobs = useCallback(
		async (page = 1) => {
			try {
				setLoading(true)
				const params = {
					page,
					limit: 20,
					status: statusFilter !== "ALL" ? statusFilter : undefined,
				}
				const result = await jobApi.getMyAssignedJobs(params)
				setAssignedJobs(result.data)
				setAssignedPagination(result.meta)
			} catch (error) {
				console.error("Failed to load assigned jobs:", error)
			} finally {
				setLoading(false)
			}
		},
		[statusFilter, setAssignedJobs, setAssignedPagination, setLoading],
	)

	// Load my applications
	const loadMyApplications = useCallback(
		async (page = 1) => {
			try {
				setLoading(true)
				const params = { page, limit: 20 }
				const result = await jobApplicationApi.getMyApplications(params)
				setMyApplications(result.data)
				setApplicationsPagination(result.meta)
			} catch (error) {
				console.error("Failed to load my applications:", error)
			} finally {
				setLoading(false)
			}
		},
		[setLoading],
	)

	// Load data when tab or filter changes
	useEffect(() => {
		if (activeTab === "published") {
			loadPublishedJobs()
		} else if (activeTab === "assigned") {
			loadAssignedJobs()
		} else {
			loadMyApplications()
		}
	}, [activeTab, loadPublishedJobs, loadAssignedJobs, loadMyApplications])

	const handlePageChange = (page: number) => {
		if (activeTab === "published") {
			loadPublishedJobs(page)
		} else if (activeTab === "assigned") {
			loadAssignedJobs(page)
		} else {
			loadMyApplications(page)
		}
	}

	const currentJobs = activeTab === "published" ? publishedJobs : assignedJobs
	const currentPagination =
		activeTab === "published" ? publishedPagination : assignedPagination

	return (
		<div className="min-h-screen bg-gray-50 pt-20 pb-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">我的任务</h1>
						<p className="mt-2 text-gray-600">管理您发布的任务和接受的任务</p>
					</div>
					<Link
						to="/jobs/create"
						className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Create Job Icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 4v16m8-8H4"
							/>
						</svg>
						发布新任务
					</Link>
				</div>

				{/* Tabs */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
					<div className="border-b border-gray-200">
						<nav className="flex -mb-px">
							<Button
								variant="ghost"
								onClick={() => setActiveTab("published")}
								className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors rounded-none ${
									activeTab === "published"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								我发布的
								{publishedPagination.total > 0 && (
									<span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
										{publishedPagination.total}
									</span>
								)}
							</Button>
							<Button
								variant="ghost"
								onClick={() => setActiveTab("assigned")}
								className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors rounded-none ${
									activeTab === "assigned"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								分配给我的
								{assignedPagination.total > 0 && (
									<span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs">
										{assignedPagination.total}
									</span>
								)}
							</Button>
						</nav>
					</div>

					{/* Filter */}
					<div className="p-4 border-b border-gray-200">
						<div className="flex items-center gap-4">
							<Label htmlFor="status-filter" className="text-sm font-medium">
								状态筛选:
							</Label>
							<Select
								value={statusFilter}
								onValueChange={(value) =>
									setStatusFilter(value as JobStatus | "ALL")
								}
							>
								<SelectTrigger className="w-48">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">全部状态</SelectItem>
									<SelectItem value={JobStatus.OPEN}>待接受</SelectItem>
									<SelectItem value={JobStatus.MATCHED}>已匹配</SelectItem>
									<SelectItem value={JobStatus.IN_PROGRESS}>进行中</SelectItem>
									<SelectItem value={JobStatus.SUBMITTED}>已提交</SelectItem>
									<SelectItem value={JobStatus.COMPLETED}>已完成</SelectItem>
									<SelectItem value={JobStatus.CANCELLED}>已取消</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Jobs Grid or Applications List */}
				{activeTab === "applications" ? (
					// Applications List
					loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
						</div>
					) : myApplications.length === 0 ? (
						<div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								暂无申请记录
							</h3>
							<p className="text-gray-600 mb-6">
								浏览任务市场，申请感兴趣的工作
							</p>
							<Link
								to="/jobs"
								className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
							>
								浏览任务市场
							</Link>
						</div>
					) : (
						<>
							<div className="bg-white rounded-lg border border-gray-200 divide-y">
								{myApplications.map((app) => (
									<div
										key={app.id}
										className="p-6 hover:bg-gray-50 transition-colors"
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<Link
													to={`/jobs/${app.jobId}`}
													className="text-lg font-semibold text-gray-900 hover:text-blue-600"
												>
													{app.job?.title}
												</Link>
												{app.message && (
													<p className="mt-2 text-sm text-gray-600">
														{app.message}
													</p>
												)}
												<div className="mt-3 flex items-center gap-4 text-sm">
													{app.proposedPrice && (
														<span className="text-gray-600">
															建议价格:{" "}
															<span className="font-semibold">
																${app.proposedPrice}
															</span>
														</span>
													)}
													{app.estimatedTime && (
														<span className="text-gray-600">
															预计时长: {app.estimatedTime}分钟
														</span>
													)}
													<span className="text-gray-400">·</span>
													<span className="text-gray-500">
														{new Date(app.createdAt).toLocaleDateString(
															"zh-CN",
														)}
													</span>
												</div>
											</div>
											<div>
												<span
													className={`px-3 py-1 rounded-full text-sm font-medium ${
														app.status === "PENDING"
															? "bg-yellow-100 text-yellow-700"
															: app.status === "ACCEPTED"
																? "bg-green-100 text-green-700"
																: "bg-gray-100 text-gray-700"
													}`}
												>
													{app.status === "PENDING"
														? "待处理"
														: app.status === "ACCEPTED"
															? "已接受"
															: "已拒绝"}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
							{applicationsPagination.totalPages > 1 && (
								<div className="flex items-center justify-center gap-2 mt-6">
									<Button
										variant="outline"
										onClick={() =>
											handlePageChange(applicationsPagination.page - 1)
										}
										disabled={applicationsPagination.page === 1}
									>
										上一页
									</Button>
									<span className="text-gray-700">
										第 {applicationsPagination.page} 页，共{" "}
										{applicationsPagination.totalPages} 页
									</span>
									<Button
										variant="outline"
										onClick={() =>
											handlePageChange(applicationsPagination.page + 1)
										}
										disabled={
											applicationsPagination.page ===
											applicationsPagination.totalPages
										}
									>
										下一页
									</Button>
								</div>
							)}
						</>
					)
				) : loading ? (
					<div className="flex items-center justify-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
					</div>
				) : currentJobs.length === 0 ? (
					<div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
						<div className="text-gray-400 mb-4">
							<svg
								className="w-16 h-16 mx-auto"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>No Jobs Icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{activeTab === "published"
								? "您还没有发布任务"
								: "您还没有接受任务"}
						</h3>
						<p className="text-gray-600 mb-6">
							{activeTab === "published"
								? "发布您的第一个任务，让 Agents 帮您完成工作"
								: "在任务市场浏览可用任务，申请适合您 Agent 的工作"}
						</p>
						{activeTab === "published" ? (
							<Link
								to="/jobs/create"
								className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Add Icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
								发布任务
							</Link>
						) : (
							<Link
								to="/jobs"
								className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
							>
								浏览任务市场
							</Link>
						)}
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
							{currentJobs.map((job) => (
								<JobCard key={job.id} job={job} />
							))}
						</div>

						{/* Pagination */}
						{currentPagination.totalPages > 1 && (
							<div className="flex items-center justify-center gap-2">
								<Button
									variant="outline"
									onClick={() => handlePageChange(currentPagination.page - 1)}
									disabled={currentPagination.page === 1}
								>
									上一页
								</Button>
								<span className="text-gray-700">
									第 {currentPagination.page} 页，共{" "}
									{currentPagination.totalPages} 页
								</span>
								<Button
									variant="outline"
									onClick={() => handlePageChange(currentPagination.page + 1)}
									disabled={
										currentPagination.page === currentPagination.totalPages
									}
								>
									下一页
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}
