import type { AgentListQuery } from "@/types/agent"

const DEFAULT_PAGE = 1

const parseNumber = (value: string | null): number | undefined => {
	if (!value) {
		return undefined
	}
	const parsed = Number(value)
	return Number.isNaN(parsed) ? undefined : parsed
}

export const parseAgentListQuery = (
	params: URLSearchParams,
	defaultLimit: number,
): AgentListQuery => {
	const page = parseNumber(params.get("page")) ?? DEFAULT_PAGE
	const limit = parseNumber(params.get("limit")) ?? defaultLimit

	return {
		category: params.get("category") || undefined,
		location: params.get("location") || undefined,
		minRating: parseNumber(params.get("minRating")),
		minPrice: parseNumber(params.get("minPrice")),
		maxPrice: parseNumber(params.get("maxPrice")),
		sortBy: (params.get("sortBy") as AgentListQuery["sortBy"]) || undefined,
		sortOrder:
			(params.get("sortOrder") as AgentListQuery["sortOrder"]) || undefined,
		search: params.get("search") || undefined,
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
	if (query.location) {
		params.set("location", query.location)
	}
	if (query.minRating !== undefined) {
		params.set("minRating", String(query.minRating))
	}
	if (query.minPrice !== undefined) {
		params.set("minPrice", String(query.minPrice))
	}
	if (query.maxPrice !== undefined) {
		params.set("maxPrice", String(query.maxPrice))
	}
	if (query.sortBy) {
		params.set("sortBy", query.sortBy)
	}
	if (query.sortOrder) {
		params.set("sortOrder", query.sortOrder)
	}
	if (query.search) {
		params.set("search", query.search)
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
