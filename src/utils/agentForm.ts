import type {
	Agent,
	Availability,
	CreateAgentDTO,
	TimeSlot,
	WeeklySchedule,
} from "@/types/agent"
import type { AgentFormErrors, AgentFormValues } from "@/types/agentForm"

const createEmptySchedule = (): WeeklySchedule => ({
	monday: [],
	tuesday: [],
	wednesday: [],
	thursday: [],
	friday: [],
	saturday: [],
	sunday: [],
})

const normalizeSlot = (slot: TimeSlot): TimeSlot => ({
	start: slot.start.trim(),
	end: slot.end.trim(),
})

export const createEmptyAvailability = (): Availability => ({
	timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
	schedule: createEmptySchedule(),
})

export const createEmptyAgentForm = (): AgentFormValues => ({
	title: "",
	description: "",
	category: "",
	subcategory: "",
	location: {
		city: "",
		country: "",
		isRemote: true,
	},
	services: [
		{
			name: "",
			description: "",
			duration: 30,
			price: 0,
			currency: "USD",
		},
	],
	pricing: [
		{
			name: "",
			price: 0,
			currency: "USD",
			unit: "hour",
			description: "",
		},
	],
	availability: createEmptyAvailability(),
	responseTime: "",
	languages: [],
	tags: [],
	isActive: true,
	images: [],
})

export const mapAgentToFormValues = (agent: Agent): AgentFormValues => ({
	title: agent.title,
	description: agent.description,
	category: agent.category,
	subcategory: agent.subcategory ?? "",
	location: {
		city: agent.location.city,
		country: agent.location.country,
		isRemote: agent.location.isRemote,
	},
	services: agent.services.map((service) => ({
		name: service.name,
		description: service.description,
		duration: service.duration,
		price: service.price,
		currency: service.currency,
	})),
	pricing: agent.pricing.map((plan) => ({
		name: plan.name,
		price: plan.price,
		currency: plan.currency,
		unit: plan.unit,
		description: plan.description ?? "",
	})),
	availability: {
		timezone: agent.availability?.timezone || "UTC",
		schedule: agent.availability?.schedule || createEmptySchedule(),
		exceptions: agent.availability?.exceptions || [],
	},
	responseTime: agent.responseTime,
	languages: agent.languages,
	tags: agent.tags,
	isActive: agent.isActive,
	images: [],
})

export const buildAgentPayload = (
	values: AgentFormValues,
): CreateAgentDTO => ({
	title: values.title.trim(),
	description: values.description.trim(),
	category: values.category.trim(),
	subcategory: values.subcategory?.trim() || undefined,
	location: {
		city: values.location.city.trim(),
		country: values.location.country.trim(),
		isRemote: values.location.isRemote,
	},
	services: values.services.map((service) => ({
		name: service.name.trim(),
		description: service.description.trim(),
		duration: service.duration,
		price: service.price,
		currency: service.currency,
	})),
	pricing: values.pricing.map((plan) => ({
		name: plan.name.trim(),
		price: plan.price,
		currency: plan.currency,
		unit: plan.unit,
		description: plan.description?.trim() || undefined,
	})),
	availability: {
		timezone: values.availability.timezone,
		schedule: {
			...values.availability.schedule,
			monday: values.availability.schedule.monday.map(normalizeSlot),
			tuesday: values.availability.schedule.tuesday.map(normalizeSlot),
			wednesday: values.availability.schedule.wednesday.map(normalizeSlot),
			thursday: values.availability.schedule.thursday.map(normalizeSlot),
			friday: values.availability.schedule.friday.map(normalizeSlot),
			saturday: values.availability.schedule.saturday.map(normalizeSlot),
			sunday: values.availability.schedule.sunday.map(normalizeSlot),
		},
		exceptions: values.availability.exceptions,
	},
	responseTime: values.responseTime.trim(),
	languages: values.languages.map((language) => language.trim()).filter(Boolean),
	tags: values.tags.map((tag) => tag.trim()).filter(Boolean),
	isActive: values.isActive,
})

export const validateAgentForm = (values: AgentFormValues): AgentFormErrors => {
	const errors: AgentFormErrors = {}

	if (!values.title.trim()) {
		errors.title = "请填写代理人名称"
	}

	if (values.description.trim().length < 20) {
		errors.description = "描述至少需要 20 个字符"
	}

	if (!values.category.trim()) {
		errors.category = "请选择服务类别"
	}

	if (!values.location.isRemote) {
		const hasLocation = values.location.city.trim() && values.location.country.trim()
		if (!hasLocation) {
			errors.location = "线下服务需要填写城市和国家"
		}
	}

	if (!values.responseTime.trim()) {
		errors.responseTime = "请填写响应时间"
	}

	if (!values.services.length) {
		errors.services = { 0: { name: "请至少添加一个服务" } }
	} else {
		values.services.forEach((service, index) => {
			const serviceErrors: Partial<Record<keyof typeof service, string>> = {}
			if (!service.name.trim()) {
				serviceErrors.name = "请输入服务名称"
			}
			if (service.duration <= 0) {
				serviceErrors.duration = "时长需大于 0"
			}
			if (service.price <= 0) {
				serviceErrors.price = "价格需大于 0"
			}
			if (Object.keys(serviceErrors).length > 0) {
				if (!errors.services) {
					errors.services = {}
				}
				errors.services[index] = serviceErrors
			}
		})
	}

	if (!values.pricing.length) {
		errors.pricing = { 0: { name: "请至少添加一个套餐" } }
	} else {
		values.pricing.forEach((plan, index) => {
			const planErrors: Partial<Record<keyof typeof plan, string>> = {}
			if (!plan.name.trim()) {
				planErrors.name = "请输入套餐名称"
			}
			if (plan.price <= 0) {
				planErrors.price = "价格需大于 0"
			}
			if (Object.keys(planErrors).length > 0) {
				if (!errors.pricing) {
					errors.pricing = {}
				}
				errors.pricing[index] = planErrors
			}
		})
	}

	return errors
}
