import {
	buildAgentPayload,
	createEmptyAvailability,
	createEmptyAgentForm,
	mapAgentToFormValues,
	validateAgentForm,
} from "@/utils/agentForm"

describe("agentForm utils", () => {
	it("creates empty form defaults", () => {
		const form = createEmptyAgentForm()

		expect(form.title).toBe("")
		expect(form.services).toHaveLength(1)
		expect(form.pricing).toHaveLength(1)
		expect(form.availability.schedule.monday).toEqual([])
	})

	it("creates default availability slots", () => {
		const availability = createEmptyAvailability()

		expect(availability.timezone).toBeTruthy()
		expect(availability.schedule.sunday).toEqual([])
	})

	it("validates required fields", () => {
		const form = createEmptyAgentForm()
		const errors = validateAgentForm(form)

		expect(errors.title).toBe("请填写代理人名称")
		expect(errors.description).toBe("描述至少需要 20 个字符")
		expect(errors.category).toBe("请选择服务类别")
		expect(errors.responseTime).toBe("请填写响应时间")
		expect(errors.services?.[0]?.name).toBe("请输入服务名称")
		expect(errors.pricing?.[0]?.name).toBe("请输入套餐名称")
	})

	it("validates empty service and pricing arrays", () => {
		const form = {
			...createEmptyAgentForm(),
			title: "Agent",
			description: "This is a valid description for testing.",
			category: "Design",
			responseTime: "< 1 hour",
			services: [],
			pricing: [],
		}

		const errors = validateAgentForm(form)

		expect(errors.services?.[0]?.name).toBe("请至少添加一个服务")
		expect(errors.pricing?.[0]?.name).toBe("请至少添加一个套餐")
	})

	it("allows remote agents without location fields", () => {
		const form = {
			...createEmptyAgentForm(),
			title: "Agent",
			description: "This is a valid description for testing.",
			category: "Design",
			responseTime: "< 1 hour",
			location: { city: "", country: "", isRemote: true },
			services: [
				{
					name: "Review",
					description: "desc",
					duration: 30,
					price: 100,
					currency: "USD",
				},
			],
			pricing: [
				{
					name: "Starter",
					price: 100,
					currency: "USD",
					unit: "hour",
				},
			],
		}

		const errors = validateAgentForm(form)

		expect(errors.location).toBeUndefined()
	})

	it("builds payload with normalized strings", () => {
		const form = {
			...createEmptyAgentForm(),
			title: "  Agent Pro ",
			description: "This is a valid description for the agent.",
			category: "Design",
			location: { city: "Shanghai", country: "China", isRemote: false },
			responseTime: " < 1 hour ",
			languages: ["中文", "  ", "English "],
			tags: ["AI", "  "],
			services: [
				{
					name: "Strategy",
					description: "desc",
					duration: 60,
					price: 200,
					currency: "USD",
				},
			],
			pricing: [
				{
					name: "Starter",
					price: 200,
					currency: "USD",
					unit: "hour",
					description: "Plan",
				},
			],
			availability: {
				timezone: "UTC",
				schedule: {
					monday: [{ start: " 09:00 ", end: " 18:00 " }],
					tuesday: [],
					wednesday: [],
					thursday: [],
					friday: [],
					saturday: [],
					sunday: [],
				},
				exceptions: [],
			},
		}

		const payload = buildAgentPayload(form)

		expect(payload.title).toBe("Agent Pro")
		expect(payload.responseTime).toBe("< 1 hour")
		expect(payload.languages).toEqual(["中文", "English"])
		expect(payload.tags).toEqual(["AI"])
		expect(payload.availability.schedule.monday[0]).toEqual({
			start: "09:00",
			end: "18:00",
		})
	})

	it("maps agent data into form values", () => {
		const agent = {
			id: 1,
			userId: 9,
			title: "Agent",
			description: "Full description content here",
			category: "Engineering",
			subcategory: "Frontend",
			location: { city: "Berlin", country: "Germany", isRemote: false },
			services: [
				{
					id: 1,
					name: "Build",
					description: "Build service",
					duration: 45,
					price: 100,
					currency: "USD",
				},
			],
			pricing: [
				{
					id: 2,
					name: "Standard",
					price: 300,
					currency: "USD",
					unit: "job",
				},
			],
			availability: {
				timezone: "UTC",
				schedule: {
					monday: [{ start: "09:00", end: "18:00" }],
					tuesday: [],
					wednesday: [],
					thursday: [],
					friday: [],
					saturday: [],
					sunday: [],
				},
				exceptions: [],
			},
			rating: 4.8,
			reviewCount: 12,
			completedJobs: 42,
			responseTime: "< 1 hour",
			languages: ["English"],
			tags: ["AI"],
			isActive: true,
			createdAt: "2024-01-01",
			updatedAt: "2024-01-02",
		}

		const form = mapAgentToFormValues(agent)

		expect(form.title).toBe("Agent")
		expect(form.services[0].name).toBe("Build")
		expect(form.pricing[0].unit).toBe("job")
		expect(form.availability.schedule.monday).toHaveLength(1)
	})
})
