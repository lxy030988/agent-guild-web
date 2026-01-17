import { RefreshCw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { CreateDisputeDialog } from "../components/dao/CreateDisputeDialog"
import { DisputeCard } from "../components/dao/DisputeCard"
import { DisputeStats } from "../components/dao/DisputeStats"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select"
import {
	type Dispute,
	type DisputeStatus,
	disputeApi,
	type DisputeStats as IDisputeStats,
} from "../utils/disputeApi"

export default function DAOPage() {
	const [disputes, setDisputes] = useState<Dispute[]>([])
	const [stats, setStats] = useState<IDisputeStats | null>(null)
	const [loading, setLoading] = useState(true)
	const [statusFilter, setStatusFilter] = useState<DisputeStatus | "ALL">(
		"ALL",
	)
	const [searchTerm, setSearchTerm] = useState("")

	const fetchData = useCallback(async () => {
		try {
			setLoading(true)
			const [disputeResult, statsData] = await Promise.all([
				disputeApi.listDisputes(
					statusFilter !== "ALL"
						? { status: statusFilter as DisputeStatus }
						: undefined,
				),
				disputeApi.getStatistics(),
			])
			setDisputes(disputeResult?.data || [])
			setStats(statsData)
		} catch (error) {
			console.error("Failed to fetch DAO data:", error)
			toast.error("Failed to load DAO platform data")
			setDisputes([])
		} finally {
			setLoading(false)
		}
	}, [statusFilter])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	const filteredDisputes = disputes.filter(
		(d) =>
			d.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			d.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	return (
		<div className="min-h-screen bg-gray-50 pt-20 pb-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">DAO 争议中心</h1>
						<p className="mt-2 text-gray-600">
							对任务争议进行治理投票，保障平台公平性
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							size="icon"
							onClick={fetchData}
							disabled={loading}
							className="border-gray-300"
						>
							<RefreshCw
								className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
							/>
						</Button>
						<CreateDisputeDialog onSuccess={fetchData} />
					</div>
				</div>

				<DisputeStats stats={stats} loading={loading} />

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="search" className="mb-2">
								搜索争议
							</Label>
							<Input
								id="search"
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="搜索任务标题或争议原因..."
							/>
						</div>
						<div>
							<Label htmlFor="status" className="mb-2">
								状态
							</Label>
							<Select
								value={statusFilter}
								onValueChange={(value) =>
									setStatusFilter(value as DisputeStatus | "ALL")
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">全部状态</SelectItem>
									<SelectItem value="PENDING">待处理</SelectItem>
									<SelectItem value="VOTING">投票中</SelectItem>
									<SelectItem value="RESOLVED">已解决</SelectItem>
									<SelectItem value="EXPIRED">已过期</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{loading && disputes.length === 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div
								key={i}
								className="h-56 bg-gray-200 animate-pulse rounded-lg"
							/>
						))}
					</div>
				) : filteredDisputes.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredDisputes.map((dispute) => (
							<DisputeCard key={dispute.id} dispute={dispute} />
						))}
					</div>
				) : (
					<div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							暂无争议
						</h3>
						<p className="text-gray-600 mb-6">
							尝试调整筛选条件或发起新的争议
						</p>
						{searchTerm && (
							<Button
								variant="outline"
								onClick={() => setSearchTerm("")}
								className="border-gray-300"
							>
								清除搜索
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
