import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { AgentFilters, AgentGrid } from "@/components/agent"
import { EmptyState, Pagination, SearchBar } from "@/components/common"
import { Button } from "@/components/ui/button"
import { useAgents } from "@/hooks/useAgents"
import type {
	AgentFilters as AgentFiltersState,
	AgentListQuery,
} from "@/types/agent"
import {
	mergeAgentListQuery,
	parseAgentListQuery,
	serializeAgentListQuery,
} from "@/utils/agentFilters"

const DEFAULT_LIMIT = 12
const CATEGORY_OPTIONS = [
	"Strategy",
	"Design",
	"Engineering",
	"Growth",
	"Operations",
	"Research",
]

const AgentsPage = () => {
	const [searchParams, setSearchParams] = useSearchParams()

	const query = useMemo(
		() => parseAgentListQuery(searchParams, DEFAULT_LIMIT),
		[searchParams],
	)

	const { data, isLoading, isFetching, error, refetch } = useAgents(query)

	const updateQuery = (updates: Partial<AgentListQuery>) => {
		const nextQuery = mergeAgentListQuery(query, updates)
		setSearchParams(serializeAgentListQuery(nextQuery))
	}

	const handleFiltersChange = (filters: AgentFiltersState) => {
		updateQuery({ ...filters, page: 1 })
	}

	const handleSearch = (value: string) => {
		updateQuery({ search: value || undefined, page: 1 })
	}

	const handleReset = () => {
		setSearchParams(
			serializeAgentListQuery({
				page: 1,
				limit: DEFAULT_LIMIT,
			}),
		)
	}

	const agents = data?.data?.data ?? []
	const total = data?.total ?? 0

	return (
		<section className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-10">
			<div className="flex flex-col gap-2">
				<p className="text-sm font-semibold text-muted-foreground">
					Agent Marketplace
				</p>
				<h1 className="text-3xl font-bold text-foreground">
					发现你的下一位代理人
				</h1>
				<p className="text-sm text-muted-foreground">
					浏览经过验证的专家代理人，支持搜索、筛选和快速对比。
				</p>
			</div>

			<div className="flex justify-between">
				<SearchBar
					key={query.search ?? ""}
					className="max-w-xl min-w-xl"
					placeholder="搜索技能、服务或代理人"
					defaultValue={query.search ?? ""}
					onSearch={handleSearch}
				/>
				<Button
					asChild
					className="rounded-full px-7 premium-gradient shadow-glow hover:scale-105 transition-transform border-none font-bold"
				>
					<Link to="/agents/create">Upload Agent</Link>
				</Button>
			</div>

			<AgentFilters
				filters={query}
				categories={CATEGORY_OPTIONS}
				loading={isLoading}
				onChange={handleFiltersChange}
				onReset={handleReset}
			/>

			{error ? (
				<EmptyState
					title="加载失败"
					description="无法加载代理人列表，请稍后重试。"
					action={{ label: "重新加载", onClick: () => refetch() }}
				/>
			) : agents.length === 0 && !isLoading ? (
				<EmptyState
					title="暂无代理人"
					description="尝试调整筛选条件或清空搜索关键词。"
					action={{ label: "清空筛选", onClick: handleReset }}
				/>
			) : (
				<div className="flex flex-col gap-6">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							共 {total} 位代理人
							{isFetching && " · 更新中"}
						</p>
					</div>
					<AgentGrid agents={agents} loading={isLoading} />
					<Pagination
						total={total}
						current={query.page}
						pageSize={query.limit}
						onChange={(page) => updateQuery({ page })}
					/>
				</div>
			)}
		</section>
	)
}

export default AgentsPage
