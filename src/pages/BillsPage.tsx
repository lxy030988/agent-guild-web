import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "../components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select"
import { type Bill, type BillDetail, billsApi } from "../utils/bills-api"

export default function BillsPage() {
	const [bills, setBills] = useState<Bill[]>([])
	const [loading, setLoading] = useState(true)
	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [limit] = useState(20)

	// 筛选条件
	const [typeFilter, setTypeFilter] = useState<string>("ALL")
	const [startDate, setStartDate] = useState("")
	const [endDate, setEndDate] = useState("")

	// 账单详情对话框
	const [selectedBill, setSelectedBill] = useState<BillDetail | null>(null)
	const [detailDialogOpen, setDetailDialogOpen] = useState(false)

	const loadBills = useCallback(async () => {
		try {
			setLoading(true)
			const params: Record<string, string | number> = { page, limit }

			if (typeFilter !== "ALL") params.type = typeFilter
			if (startDate) params.startDate = startDate
			if (endDate) params.endDate = endDate

			const result = await billsApi.getBills(params)
			setBills(result.items)
			setTotal(result.total)
		} catch (error) {
			console.error("Failed to load bills:", error)
			toast.error("加载账单失败")
		} finally {
			setLoading(false)
		}
	}, [page, limit, typeFilter, startDate, endDate])

	// 加载账单列表
	useEffect(() => {
		loadBills()
	}, [loadBills])

	// 查看账单详情
	const viewBillDetail = async (billId: number) => {
		try {
			const detail = await billsApi.getBillDetail(billId)
			setSelectedBill(detail)
			setDetailDialogOpen(true)
		} catch (error) {
			console.error("Failed to load bill detail:", error)
			toast.error("加载账单详情失败")
		}
	}

	// 重置筛选
	const resetFilters = () => {
		setTypeFilter("ALL")
		setStartDate("")
		setEndDate("")
		setPage(1)
	}

	// 账单类型标签颜色
	const getBillTypeColor = (type: string) => {
		const colors: Record<string, string> = {
			INCOME: "bg-green-100 text-green-800 border-green-300",
			EXPENSE: "bg-red-100 text-red-800 border-red-300",
			PLATFORM_FEE: "bg-blue-100 text-blue-800 border-blue-300",
		}
		return colors[type] || "bg-gray-100 text-gray-800 border-gray-300"
	}

	// 账单类型中文名
	const getBillTypeName = (type: string) => {
		const names: Record<string, string> = {
			INCOME: "收入",
			EXPENSE: "支出",
			PLATFORM_FEE: "平台费用",
		}
		return names[type] || type
	}

	// 账单类型图标
	const getBillTypeIcon = (type: string) => {
		const icons: Record<string, string> = {
			INCOME: "💰",
			EXPENSE: "💸",
			PLATFORM_FEE: "🏦",
		}
		return icons[type] || "📄"
	}

	const totalPages = Math.ceil(total / limit)

	return (
		<div className="min-h-screen bg-gray-50 pt-20 pb-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">我的账单</h1>
						<p className="mt-2 text-gray-600">查看和管理您的财务账单记录</p>
					</div>
				</div>

				{/* 筛选器 */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>筛选账单</CardTitle>
						<CardDescription>根据类型和时间筛选账单</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							{/* 账单类型 */}
							<div>
								<Label htmlFor="type" className="mb-2">
									账单类型
								</Label>
								<Select value={typeFilter} onValueChange={setTypeFilter}>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ALL">全部类型</SelectItem>
										<SelectItem value="INCOME">收入</SelectItem>
										<SelectItem value="EXPENSE">支出</SelectItem>
										<SelectItem value="PLATFORM_FEE">平台费用</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* 开始日期 */}
							<div>
								<Label htmlFor="startDate" className="mb-2">
									开始日期
								</Label>
								<Input
									id="startDate"
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
								/>
							</div>

							{/* 结束日期 */}
							<div>
								<Label htmlFor="endDate" className="mb-2">
									结束日期
								</Label>
								<Input
									id="endDate"
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
								/>
							</div>

							{/* 重置按钮 */}
							<div className="flex items-end">
								<Button
									variant="outline"
									onClick={resetFilters}
									className="w-full"
								>
									重置筛选
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 账单列表 */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>账单列表</CardTitle>
								<CardDescription>共 {total} 条账单记录</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center h-64">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
							</div>
						) : bills.length === 0 ? (
							<div className="text-center py-12 text-gray-400">
								<div className="text-6xl mb-4">📄</div>
								<p className="text-lg">暂无账单记录</p>
								<p className="text-sm mt-2">完成任务后将自动生成账单</p>
							</div>
						) : (
							<div className="space-y-4">
								{/* 账单卡片列表 */}
								<div className="grid grid-cols-1 gap-4">
									{bills.map((bill) => (
										<button
											key={bill.id}
											type="button"
											className="w-full text-left border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
											onClick={() => viewBillDetail(bill.id)}
										>
											<div className="flex items-start justify-between">
												<div className="flex items-start gap-4 flex-1">
													{/* 图标 */}
													<div className="text-4xl">
														{getBillTypeIcon(bill.type)}
													</div>

													{/* 主要信息 */}
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-2">
															<span
																className={`inline-block px-2 py-1 rounded-md text-xs font-medium border ${getBillTypeColor(bill.type)}`}
															>
																{getBillTypeName(bill.type)}
															</span>
															<span className="text-sm text-gray-500">
																{bill.billNumber}
															</span>
														</div>
														<h3 className="font-medium text-gray-900 mb-1">
															{bill.description}
														</h3>
														{bill.job && (
															<p className="text-sm text-gray-600">
																关联任务: {bill.job.title}
															</p>
														)}
														<p className="text-xs text-gray-500 mt-2">
															{new Date(bill.createdAt).toLocaleString("zh-CN")}
														</p>
													</div>

													{/* 金额 */}
													<div className="text-right">
														<p
															className={`text-2xl font-bold ${
																bill.type === "INCOME"
																	? "text-green-600"
																	: bill.type === "EXPENSE"
																		? "text-red-600"
																		: "text-blue-600"
															}`}
														>
															{bill.type === "INCOME"
																? "+"
																: bill.type === "EXPENSE"
																	? "-"
																	: ""}
															{bill.amount} {bill.currency}
														</p>
														<div className="mt-2">
															{bill.isPaid ? (
																<span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
																	已支付
																</span>
															) : (
																<span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
																	待支付
																</span>
															)}
														</div>
													</div>
												</div>

												{/* 查看详情箭头 */}
												<div className="ml-4 text-gray-400">
													<svg
														className="w-6 h-6"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														role="img"
														aria-label="查看详情"
													>
														<title>查看详情</title>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M9 5l7 7-7 7"
														/>
													</svg>
												</div>
											</div>
										</button>
									))}
								</div>

								{/* 分页 */}
								{totalPages > 1 && (
									<div className="flex items-center justify-center gap-4 pt-6">
										<Button
											variant="outline"
											onClick={() => setPage((p) => Math.max(1, p - 1))}
											disabled={page === 1}
										>
											上一页
										</Button>
										<span className="text-gray-600">
											第 {page} 页，共 {totalPages} 页
										</span>
										<Button
											variant="outline"
											onClick={() =>
												setPage((p) => Math.min(totalPages, p + 1))
											}
											disabled={page === totalPages}
										>
											下一页
										</Button>
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* 账单详情对话框 */}
				<Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
					<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>账单详情</DialogTitle>
							<DialogDescription>查看账单的完整信息</DialogDescription>
						</DialogHeader>

						{selectedBill && (
							<div className="space-y-6">
								{/* 基本信息 */}
								<div className="bg-gray-50 rounded-lg p-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500 mb-1">账单编号</p>
											<p className="font-medium text-gray-900">
												{selectedBill.billNumber}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">账单类型</p>
											<span
												className={`inline-block px-2 py-1 rounded-md text-xs font-medium border ${getBillTypeColor(selectedBill.type)}`}
											>
												{getBillTypeName(selectedBill.type)}
											</span>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">金额</p>
											<p
												className={`text-2xl font-bold ${
													selectedBill.type === "INCOME"
														? "text-green-600"
														: selectedBill.type === "EXPENSE"
															? "text-red-600"
															: "text-blue-600"
												}`}
											>
												{selectedBill.amount} {selectedBill.currency}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">支付状态</p>
											{selectedBill.isPaid ? (
												<span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
													已支付
												</span>
											) : (
												<span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
													待支付
												</span>
											)}
										</div>
									</div>
								</div>

								{/* 描述 */}
								<div>
									<p className="text-sm text-gray-500 mb-2">账单描述</p>
									<p className="text-gray-900">{selectedBill.description}</p>
								</div>

								{/* 详细条目 */}
								{selectedBill.details && (
									<div>
										<p className="text-sm text-gray-500 mb-2">详细条目</p>
										<div className="bg-gray-50 rounded-lg p-4 space-y-2">
											{Object.entries(selectedBill.details).map(
												([key, value]) => (
													<div key={key} className="flex justify-between">
														<span className="text-gray-600 capitalize">
															{key.replace(/([A-Z])/g, " $1").trim()}:
														</span>
														<span className="font-medium text-gray-900">
															{String(value)}
														</span>
													</div>
												),
											)}
										</div>
									</div>
								)}

								{/* 时间信息 */}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-gray-500 mb-1">创建时间</p>
										<p className="text-gray-900">
											{new Date(selectedBill.createdAt).toLocaleString("zh-CN")}
										</p>
									</div>
									{selectedBill.paidAt && (
										<div>
											<p className="text-sm text-gray-500 mb-1">支付时间</p>
											<p className="text-gray-900">
												{new Date(selectedBill.paidAt).toLocaleString("zh-CN")}
											</p>
										</div>
									)}
								</div>

								{/* 操作按钮 */}
								<div className="flex gap-4">
									<Button
										variant="outline"
										className="flex-1"
										onClick={() => setDetailDialogOpen(false)}
									>
										关闭
									</Button>
									<Button
										className="flex-1"
										onClick={() => toast.info("PDF 导出功能开发中")}
									>
										导出 PDF
									</Button>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}
