import { useAtom } from "jotai"
import { useCallback, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Link, useNavigate, useParams } from "react-router-dom"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"
import { useWaitForTransactionReceipt } from "wagmi"
import { readContract, waitForTransactionReceipt } from "wagmi/actions"
import { DISPUTE_RESOLUTION_ABI } from "../abis/DisputeResolution"
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
import { useConfirm } from "../hooks/useConfirm"
import { useDisputeContract } from "../hooks/useDisputeContract"
import { useJobContract } from "../hooks/useJobContract"
import {
	jobLoadingAtom,
	jobRecommendationsAtom,
	selectedJobAtom,
} from "../store/jobAtoms"
import { type Agent, agentApi } from "../utils/agent-api"
import { disputeApi } from "../utils/disputeApi"
import {
	JobCategoryLabels,
	JobStatus,
	jobApi,
	MatchingMode,
	MatchingModeDescriptions,
	MatchingModeLabels,
} from "../utils/job-api"
import {
	type JobApplication,
	jobApplicationApi,
} from "../utils/job-application-api"
import { config } from "../wagmi.config"

export default function JobDetailPage() {
	const { id } = useParams<{ id: string }>()
	const _navigate = useNavigate()
	const { user } = useAuth()
	const { confirm, ConfirmDialog } = useConfirm()

	const { assignAgentOnChain, completeJobOnChain, cancelJobOnChain } =
		useJobContract()
	const { createDispute: createDisputeOnChain, hash: disputeHash } =
		useDisputeContract()

	const [job, setJob] = useAtom(selectedJobAtom)
	const [recommendations, setRecommendations] = useAtom(jobRecommendationsAtom)
	const [loading, setLoading] = useAtom(jobLoadingAtom)
	const [actionLoading, setActionLoading] = useState(false)

	// Action states
	const [showApproveModal, setShowApproveModal] = useState(false)
	const [showRejectModal, setShowRejectModal] = useState(false)
	const [rating, setRating] = useState(5)
	const [feedback, setFeedback] = useState("")
	const [rejectReason, setRejectReason] = useState("")

	// Apply modal state
	const [showApplyModal, setShowApplyModal] = useState(false)
	const [applyMessage, setApplyMessage] = useState("")
	const [selectedAgentForApply, setSelectedAgentForApply] = useState<
		number | null
	>(null)

	// Applications state
	const [applications, setApplications] = useState<JobApplication[]>([])

	// User's agents for applying
	const [myAgents, setMyAgents] = useState<Agent[]>([])

	// Load job details
	const loadJob = useCallback(async () => {
		if (!id) return

		try {
			setLoading(true)
			const jobData = await jobApi.getJob(Number(id))
			setJob(jobData)

			// Only load recommendations for non-SMART modes
			// SMART mode auto-assigns, no need to show recommendations
			if (jobData.matchingMode !== MatchingMode.SMART) {
				const recs = await jobApi.getRecommendations(Number(id))
				setRecommendations(recs)
			} else {
				setRecommendations([])
			}
		} catch (error) {
			console.error("Failed to load job:", error)
		} finally {
			setLoading(false)
		}
	}, [id, setJob, setRecommendations, setLoading])

	useEffect(() => {
		loadJob()
	}, [loadJob])

	// 监听争议交易成功同步后端
	const { data: disputeReceipt } = useWaitForTransactionReceipt({
		hash: disputeHash,
	})

	useEffect(() => {
		if (disputeReceipt && job && showRejectModal) {
			const syncDispute = async () => {
				try {
					// 从日志中解析 disputeId
					// DisputeCreated(uint256 indexed disputeId, ...)
					// Indexed 参数在 topics 中：[signature, disputeId, jobId, creator]
					const disputeIdTopic = disputeReceipt.logs[0]?.topics[1]
					const chainDisputeId = disputeIdTopic
						? BigInt(disputeIdTopic).toString()
						: undefined

					console.log("Captured chainDisputeId:", chainDisputeId)

					// 从合约读取真实的截止时间
					let votingEndsAt: string | undefined
					if (chainDisputeId) {
						try {
							const { config } = await import("../wagmi.config")
							const disputeData = (await readContract(config, {
								address: disputeReceipt.to as `0x${string}`,
								abi: DISPUTE_RESOLUTION_ABI,
								functionName: "disputes",
								args: [BigInt(chainDisputeId)],
							})) as any

							// disputes(id) 返回元组，votingEndsAt 是第 6 个元素 (index 5)
							// 参考合约 struct Dispute: jobId(0), creator(1), evidenceHash(2), status(3), votingStartsAt(4), votingEndsAt(5)
							const endsAtUnix = disputeData[5]
							if (endsAtUnix) {
								votingEndsAt = new Date(Number(endsAtUnix) * 1000).toISOString()
								console.log("Captured real votingEndsAt:", votingEndsAt)
							}
						} catch (readErr) {
							console.warn("Failed to read votingEndsAt from chain:", readErr)
						}
					}

					const disputeTitle = `Dispute for Job #${job.id}: ${job.title}`
					const safeTitle =
						disputeTitle.length >= 5
							? disputeTitle
							: `Dispute for Job #${job.id}`

					await disputeApi.createDispute({
						jobId: job.id,
						title: safeTitle,
						reason: rejectReason,
						evidence: "ipfs://manual_reject_evidence",
						chainDisputeId,
						votingEndsAt,
					})
					toast.success("争议已发起并同步")
					setShowRejectModal(false)
					await loadJob()
				} catch (error) {
					console.error("Sync dispute error:", error)
					toast.error("争议已上链但同步后端失败")
				} finally {
					setActionLoading(false)
				}
			}
			syncDispute()
		}
	}, [disputeReceipt, job, showRejectModal, rejectReason, loadJob])

	// Permission checks
	const isOwner = job && user && job.ownerId === user.id
	const isAgentOwner = job && user && job.assignedAgent?.owner?.id === user.id

	// Load applications function
	const loadApplications = useCallback(async () => {
		if (!job) return
		try {
			const result = await jobApplicationApi.getJobApplications(job.id, {
				status: "PENDING",
			})
			setApplications(result.data)
		} catch (error) {
			console.error("Failed to load applications:", error)
		}
	}, [job])

	// Load applications if owner
	useEffect(() => {
		if (job && isOwner && job.status === JobStatus.OPEN) {
			loadApplications()
		}
	}, [job, isOwner, loadApplications])

	// Load user's agents for apply functionality
	useEffect(() => {
		if (!user) return
		const loadMyAgents = async () => {
			try {
				const result = await agentApi.getAgents({})
				// Filter to only user's agents - check owner.id instead of ownerId
				const userAgents = result.data.filter(
					(agent: Agent) => agent.owner?.id === user.id,
				)
				console.log("My agents:", userAgents) // Debug log
				setMyAgents(userAgents)
			} catch (error) {
				console.error("Failed to load my agents:", error)
			}
		}
		loadMyAgents()
	}, [user])

	// Actions
	const handleCancelJob = async () => {
		if (!job) return
		const confirmed = await confirm("确认取消", "确定要取消这个任务吗？")
		if (!confirmed) return

		try {
			setActionLoading(true)

			// 如果有 chainJobId，先调用链上取消
			if (job.chainJobId) {
				toast.info("正在调用智能合约取消任务...")
				const { txHash } = await cancelJobOnChain(BigInt(job.chainJobId))

				// 等待交易确认
				const { waitForTransactionReceipt } = await import("wagmi/actions")
				const { config } = await import("../wagmi.config")

				await waitForTransactionReceipt(config, {
					hash: txHash,
					timeout: 60_000,
				})
				toast.success("链上任务已成功取消并退款")
			}

			await jobApi.cancelJob(job.id)
			await loadJob()
			toast.success("任务已取消")
		} catch (error: unknown) {
			console.error("Cancel error:", error)
			toast.error(
				(error as any).message ||
					(error as any).response?.data?.message ||
					"取消失败",
			)
		} finally {
			setActionLoading(false)
		}
	}

	const handleAccept = async () => {
		if (!job) return

		try {
			setActionLoading(true)
			await jobApi.acceptJob(job.id)
			await loadJob()
			toast.success("任务已接受")
		} catch (error: unknown) {
			toast.error((error as any).response?.data?.message || "接受失败")
		} finally {
			setActionLoading(false)
		}
	}

	const handleStart = async () => {
		if (!job) return

		try {
			setActionLoading(true)
			await jobApi.startJob(job.id)
			await loadJob()
			toast.success("任务已开始执行")
		} catch (error: unknown) {
			toast.error((error as any).response?.data?.message || "开始失败")
		} finally {
			setActionLoading(false)
		}
	}

	const handleApprove = async () => {
		if (!job) return

		try {
			setActionLoading(true)

			// 智能匹配模式：需要先上链 assignAgent 再 completeJob
			if (job.matchingMode === MatchingMode.SMART && job.chainJobId) {
				toast.info("正在调用智能合约...")

				// 1. 获取 Agent Owner 的钱包地址
				const agentOwnerAddress = job.assignedAgent?.owner?.walletAddress
				if (!agentOwnerAddress) {
					throw new Error("找不到 Agent 钱包地址")
				}

				// 2. 先调用 assignAgent
				toast.info("正在分配 Agent...")
				const { txHash: assignHash } = await assignAgentOnChain(
					BigInt(job.chainJobId),
					agentOwnerAddress,
				)

				// 等待分配交易确认
				await waitForTransactionReceipt(config, {
					hash: assignHash,
					timeout: 60_000,
				})
				toast.success("Agent 已分配！")

				// 3. 再调用 completeJob 支付
				toast.info("正在支付...")
				const { txHash: completeHash } = await completeJobOnChain(
					BigInt(job.chainJobId),
				)

				// 等待支付交易确认
				await waitForTransactionReceipt(config, {
					hash: completeHash,
					timeout: 60_000,
				})

				toast.success(`资金已支付给 ${job.assignedAgent?.name || "Agent"}！`)
			} else if (job.matchingMode !== MatchingMode.SMART && job.chainJobId) {
				// 手动匹配模式：已经 assign过了，直接 complete
				toast.info("正在支付...")
				const { txHash } = await completeJobOnChain(BigInt(job.chainJobId))

				await waitForTransactionReceipt(config, {
					hash: txHash,
					timeout: 60_000,
				})

				toast.success(`资金已支付给 ${job.assignedAgent?.name || "Agent"}！`)
			}

			// 4. 更新后端状态
			await jobApi.approveJob(job.id, rating, feedback)
			await loadJob()
			setShowApproveModal(false)
			toast.success("验收通过")
		} catch (error: unknown) {
			console.error("Approve error:", error)
			toast.error(
				(error as any).message ||
					(error as any).response?.data?.message ||
					"验收失败",
			)
		} finally {
			setActionLoading(false)
		}
	}

	const handleAssignAgent = async (agentId: number) => {
		if (!job) return
		const confirmed = await confirm("确认分配", "确定要分配这个 Agent 吗？")
		if (!confirmed) return

		try {
			setActionLoading(true)

			// 手动选择模式：需要先调用链上 assignAgent
			if (job.chainJobId) {
				// 找到被选中的 Agent
				const selectedRec = recommendations.find((r) => r.agent.id === agentId)
				if (!selectedRec) {
					toast.error("找不到选中的 Agent")
					return
				}

				const agentOwnerAddress = selectedRec.agent.owner?.walletAddress
				if (!agentOwnerAddress) {
					toast.error("Agent 钱包地址无效")
					return
				}

				toast.info("正在调用智能合约...")

				// 调用链上 assignAgent
				const { txHash } = await assignAgentOnChain(
					BigInt(job.chainJobId),
					agentOwnerAddress,
				)

				// 等待交易确认
				const { waitForTransactionReceipt } = await import("wagmi/actions")
				const { config } = await import("../wagmi.config")

				await waitForTransactionReceipt(config, {
					hash: txHash,
					timeout: 60_000,
				})

				toast.success("链上分配成功！")
			}

			// 更新后端状态
			await jobApi.updateJob(job.id, {
				assignedAgentId: agentId,
				status: JobStatus.MATCHED,
			})
			await loadJob()
			toast.success("Agent 已成功分配")
		} catch (error: unknown) {
			console.error("Assign error:", error)
			toast.error(
				(error as any).message ||
					(error as any).response?.data?.message ||
					"分配失败",
			)
		} finally {
			setActionLoading(false)
		}
	}

	const handleReject = async () => {
		if (!isOwner || !job) return

		const trimmedReason = rejectReason.trim()
		if (!trimmedReason) {
			toast.error("请填写拒绝原因")
			return
		}

		// 后端 CreateDisputeDto 要求 reason 最少 20 字符
		if (job.chainJobId && trimmedReason.length < 20) {
			toast.error("拒绝原因太短", {
				description: `发起争议需要至少 20 个字的详细描述（当前 ${trimmedReason.length} 字），以便 DAO 成员投票参考。`,
			})
			return
		}

		try {
			setActionLoading(true)

			// 如果是链上任务，发起争议
			if (job.chainJobId) {
				toast.info("正在调起争议合约...")
				createDisputeOnChain(
					BigInt(job.chainJobId),
					"ipfs://manual_reject_evidence",
				)
				// 后续同步逻辑由于 useDisputeContract 的异步性，放在上面的 useEffect 中处理
				return
			}

			// 仅更新后端状态（非链上任务）
			await jobApi.rejectJob(job.id, rejectReason)
			await loadJob()
			setShowRejectModal(false)
			toast.success("已拒绝验收")
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } } }
			toast.error(err.response?.data?.message || "拒绝失败")
		} finally {
			if (!job.chainJobId) {
				setActionLoading(false)
			}
		}
	}

	const handleApplyToJob = async () => {
		if (!selectedAgentForApply || !job) return

		try {
			setActionLoading(true)
			await jobApplicationApi.applyToJob(job.id, {
				agentId: selectedAgentForApply,
				message: applyMessage,
			})
			toast.success("申请已提交")
			setShowApplyModal(false)
			setApplyMessage("")
			setSelectedAgentForApply(null)
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } } }
			toast.error(err.response?.data?.message || "申请失败")
		} finally {
			setActionLoading(false)
		}
	}

	const handleAcceptApplication = async (applicationId: number) => {
		const confirmed = await confirm("确认接受", "确定接受此申请吗？")
		if (!confirmed) return

		try {
			setActionLoading(true)

			// 找到对应的申请
			const application = applications.find((app) => app.id === applicationId)
			if (!application) {
				toast.error("找不到申请")
				return
			}

			// 如果有 chainJobId，先调用链上 assignAgent
			if (job?.chainJobId) {
				const agentOwnerAddress = application.agent?.owner?.walletAddress
				if (!agentOwnerAddress) {
					toast.error("Agent 钱包地址无效")
					return
				}

				toast.info("正在调用智能合约...")

				// 调用链上 assignAgent
				const { txHash } = await assignAgentOnChain(
					BigInt(job.chainJobId),
					agentOwnerAddress,
				)

				// 等待交易确认
				const { waitForTransactionReceipt } = await import("wagmi/actions")
				const { config } = await import("../wagmi.config")

				await waitForTransactionReceipt(config, {
					hash: txHash,
					timeout: 60_000,
				})

				toast.success("链上分配成功！")
			}

			// 更新后端状态
			await jobApplicationApi.updateApplicationStatus(applicationId, "ACCEPTED")
			await loadJob()
			await loadApplications()
			toast.success("已接受申请")
		} catch (error: unknown) {
			const err = error as {
				response?: { data?: { message?: string } }
				message?: string
			}
			console.error("Accept application error:", err)
			toast.error(err.message || err.response?.data?.message || "操作失败")
		} finally {
			setActionLoading(false)
		}
	}

	const handleRejectApplication = async (applicationId: number) => {
		const confirmed = await confirm("确认拒绝", "确定拒绝此申请吗？")
		if (!confirmed) return

		try {
			setActionLoading(true)
			await jobApplicationApi.updateApplicationStatus(applicationId, "REJECTED")
			await loadApplications()
			toast.success("已拒绝申请")
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } } }
			toast.error(err.response?.data?.message || "操作失败")
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

							{isAgentOwner &&
								job.status === JobStatus.OPEN &&
								job.assignedAgentId && (
									<Button
										onClick={handleAccept}
										disabled={actionLoading}
										className="bg-blue-600 hover:bg-blue-700"
									>
										接受任务
									</Button>
								)}

							{isAgentOwner && job.status === JobStatus.MATCHED && (
								<Button
									onClick={handleStart}
									disabled={actionLoading}
									className="bg-green-600 hover:bg-green-700"
								>
									开始执行
								</Button>
							)}

							{isOwner && job.status === JobStatus.SUBMITTED && (
								<>
									<Button
										onClick={() => setShowApproveModal(true)}
										className="bg-green-600 hover:bg-green-700"
									>
										验收通过
									</Button>
									<Button
										variant="outline"
										onClick={() => setShowRejectModal(true)}
										className="border-red-300 text-red-600 hover:bg-red-50"
									>
										拒绝验收
									</Button>
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
											{(() => {
												// 如果是字符串，直接显示
												if (typeof job.inputData === "string") {
													return (
														<p className="whitespace-pre-wrap text-gray-700">
															{job.inputData}
														</p>
													)
												}
												// 如果是对象且有 content 字段（JobCreatePage 默认格式）
												const inputObj = job.inputData as Record<
													string,
													unknown
												>
												if (inputObj.content) {
													return (
														<p className="whitespace-pre-wrap text-gray-700">
															{inputObj.content as string}
														</p>
													)
												}
												// 如果是对象且有 code 字段
												if (inputObj.code) {
													return (
														<pre className="text-sm text-gray-700 overflow-x-auto">
															<code>{inputObj.code as string}</code>
														</pre>
													)
												}
												// 否则显示 JSON
												return (
													<pre className="text-sm text-gray-700 overflow-x-auto">
														{JSON.stringify(job.inputData, null, 2)}
													</pre>
												)
											})()}
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Result (if submitted/completed) */}
						{job.resultData && (
							<div className="bg-white rounded-lg border border-gray-200 p-6">
								<h2 className="text-xl font-semibold mb-4">执行结果</h2>
								<div className="space-y-4">
									<div>
										<Label>提交时间</Label>
										<p className="text-gray-900 mt-1">
											{job.submittedAt
												? new Date(job.submittedAt).toLocaleString("zh-CN")
												: "-"}
										</p>
									</div>
									<div>
										<Label>结果内容</Label>
										<div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded border border-gray-200 mt-1">
											<ReactMarkdown remarkPlugins={[remarkGfm]}>
												{(() => {
													if (typeof job.resultData === "string")
														return job.resultData
													const resObj = job.resultData as Record<
														string,
														unknown
													>
													return (
														(resObj?.text as string) ||
														(resObj?.output as string) ||
														JSON.stringify(job.resultData, null, 2)
													)
												})()}
											</ReactMarkdown>
										</div>
									</div>
									{job.feedback && (
										<div>
											<Label>反馈</Label>
											<p className="text-gray-900 mt-1">{job.feedback}</p>
										</div>
									)}
									{job.rating && (
										<div>
											<Label>评分</Label>
											<div className="flex items-center gap-1 mt-1">
												{[1, 2, 3, 4, 5].map((star) => (
													<svg
														key={star}
														className={`w-5 h-5 ${star <= (job.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<title>Star {star}</title>
														<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
													</svg>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Right Column - Conditional based on matchingMode */}
					<div className="space-y-6">
						{/* For MANUAL/OPEN_MARKET: Show recommendations with assign button */}
						{/* SMART mode auto-assigns, so no need to show recommendations */}
						{(job.matchingMode === MatchingMode.MANUAL ||
							job.matchingMode === MatchingMode.OPEN_MARKET) &&
							job.status === JobStatus.OPEN &&
							recommendations.length > 0 && (
								<div className="bg-white rounded-lg border border-gray-200 p-6">
									<h2 className="text-xl font-semibold mb-4">推荐 Agents</h2>
									<div className="space-y-4">
										{recommendations.map((rec) => (
											<div
												key={rec.id}
												className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
											>
												<div className="flex items-start justify-between mb-3">
													<div className="flex-1">
														<h3 className="font-semibold text-gray-900 mb-1">
															{rec.agent.name}
														</h3>
														<p className="text-xs text-gray-600 line-clamp-2">
															{rec.agent.description}
														</p>
													</div>
													<div className="ml-3 text-center">
														<div className="text-2xl font-bold text-blue-600">
															{rec.matchScore}
														</div>
														<div className="text-xs text-gray-500">匹配度</div>
													</div>
												</div>

												<p className="text-sm text-gray-700 mb-3">
													{rec.reason}
												</p>

												<div className="flex items-center justify-between text-sm">
													<div className="flex items-center gap-3">
														<span className="text-gray-600">
															⭐ {rec.agent.rating?.toFixed(1) || "N/A"}
														</span>
														<span className="text-gray-600">
															{rec.agent.jobCount} 任务
														</span>
													</div>
													<div className="flex items-center gap-2">
														<Link
															to={`/agents/${rec.agent.id}`}
															className="text-blue-600 hover:text-blue-700 text-sm"
														>
															查看详情
														</Link>
														{isOwner &&
															job.matchingMode !== MatchingMode.APPLICATION &&
															[JobStatus.OPEN, JobStatus.MATCHED].includes(
																job.status,
															) && (
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() =>
																		handleAssignAgent(rec.agent.id)
																	}
																	disabled={
																		actionLoading ||
																		job.assignedAgentId === rec.agent.id
																	}
																	className="h-7 px-2 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
																>
																	{job.assignedAgentId === rec.agent.id
																		? "已选择"
																		: "选择并分配"}
																</Button>
															)}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						{/* For APPLICATION/OPEN_MARKET: Show apply button for non-owners */}
						{(() => {
							const shouldShowApply =
								(job.matchingMode === MatchingMode.APPLICATION ||
									job.matchingMode === MatchingMode.OPEN_MARKET) &&
								job.status === JobStatus.OPEN &&
								myAgents.length > 0

							console.log("Apply button debug:", {
								matchingMode: job.matchingMode,
								isAPPLICATION: job.matchingMode === MatchingMode.APPLICATION,
								isOPEN_MARKET: job.matchingMode === MatchingMode.OPEN_MARKET,
								isOwner,
								myAgentsLength: myAgents.length,
								shouldShowApply,
							})

							return shouldShowApply
						})() && (
							<div className="bg-white rounded-lg border border-gray-200 p-6">
								<h2 className="text-xl font-semibold mb-4">申请此任务</h2>
								<p className="text-gray-600 mb-4 text-sm">
									您可以使用您的 Agent 申请此任务
								</p>
								<Button
									onClick={() => setShowApplyModal(true)}
									className="w-full"
								>
									提交申请
								</Button>
							</div>
						)}

						{/* For APPLICATION/OPEN_MARKET: Show applications list for owners */}
						{(() => {
							const shouldShowApplications =
								(job.matchingMode === MatchingMode.APPLICATION ||
									job.matchingMode === MatchingMode.OPEN_MARKET) &&
								isOwner

							console.log("Applications list debug:", {
								matchingMode: job.matchingMode,
								isAPPLICATION: job.matchingMode === MatchingMode.APPLICATION,
								isOPEN_MARKET: job.matchingMode === MatchingMode.OPEN_MARKET,
								isOwner,
								applicationsLength: applications.length,
								shouldShowApplications,
							})

							return shouldShowApplications
						})() &&
							job.status === JobStatus.OPEN && (
								<div className="bg-white rounded-lg border border-gray-200 p-6">
									<h2 className="text-xl font-semibold mb-4">申请列表</h2>
									{applications.length === 0 ? (
										<p className="text-gray-500 text-sm text-center py-8">
											暂无申请
										</p>
									) : (
										<div className="space-y-3">
											{applications.map((app) => (
												<div
													key={app.id}
													className="border border-gray-200 rounded-lg p-4"
												>
													<div className="flex items-start justify-between mb-2">
														<div>
															<h3 className="font-semibold text-gray-900">
																{app.agent?.name}
															</h3>
															<p className="text-xs text-gray-500">
																来自{" "}
																{app.agent?.owner?.name ||
																	app.agent?.owner?.walletAddress.slice(0, 8)}
															</p>
														</div>
														<div className="flex items-center gap-1 text-xs text-gray-600">
															⭐ {app.agent?.rating?.toFixed(1) || "N/A"}
														</div>
													</div>
													{app.message && (
														<p className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded">
															{app.message}
														</p>
													)}
													<div className="flex items-center gap-2">
														<Button
															size="sm"
															onClick={() => handleAcceptApplication(app.id)}
															disabled={actionLoading}
															className="flex-1 bg-green-600 hover:bg-green-700"
														>
															接受
														</Button>
														<Button
															size="sm"
															variant="outline"
															onClick={() => handleRejectApplication(app.id)}
															disabled={actionLoading}
															className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
														>
															拒绝
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							)}
					</div>
				</div>
			</div>

			<ConfirmDialog />
			{/* Approve Modal */}
			{showApproveModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-md w-full p-6">
						<h3 className="text-xl font-semibold mb-4">验收通过</h3>
						<div className="space-y-4">
							<div>
								<Label className="mb-2">评分</Label>
								<div className="flex items-center gap-2">
									{[1, 2, 3, 4, 5].map((star) => (
										<Button
											key={star}
											variant="ghost"
											onClick={() => setRating(star)}
											className="p-0 h-auto hover:bg-transparent"
										>
											<svg
												className={`w-8 h-8 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<title>Star {star}</title>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										</Button>
									))}
								</div>
							</div>
							<div>
								<Label htmlFor="feedback">反馈（可选）</Label>
								<Textarea
									id="feedback"
									value={feedback}
									onChange={(e) => setFeedback(e.target.value)}
									rows={4}
									placeholder="分享您的使用体验..."
									className="mt-2"
								/>
							</div>
						</div>
						<div className="flex items-center gap-3 mt-6">
							<Button
								onClick={handleApprove}
								disabled={actionLoading}
								className="flex-1 bg-green-600 hover:bg-green-700"
							>
								{actionLoading ? "处理中..." : "确认通过"}
							</Button>
							<Button
								variant="outline"
								onClick={() => setShowApproveModal(false)}
							>
								取消
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Reject Modal */}
			{showRejectModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-md w-full p-6">
						<h3 className="text-xl font-semibold mb-4">拒绝验收</h3>
						<div className="space-y-4">
							<div>
								<Label htmlFor="reject-reason">拒绝原因 *</Label>
								<Textarea
									id="reject-reason"
									value={rejectReason}
									onChange={(e) => setRejectReason(e.target.value)}
									rows={4}
									placeholder="请详细说明拒绝原因（发起争议需至少 20 字）..."
									required
									className="mt-2"
								/>
								{job?.chainJobId &&
									rejectReason.length > 0 &&
									rejectReason.length < 20 && (
										<p className="text-xs text-red-500 mt-1">
											还需输入 {20 - rejectReason.length} 个字
										</p>
									)}
							</div>
						</div>
						<div className="flex items-center gap-3 mt-6">
							<Button
								variant="destructive"
								onClick={handleReject}
								disabled={actionLoading || !rejectReason.trim()}
								className="flex-1"
							>
								{actionLoading ? "处理中..." : "确认拒绝"}
							</Button>
							<Button
								variant="outline"
								onClick={() => setShowRejectModal(false)}
							>
								取消
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Apply Modal */}
			{showApplyModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-md w-full p-6">
						<h3 className="text-xl font-semibold mb-4">申请任务</h3>
						<div className="space-y-4">
							<div>
								<Label htmlFor="apply-agent">选择 Agent *</Label>
								<Select
									value={selectedAgentForApply?.toString() || ""}
									onValueChange={(value) =>
										setSelectedAgentForApply(Number(value))
									}
								>
									<SelectTrigger className="mt-2">
										<SelectValue placeholder="请选择一个 Agent" />
									</SelectTrigger>
									<SelectContent>
										{myAgents.map((agent) => (
											<SelectItem key={agent.id} value={agent.id.toString()}>
												{agent.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="apply-message">申请说明（可选）</Label>
								<Textarea
									id="apply-message"
									value={applyMessage}
									onChange={(e) => setApplyMessage(e.target.value)}
									rows={4}
									placeholder="说明您的优势和为什么适合这个任务..."
									className="mt-2"
								/>
							</div>
						</div>
						<div className="flex items-center gap-3 mt-6">
							<Button
								onClick={handleApplyToJob}
								disabled={actionLoading || !selectedAgentForApply}
								className="flex-1 bg-blue-600 hover:bg-blue-700"
							>
								{actionLoading ? "提交中..." : "提交申请"}
							</Button>
							<Button
								variant="outline"
								onClick={() => setShowApplyModal(false)}
							>
								取消
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
