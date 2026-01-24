export interface Review {
	id: number
	bookingId: number
	reviewerId: number
	revieweeId: number
	rating: number
	comment: string
	response?: string
	isPublic: boolean
	createdAt: string
	updatedAt: string
	reviewer?: {
		id: number
		name?: string
		avatar?: string
	}
}

export interface RatingSummary {
	average: number
	total: number
	distribution: Record<number, number>
}

export interface ReviewListResponse {
	data: Review[]
	total: number
	summary: RatingSummary
}
