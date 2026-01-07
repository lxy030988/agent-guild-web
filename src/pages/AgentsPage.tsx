import { useAtom } from "jotai"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AgentCard } from "../components/AgentCard"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import {
	agentListAtom,
	agentListLoadingAtom,
	agentQueryParamsAtom,
	agentTotalAtom,
	allTagsAtom,
	categoryStatsAtom,
	searchKeywordAtom,
	selectedCategoryAtom,
} from "../store/agentAtoms"
import { AgentCategory, agentApi } from "../utils/agent-api"

/**
 * Agent 列表页面
 */
export const AgentsPage: React.FC = () => {
	const navigate = useNavigate()
	const [agents, setAgents] = useAtom(agentListAtom)
	const [loading, setLoading] = useAtom(agentListLoadingAtom)
	const [total, setTotal] = useAtom(agentTotalAtom)
	const [queryParams, setQueryParams] = useAtom(agentQueryParamsAtom)
	const [selectedCategory, setSelectedCategory] = useAtom(selectedCategoryAtom)
	const [searchKeyword, setSearchKeyword] = useAtom(searchKeywordAtom)
	const [allTags, setAllTags] = useAtom(allTagsAtom)
	const [categoryStats, setCategoryStats] = useAtom(categoryStatsAtom)

	const [selectedTags, setSelectedTags] = useState<string[]>([])

	/**
	 * 加载 Agents
	 */
	const loadAgents = useCallback(async () => {
		setLoading(true)
		try {
			const params = {
				...queryParams,
				category: selectedCategory || undefined,
				search: searchKeyword || undefined,
				tags: selectedTags.length > 0 ? selectedTags.join(",") : undefined,
			}

			const response = await agentApi.getAgents(params)
			setAgents(response.data)
			setTotal(response.meta.total)
		} catch (error) {
			console.error("Failed to load agents:", error)
		} finally {
			setLoading(false)
		}
	}, [
		queryParams,
		selectedCategory,
		searchKeyword,
		selectedTags,
		setAgents,
		setLoading,
		setTotal,
	])

	/**
	 * 加载标签列表
	 */
	const loadTags = useCallback(async () => {
		try {
			const response = await agentApi.getAllTags()
			setAllTags(response.tags)
		} catch (error) {
			console.error("Failed to load tags:", error)
		}
	}, [setAllTags])

	/**
	 * 加载分类统计
	 */
	const loadCategoryStats = useCallback(async () => {
		try {
			const stats = await agentApi.getCategoryStats()
			setCategoryStats(stats)
		} catch (error) {
			console.error("Failed to load category stats:", error)
		}
	}, [setCategoryStats])

	/**
	 * 初始加载
	 */
	useEffect(() => {
		loadAgents()
		loadTags()
		loadCategoryStats()
	}, [loadAgents, loadTags, loadCategoryStats])

	/**
	 * 筛选条件变化时重新加载
	 */
	useEffect(() => {
		loadAgents()
	}, [loadAgents])

	/**
	 * 分页处理
	 */
	const handlePageChange = (newPage: number) => {
		setQueryParams({ ...queryParams, page: newPage })
	}

	/**
	 * 分类筛选
	 */
	const handleCategoryFilter = (category: AgentCategory | null) => {
		setSelectedCategory(category)
		setQueryParams({ ...queryParams, page: 1 })
	}

	/**
	 * 搜索处理
	 */
	const handleSearch = (keyword: string) => {
		setSearchKeyword(keyword)
		setQueryParams({ ...queryParams, page: 1 })
	}

	/**
	 * 排序处理
	 */
	const handleSort = (
		sortBy: "createdAt" | "viewCount" | "rating" | "jobCount",
		order: "asc" | "desc",
	) => {
		setQueryParams({ ...queryParams, sortBy, order, page: 1 })
	}

	const totalPages = Math.ceil(total / (queryParams.limit || 20))

	return (
		<div className="min-h-screen bg-gray-50">
			{/* 顶部搜索栏 */}
			<div className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between mb-6">
						<h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
						<Button onClick={() => navigate("/agents/create")}>
							Create Agent
						</Button>
					</div>

					{/* 搜索框 */}
					<div className="relative">
						<input
							type="text"
							placeholder="Search agents..."
							value={searchKeyword}
							onChange={(e) => handleSearch(e.target.value)}
							className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
						/>
						<svg
							className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<title>Search Icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex gap-8">
					{/* 侧边栏筛选 */}
					<aside className="w-64 flex-shrink-0">
						<Card className="p-6">
							{/* 分类筛选 */}
							<div className="mb-6">
								<h3 className="text-sm font-semibold text-gray-900 mb-3">
									Category
								</h3>
								<div className="space-y-2">
									<Button
										type="button"
										variant={!selectedCategory ? "secondary" : "ghost"}
										onClick={() => handleCategoryFilter(null)}
										className="w-full justify-start"
									>
										All ({total})
									</Button>
									{Object.values(AgentCategory).map((category) => (
										<Button
											type="button"
											key={category}
											variant={
												selectedCategory === category ? "secondary" : "ghost"
											}
											onClick={() => handleCategoryFilter(category)}
											className="w-full justify-start"
										>
											{category.replace(/_/g, " ")} (
											{categoryStats[category] || 0})
										</Button>
									))}
								</div>
							</div>

							{/* 标签筛选 */}
							{(allTags || []).length > 0 && (
								<div>
									<h3 className="text-sm font-semibold text-gray-900 mb-3">
										Tags
									</h3>
									<div className="flex flex-wrap gap-2">
										{(allTags || []).map((tag) => (
											<Button
												type="button"
												key={tag}
												size="sm"
												variant={
													selectedTags.includes(tag) ? "default" : "outline"
												}
												onClick={() => {
													if (selectedTags.includes(tag)) {
														setSelectedTags(
															selectedTags.filter((t) => t !== tag),
														)
													} else {
														setSelectedTags([...selectedTags, tag])
													}
												}}
												className="rounded-full"
											>
												{tag}
											</Button>
										))}
									</div>
								</div>
							)}
						</Card>
					</aside>

					{/* 主内容区 */}
					<main className="flex-1">
						{/* 工具栏 */}
						<div className="flex items-center justify-between mb-6">
							<p className="text-sm text-gray-600">
								Showing {(agents || []).length} of {total} agents
							</p>

							{/* 排序 */}
							<select
								value={`${queryParams.sortBy}-${queryParams.order}`}
								onChange={(e) => {
									const [sortBy, order] = e.target.value.split("-") as [
										"createdAt" | "viewCount" | "rating" | "jobCount",
										"asc" | "desc",
									]
									handleSort(sortBy, order)
								}}
								className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							>
								<option value="createdAt-desc">Latest</option>
								<option value="viewCount-desc">Most Viewed</option>
								<option value="rating-desc">Top Rated</option>
								<option value="jobCount-desc">Most Active</option>
							</select>
						</div>

						{/* Agent 列表 */}
						{loading ? (
							<div className="flex justify-center items-center py-12">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
							</div>
						) : (agents || []).length === 0 ? (
							<div className="text-center py-12">
								<p className="text-gray-500">No agents found</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{agents.map((agent) => (
									<AgentCard key={agent.id} agent={agent} />
								))}
							</div>
						)}

						{/* 分页 */}
						{totalPages > 1 && (
							<div className="flex justify-center items-center gap-2 mt-8">
								<Button
									type="button"
									variant="outline"
									onClick={() => handlePageChange((queryParams.page || 1) - 1)}
									disabled={queryParams.page === 1}
								>
									Previous
								</Button>

								{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
									const page = i + 1
									return (
										<Button
											type="button"
											key={page}
											variant={
												queryParams.page === page ? "default" : "outline"
											}
											onClick={() => handlePageChange(page)}
										>
											{page}
										</Button>
									)
								})}

								<Button
									type="button"
									variant="outline"
									onClick={() => handlePageChange((queryParams.page || 1) + 1)}
									disabled={queryParams.page === totalPages}
								>
									Next
								</Button>
							</div>
						)}
					</main>
				</div>
			</div>
		</div>
	)
}

export default AgentsPage
