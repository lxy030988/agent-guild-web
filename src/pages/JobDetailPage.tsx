import { useAtom } from "jotai"
import { useCallback, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Link, useNavigate, useParams } from "react-router-dom"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"
import { waitForTransactionReceipt } from "wagmi/actions"
import JobStatusBadge from "../components/JobStatusBadge"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import { useAuth } from "../hooks/useAuth"
import { useJobContract } from "../hooks/useJobContract"
import {
	jobLoadingAtom,
	jobRecommendationsAtom,
	selectedJobAtom,
} from "../store/jobAtoms"
// Agent and Dispute features removed in job-only branch
// import { type Agent, agentApi } from "../utils/agent-api"
// import { disputeApi } from "../utils/disputeApi"
// import { useConfirm } from "../hooks/useConfirm"
// import { useDisputeContract } from "../hooks/useDisputeContract"
import {
	jobApi,
	JobCategoryLabels,
	JobStatus,
	MatchingModeDescriptions,
	MatchingModeLabels,
} from "../utils/job-api"
// import {
// 	type JobApplication,
// 	jobApplicationApi,
// } from "../utils/job-application-api"
import { config } from "../wagmi.config"

export default function JobDetailPage() {
	const { id } = useParams<{ id: string }>()
	const _navigate = useNavigate()
	const { user } = useAuth()

	const { assignAgentOnChain, completeJobOnChain, cancelJobOnChain } =
		useJobContract()

	const [job, setJob] = useAtom(selectedJobAtom)
	const [recommendations, setRecommendations] = useAtom(jobRecommendationsAtom)
	const [loading, setLoading] = useAtom(jobLoadingAtom)
	const [actionLoading, setActionLoading] = useState(false)

	// Action states
	const [showApproveModal, setShowApproveModal] = useState(false)
	const [rating, setRating] = useState(5)
	const [feedback, setFeedback] = useState("")

	// ===== DISABLED: Agent & Application features =====
	// const [showRejectModal, setShowRejectModal] = useState(false)
	// const [rejectReason, setRejectReason] = useState("")
	// const [showApplyModal, setShowApplyModal] = useState(false)
	// const [applyMessage, setApplyMessage] = useState("")
	// const [selectedAgentForApply, setSelectedAgentForApply] = useState<number | null>(null)
	// const [applications, setApplications] = useState<JobApplication[]>([])
	// const [myAgents, setMyAgents] = useState<Agent[]>([])

	// Load job details
	const loadJob = useCallback(async () => {
		if (!id) return

		try {
			setLoading(true)
			const jobData = await jobApi.getJob(Number(id))
			setJob(jobData)

			// Load recommendations - commenting out since it depends on Agent
			// const recs = await jobApi.getRecommendations(Number(id))
			// setRecommendations(recs)
		} catch (error) {
			console.error("Failed to load job:", error)
		} finally {
			setLoading(false)
		}
	}, [id, setJob, setLoading])

	useEffect(() => {
		loadJob()
	}, [loadJob])

	// ===== DISABLED: Dispute transaction monitoring =====
	// const { confirm, ConfirmDialog } = useConfirm()
	// const { createDispute: createDisputeOnChain, hash: disputeHash } = useDisputeContract()
	// const { data: disputeReceipt } = useWaitForTransactionReceipt({ hash: disputeHash })
	// useEffect(() => { ... dispute sync logic ... }, [disputeReceipt, job, showRejectModal, rejectReason, loadJob])

	// Permission checks
	const isOwner = job && user && job.ownerId === user.id
	// const isAgentOwner = job && user && job.assignedAgent?.owner?.id === user.id

	// ===== DISABLED: Load applications =====
	// const loadApplications = useCallback(async () => { ... }, [job])
	// useEffect(() => { if (job && isOwner && job.status === JobStatus.OPEN) { loadApplications() } }, [job, isOwner, loadApplications])

	// ===== DISABLED: Load user's agents =====
	// useEffect(() => { if (!user) return; const loadMyAgents = async () => { ... }; loadMyAgents() }, [user])

	// Actions
	const handleCancelJob = async () => {
		if (!job) return

		const confirmed = window.confirm("确定要取消这个任务吗？")
		if (!confirmed) return

		try {
			setActionLoading(true)

			// 如果有 chainJobId，先调用链上取消
			if (job.chainJobId) {
				toast.info("正在调用智能合约取消任务...")
				const { txHash } = await cancelJobOnChain(BigInt(job.chainJobId))

				// 等待交易确认
				await waitForTransactionReceipt(config, {
					hash: txHash,
					timeout: 60_000,
				})
				toast.success("链上任务已成功取消并退款")
			}

			await jobApi.cancelJob(job.id)
			await loadJob()
			toast.success("任务已取消")
		} catch (error: any) {
			console.error("Cancel error:", error)
			toast.error(error.message || error.response?.data?.message || "取消失败")
		} finally {
			setActionLoading(false)
		}
	}

	// ===== DISABLED: Agent owner actions =====
	// const handleAccept = async () => { ... }
	// const handleStart = async () => { ... }

	const handleApprove = async () => {
		if (!job) return

		try {
			setActionLoading(true)

			// ===== DISABLED: Smart contract integration with agent =====
			// if (job.matchingMode === MatchingMode.SMART && job.chainJobId) {
			// 	toast.info("正在调用智能合约...")
			// 	const agentOwnerAddress = job.assignedAgent?.owner?.walletAddress
			// 	if (!agentOwnerAddress) throw new Error("找不到 Agent 钱包地址")
			// 	... assign and complete logic ...
			// }

			// 直接更新后端状态（暂时不调用链上）
			await jobApi.approveJob(job.id, rating, feedback)
			await loadJob()
			setShowApproveModal(false)
			toast.success("验收通过")
		} catch (error: any) {
			console.error("Approve error:", error)
			toast.error(error.message || error.response?.data?.message || "验收失败")
		} finally {
			setActionLoading(false)
		}
	}

	// ===== DISABLED: Agent assignment =====
	// const handleAssignAgent = async (agentId: number) => { ... }

	// ===== DISABLED: Dispute/Reject functionality =====
	// const handleReject = async () => { ... dispute logic ... }

	// ===== DISABLED: Application system =====
	// const handleApplyToJob = async () => { ... }
	// const handleAcceptApplication = async (applicationId: number) => { ... }
	// const handleRejectApplication = async (applicationId: number) => { ... }

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 pt-20 pb-12 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
			</div>
		)
	}

	if (!job) {
		return (
			<div className="min-h-screen bg-gray-50 pt-20 pb-12">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">任务不存在</h1>
					<Link to="/jobs" className="text-blue-600 hover:text-blue-700">
						返回任务列表
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 pt-20 pb-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-6">
					<Link
						to="/jobs"
						className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
					>
						<svg
							className="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Back Icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						返回列表
					</Link>

					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								{job.title}
							</h1>
							<div className="flex items-center gap-3">
								<span className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded">
									{JobCategoryLabels[job.category]}
								</span>
								<JobStatusBadge status={job.status} />
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex items-center gap-3">
							{isOwner && job.status === JobStatus.OPEN && (
								<>
									<Link
										to={`/jobs/${job.id}/edit`}
										className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
									>
										编辑
									</Link>
									<Button
										variant="outline"
										onClick={handleCancelJob}
										disabled={actionLoading}
										className="border-red-300 text-red-600 hover:bg-red-50"
									>
										取消任务
									</Button>
								</>
							)}

							{/* DISABLED: Agent owner actions */}
							{/* {isAgentOwner && job.status === JobStatus.OPEN && job.assignedAgentId && (
								<Button onClick={handleAccept} disabled={actionLoading}>接受任务</Button>
							)} */}

							{isOwner && job.status === JobStatus.SUBMITTED && (
								<>
									<Button
										onClick={() => setShowApproveModal(true)}
										className="bg-green-600 hover:bg-green-700"
									>
										验收通过
									</Button>
									{/* DISABLED: Reject button */}
									{/* <Button variant="outline" onClick={() => setShowRejectModal(true)}>拒绝验收</Button> */}
								</>
							)}
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Job Details */}
					<div className="lg:col-span-2 space-y-6">
						{/* Basic Info */}
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-semibold mb-4">任务详情</h2>

							<div className="space-y-4">
								<div>
									<Label>描述</Label>
									<p className="text-gray-900 whitespace-pre-wrap mt-1">
										{job.description}
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>预算</Label>
										<p className="text-2xl font-bold text-blue-600 mt-1">
											${job.budget} {job.currency}
										</p>
									</div>
									<div>
										<Label>预计耗时</Label>
										<p className="text-gray-900 mt-1">
											{job.estimatedDuration
												? `${job.estimatedDuration} 分钟`
												: "未指定"}
										</p>
									</div>
								</div>

								<div>
									<Label>匹配模式</Label>
									<p className="text-gray-900 mt-1 font-medium">
										{MatchingModeLabels[job.matchingMode]}
									</p>
									<p className="text-sm text-gray-500 mt-1">
										{MatchingModeDescriptions[job.matchingMode]}
									</p>
								</div>

								<div>
									<Label className="mb-2">所需能力</Label>
									<div className="flex flex-wrap gap-2">
										{job.requiredCapabilities.map((cap) => (
											<span
												key={cap}
												className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100"
											>
												{cap}
											</span>
										))}
									</div>
								</div>

								{job.tags.length > 0 && (
									<div>
										<Label className="mb-2">标签</Label>
										<div className="flex flex-wrap gap-2">
											{job.tags.map((tag) => (
												<span
													key={tag}
													className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
												>
													#{tag}
												</span>
											))}
										</div>
									</div>
								)}

								<div>
									<Label>发布者</Label>
									<div className="flex items-center gap-2 mt-1">
										<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
											{job.owner.name?.[0] || job.owner.walletAddress[2]}
										</div>
										<span className="text-gray-900">
											{job.owner.name ||
												`${job.owner.walletAddress.slice(0, 6)}...${job.owner.walletAddress.slice(-4)}`}
										</span>
									</div>
								</div>

								{job.inputData && (
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											输入数据
										</h3>
										<div className="bg-gray-50 p-4 rounded-lg">
											<p className="whitespace-pre-wrap text-gray-700">
												{typeof job.inputData === "string"
													? job.inputData
													: (job.inputData as any).content ||
														JSON.stringify(job.inputData, null, 2)}
											</p>
										</div>
									</div>
								)}

								{job.resultData && (
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											执行结果
										</h3>
										<div className="bg-gray-50 p-4 rounded-lg">
											<ReactMarkdown remarkPlugins={[remarkGfm]}>
												{typeof job.resultData === "string"
													? job.resultData
													: (job.resultData as any).text ||
														(job.resultData as any).output ||
														JSON.stringify(job.resultData, null, 2)}
											</ReactMarkdown>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Right Column - Sidebar */}
					<div className="space-y-6">
						{/* Job Info Card */}
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h3 className="font-semibold mb-4">任务信息</h3>
							<div className="space-y-3 text-sm">
								<div>
									<span className="text-gray-500">状态:</span>
									<span className="ml-2 font-medium">
										<JobStatusBadge status={job.status} />
									</span>
								</div>
								<div>
									<span className="text-gray-500">创建时间:</span>
									<span className="ml-2">
										{new Date(job.createdAt).toLocaleString("zh-CN")}
									</span>
								</div>
								{job.chainJobId && (
									<div>
										<span className="text-gray-500">链上 ID:</span>
										<span className="ml-2 font-mono text-xs">
											{job.chainJobId}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Approve Modal */}
				{showApproveModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
							<h3 className="text-xl font-semibold mb-4">验收通过</h3>

							<div className="space-y-4">
								<div>
									<Label>评分 (1-5星)</Label>
									<Select
										value={rating.toString()}
										onValueChange={(v) => setRating(Number(v))}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{[1, 2, 3, 4, 5].map((r) => (
												<SelectItem key={r} value={r.toString()}>
													{r} 星
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label>反馈（可选）</Label>
									<Textarea
										value={feedback}
										onChange={(e) => setFeedback(e.target.value)}
										placeholder="对任务完成情况的评价..."
										rows={4}
									/>
								</div>

								<div className="flex gap-3 justify-end">
									<Button
										variant="outline"
										onClick={() => setShowApproveModal(false)}
										disabled={actionLoading}
									>
										取消
									</Button>
									<Button
										onClick={handleApprove}
										disabled={actionLoading}
										className="bg-green-600 hover:bg-green-700"
									>
										{actionLoading ? "处理中..." : "确认通过"}
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* DISABLED: Confirm Dialog component */}
				{/* {ConfirmDialog} */}
			</div>
		</div>
	)
}
