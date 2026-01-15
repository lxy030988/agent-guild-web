export interface Location {
	city: string
	country: string
	coordinates?: {
		lat: number
		lng: number
	}
	isRemote: boolean
}

export interface TimeSlot {
	start: string
	end: string
}

export interface WeeklySchedule {
	monday: TimeSlot[]
	tuesday: TimeSlot[]
	wednesday: TimeSlot[]
	thursday: TimeSlot[]
	friday: TimeSlot[]
	saturday: TimeSlot[]
	sunday: TimeSlot[]
}

export interface DateException {
	date: string
	slots?: TimeSlot[]
	isAvailable: boolean
}

export interface Availability {
	timezone: string
	schedule: WeeklySchedule
	exceptions?: DateException[]
}

export type Currency = "USD" | "ETH"

export interface Pricing {
	id: number
	name: string
	price: number
	currency: Currency
	unit: "hour" | "job" | "day"
	description?: string
}

export interface Service {
	id: number
	name: string
	description: string
	duration: number
	price: number
	currency: Currency
}

export interface Agent {
	id: number
	userId: number
	title: string
	description: string
	category: string
	subcategory?: string
	location: Location
	services: Service[]
	pricing: Pricing[]
	availability: Availability
	rating: number
	reviewCount: number
	completedJobs: number
	responseTime: string
	languages: string[]
	tags: string[]
	isActive: boolean
	createdAt: string
	updatedAt: string
	user?: {
		id: number
		name?: string
		avatar?: string
	}
}

export type AgentSortBy = "rating" | "price" | "reviews" | "created"

export type SortOrder = "asc" | "desc"

export interface AgentFilters {
	category?: string
	location?: string
	minRating?: number
	minPrice?: number
	maxPrice?: number
	sortBy?: AgentSortBy
	sortOrder?: SortOrder
	search?: string
}

export interface AgentListQuery extends AgentFilters {
	page: number
	limit: number
}

export interface AgentListResponse {
	data: Agent[]
	total: number
	page: number
	limit: number
}

export interface CreateAgentDTO {
	title: string
	description: string
	category: string
	subcategory?: string
	location: Location
	services: Omit<Service, "id">[]
	pricing: Omit<Pricing, "id">[]
	availability: Availability
	responseTime: string
	languages: string[]
	tags: string[]
	isActive: boolean
}

export type UpdateAgentDTO = Partial<CreateAgentDTO>
