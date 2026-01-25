import { Loader2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"
import { useConfirm } from "../hooks/useConfirm"
import apiClient from "../utils/api-client"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"

interface Agent {
	id: number
	name: string
	avatar?: string
	rating?: number
	competitionsWon?: number
	competitionsTotal?: number
}

interface CompetitionExecution {
	id: number
	status: string
	agent: Agent
	resultData?: any
	qualityScore?: number
	autoScore?: number
	manualScore?: number
	isWinner: boolean
	startedAt?: string
	completedAt?: string
	errorMessage?: string
}

interface CompetitionResultsProps {
	jobId: number
	isOwner: boolean
	onRefresh?: () => void
}

const statusColors: Record<string, string> = {
	PENDING: "bg-gray-100 text-gray-800",
	IN_PROGRESS: "bg-blue-100 text-blue-800",
	SUBMITTED: "bg-green-100 text-green-800",
	COMPLETED: "bg-green-100 text-green-800",
	FAILED: "bg-red-100 text-red-800",
}

export function CompetitionResults({
	jobId,
	isOwner,
	onRefresh,
}: CompetitionResultsProps) {
	const [results, setResults] = useState<CompetitionExecution[]>([])
	const [loading, setLoading] = useState(true)
	const [scoreDialogOpen, setScoreDialogOpen] = useState(false)
	const [selectedExecutionId, setSelectedExecutionId] = useState<number | null>(
		null,
	)

	const { confirm, ConfirmDialog } = useConfirm()

	// 使用 useCallback 解决 useEffect 依赖问题
	const fetchResults = useCallback(async () => {
		try {
			setLoading(true)
			// 使用 apiClient 自动处理 baseURL 和 token
			const res = await apiClient.get(`/jobs/${jobId}/competition/results`)
			setResults(res.data.data)
		} catch (error) {
			console.error("Failed to fetch competition results:", error)
			// 不显示的报错，避免打扰用户（可能是还没有结果）
		} finally {
			setLoading(false)
		}
	}, [jobId])

	useEffect(() => {
		fetchResults()
	}, [fetchResults])

	const handleSelectWinner = async (executionId: number) => {
		const confirmed = await confirm(
			"确认胜出者",
			"确定选择此 Agent 为胜出者吗？这将作为最终结果用于支付。",
		)
		if (!confirmed) return

		try {
			await apiClient.post(`/jobs/${jobId}/competition/select-winner`, {
				executionId,
			})

			toast.success("胜出者已选择！现在可以分配 Agent 并完成任务了")
			fetchResults()
			onRefresh?.()
		} catch (error: any) {
			console.error("Failed to select winner:", error)
			toast.error(error.response?.data?.message || "选择胜出者失败")
		}
	}

	const handleScore = async (
		executionId: number,
		score: number,
		reason: string,
	) => {
		try {
			await apiClient.post(`/jobs/${jobId}/executions/${executionId}/score`, {
				score,
				reason,
			})

			toast.success("评分成功！")
			fetchResults()
		} catch (error: any) {
			console.error("Failed to score execution:", error)
			toast.error(error.response?.data?.message || "评分失败")
		}
	}

	if (loading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center p-8">
					<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
				</CardContent>
			</Card>
		)
	}

	if (results.length === 0) {
		return (
			<Card>
				<CardContent className="text-center p-8">
					<p className="text-gray-500">暂无执行结果，请等待 Agent 完成任务</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-4">
			<ConfirmDialog />
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">竞价执行结果</h3>
				<Button variant="outline" size="sm" onClick={fetchResults}>
					刷新
				</Button>
			</div>

			{results.map((execution) => (
				<Card
					key={execution.id}
					className={execution.isWinner ? "border-yellow-400 border-2" : ""}
				>
					<CardContent className="p-6">
						{/* Agent Info */}
						<div className="flex items-start gap-4 mb-4">
							<Avatar className="h-12 w-12">
								<AvatarImage src={execution.agent.avatar} />
								<AvatarFallback>{execution.agent.name[0]}</AvatarFallback>
							</Avatar>

							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<h4 className="font-semibold text-lg">
										{execution.agent.name}
									</h4>
									{execution.isWinner && (
										<Badge className="bg-yellow-500">🏆 胜出</Badge>
									)}
								</div>

								<div className="flex items-center gap-4 text-sm text-gray-600">
									{execution.agent.rating && (
										<span>⭐ {execution.agent.rating.toFixed(1)}</span>
									)}
									{execution.agent.competitionsWon !== undefined && (
										<span>
											胜率:{" "}
											{execution.agent.competitionsTotal
												? (
														(execution.agent.competitionsWon /
															execution.agent.competitionsTotal) *
														100
													).toFixed(0)
												: 0}
											%
										</span>
									)}
								</div>
							</div>

							<Badge
								className={statusColors[execution.status] || "bg-gray-100"}
							>
								{execution.status}
							</Badge>
						</div>

						{/* Scores */}
						<div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
							<div>
								<div className="text-sm text-gray-600">自动评分</div>
								<div className="text-lg font-semibold">
									{execution.autoScore !== undefined &&
									execution.autoScore !== null
										? execution.autoScore
										: "-"}
								</div>
							</div>
							<div>
								<div className="text-sm text-gray-600">人工评分</div>
								<div className="text-lg font-semibold">
									{execution.manualScore || "-"}
								</div>
							</div>
							<div>
								<div className="text-sm text-gray-600">最终评分</div>
								<div className="text-lg font-semibold text-blue-600">
									{execution.qualityScore || "-"}
								</div>
							</div>
						</div>

						{/* Result Data */}
						{execution.resultData && (
							<div className="mb-4">
								<div className="text-sm font-medium text-gray-700 mb-2">
									执行结果：
								</div>
								<div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded border border-gray-200 mt-1 max-h-60 overflow-y-auto">
									<ReactMarkdown remarkPlugins={[remarkGfm]}>
										{(() => {
											if (typeof execution.resultData === "string")
												return execution.resultData
											const resObj = execution.resultData as Record<
												string,
												unknown
											>
											return (
												(resObj?.text as string) ||
												(resObj?.output as string) ||
												JSON.stringify(execution.resultData, null, 2)
											)
										})()}
									</ReactMarkdown>
								</div>
							</div>
						)}

						{/* Error Message */}
						{execution.errorMessage && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
								<div className="text-sm font-medium text-red-800">
									错误信息：
								</div>
								<div className="text-sm text-red-600 mt-1">
									{execution.errorMessage}
								</div>
							</div>
						)}

						{/* Actions (Owner only) */}
						{isOwner &&
							!execution.isWinner &&
							!results.some((r) => r.isWinner) && (
								<div className="flex gap-2 pt-4 border-t">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setSelectedExecutionId(execution.id)
											setScoreDialogOpen(true)
										}}
									>
										评分
									</Button>
									<Button
										size="sm"
										onClick={() => handleSelectWinner(execution.id)}
										disabled={
											execution.status !== "SUBMITTED" &&
											execution.status !== "COMPLETED"
										}
									>
										选为胜出者
									</Button>
								</div>
							)}
					</CardContent>
				</Card>
			))}

			{/* Score Dialog - Simple version */}
			{scoreDialogOpen && selectedExecutionId && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-lg font-semibold mb-4">评分执行结果</h3>

						<form
							onSubmit={(e) => {
								e.preventDefault()
								const formData = new FormData(e.currentTarget)
								const score = Number(formData.get("score"))
								const reason = formData.get("reason") as string
								handleScore(selectedExecutionId, score, reason)
								setScoreDialogOpen(false)
								setSelectedExecutionId(null)
							}}
						>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="score-input"
										className="block text-sm font-medium mb-2"
									>
										评分（0-100）
									</label>
									<input
										id="score-input"
										type="number"
										name="score"
										min="0"
										max="100"
										defaultValue="80"
										required
										className="w-full px-3 py-2 border rounded-lg"
									/>
								</div>

								<div>
									<label
										htmlFor="reason-input"
										className="block text-sm font-medium mb-2"
									>
										评分理由
									</label>
									<textarea
										id="reason-input"
										name="reason"
										rows={3}
										className="w-full px-3 py-2 border rounded-lg"
										placeholder="请说明评分依据..."
									/>
								</div>

								<div className="flex gap-2 justify-end">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setScoreDialogOpen(false)
											setSelectedExecutionId(null)
										}}
									>
										取消
									</Button>
									<Button type="submit">提交评分</Button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}
