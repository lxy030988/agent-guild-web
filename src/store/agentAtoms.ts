import { atom } from "jotai"
import type { Agent, AgentListQuery, CategoryStats } from "@/types/agent"
import { AgentCategory, AgentStatus } from "@/types/agent"

/**
 * Agent 列表状态
 */
export const agentListAtom = atom<Agent[]>([])

/**
 * Agent 列表加载状态
 */
export const agentListLoadingAtom = atom<boolean>(false)

/**
 * Agent 总数
 */
export const agentTotalAtom = atom<number>(0)

/**
 * 当前选中的 Agent
 */
export const selectedAgentAtom = atom<Agent | null>(null)

/**
 * Agent 详情加载状态
 */
export const agentDetailLoadingAtom = atom<boolean>(false)

/**
 * 查询参数
 */
export const agentQueryParamsAtom = atom<AgentListQuery>({
	page: 1,
	limit: 20,
	sortBy: "createdAt",
	order: "desc",
	status: AgentStatus.ACTIVE,
})

/**
 * 分类筛选
 */
export const selectedCategoryAtom = atom<AgentCategory | null>(null)

/**
 * 标签筛选
 */
export const selectedTagsAtom = atom<string[]>([])

/**
 * 搜索关键词
 */
export const searchKeywordAtom = atom<string>("")

/**
 * 分类统计
 */
export const categoryStatsAtom = atom<CategoryStats>({})

/**
 * 所有标签列表
 */
export const allTagsAtom = atom<string[]>([])

/**
 * 精选 Agents
 */
export const featuredAgentsAtom = atom<Record<AgentCategory, Agent[]>>({
	[AgentCategory.PRODUCTIVITY_TOOLS]: [],
	[AgentCategory.CREATIVE_ASSISTANTS]: [],
	[AgentCategory.DEVELOPER_TOOLS]: [],
	[AgentCategory.OTHERS]: [],
})

/**
 * 热门 Agents
 */
export const popularAgentsAtom = atom<Agent[]>([])

/**
 * 用户的 Agents（我的 Agents）
 */
export const myAgentsAtom = atom<Agent[]>([])
