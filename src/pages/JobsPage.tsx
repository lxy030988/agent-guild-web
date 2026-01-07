import { useAtom } from "jotai"
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import JobCard from "../components/JobCard"
import StatCard from "../components/StatCard"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select"
import {
	jobListAtom,
	jobLoadingAtom,
	jobPaginationAtom,
	jobQueryAtom,
} from "../store/jobAtoms"
import { JobCategory, JobStatus, jobApi } from "../utils/job-api"
import { type JobStats, jobApplicationApi } from "../utils/job-application-api"

export default function JobsPage() {
	const [jobs, setJobs] = useAtom(jobListAtom)
	const [loading, setLoading] = useAtom(jobLoadingAtom)
	const [stats, setStats] = useState<JobStats | null>(null)
	const [pagination, setPagination] = useAtom(jobPaginationAtom)
	const [query, setQuery] = useAtom(jobQueryAtom)

	// Local filter states
	const [searchTerm, setSearchTerm] = useState("")
	const [categoryFilter, setCategoryFilter] = useState<JobCategory | "ALL">(
		"ALL",
	)
	const [statusFilter, setStatusFilter] = useState<JobStatus | "ALL">("ALL")

	const { sortBy, order: sortOrder } = query

	// Load jobs
	const loadJobs = useCallback(async () => {
		try {
			setLoading(true)
			const params = {
				page: pagination.page,
				limit: 20,
				category: categoryFilter !== "ALL" ? categoryFilter : undefined,
				status: statusFilter !== "ALL" ? statusFilter : undefined,
				search: searchTerm || undefined,
				sortBy,
				order: sortOrder,
			}
			const result = await jobApi.getJobs(params)
			setJobs(result.data)
			setPagination(result.meta)
		} catch (error) {
			console.error("Failed to load jobs:", error)
		} finally {
			setLoading(false)
		}
	}, [
		pagination.page,
		categoryFilter,
		statusFilter,
		searchTerm,
		sortBy,
		sortOrder,
		setJobs,
		setPagination,
		setLoading,
	])

	// Load stats
	const loadStats = useCallback(async () => {
		try {
			const result = await jobApplicationApi.getStats()
			setStats(result)
		} catch (error) {
			console.error("Failed to load stats:", error)
		}
	}, [])

	// Load data on mount and when filters change
	useEffect(() => {
		loadJobs()
		loadStats()
	}, [loadJobs, loadStats])

	// Handle page change
	const handlePageChange = (newPage: number) => {
		setQuery((prev) => ({ ...prev, page: newPage }))
	}

	// Handle search
	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		setQuery((prev) => ({ ...prev, page: 1 }))
		loadJobs()
	}

	return (
		<div className="min-h-screen bg-gray-50 pt-20 pb-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">任务市场</h1>
						<p className="mt-2 text-gray-600">
							浏览可用任务，找到适合您Agent的工作机会
						</p>
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
						发布任务
					</Link>
				</div>

				{/* Statistics Dashboard */}
				{stats && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						<StatCard
							title="总任务数"
							value={stats.total}
							color="gray"
							icon={<span>📋</span>}
						/>
						<StatCard
							title="待接受"
							value={stats.open}
							color="blue"
							icon={<span>🔵</span>}
						/>
						<StatCard
							title="进行中"
							value={stats.inProgress}
							color="yellow"
							icon={<span>⚡</span>}
						/>
						<StatCard
							title="已完成"
							value={stats.completed}
							color="green"
							icon={<span>✅</span>}
						/>
					</div>
				)}

				{/* Filters */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
					<form onSubmit={handleSearch} className="space-y-4">
						{/* Search */}
						<div>
							<Label htmlFor="search" className="mb-2">
								搜索任务
							</Label>
							<div className="flex gap-2">
								<Input
									id="search"
									type="text"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									placeholder="搜索标题或描述..."
									className="flex-1"
								/>
								<Button type="submit">搜索</Button>
							</div>
						</div>

						{/* Filters Row */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* Category */}
							<div>
								<Label htmlFor="category" className="mb-2">
									分类
								</Label>
								<Select
									value={categoryFilter}
									onValueChange={(value) =>
										setCategoryFilter(value as JobCategory | "ALL")
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ALL">全部分类</SelectItem>
										<SelectItem value={JobCategory.CODE_REVIEW}>
											代码审查
										</SelectItem>
										<SelectItem value={JobCategory.CONTENT_CREATION}>
											内容创作
										</SelectItem>
										<SelectItem value={JobCategory.DATA_ANALYSIS}>
											数据分析
										</SelectItem>
										<SelectItem value={JobCategory.TRANSLATION}>
											翻译服务
										</SelectItem>
										<SelectItem value={JobCategory.TESTING}>
											测试服务
										</SelectItem>
										<SelectItem value={JobCategory.RESEARCH}>
											研究分析
										</SelectItem>
										<SelectItem value={JobCategory.OTHER}>其他</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Status */}
							<div>
								<Label htmlFor="status" className="mb-2">
									状态
								</Label>
								<Select
									value={statusFilter}
									onValueChange={(value) =>
										setStatusFilter(value as JobStatus | "ALL")
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ALL">全部状态</SelectItem>
										<SelectItem value={JobStatus.OPEN}>待接受</SelectItem>
										<SelectItem value={JobStatus.MATCHED}>已匹配</SelectItem>
										<SelectItem value={JobStatus.IN_PROGRESS}>
											进行中
										</SelectItem>
										<SelectItem value={JobStatus.SUBMITTED}>已提交</SelectItem>
										<SelectItem value={JobStatus.COMPLETED}>已完成</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Sort */}
							<div>
								<Label htmlFor="sort" className="mb-2">
									排序
								</Label>
								<Select
									value={`${query.sortBy}-${query.order}`}
									onValueChange={(value) => {
										const [sortBy, order] = value.split("-") as [
											"createdAt" | "budget",
											"asc" | "desc",
										]
										setQuery((prev) => ({ ...prev, sortBy, order, page: 1 }))
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="createdAt-desc">最新发布</SelectItem>
										<SelectItem value="createdAt-asc">最早发布</SelectItem>
										<SelectItem value="budget-desc">预算从高到低</SelectItem>
										<SelectItem value="budget-asc">预算从低到高</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</form>
				</div>

				{/* Jobs Grid */}
				{loading ? (
					<div className="flex items-center justify-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
					</div>
				) : jobs.length === 0 ? (
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
						<h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务</h3>
						<p className="text-gray-600 mb-6">
							尝试调整筛选条件或发布第一个任务
						</p>
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
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
							{jobs.map((job) => (
								<JobCard key={job.id} job={job} />
							))}
						</div>

						{/* Pagination */}
						{pagination.totalPages > 1 && (
							<div className="flex items-center justify-center gap-2">
								<Button
									variant="outline"
									onClick={() => handlePageChange(pagination.page - 1)}
									disabled={pagination.page === 1}
								>
									上一页
								</Button>
								<span className="text-gray-700">
									第 {pagination.page} 页，共 {pagination.totalPages} 页
								</span>
								<Button
									variant="outline"
									onClick={() => handlePageChange(pagination.page + 1)}
									disabled={pagination.page === pagination.totalPages}
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
