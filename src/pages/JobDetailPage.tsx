import { useAtom } from "jotai"
import { useCallback, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Link, useNavigate, useParams } from "react-router-dom"
import remarkGfm from "remark-gfm"
import JobStatusBadge from "../components/JobStatusBadge"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { useAuth } from "../hooks/useAuth"
import {
	jobLoadingAtom,
	jobRecommendationsAtom,
	selectedJobAtom,
} from "../store/jobAtoms"
import { JobCategoryLabels, JobStatus, jobApi } from "../utils/job-api"
import {
	type JobApplication,
	jobApplicationApi,
} from "../utils/job-application-api"

export default function JobDetailPage() {
	const { id } = useParams<{ id: string }>()
	const _navigate = useNavigate()
	const { user } = useAuth()

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

	// Apply modal state - These are defined for future use
	const [_showApplyModal, _setShowApplyModal] = useState(false)
	const [_applyMessage, _setApplyMessage] = useState("")
	const [_proposedPrice, _setProposedPrice] = useState(
		job?.budget.toString() || "",
	)
	const [_estimatedTime, _setEstimatedTime] = useState("60")

	// Applications state
	const [_applications, setApplications] = useState<JobApplication[]>([])

	// Load job details
	const loadJob = useCallback(async () => {
		if (!id) return

		try {
			setLoading(true)
			const jobData = await jobApi.getJob(Number(id))
			setJob(jobData)

			// Load recommendations
			const recs = await jobApi.getRecommendations(Number(id))
			setRecommendations(recs)
		} catch (error) {
			console.error("Failed to load job:", error)
		} finally {
			setLoading(false)
		}
	}, [id, setJob, setRecommendations, setLoading])

	useEffect(() => {
		loadJob()
	}, [loadJob])

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

	// Actions
	const handleCancel = async () => {
		if (!job || !window.confirm("确定要取消这个任务吗？")) return

		try {
			setActionLoading(true)
			await jobApi.cancelJob(job.id)
			await loadJob()
			alert("任务已取消")
		} catch (error: any) {
			alert(error.response?.data?.message || "取消失败")
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
			alert("任务已接受")
		} catch (error: any) {
			alert(error.response?.data?.message || "接受失败")
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
			alert("任务已开始执行")
		} catch (error: any) {
			alert(error.response?.data?.message || "开始失败")
		} finally {
			setActionLoading(false)
		}
	}

	const handleApprove = async () => {
		if (!job) return

		try {
			setActionLoading(true)
			await jobApi.approveJob(job.id, rating, feedback)
			await loadJob()
			setShowApproveModal(false)
			alert("验收通过")
		} catch (error: any) {
			alert(error.response?.data?.message || "验收失败")
		} finally {
			setActionLoading(false)
		}
	}

	const handleAssignAgent = async (agentId: number) => {
		if (!job || !window.confirm("确定要分配这个 Agent 吗？")) return

		try {
			setActionLoading(true)
			await jobApi.updateJob(job.id, {
				assignedAgentId: agentId,
				status: JobStatus.MATCHED,
			})
			await loadJob()
			alert("Agent 已成功分配")
		} catch (error: any) {
			alert(error.response?.data?.message || "分配失败")
		} finally {
			setActionLoading(false)
		}
	}

	const handleReject = async () => {
		if (!job || !rejectReason.trim()) {
			alert("请填写拒绝原因")
			return
		}

		try {
			setActionLoading(true)
			await jobApi.rejectJob(job.id, rejectReason)
			await loadJob()
			setShowRejectModal(false)
			alert("已拒绝验收")
		} catch (error: any) {
			alert(error.response?.data?.message || "拒绝失败")
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
										onClick={handleCancel}
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
										<Label className="mb-2">输入数据 (Input Data)</Label>
										<div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto text-sm mt-1">
											{typeof job.inputData === "string" ? (
												<p className="whitespace-pre-wrap">{job.inputData}</p>
											) : (
												<pre>{JSON.stringify(job.inputData, null, 2)}</pre>
											)}
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
												{typeof job.resultData === "string"
													? job.resultData
													: job.resultData?.text ||
														job.resultData?.output ||
														JSON.stringify(job.resultData, null, 2)}
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

					{/* Right Column - Recommendations */}
					<div className="space-y-6">
						{recommendations.length > 0 && (
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

											<p className="text-sm text-gray-700 mb-3">{rec.reason}</p>

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
														[JobStatus.OPEN, JobStatus.MATCHED].includes(
															job.status,
														) && (
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleAssignAgent(rec.agent.id)}
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
					</div>
				</div>
			</div>

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
									placeholder="请说明拒绝原因..."
									required
									className="mt-2"
								/>
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
		</div>
	)
}
