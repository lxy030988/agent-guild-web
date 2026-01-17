import {
	mergeAgentListQuery,
	parseAgentListQuery,
	serializeAgentListQuery,
} from "@/utils/agentFilters"
import { buildAgentQueryParams } from "@/utils/agentQuery"

const DEFAULT_LIMIT = 12

describe("agentFilters", () => {
	it("parses search params into query defaults", () => {
		const params = new URLSearchParams({
			category: "Design",
			minRating: "4.5",
			page: "2",
			limit: "20",
			search: "prototype",
		})

		const query = parseAgentListQuery(params, DEFAULT_LIMIT)

		expect(query).toEqual({
			category: "Design",
			location: undefined,
			minRating: 4.5,
			minPrice: undefined,
			maxPrice: undefined,
			sortBy: undefined,
			sortOrder: undefined,
			search: "prototype",
			page: 2,
			limit: 20,
		})
	})

	it("serializes query back to search params", () => {
		const query = {
			category: "Engineering",
			location: "Berlin",
			minRating: 4,
			minPrice: 100,
			maxPrice: 500,
			sortBy: "rating",
			sortOrder: "desc",
			search: "agent",
			page: 3,
			limit: 12,
		}

		const params = serializeAgentListQuery(query)

		expect(params.get("category")).toBe("Engineering")
		expect(params.get("location")).toBe("Berlin")
		expect(params.get("minRating")).toBe("4")
		expect(params.get("minPrice")).toBe("100")
		expect(params.get("maxPrice")).toBe("500")
		expect(params.get("sortBy")).toBe("rating")
		expect(params.get("sortOrder")).toBe("desc")
		expect(params.get("search")).toBe("agent")
		expect(params.get("page")).toBe("3")
		expect(params.get("limit")).toBe("12")
	})

	it("merges query updates safely", () => {
		const query = {
			page: 1,
			limit: 12,
			search: "design",
		}

		const merged = mergeAgentListQuery(query, { page: 2 })

		expect(merged).toEqual({
			page: 2,
			limit: 12,
			search: "design",
		})
	})

	it("builds api params without undefined values", () => {
		const params = buildAgentQueryParams({
			page: 1,
			limit: 12,
			category: "Strategy",
			location: "Seoul",
			minRating: 4.5,
			minPrice: 0,
			maxPrice: 500,
			sortBy: "reviews",
			sortOrder: "desc",
			search: "ops",
		})

		expect(params).toEqual({
			page: 1,
			limit: 12,
			category: "Strategy",
			location: "Seoul",
			minRating: 4.5,
			minPrice: 0,
			maxPrice: 500,
			sortBy: "reviews",
			sortOrder: "desc",
			search: "ops",
		})
	})
})
