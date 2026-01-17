import type { AgentListQuery } from "@/types/agent"

export const buildAgentQueryParams = (query: AgentListQuery) => {
	const params: Record<string, string | number> = {
		page: query.page,
		limit: query.limit,
	}

	if (query.category) {
		params.category = query.category
	}
	if (query.location) {
		params.location = query.location
	}
	if (query.minRating !== undefined) {
		params.minRating = query.minRating
	}
	if (query.minPrice !== undefined) {
		params.minPrice = query.minPrice
	}
	if (query.maxPrice !== undefined) {
		params.maxPrice = query.maxPrice
	}
	if (query.sortBy) {
		params.sortBy = query.sortBy
	}
	if (query.sortOrder) {
		params.sortOrder = query.sortOrder
	}
	if (query.search) {
		params.search = query.search
	}

	return params
}
