import type { AgentListQuery } from "@/types/agent"

const DEFAULT_PAGE = 1

const parseNumber = (value: string | null): number | undefined => {
	if (!value) {
		return undefined
	}
	const parsed = Number(value)
	return Number.isNaN(parsed) ? undefined : parsed
}

const parseBoolean = (value: string | null): boolean | undefined => {
	if (!value) {
		return undefined
	}
	return value === "true"
}

export const parseAgentListQuery = (
	params: URLSearchParams,
	defaultLimit: number,
): AgentListQuery => {
	const page = parseNumber(params.get("page")) ?? DEFAULT_PAGE
	const limit = parseNumber(params.get("limit")) ?? defaultLimit

	return {
		category: (params.get("category") as AgentListQuery["category"]) || undefined,
		tags: params.get("tags") || undefined,
		search: params.get("search") || undefined,
		status: (params.get("status") as AgentListQuery["status"]) || undefined,
		sortBy: (params.get("sortBy") as AgentListQuery["sortBy"]) || undefined,
		order: (params.get("order") as AgentListQuery["order"]) || undefined,
		verifiedOnly: parseBoolean(params.get("verifiedOnly")),
		page: page < 1 ? DEFAULT_PAGE : page,
		limit: limit <= 0 ? defaultLimit : limit,
	}
}

export const serializeAgentListQuery = (
	query: AgentListQuery,
): URLSearchParams => {
	const params = new URLSearchParams()

	if (query.category) {
		params.set("category", query.category)
	}
	if (query.tags) {
		params.set("tags", query.tags)
	}
	if (query.search) {
		params.set("search", query.search)
	}
	if (query.status) {
		params.set("status", query.status)
	}
	if (query.sortBy) {
		params.set("sortBy", query.sortBy)
	}
	if (query.order) {
		params.set("order", query.order)
	}
	if (query.verifiedOnly !== undefined) {
		params.set("verifiedOnly", String(query.verifiedOnly))
	}
	if (query.page > DEFAULT_PAGE) {
		params.set("page", String(query.page))
	}
	if (query.limit) {
		params.set("limit", String(query.limit))
	}

	return params
}

export const mergeAgentListQuery = (
	current: AgentListQuery,
	updates: Partial<AgentListQuery>,
): AgentListQuery => {
	return {
		...current,
		...updates,
		page: updates.page ?? current.page,
		limit: updates.limit ?? current.limit,
	}
}
