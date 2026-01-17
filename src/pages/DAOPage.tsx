import { Filter, RefreshCw, Search } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { CreateDisputeDialog } from "../components/dao/CreateDisputeDialog"
import { DisputeCard } from "../components/dao/DisputeCard"
import { DisputeStats } from "../components/dao/DisputeStats"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
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
	const [activeStatus, setActiveStatus] = useState<DisputeStatus | "ALL">("ALL")
	const [searchQuery, setSearchQuery] = useState("")

	const fetchData = useCallback(async () => {
		try {
			setLoading(true)
			const [disputeList, statsData] = await Promise.all([
				disputeApi.listDisputes(
					activeStatus !== "ALL"
						? { status: activeStatus as DisputeStatus }
						: undefined,
				),
				disputeApi.getStatistics(),
			])
			setDisputes(disputeList || [])
			setStats(statsData)
		} catch (error) {
			console.error("Failed to fetch DAO data:", error)
			toast.error("Failed to load DAO platform data")
			setDisputes([]) // 发生错误时确保是空数组
		} finally {
			setLoading(false)
		}
	}, [activeStatus])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	const filteredDisputes = disputes.filter(
		(d) =>
			d.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			d.reason?.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	return (
		<div className="min-h-screen bg-[#F8FAFC] pt-24 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Hero Section */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
					<div>
						<h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
							DAO Governance{" "}
							<span className="text-indigo-600">Dispute Center</span>
						</h1>
						<p className="mt-3 text-lg text-slate-600 max-w-2xl">
							Decentralized resolution for job disputes. Stake your governance
							tokens to vote and ensure platform fairness.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							size="icon"
							onClick={fetchData}
							disabled={loading}
							className="rounded-full hover:bg-white hover:text-indigo-600 border-slate-200"
						>
							<RefreshCw
								className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
							/>
						</Button>
						<CreateDisputeDialog onSuccess={fetchData} />
					</div>
				</div>

				{/* Stats Grid */}
				<DisputeStats stats={stats} loading={loading} />

				{/* Filters & Search */}
				<div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row items-center justify-between gap-4">
					<div className="flex p-1 bg-slate-50 rounded-xl w-full lg:w-auto overflow-x-auto no-scrollbar gap-1">
						{(["ALL", "PENDING", "VOTING", "RESOLVED"] as const).map(
							(status) => (
								<Button
									key={status}
									variant={activeStatus === status ? "default" : "ghost"}
									size="sm"
									type="button"
									onClick={() => setActiveStatus(status as any)}
									className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
										activeStatus === status
											? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200 hover:bg-white"
											: "text-slate-500 hover:text-slate-700"
									}`}
								>
									{status}
								</Button>
							),
						)}
					</div>

					<div className="relative w-full lg:w-96">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
						<Input
							placeholder="Search disputes by title or reason..."
							className="pl-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				{/* Disputes Grid */}
				{loading && disputes.length === 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div
								key={i}
								className="h-64 bg-slate-200 animate-pulse rounded-2xl"
							/>
						))}
					</div>
				) : filteredDisputes.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{filteredDisputes.map((dispute) => (
							<DisputeCard key={dispute.id} dispute={dispute} />
						))}
					</div>
				) : (
					<div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center">
						<div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
							<Filter className="h-10 w-10 text-slate-300" />
						</div>
						<h3 className="text-xl font-bold text-slate-800">
							No disputes found
						</h3>
						<p className="text-slate-500 mt-2 max-w-sm mx-auto">
							{searchQuery
								? `No results for "${searchQuery}". Try a different term.`
								: "Everything looks smooth! No cases match your selection."}
						</p>
						{searchQuery && (
							<Button
								variant="link"
								onClick={() => setSearchQuery("")}
								className="mt-4 text-indigo-600"
							>
								Clear Search
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
