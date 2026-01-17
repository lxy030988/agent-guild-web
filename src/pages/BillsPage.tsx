import {
	ArrowDownLeft,
	ArrowUpRight,
	Download,
	ExternalLink,
	FileText,
	Lock,
	Search,
	ShieldAlert,
	ShieldCheck,
	X,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	type Bill,
	type BillDetail,
	type BillsSummary,
	type BillStatus,
	type BillType,
	type MonthlyStatement,
	billsApi,
} from "@/utils/bills-api"

type RangeFilter =
	| "LAST_7"
	| "LAST_30"
	| "LAST_90"
	| "YEAR_TO_DATE"
	| "ALL"
	| "CUSTOM"

const formatCurrency = (value: number, currency: string) =>
	`${new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value)} ${currency}`

const formatDate = (value: string) =>
	new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	})

const formatTime = (value: string) =>
	new Date(value).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	})

const formatISODate = (date: Date) => date.toISOString().split("T")[0]

const getTypeStyles = (type: BillType) => {
	switch (type) {
		case "INCOME":
			return "bg-emerald-50 text-emerald-600 border-emerald-200"
		case "EXPENSE":
			return "bg-rose-50 text-rose-600 border-rose-200"
		case "PLATFORM_FEE":
			return "bg-indigo-50 text-indigo-600 border-indigo-200"
		default:
			return "bg-neutral-50 text-neutral-600 border-neutral-200"
	}
}

const getStatusStyles = (status: BillStatus) => {
	switch (status) {
		case "CONFIRMED":
			return "bg-emerald-50 text-emerald-600 border-emerald-200"
		case "LOCKED":
			return "bg-amber-50 text-amber-600 border-amber-200"
		case "REVERTED":
			return "bg-rose-50 text-rose-600 border-rose-200"
		case "SETTLED":
			return "bg-teal-50 text-teal-600 border-teal-200"
		default:
			return "bg-neutral-50 text-neutral-600 border-neutral-200"
	}
}

const getStatusLabel = (status: BillStatus) => {
	switch (status) {
		case "CONFIRMED":
			return "Confirmed"
		case "LOCKED":
			return "Locked"
		case "REVERTED":
			return "Reverted"
		case "SETTLED":
			return "Settled"
		default:
			return status
	}
}

const getBillTypeLabel = (type: BillType) => {
	switch (type) {
		case "INCOME":
			return "Income"
		case "EXPENSE":
			return "Expense"
		case "PLATFORM_FEE":
			return "Platform Fee"
		default:
			return type
	}
}

const getBillIcon = (type: BillType) => {
	switch (type) {
		case "INCOME":
			return ArrowDownLeft
		case "EXPENSE":
			return ArrowUpRight
		case "PLATFORM_FEE":
			return FileText
		default:
			return FileText
	}
}

const getAmountColor = (type: BillType) => {
	switch (type) {
		case "INCOME":
			return "text-emerald-600"
		case "EXPENSE":
			return "text-rose-600"
		case "PLATFORM_FEE":
			return "text-indigo-600"
		default:
			return "text-neutral-600"
	}
}

const getPagination = (current: number, totalPages: number) => {
	if (totalPages <= 1) return []
	const pages: Array<number | "ellipsis-start" | "ellipsis-end"> = []
	const maxVisible = 5
	let start = Math.max(1, current - 2)
	const end = Math.min(totalPages, start + maxVisible - 1)

	if (end - start < maxVisible - 1) {
		start = Math.max(1, end - maxVisible + 1)
	}

	if (start > 1) {
		pages.push(1)
		if (start > 2) pages.push("ellipsis-start")
	}

	for (let i = start; i <= end; i += 1) {
		pages.push(i)
	}

	if (end < totalPages) {
		if (end < totalPages - 1) pages.push("ellipsis-end")
		pages.push(totalPages)
	}

	return pages
}

const rangeLabelMap: Record<RangeFilter, string> = {
	LAST_7: "Last 7 Days",
	LAST_30: "Last 30 Days",
	LAST_90: "Last 90 Days",
	YEAR_TO_DATE: "Year to Date",
	ALL: "All Time",
	CUSTOM: "Custom Range",
}

export default function BillsPage() {
	const [bills, setBills] = useState<Bill[]>([])
	const [summary, setSummary] = useState<BillsSummary | null>(null)
	const [statements, setStatements] = useState<MonthlyStatement[]>([])
	const [loading, setLoading] = useState(true)
	const [detailsLoading, setDetailsLoading] = useState(false)

	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [limit] = useState(6)

	const [typeFilter, setTypeFilter] = useState<BillType | "ALL">("ALL")
	const [rangeFilter, setRangeFilter] = useState<RangeFilter>("LAST_30")
	const [customStart, setCustomStart] = useState("")
	const [customEnd, setCustomEnd] = useState("")
	const [searchInput, setSearchInput] = useState("")
	const [search, setSearch] = useState("")

	const [selectedBill, setSelectedBill] = useState<BillDetail | null>(null)
	const [detailOpen, setDetailOpen] = useState(false)

	const dateRange = useMemo(() => {
		const now = new Date()
		switch (rangeFilter) {
			case "LAST_7":
				return {
					startDate: formatISODate(
						new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
					),
					endDate: formatISODate(now),
				}
			case "LAST_30":
				return {
					startDate: formatISODate(
						new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
					),
					endDate: formatISODate(now),
				}
			case "LAST_90":
				return {
					startDate: formatISODate(
						new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
					),
					endDate: formatISODate(now),
				}
			case "YEAR_TO_DATE":
				return {
					startDate: formatISODate(new Date(now.getFullYear(), 0, 1)),
					endDate: formatISODate(now),
				}
			case "CUSTOM":
				return {
					startDate: customStart || undefined,
					endDate: customEnd || undefined,
				}
			default:
				return { startDate: undefined, endDate: undefined }
		}
	}, [rangeFilter, customStart, customEnd])

	const loadBills = useCallback(async () => {
		setLoading(true)
		try {
			const result = await billsApi.getBills({
				page,
				limit,
				type: typeFilter,
				startDate: dateRange.startDate,
				endDate: dateRange.endDate,
				search,
			})
			setBills(result.items)
			setTotal(result.total)
		} finally {
			setLoading(false)
		}
	}, [page, limit, typeFilter, dateRange, search])

	const refreshOverview = useCallback(async () => {
		const [summaryResult, statementsResult] = await Promise.all([
			billsApi.getSummary(),
			billsApi.getMonthlyStatements(),
		])
		setSummary(summaryResult)
		setStatements(statementsResult)
	}, [])

	useEffect(() => {
		refreshOverview()
	}, [refreshOverview])

	useEffect(() => {
		loadBills()
	}, [loadBills])

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearch(searchInput.trim())
			setPage(1)
		}, 250)
		return () => clearTimeout(timer)
	}, [searchInput])

	useEffect(() => {
		if (!detailOpen) {
			setSelectedBill(null)
		}
	}, [detailOpen])

	useEffect(() => {
		if (!detailOpen) return
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setDetailOpen(false)
			}
		}
		window.addEventListener("keydown", handleKey)
		return () => window.removeEventListener("keydown", handleKey)
	}, [detailOpen])

	const handleViewDetail = async (billId: number) => {
		setDetailsLoading(true)
		try {
			const detail = await billsApi.getBillDetail(billId)
			setSelectedBill(detail)
			setDetailOpen(true)
		} finally {
			setDetailsLoading(false)
		}
	}

	const handleExport = () => {
		if (!bills.length) return
		const header = [
			"Bill Number",
			"Type",
			"Description",
			"Amount",
			"Currency",
			"Status",
			"Counterparty",
			"Created At",
		]
		const rows = bills.map((bill) => [
			bill.billNumber,
			getBillTypeLabel(bill.type),
			bill.description,
			bill.amount,
			bill.currency,
			getStatusLabel(bill.status),
			bill.counterparty.name,
			bill.createdAt,
		])
		const csv = [header, ...rows]
			.map((row) => row.map((value) => `"${String(value)}"`).join(","))
			.join("\n")
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.setAttribute("download", "billing-history.csv")
		document.body.appendChild(link)
		link.click()
		link.remove()
		URL.revokeObjectURL(url)
	}

	const resetFilters = () => {
		setTypeFilter("ALL")
		setRangeFilter("LAST_30")
		setCustomStart("")
		setCustomEnd("")
		setSearchInput("")
		setPage(1)
	}

	const totalPages = Math.ceil(total / limit)
	const pagination = getPagination(page, totalPages)

	const summaryCards = [
		{
			title: "Total Spent (30 Days)",
			value: summary
				? formatCurrency(summary.totalSpent, summary.currency || "USDT")
				: "--",
			change: summary?.spentChange ?? 0,
			icon: ArrowUpRight,
			iconColor: "text-rose-300",
		},
		{
			title: "Total Earnings",
			value: summary
				? formatCurrency(summary.totalEarnings, summary.currency || "USDT")
				: "--",
			change: summary?.earningsChange ?? 0,
			icon: ArrowDownLeft,
			iconColor: "text-emerald-300",
		},
		{
			title: "Active Escrow",
			value: summary
				? formatCurrency(summary.activeEscrow, summary.currency || "USDT")
				: "--",
			subtitle: summary
				? `Across ${summary.activeEscrowJobs} active jobs`
				: "",
			icon: Lock,
			iconColor: "text-amber-300",
		},
	]

	const showingStart = total ? (page - 1) * limit + 1 : 0
	const showingEnd = Math.min(page * limit, total)

	return (
		<div className="min-h-screen bg-white text-neutral-900 selection:bg-primary/10">
			<div className="container mx-auto px-6 py-10 max-w-7xl">
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
					<div className="space-y-3">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
							<ShieldCheck className="w-3 h-3" />
							Billing Center
						</div>
						<h1 className="text-4xl md:text-5xl font-black tracking-tighter text-neutral-900 italic">
							Billing & Transactions
						</h1>
						<p className="text-neutral-500 font-medium max-w-2xl">
							Manage your on-chain financial history, escrow balances, and export
							invoices for compliance.
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<Button
							variant="outline"
							className="rounded-2xl border-neutral-200 bg-white shadow-sm"
							onClick={handleExport}
						>
							<Download className="mr-2 h-4 w-4" />
							Export CSV
						</Button>
						<Button className="rounded-2xl premium-gradient shadow-glow">
							Withdraw Funds
						</Button>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-3 mb-10">
					{summaryCards.map((card) => (
						<Card
							key={card.title}
							className="rounded-3xl border-neutral-200 shadow-xl bg-white"
						>
							<CardHeader className="pb-4">
								<CardDescription className="text-xs font-bold uppercase tracking-widest text-neutral-400">
									{card.title}
								</CardDescription>
								<CardTitle className="text-3xl font-black text-neutral-900">
									{card.value ?? "--"}
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0 flex items-center justify-between text-sm">
								{card.subtitle ? (
									<span className="text-neutral-500 font-medium">
										{card.subtitle}
									</span>
								) : (
									<span className="text-neutral-500 font-medium">
										<span
											className={
												card.change >= 0
													? "text-emerald-600"
													: "text-rose-600"
											}
										>
											{card.change >= 0 ? "↑" : "↓"}{" "}
											{Math.abs(card.change)}%
										</span>{" "}
										vs last month
									</span>
								)}
								<div
									className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-neutral-50 border border-neutral-200 ${card.iconColor}`}
								>
									<card.icon className="w-5 h-5" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				<Card className="rounded-3xl border-neutral-200 shadow-xl bg-white">
					<CardHeader className="pb-4 flex flex-col gap-4">
						<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
								<input
									value={searchInput}
									onChange={(event) => setSearchInput(event.target.value)}
									placeholder="Search by TxID, Agent Name, or Job Title"
									className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/60 py-3 pl-11 pr-4 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
								/>
							</div>
							<div className="flex flex-wrap items-center gap-3">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="rounded-2xl border-neutral-200 bg-white"
										>
											{typeFilter === "ALL"
												? "All Types"
												: getBillTypeLabel(typeFilter)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuLabel>Type Filter</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuRadioGroup
											value={typeFilter}
											onValueChange={(value) => {
												setTypeFilter(value as BillType | "ALL")
												setPage(1)
											}}
										>
											<DropdownMenuRadioItem value="ALL">
												All Types
											</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value="INCOME">
												Income
											</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value="EXPENSE">
												Expense
											</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value="PLATFORM_FEE">
												Platform Fee
											</DropdownMenuRadioItem>
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="rounded-2xl border-neutral-200 bg-white"
										>
											{rangeLabelMap[rangeFilter]}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuLabel>Date Range</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuRadioGroup
											value={rangeFilter}
											onValueChange={(value) => {
												setRangeFilter(value as RangeFilter)
												setPage(1)
											}}
										>
											{Object.entries(rangeLabelMap).map(([key, label]) => (
												<DropdownMenuRadioItem key={key} value={key}>
													{label}
												</DropdownMenuRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>

								<Button
									variant="outline"
									className="rounded-2xl border-neutral-200 bg-white"
									onClick={resetFilters}
								>
									Reset
								</Button>
							</div>
						</div>

						{rangeFilter === "CUSTOM" && (
							<div className="flex flex-wrap items-center gap-3">
								<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
									Custom Range
								</div>
								<input
									type="date"
									value={customStart}
									onChange={(event) => setCustomStart(event.target.value)}
									className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700"
								/>
								<span className="text-neutral-400 text-sm">to</span>
								<input
									type="date"
									value={customEnd}
									onChange={(event) => setCustomEnd(event.target.value)}
									className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700"
								/>
							</div>
						)}
					</CardHeader>

					<CardContent className="pt-0">
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400 border-b border-neutral-200">
										<th className="px-4 py-3">Transaction / Date</th>
										<th className="px-4 py-3">Type / Job</th>
										<th className="px-4 py-3">Counterparty</th>
										<th className="px-4 py-3">Amount</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3 text-right">Action</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr>
											<td colSpan={6} className="px-4 py-10 text-center">
												<div className="flex items-center justify-center gap-3 text-neutral-400">
													<div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent" />
													Loading transactions...
												</div>
											</td>
										</tr>
									) : bills.length === 0 ? (
										<tr>
											<td colSpan={6} className="px-4 py-12 text-center">
												<div className="text-5xl mb-4">📄</div>
												<p className="text-neutral-500 font-medium">
													No billing records match the current filters.
												</p>
											</td>
										</tr>
									) : (
										bills.map((bill) => {
											const Icon = getBillIcon(bill.type)
											return (
												<tr
													key={bill.id}
													className="border-b border-neutral-100 hover:bg-neutral-50/40 transition-colors"
												>
													<td className="px-4 py-4">
														<div className="flex items-center gap-4">
															<div
																className={`h-10 w-10 rounded-full flex items-center justify-center border ${getTypeStyles(
																	bill.type,
																)}`}
															>
																<Icon className="h-4 w-4" />
															</div>
															<div>
																<div className="font-semibold text-neutral-900">
																	{formatDate(bill.createdAt)}
																</div>
																<div className="text-xs text-neutral-400 font-medium">
																	{formatTime(bill.createdAt)}
																</div>
															</div>
														</div>
													</td>
													<td className="px-4 py-4">
														<div className="font-semibold text-neutral-900">
															{bill.description}
														</div>
														{bill.job && (
															<div className="text-xs text-neutral-400 font-medium">
																{bill.job.title}
															</div>
														)}
													</td>
													<td className="px-4 py-4">
														<div className="flex items-center gap-2">
															<div className="h-8 w-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500 text-xs font-bold">
																{bill.counterparty.name[0]}
															</div>
															<div>
																<div className="font-semibold text-neutral-900">
																	{bill.counterparty.name}
																</div>
																{bill.counterparty.address && (
																	<div className="text-xs text-neutral-400 font-mono">
																		{bill.counterparty.address}
																	</div>
																)}
															</div>
														</div>
													</td>
													<td className="px-4 py-4">
														<div
															className={`font-bold ${getAmountColor(
																bill.type,
															)}`}
														>
															{bill.type === "INCOME" ? "+" : "-"}{" "}
															{bill.amount} {bill.currency}
														</div>
														{bill.gasFee && (
															<div className="text-xs text-neutral-400">
																Gas: {bill.gasFee}
															</div>
														)}
													</td>
													<td className="px-4 py-4">
														<span
															className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(
																bill.status,
															)}`}
														>
															{getStatusLabel(bill.status)}
														</span>
													</td>
													<td className="px-4 py-4 text-right">
														<Button
															variant="link"
															className="text-primary font-semibold"
															onClick={() => handleViewDetail(bill.id)}
															disabled={detailsLoading}
														>
															View <ExternalLink className="ml-1 h-3 w-3" />
														</Button>
													</td>
												</tr>
											)
										})
									)}
								</tbody>
							</table>
						</div>

						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 text-sm text-neutral-500">
							<div>
								Showing {showingStart} to {showingEnd} of {total} results
							</div>
							{totalPages > 1 && (
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="icon"
										className="rounded-xl border-neutral-200"
										onClick={() => setPage((prev) => Math.max(1, prev - 1))}
										disabled={page === 1}
									>
										{"<"}
									</Button>
									{pagination.map((item) =>
										item === "ellipsis-start" || item === "ellipsis-end" ? (
											<span
												key={item}
												className="px-2 text-neutral-400"
											>
												...
											</span>
										) : (
											<Button
												key={item}
												variant={item === page ? "default" : "outline"}
												size="icon"
												className={`rounded-xl ${
													item === page
														? "bg-primary text-white"
														: "border-neutral-200"
												}`}
												onClick={() => setPage(item)}
											>
												{item}
											</Button>
										),
									)}
									<Button
										variant="outline"
										size="icon"
										className="rounded-xl border-neutral-200"
										onClick={() =>
											setPage((prev) => Math.min(totalPages, prev + 1))
										}
										disabled={page === totalPages}
									>
										{">"}
									</Button>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<div className="mt-10">
					<h2 className="text-2xl font-black italic text-neutral-900 mb-4">
						Monthly Statements
					</h2>
					<div className="grid gap-4 md:grid-cols-2">
						{statements.slice(0, 4).map((statement) => (
							<Card
								key={`${statement.month}-${statement.year}`}
								className="rounded-2xl border-neutral-200 bg-white shadow-sm"
							>
								<CardContent className="flex items-center justify-between py-5">
									<div className="flex items-center gap-4">
										<div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
											<FileText className="h-5 w-5" />
										</div>
										<div>
											<div className="font-semibold text-neutral-900">
												{statement.month} {statement.year}
											</div>
											<div className="text-xs text-neutral-400 font-medium">
												{statement.transactions} Transactions
											</div>
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="rounded-xl"
									>
										<Download className="h-4 w-4" />
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>

			{detailOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
					<div
						className="w-full max-w-2xl rounded-3xl bg-white border border-neutral-200 shadow-2xl"
						role="dialog"
						aria-modal="true"
					>
						<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
							<div>
								<h3 className="text-xl font-black text-neutral-900">
									Bill Details
								</h3>
								<p className="text-xs text-neutral-400 font-medium">
									Full transaction metadata and settlement fields
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="rounded-xl"
								onClick={() => setDetailOpen(false)}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>

						<div className="px-6 py-6 space-y-6">
							{detailsLoading || !selectedBill ? (
								<div className="flex items-center justify-center gap-3 text-neutral-400">
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent" />
									Loading details...
								</div>
							) : (
								<>
									<div className="grid gap-4 md:grid-cols-2 bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
										<div>
											<div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
												Bill Number
											</div>
											<div className="text-sm font-semibold text-neutral-900">
												{selectedBill.billNumber}
											</div>
										</div>
										<div>
											<div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
												Type
											</div>
											<div
												className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getTypeStyles(
													selectedBill.type,
												)}`}
											>
												{getBillTypeLabel(selectedBill.type)}
											</div>
										</div>
										<div>
											<div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
												Amount
											</div>
											<div className="text-sm font-semibold text-neutral-900">
												{selectedBill.amount} {selectedBill.currency}
											</div>
										</div>
										<div>
											<div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
												Status
											</div>
											<div
												className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(
													selectedBill.status,
												)}`}
											>
												{getStatusLabel(selectedBill.status)}
											</div>
										</div>
										<div>
											<div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
												Created
											</div>
											<div className="text-sm font-semibold text-neutral-900">
												{formatDate(selectedBill.createdAt)}{" "}
												{formatTime(selectedBill.createdAt)}
											</div>
										</div>
										<div>
											<div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
												Paid
											</div>
											<div className="text-sm font-semibold text-neutral-900">
												{selectedBill.isPaid
													? selectedBill.paidAt
														? `${formatDate(selectedBill.paidAt)} ${formatTime(
																selectedBill.paidAt,
															)}`
														: "Paid"
													: "Pending"}
											</div>
										</div>
									</div>

									{selectedBill.details && (
										<div className="space-y-3">
											<div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
												Detail Breakdown
											</div>
											<div className="rounded-2xl border border-neutral-200 bg-white">
												{Object.entries(selectedBill.details).map(
													([key, value]) => (
														<div
															key={key}
															className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 last:border-b-0 text-sm"
														>
															<span className="text-neutral-500 capitalize">
																{key.replace(/([A-Z])/g, " $1").trim()}
															</span>
															<span className="font-semibold text-neutral-900">
																{value}
															</span>
														</div>
													),
												)}
											</div>
										</div>
									)}

									{selectedBill.status === "REVERTED" ? (
										<div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-600 text-sm font-semibold">
											<ShieldAlert className="h-4 w-4" />
											Transaction reverted. Gas fees may still apply.
										</div>
									) : null}
								</>
							)}
						</div>

						<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100">
							<Button
								variant="outline"
								className="rounded-2xl border-neutral-200"
								onClick={() => setDetailOpen(false)}
							>
								Close
							</Button>
							<Button className="rounded-2xl premium-gradient">
								Download Invoice
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
