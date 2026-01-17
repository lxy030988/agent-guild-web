import { format, formatDistanceToNow } from "date-fns"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { waitForTransactionReceipt } from "wagmi/actions"
import { VoteButton } from "../components/dao/VoteButton"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { useDisputeContract } from "../hooks/useDisputeContract"
import {
	type Dispute,
	DisputeStatus,
	disputeApi,
	VoteChoice,
} from "../utils/disputeApi"
import { config } from "../wagmi.config"

export default function DisputeDetailPage() {
	const { id } = useParams()
	const navigate = useNavigate()
	const [dispute, setDispute] = useState<Dispute | null>(null)
	const [loading, setLoading] = useState(true)
	const [actionLoading, setActionLoading] = useState(false)
	const [selectedChoice, setSelectedChoice] = useState<VoteChoice | null>(null)

	const { voteOnChain, resolveDisputeOnChain } = useDisputeContract()

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
		if (!dispute.chainDisputeId) {
			toast.error("链上争议 ID 缺失，无法投票")
			return
		}
		try {
			setActionLoading(true)
			setSelectedChoice(choice)
			const choiceMap = {
				[VoteChoice.APPROVE]: 0,
				[VoteChoice.REJECT]: 1,
				[VoteChoice.ABSTAIN]: 2,
			}

			toast.info("正在提交链上投票...")
			const { txHash } = await voteOnChain(
				BigInt(dispute.chainDisputeId),
				choiceMap[choice],
			)

			await waitForTransactionReceipt(config, {
				hash: txHash,
				timeout: 60_000,
			})

			await disputeApi.submitVote(Number.parseInt(id), {
				choice,
				tokenWeight: "1",
				reason: "Voted via DAO interface",
			})

			toast.success("投票已记录")
			await loadDispute()
		} catch (error: any) {
			console.error("Vote error:", error)
			toast.error(error?.message || "投票失败")
		} finally {
			setActionLoading(false)
			setSelectedChoice(null)
		}
	}

	const handleResolve = async () => {
		if (!id || !dispute) return
		if (!dispute.chainDisputeId) {
			toast.error("链上争议 ID 缺失，无法执行")
			return
		}

		try {
			setActionLoading(true)
			toast.info("正在触发链上裁决...")
			const { txHash } = await resolveDisputeOnChain(
				BigInt(dispute.chainDisputeId),
			)

			await waitForTransactionReceipt(config, {
				hash: txHash,
				timeout: 60_000,
			})

			await disputeApi.resolveDispute(Number.parseInt(id))
			toast.success("争议已解决")
			await loadDispute()
		} catch (error: any) {
			console.error("Resolve error:", error)
			toast.error(error?.message || "执行失败")
		} finally {
			setActionLoading(false)
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 pt-20 pb-12 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
			</div>
		)
	}

	if (!dispute) {
		return (
			<div className="min-h-screen bg-gray-50 pt-20 pb-12">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						争议不存在
					</h1>
					<Link to="/dao" className="text-blue-600 hover:text-blue-700">
						返回争议列表
					</Link>
				</div>
			</div>
		)
	}

	const totalVotes =
		dispute.approveVotes + dispute.rejectVotes + dispute.abstainVotes
	const isExpired =
		dispute.votingEndsAt && new Date() > new Date(dispute.votingEndsAt)
	const canVote = dispute.status === DisputeStatus.VOTING && !isExpired

	return (
		<div className="min-h-screen bg-gray-50 pt-20 pb-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-6">
					<Link
						to="/dao"
						className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
					>
						<ArrowLeft className="w-5 h-5 mr-2" />
						返回争议列表
					</Link>

					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								{dispute.job?.title || "争议详情"}
							</h1>
							<div className="flex items-center gap-3">
								<Badge
									className={`px-3 py-1 ${
										dispute.status === DisputeStatus.VOTING
											? "bg-amber-100 text-amber-700"
											: "bg-emerald-100 text-emerald-700"
									}`}
								>
									{dispute.status}
								</Badge>
								<span className="text-sm text-gray-500">ID: #{dispute.id}</span>
							</div>
						</div>

						{isExpired && dispute.status === DisputeStatus.VOTING && (
							<Button
								onClick={handleResolve}
								disabled={actionLoading}
								className="bg-blue-600 hover:bg-blue-700"
							>
								{actionLoading ? "处理中..." : "触发结案"}
							</Button>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-6">
						{dispute.status === DisputeStatus.RESOLVED && (
							<div className="bg-white rounded-lg border border-gray-200 p-6">
								<h2 className="text-xl font-semibold mb-2">最终裁决</h2>
								<p className="text-gray-900 font-medium">
									{dispute.resolution || "已结案"}
								</p>
								{dispute.resolvedAt && (
									<p className="text-sm text-gray-500 mt-1">
										{format(new Date(dispute.resolvedAt), "PPP p")}
									</p>
								)}
							</div>
						)}

						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-semibold mb-4">争议详情</h2>
							<div className="space-y-4">
								<div>
									<Label>争议原因</Label>
									<p className="text-gray-900 whitespace-pre-wrap mt-1">
										{dispute.reason}
									</p>
								</div>
								{dispute.evidence && (
									<div>
										<Label>证据链接</Label>
										<a
											href={dispute.evidence}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-1"
										>
											查看证据 <ExternalLink className="w-4 h-4" />
										</a>
									</div>
								)}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>提交时间</Label>
										<p className="text-gray-900 mt-1">
											{new Date(dispute.createdAt).toLocaleString("zh-CN")}
										</p>
									</div>
									<div>
										<Label>投票截止</Label>
										<p className="text-gray-900 mt-1">
											{dispute.votingEndsAt
												? formatDistanceToNow(new Date(dispute.votingEndsAt))
												: "未设置"}
										</p>
									</div>
								</div>
							</div>
						</div>

						{canVote && (
							<div className="bg-white rounded-lg border border-gray-200 p-6">
								<h2 className="text-xl font-semibold mb-4">参与投票</h2>
								<div className="flex flex-col sm:flex-row gap-3">
									<VoteButton
										choice={VoteChoice.APPROVE}
										selected={selectedChoice === VoteChoice.APPROVE}
										disabled={actionLoading}
										loading={actionLoading}
										onClick={handleVote}
									/>
									<VoteButton
										choice={VoteChoice.REJECT}
										selected={selectedChoice === VoteChoice.REJECT}
										disabled={actionLoading}
										loading={actionLoading}
										onClick={handleVote}
									/>
									<VoteButton
										choice={VoteChoice.ABSTAIN}
										selected={selectedChoice === VoteChoice.ABSTAIN}
										disabled={actionLoading}
										loading={actionLoading}
										onClick={handleVote}
									/>
								</div>
							</div>
						)}
					</div>

					<div className="space-y-6">
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-semibold mb-4">投票统计</h2>
							<div className="space-y-4">
								<div>
									<div className="flex justify-between text-sm mb-1">
										<span className="text-emerald-600">赞成</span>
										<span className="font-medium">{dispute.approveVotes}</span>
									</div>
									<div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
										<div
											className="h-full bg-emerald-500"
											style={{
												width: `${totalVotes > 0 ? (dispute.approveVotes / totalVotes) * 100 : 0}%`,
											}}
										/>
									</div>
								</div>
								<div>
									<div className="flex justify-between text-sm mb-1">
										<span className="text-rose-600">反对</span>
										<span className="font-medium">{dispute.rejectVotes}</span>
									</div>
									<div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
										<div
											className="h-full bg-rose-500"
											style={{
												width: `${totalVotes > 0 ? (dispute.rejectVotes / totalVotes) * 100 : 0}%`,
											}}
										/>
									</div>
								</div>
								<div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
									<span>总投票数</span>
									<span className="font-medium">{totalVotes}</span>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-semibold mb-4">关联任务</h2>
							<div className="space-y-2">
								<div>
									<Label>预算</Label>
									<p className="text-gray-900 mt-1">
										{dispute.job?.budget ? `${dispute.job?.budget} ETH` : "-"}
									</p>
								</div>
								<div>
									<Label>发布者</Label>
									<p className="text-gray-900 mt-1">
										{dispute.creator?.username || "未知"}
									</p>
								</div>
								<Button
									variant="outline"
									onClick={() => navigate(`/jobs/${dispute.jobId}`)}
									className="w-full mt-2"
								>
									查看任务详情
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
