export type BillType = "INCOME" | "EXPENSE" | "PLATFORM_FEE"
export type BillStatus = "CONFIRMED" | "LOCKED" | "REVERTED" | "SETTLED"

export type BillCounterparty = {
	name: string
	address?: string
}

export type BillJob = {
	id: number
	title: string
}

export type Bill = {
	id: number
	billNumber: string
	type: BillType
	amount: string
	currency: string
	description: string
	job?: BillJob
	counterparty: BillCounterparty
	status: BillStatus
	isPaid: boolean
	createdAt: string
	txHash?: string
	gasFee?: string
}

export type BillDetail = Bill & {
	userId: number
	jobId?: number
	details?: Record<string, string>
	paidAt?: string
}

export type BillListResponse = {
	items: Bill[]
	total: number
	page: number
	limit: number
}

export type BillsQuery = {
	type?: BillType | "ALL"
	startDate?: string
	endDate?: string
	search?: string
	page?: number
	limit?: number
}

export type BillsSummary = {
	totalSpent: number
	totalEarnings: number
	activeEscrow: number
	activeEscrowJobs: number
	spentChange: number
	earningsChange: number
	currency: string
}

export type MonthlyStatement = {
	month: string
	year: number
	transactions: number
}

const mockBills: BillDetail[] = [
	{
		id: 101,
		billNumber: "BILL-20231024-A12F",
		type: "INCOME",
		amount: "450.00",
		currency: "USDT",
		description: "Job Payment",
		job: { id: 22, title: "Data Analysis Model v2" },
		counterparty: { name: "0x892...12A", address: "0x892...12A" },
		status: "CONFIRMED",
		isPaid: true,
		createdAt: "2023-10-24T10:42:00Z",
		txHash: "0x8f12...a912",
		gasFee: "0.001 ETH",
		userId: 14,
		jobId: 22,
		details: {
			network: "Ethereum",
			settlement: "Instant",
			release: "Milestone 3",
		},
		paidAt: "2023-10-24T10:44:00Z",
	},
	{
		id: 102,
		billNumber: "BILL-20231022-8B31",
		type: "EXPENSE",
		amount: "200.00",
		currency: "USDT",
		description: "Escrow Deposit",
		job: { id: 24, title: "Image Gen Agent Task" },
		counterparty: { name: "Contract Vault", address: "0xVault...18B" },
		status: "LOCKED",
		isPaid: true,
		createdAt: "2023-10-22T15:15:00Z",
		txHash: "0xa7c9...f83a",
		gasFee: "0.0004 ETH",
		userId: 14,
		jobId: 24,
		details: {
			escrow: "Active",
			milestones: "2 remaining",
			contract: "0xVault...18B",
		},
	},
	{
		id: 103,
		billNumber: "BILL-20231020-33C9",
		type: "PLATFORM_FEE",
		amount: "25.00",
		currency: "USDT",
		description: "Service Fee",
		job: { id: 18, title: "Monthly Platform Sub" },
		counterparty: { name: "AgentMarket DAO" },
		status: "CONFIRMED",
		isPaid: true,
		createdAt: "2023-10-20T09:00:00Z",
		txHash: "0x4bd1...d22e",
		gasFee: "0.0002 ETH",
		userId: 14,
		details: {
			period: "Oct 2023",
			feeTier: "Pro",
		},
		paidAt: "2023-10-20T09:01:00Z",
	},
	{
		id: 104,
		billNumber: "BILL-20231018-1B2C",
		type: "EXPENSE",
		amount: "0.00",
		currency: "USDT",
		description: "Contract Interaction",
		job: { id: 17, title: "Job Creation (Failed)" },
		counterparty: { name: "0xContract...", address: "0xContract..." },
		status: "REVERTED",
		isPaid: false,
		createdAt: "2023-10-18T11:20:00Z",
		txHash: "0x00ff...12aa",
		gasFee: "0.0004 ETH",
		userId: 14,
		jobId: 17,
		details: {
			reason: "Gas limit exceeded",
			action: "Job creation",
		},
	},
	{
		id: 105,
		billNumber: "BILL-20231015-998F",
		type: "INCOME",
		amount: "100.00",
		currency: "USDT",
		description: "Arbitration Settlement",
		job: { id: 13, title: "Refund: Unresponsive Agent" },
		counterparty: { name: "DAO Committee" },
		status: "SETTLED",
		isPaid: true,
		createdAt: "2023-10-15T14:00:00Z",
		txHash: "0x91fe...9cc1",
		gasFee: "0.0001 ETH",
		userId: 14,
		jobId: 13,
		details: {
			caseId: "ARB-2219",
			outcome: "Refund approved",
		},
		paidAt: "2023-10-15T14:05:00Z",
	},
	{
		id: 106,
		billNumber: "BILL-20231012-77E4",
		type: "EXPENSE",
		amount: "320.00",
		currency: "USDT",
		description: "Job Funding",
		job: { id: 31, title: "Marketing Intelligence Agent" },
		counterparty: { name: "Contract Vault", address: "0xVault...18B" },
		status: "LOCKED",
		isPaid: true,
		createdAt: "2023-10-12T08:10:00Z",
		txHash: "0x8b1c...7812",
		gasFee: "0.0003 ETH",
		userId: 14,
		jobId: 31,
		details: {
			escrow: "Active",
			release: "On delivery",
		},
	},
	{
		id: 107,
		billNumber: "BILL-20230928-2C9A",
		type: "INCOME",
		amount: "1,200.50",
		currency: "USDT",
		description: "Agent Revenue",
		job: { id: 12, title: "Autonomous Research Sprint" },
		counterparty: { name: "0x448...F19", address: "0x448...F19" },
		status: "CONFIRMED",
		isPaid: true,
		createdAt: "2023-09-28T10:45:00Z",
		txHash: "0x77b2...4491",
		gasFee: "0.0007 ETH",
		userId: 14,
		jobId: 12,
		details: {
			release: "Final milestone",
			payout: "Net",
		},
		paidAt: "2023-09-28T10:50:00Z",
	},
	{
		id: 108,
		billNumber: "BILL-20230921-512D",
		type: "PLATFORM_FEE",
		amount: "19.00",
		currency: "USDT",
		description: "Platform Fee",
		counterparty: { name: "AgentMarket DAO" },
		status: "CONFIRMED",
		isPaid: true,
		createdAt: "2023-09-21T05:30:00Z",
		txHash: "0x91a3...cc41",
		gasFee: "0.0001 ETH",
		userId: 14,
		details: {
			period: "Sep 2023",
			feeTier: "Growth",
		},
		paidAt: "2023-09-21T05:31:00Z",
	},
	{
		id: 109,
		billNumber: "BILL-20230918-221F",
		type: "EXPENSE",
		amount: "85.00",
		currency: "USDT",
		description: "Tooling Credits",
		counterparty: { name: "Agent Toolkit", address: "0xTool...22A" },
		status: "CONFIRMED",
		isPaid: true,
		createdAt: "2023-09-18T18:20:00Z",
		txHash: "0x15c1...aa12",
		gasFee: "0.0002 ETH",
		userId: 14,
		details: {
			package: "Diagnostics Suite",
			duration: "30 days",
		},
		paidAt: "2023-09-18T18:25:00Z",
	},
	{
		id: 110,
		billNumber: "BILL-20230912-998A",
		type: "INCOME",
		amount: "780.00",
		currency: "USDT",
		description: "Milestone Release",
		job: { id: 9, title: "Predictive Ops Engine" },
		counterparty: { name: "0x911...8A2", address: "0x911...8A2" },
		status: "CONFIRMED",
		isPaid: true,
		createdAt: "2023-09-12T09:10:00Z",
		txHash: "0x41fa...99bc",
		gasFee: "0.0005 ETH",
		userId: 14,
		jobId: 9,
		details: {
			release: "Milestone 2",
			sla: "Satisfied",
		},
		paidAt: "2023-09-12T09:12:00Z",
	},
	{
		id: 111,
		billNumber: "BILL-20230829-77BD",
		type: "EXPENSE",
		amount: "60.00",
		currency: "USDT",
		description: "API Usage",
		counterparty: { name: "Chain Metrics" },
		status: "CONFIRMED",
		isPaid: true,
		createdAt: "2023-08-29T12:40:00Z",
		txHash: "0x1212...cc19",
		gasFee: "0.0001 ETH",
		userId: 14,
		details: {
			usage: "120k requests",
			billingCycle: "Aug 2023",
		},
		paidAt: "2023-08-29T12:42:00Z",
	},
	{
		id: 112,
		billNumber: "BILL-20230811-6C11",
		type: "PLATFORM_FEE",
		amount: "12.50",
		currency: "USDT",
		description: "Protocol Fee",
		counterparty: { name: "AgentMarket DAO" },
		status: "CONFIRMED",
		isPaid: true,
		createdAt: "2023-08-11T04:05:00Z",
		txHash: "0x9bb2...a711",
		gasFee: "0.0001 ETH",
		userId: 14,
		details: {
			period: "Aug 2023",
			feeTier: "Core",
		},
		paidAt: "2023-08-11T04:05:00Z",
	},
]

const delay = (ms: number) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms)
	})

const parseAmount = (amount: string) =>
	Number(amount.replace(/,/g, "")) || 0

const normalizeText = (value: string) => value.toLowerCase()

const withinDateRange = (
	createdAt: string,
	startDate?: string,
	endDate?: string,
) => {
	if (!startDate && !endDate) return true
	const created = new Date(createdAt).getTime()
	if (startDate) {
		const start = new Date(startDate).getTime()
		if (Number.isFinite(start) && created < start) return false
	}
	if (endDate) {
		const endDateValue = new Date(endDate)
		endDateValue.setHours(23, 59, 59, 999)
		const end = endDateValue.getTime()
		if (Number.isFinite(end) && created > end) return false
	}
	return true
}

const searchMatch = (bill: BillDetail, query: string) => {
	const text = normalizeText(query)
	const haystack = [
		bill.billNumber,
		bill.description,
		bill.job?.title,
		bill.counterparty.name,
		bill.counterparty.address,
		bill.txHash,
	]
		.filter(Boolean)
		.map((value) => normalizeText(String(value)))
	return haystack.some((value) => value.includes(text))
}

export const billsApi = {
	async getBills(params: BillsQuery): Promise<BillListResponse> {
		await delay(240)
		const {
			page = 1,
			limit = 10,
			type = "ALL",
			startDate,
			endDate,
			search = "",
		} = params

		let filtered = [...mockBills]
		if (type !== "ALL") {
			filtered = filtered.filter((bill) => bill.type === type)
		}
		filtered = filtered.filter((bill) =>
			withinDateRange(bill.createdAt, startDate, endDate),
		)
		if (search.trim()) {
			filtered = filtered.filter((bill) => searchMatch(bill, search))
		}

		filtered.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)

		const total = filtered.length
		const startIndex = (page - 1) * limit
		const items = filtered.slice(startIndex, startIndex + limit)

		return {
			items,
			total,
			page,
			limit,
		}
	},

	async getBillDetail(id: number): Promise<BillDetail> {
		await delay(180)
		const bill = mockBills.find((item) => item.id === id)
		if (!bill) {
			throw new Error("Bill not found")
		}
		return bill
	},

	async getSummary(): Promise<BillsSummary> {
		await delay(160)
		const latestTimestamp = Math.max(
			...mockBills.map((bill) => new Date(bill.createdAt).getTime()),
		)
		const rangeStart = new Date(latestTimestamp - 30 * 24 * 60 * 60 * 1000)
		const inRange = (bill: BillDetail) =>
			new Date(bill.createdAt).getTime() >= rangeStart.getTime()

		const totalSpent = mockBills
			.filter((bill) => bill.type === "EXPENSE" && inRange(bill))
			.reduce((sum, bill) => sum + parseAmount(bill.amount), 0)
		const totalEarnings = mockBills
			.filter((bill) => bill.type === "INCOME" && inRange(bill))
			.reduce((sum, bill) => sum + parseAmount(bill.amount), 0)
		const activeEscrowBills = mockBills.filter(
			(bill) => bill.status === "LOCKED",
		)
		const activeEscrow = activeEscrowBills.reduce(
			(sum, bill) => sum + parseAmount(bill.amount),
			0,
		)

		return {
			totalSpent,
			totalEarnings,
			activeEscrow,
			activeEscrowJobs: activeEscrowBills.length,
			spentChange: -12,
			earningsChange: 8,
			currency: "USDT",
		}
	},

	async getMonthlyStatements(): Promise<MonthlyStatement[]> {
		await delay(120)
		const bucket: Record<string, MonthlyStatement> = {}
		for (const bill of mockBills) {
			const date = new Date(bill.createdAt)
			const month = date.toLocaleString("en-US", { month: "long" })
			const year = date.getFullYear()
			const key = `${month}-${year}`
			if (!bucket[key]) {
				bucket[key] = { month, year, transactions: 0 }
			}
			bucket[key].transactions += 1
		}
		return Object.values(bucket).sort((a, b) => {
			const aDate = new Date(`${a.month} 1, ${a.year}`)
			const bDate = new Date(`${b.month} 1, ${b.year}`)
			return bDate.getTime() - aDate.getTime()
		})
	},
}
