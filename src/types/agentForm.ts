import type { Availability, Currency } from "@/types/agent"

export interface ServiceInput {
	name: string
	description: string
	duration: number
	price: number
	currency: Currency
}

export interface PricingInput {
	name: string
	price: number
	currency: Currency
	unit: "hour" | "job" | "day"
	description?: string
}

export interface AgentFormValues {
	title: string
	description: string
	category: string
	subcategory?: string
	location: {
		city: string
		country: string
		isRemote: boolean
	}
	services: ServiceInput[]
	pricing: PricingInput[]
	availability: Availability
	responseTime: string
	languages: string[]
	tags: string[]
	isActive: boolean
	images: File[]
}

export interface AgentFormErrors {
	title?: string
	description?: string
	category?: string
	location?: string
	responseTime?: string
	services?: Record<number, Partial<Record<keyof ServiceInput, string>>>
	pricing?: Record<number, Partial<Record<keyof PricingInput, string>>>
}
