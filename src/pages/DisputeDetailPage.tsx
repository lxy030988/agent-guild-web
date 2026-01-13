import { format, formatDistanceToNow } from "date-fns"
import {
	ArrowLeft,
	ChevronRight,
	Clock,
	ExternalLink,
	Gavel,
	Info,
	ShieldAlert,
	Trophy,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { VoteButton } from "../components/dao/VoteButton"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { useDisputeContract } from "../hooks/useDisputeContract"
import {
	type Dispute,
	DisputeStatus,
	disputeApi,
	VoteChoice,
} from "../utils/disputeApi"

export default function DisputeDetailPage() {
	const { id } = useParams()
	const navigate = useNavigate()
	const [dispute, setDispute] = useState<Dispute | null>(null)
	const [loading, setLoading] = useState(true)
	const [voteLoading, setVoteLoading] = useState(false)
	const [selectedChoice, setSelectedChoice] = useState<VoteChoice | null>(null)
	const [isResolvingDispute, setIsResolvingDispute] = useState(false) // 新增：标识是否在 resolve

	const { vote, resolveDispute, isConfirming, isSuccess, hash } =
		useDisputeContract()

	const loadDispute = useCallback(async () => {
		if (!id) return
		try {
			setLoading(true)
			const data = await disputeApi.getDisputeById(parseInt(id))
			setDispute(data)
		} catch (error) {
			console.error("Failed to load dispute:", error)
			toast.error("Dispute not found")
			navigate("/dao")
		} finally {
			setLoading(false)
		}
	}, [id, navigate])

	useEffect(() => {
		loadDispute()
	}, [loadDispute])

	const handleVote = async (choice: VoteChoice) => {
		if (!dispute || !id) return
		try {
			setVoteLoading(true)
			setSelectedChoice(choice)
			setIsResolvingDispute(false) // 明确标识这是投票操作

			// 1. 调用链上投票
			// choice 映射: APPROVE=0, REJECT=1, ABSTAIN=2 (根据合约枚举顺序)
			const choiceMap = {
				[VoteChoice.APPROVE]: 0,
				[VoteChoice.REJECT]: 1,
				[VoteChoice.ABSTAIN]: 2,
			}

			// 使用真实的链上 ID (chainDisputeId) 进行合约交互
			const contractDisputeId = dispute.chainDisputeId
				? BigInt(dispute.chainDisputeId)
				: BigInt(id)

			vote(contractDisputeId, choiceMap[choice])

			// 合约成功后的处理由下面的 useEffect 触发
		} catch (error: any) {
			toast.error("Voting failed", { description: error.message })
			setVoteLoading(false)
		}
	}

	const handleResolve = async () => {
		if (!id) return
		try {
			setVoteLoading(true)
			setIsResolvingDispute(true) // 明确标识这是 resolve 操作

			// 使用真实的链上 ID (chainDisputeId) 进行合约交互
			const contractDisputeId = dispute?.chainDisputeId
				? BigInt(dispute.chainDisputeId)
				: BigInt(id)

			resolveDispute(contractDisputeId)
		} catch (error: any) {
			toast.error("Failed to trigger resolution", {
				description: error.message,
			})
			setVoteLoading(false)
			setIsResolvingDispute(false)
		}
	}

	const syncVoteToBackend = useCallback(async () => {
		if (!id || !selectedChoice) return
		try {
			await disputeApi.submitVote(Number.parseInt(id), {
				choice: selectedChoice,
				tokenWeight: "1", // 默认
				reason: "Voted via DAO interface",
			})
			toast.success("Vote recorded successfully!")
			loadDispute()
		} catch (error: any) {
			toast.error("Blockchain success, backend sync pending", {
				description: (error as Error).message,
			})
		} finally {
			setVoteLoading(false)
			setSelectedChoice(null)
		}
	}, [id, selectedChoice, loadDispute])

	const syncResolutionToBackend = useCallback(async () => {
		if (!id) return
		try {
			await disputeApi.resolveDispute(Number.parseInt(id))
			toast.success("Dispute resolved successfully!")
			loadDispute()
		} catch (error: any) {
			toast.error("Blockchain resolution success, backend refresh needed")
		} finally {
			setVoteLoading(false)
			setIsResolvingDispute(false)
		}
	}, [id, loadDispute])

	// 监听合约交易成功，同步到后端
	useEffect(() => {
		if (isSuccess && hash && dispute && id) {
			// 使用明确的标志位判断操作类型
			if (isResolvingDispute) {
				// 同步解决状态
				syncResolutionToBackend()
			} else if (selectedChoice) {
				// 同步投票
				syncVoteToBackend()
			}
		}
	}, [
		isSuccess,
		hash,
		dispute,
		id,
		isResolvingDispute,
		selectedChoice,
		syncVoteToBackend,
		syncResolutionToBackend,
	])

	if (loading) {
		return (
			<div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
			</div>
		)
	}

	if (!dispute) return null

	const totalVotes =
		dispute.approveVotes + dispute.rejectVotes + dispute.abstainVotes
	const isExpired =
		dispute.votingEndsAt && new Date() > new Date(dispute.votingEndsAt)
	const canVote = dispute.status === DisputeStatus.VOTING && !isExpired

	return (
		<div className="min-h-screen bg-[#F8FAFC] pt-24 pb-16">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Navigation */}
				<Link
					to="/dao"
					className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
				>
					<ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
					Back to DAO Governance
				</Link>

				{/* Header Section */}
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
					<div>
						<div className="flex items-center gap-3 mb-2">
							<Badge
								className={`px-4 py-1.5 text-sm rounded-full ${
									dispute.status === DisputeStatus.VOTING
										? "bg-amber-100 text-amber-700"
										: "bg-emerald-100 text-emerald-700"
								}`}
							>
								{dispute.status}
							</Badge>
							<span className="text-slate-400 font-mono text-xs">
								ID: #{dispute.id}
							</span>
						</div>
						<h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
							{dispute.job?.title || "Case Detail"}
						</h1>
					</div>

					{canVote && (
						<div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
							<Clock className="w-5 h-5 text-amber-500" />
							<div>
								<p className="text-[10px] uppercase font-bold text-slate-400">
									Ends In
								</p>
								<p className="text-sm font-bold text-slate-700">
									{formatDistanceToNow(new Date(dispute.votingEndsAt!))}
								</p>
							</div>
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						{/* Resolution Block */}
						{dispute.status === DisputeStatus.RESOLVED && (
							<Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-xl overflow-hidden relative">
								<div className="absolute top-0 right-0 p-8 opacity-10">
									<Trophy className="w-32 h-32" />
								</div>
								<CardHeader>
									<CardTitle className="text-xl flex items-center gap-2">
										<Gavel className="w-6 h-6" /> Final Resolution
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-black mb-2">
										{dispute.resolution || "Case Closed"}
									</p>
									<p className="text-blue-100 text-sm">
										Resolved on {format(new Date(dispute.resolvedAt!), "PPP p")}
									</p>
								</CardContent>
							</Card>
						)}

						{/* Voting Period Ended Alert */}
						{isExpired && dispute.status === DisputeStatus.VOTING && (
							<Card className="bg-amber-50 border-amber-200">
								<CardContent className="pt-6">
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
											<ShieldAlert className="w-6 h-6" />
										</div>
										<div>
											<h4 className="font-black text-amber-900">
												Voting Period Ended
											</h4>
											<p className="text-sm text-amber-700">
												The case is ready to be finalized. Any DAO member can
												trigger the resolution.
											</p>
										</div>
										<Button
											onClick={handleResolve}
											disabled={voteLoading || isConfirming}
											className="ml-auto bg-amber-600 hover:bg-amber-700 text-white font-bold"
										>
											{voteLoading ? "Processing..." : "Trigger Resolve"}
										</Button>
									</div>
								</CardContent>
							</Card>
						)}

						<Card className="border-slate-100 shadow-sm rounded-3xl">
							<CardHeader className="pb-4">
								<CardTitle className="text-xl font-bold flex items-center gap-2">
									<Info className="w-5 h-5 text-indigo-500" /> Case Description
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="bg-slate-50 p-6 rounded-2xl">
									<p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
										{dispute.reason}
									</p>
								</div>

								{dispute.evidence && (
									<div>
										<h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
											Evidence Linked
										</h4>
										<a
											href={dispute.evidence}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-indigo-600 font-bold hover:bg-slate-50 transition-all shadow-sm"
										>
											View Documents <ExternalLink className="w-4 h-4" />
										</a>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Voting Section */}
						{canVote && (
							<div className="space-y-4">
								<h3 className="text-xl font-black text-slate-900">
									Cast Your Vote
								</h3>
								<div className="flex flex-col sm:flex-row gap-4">
									<VoteButton
										choice={VoteChoice.APPROVE}
										selected={selectedChoice === VoteChoice.APPROVE}
										disabled={voteLoading || isConfirming}
										loading={voteLoading || isConfirming}
										onClick={handleVote}
									/>
									<VoteButton
										choice={VoteChoice.REJECT}
										selected={selectedChoice === VoteChoice.REJECT}
										disabled={voteLoading || isConfirming}
										loading={voteLoading || isConfirming}
										onClick={handleVote}
									/>
									<VoteButton
										choice={VoteChoice.ABSTAIN}
										selected={selectedChoice === VoteChoice.ABSTAIN}
										disabled={voteLoading || isConfirming}
										loading={voteLoading || isConfirming}
										onClick={handleVote}
									/>
								</div>
							</div>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						<Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
							<CardHeader className="bg-slate-900 text-white pb-6 pt-8">
								<CardTitle className="text-2xl font-black">
									Vote Results
								</CardTitle>
								<CardDescription className="text-slate-400">
									Current tally from DAO members
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-8 space-y-8">
								{/* Approve Progress */}
								<div className="space-y-3">
									<div className="flex justify-between items-end">
										<span className="text-sm font-black text-slate-800">
											Support Case
										</span>
										<span className="text-2xl font-black text-emerald-600">
											{dispute.approveVotes}{" "}
											<span className="text-[10px] text-slate-400">Tokens</span>
										</span>
									</div>
									<div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
										<div
											className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
											style={{
												width: `${totalVotes > 0 ? (dispute.approveVotes / totalVotes) * 100 : 0}%`,
											}}
										/>
									</div>
								</div>

								{/* Reject Progress */}
								<div className="space-y-3">
									<div className="flex justify-between items-end">
										<span className="text-sm font-black text-slate-800">
											Reject Case
										</span>
										<span className="text-2xl font-black text-rose-600">
											{dispute.rejectVotes}{" "}
											<span className="text-[10px] text-slate-400">Tokens</span>
										</span>
									</div>
									<div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
										<div
											className="h-full bg-rose-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
											style={{
												width: `${totalVotes > 0 ? (dispute.rejectVotes / totalVotes) * 100 : 0}%`,
											}}
										/>
									</div>
								</div>

								<Separator />

								<div className="flex justify-between py-2">
									<span className="text-slate-500 font-bold">
										Total Weight Cast
									</span>
									<span className="font-bold text-slate-900">
										{totalVotes} LALAMPA
									</span>
								</div>
							</CardContent>
						</Card>

						{/* Related Job Info */}
						<Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:border-indigo-200 transition-all group">
							<CardHeader className="pb-4">
								<CardTitle className="text-lg font-bold flex items-center justify-between">
									Original Job
									<Link
										to={`/jobs/${dispute.jobId}`}
										className="text-indigo-600 group-hover:translate-x-1 transition-transform"
									>
										<ChevronRight className="w-5 h-5" />
									</Link>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
											Budget
										</p>
										<p className="text-lg font-black text-slate-900">
											{dispute.job?.budget} ETH
										</p>
									</div>
									<Separator />
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
												Owner
											</p>
											<p className="text-sm font-bold truncate">
												{dispute.creator?.username || "Loading..."}
											</p>
										</div>
										<div>
											<p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
												Agent
											</p>
											<p className="text-sm font-bold truncate">
												{dispute.job?.assignedAgent?.name || "Unassigned"}
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
