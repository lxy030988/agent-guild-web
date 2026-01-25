import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAccount } from "wagmi"
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
import { Textarea } from "../components/ui/textarea"
import { parseJobCreatedEvent, useJobContract } from "../hooks/useJobContract"
import {
	type CreateJobDto,
	JobCategory,
	jobApi,
	MatchingMode,
	MatchingModeDescriptions,
	MatchingModeLabels,
} from "../utils/job-api"

export default function JobCreatePage() {
	const navigate = useNavigate()
	const { address, isConnected } = useAccount()
	const { createJobOnChain } = useJobContract()

	const [loading, setLoading] = useState(false)

	// Form state
	const [formData, setFormData] = useState<Partial<CreateJobDto>>({
		title: "",
		description: "",
		category: JobCategory.CODE_REVIEW,
		tags: [],
		requiredCapabilities: [],
		inputData: {},
		expectedOutput: "",
		budget: 0,
		currency: "ETH", // 默认使用 ETH
		estimatedDuration: undefined,
		matchingMode: MatchingMode.SMART,
		competitionMode: false, // 🆕 竞价模式
		competitorCount: 3, // 🆕 竞争 Agent 数量
	})

	// 截止日期 (添加)
	const [deadline, setDeadline] = useState<string>("") // YYYY-MM-DD format

	// UI state
	const [capabilityInput, setCapabilityInput] = useState("")
	const [tagInput, setTagInput] = useState("")
	const [inputDataText, setInputDataText] = useState("")

	// Validation
	const [errors, setErrors] = useState<Record<string, string>>({})

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!formData.title?.trim()) {
			newErrors.title = "请输入任务标题"
		}
		if (!formData.description?.trim()) {
			newErrors.description = "请输入任务描述"
		}
		if (
			!formData.requiredCapabilities ||
			formData.requiredCapabilities.length === 0
		) {
			newErrors.requiredCapabilities = "请至少添加一个所需能力"
		}
		if (!formData.budget || formData.budget <= 0) {
			newErrors.budget = "预算必须大于0"
		}
		if (!deadline) {
			newErrors.deadline = "请选择截止日期"
		}
		if (formData.currency !== "ETH") {
			newErrors.currency = "当前仅支持 ETH 支付"
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleAddCapability = () => {
		if (
			capabilityInput.trim() &&
			!formData.requiredCapabilities?.includes(capabilityInput.trim())
		) {
			setFormData({
				...formData,
				requiredCapabilities: [
					...(formData.requiredCapabilities || []),
					capabilityInput.trim(),
				],
			})
			setCapabilityInput("")
		}
	}

	const handleRemoveCapability = (capability: string) => {
		setFormData({
			...formData,
			requiredCapabilities: formData.requiredCapabilities?.filter(
				(c) => c !== capability,
			),
		})
	}

	const handleAddTag = () => {
		if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
			setFormData({
				...formData,
				tags: [...(formData.tags || []), tagInput.trim()],
			})
			setTagInput("")
		}
	}

	const handleRemoveTag = (tag: string) => {
		setFormData({
			...formData,
			tags: formData.tags?.filter((t) => t !== tag),
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// 检查钱包连接
		if (!isConnected || !address) {
			toast.error("请先连接钱包")
			return
		}

		if (!validateForm()) {
			toast.error("请检查表单填写")
			return
		}

		try {
			setLoading(true)

			// 1️⃣ 先在链上创建任务并托管资金
			toast.info("正在发起链上交易...")

			const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000)

			if (!formData.budget) {
				throw new Error("预算不能为空")
			}

			const { txHash: hash } = await createJobOnChain(
				formData.budget.toString(),
				deadlineTimestamp,
			)

			toast.success("交易已提交，等待确认...")

			// 2️⃣ 等待交易确认 - 使用 viem 的 waitForTransactionReceipt
			const { waitForTransactionReceipt } = await import("wagmi/actions")
			const { config } = await import("../wagmi.config")

			const txReceipt = await waitForTransactionReceipt(config, {
				hash,
				timeout: 60_000, // 60秒超时
			})

			// 3️⃣ 解析链上 jobId
			const chainJobId = parseJobCreatedEvent(txReceipt)
			toast.success(`链上任务创建成功！ID: ${chainJobId}`)

			// 4️⃣ 同步到后端数据库
			if (
				!formData.title ||
				!formData.description ||
				!formData.category ||
				!formData.requiredCapabilities
			) {
				throw new Error("请完整填写表单")
			}

			const jobData: CreateJobDto = {
				title: formData.title,
				description: formData.description,
				category: formData.category,
				tags: formData.tags,
				requiredCapabilities: formData.requiredCapabilities,
				inputData: { content: inputDataText.trim() || "" },
				expectedOutput: formData.expectedOutput || undefined,
				budget: formData.budget,
				currency: formData.currency,
				estimatedDuration: formData.estimatedDuration || undefined,
				matchingMode: formData.matchingMode,
				// 🆕 竞价模式字段
				competitionMode: formData.competitionMode || false,
				competitorCount: formData.competitorCount || 3,
				// 链上数据
				chainJobId: chainJobId.toString(),
				chainTxHash: hash,
				chainDeadline: deadlineTimestamp.toString(),
			}

			const job = await jobApi.createJob(jobData)
			toast.success("任务创建成功！")
			navigate(`/jobs/${job.id}`)
		} catch (error) {
			console.error("Job creation error:", error)
			if (error instanceof Error) {
				toast.error(error.message || "创建失败")
			} else {
				toast.error("创建失败，请重试")
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 pt-20 pb-12">
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">发布任务</h1>
					<p className="mt-2 text-gray-600">
						填写任务信息，系统将自动为您匹配合适的 Agent
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Basic Info */}
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<h2 className="text-xl font-semibold mb-4">基本信息</h2>

						<div className="space-y-4">
							{/* Title */}
							<div>
								<Label htmlFor="title">任务标题 *</Label>
								<Input
									id="title"
									type="text"
									value={formData.title}
									onChange={(e) =>
										setFormData({ ...formData, title: e.target.value })
									}
									className={errors.title ? "border-red-300" : ""}
									placeholder="例如：Review my React Component"
								/>
								{errors.title && (
									<p className="mt-1 text-sm text-red-600">{errors.title}</p>
								)}
							</div>

							{/* Category */}
							<div>
								<Label htmlFor="category">任务分类 *</Label>
								<Select
									value={formData.category}
									onValueChange={(value) =>
										setFormData({
											...formData,
											category: value as JobCategory,
										})
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="选择任务分类" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={JobCategory.CODE_REVIEW}>
											代码审查
										</SelectItem>
										<SelectItem value={JobCategory.CONTENT_CREATION}>
											内容创作
										</SelectItem>
										<SelectItem value={JobCategory.DATA_ANALYSIS}>
											数据分析
										</SelectItem>
										<SelectItem value={JobCategory.TRANSLATION}>
											翻译服务
										</SelectItem>
										<SelectItem value={JobCategory.TESTING}>
											测试服务
										</SelectItem>
										<SelectItem value={JobCategory.RESEARCH}>
											研究分析
										</SelectItem>
										<SelectItem value={JobCategory.OTHER}>其他</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Matching Mode */}
							<div>
								<Label htmlFor="matchingMode">匹配模式</Label>
								<Select
									value={formData.matchingMode}
									onValueChange={(value) =>
										setFormData({
											...formData,
											matchingMode: value as MatchingMode,
										})
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="选择匹配模式" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={MatchingMode.SMART}>
											🤖 {MatchingModeLabels[MatchingMode.SMART]}
										</SelectItem>
										<SelectItem value={MatchingMode.MANUAL}>
											✋ {MatchingModeLabels[MatchingMode.MANUAL]}
										</SelectItem>
										<SelectItem value={MatchingMode.APPLICATION}>
											📮 {MatchingModeLabels[MatchingMode.APPLICATION]}
										</SelectItem>
										<SelectItem value={MatchingMode.OPEN_MARKET}>
											🔓 {MatchingModeLabels[MatchingMode.OPEN_MARKET]}
										</SelectItem>
									</SelectContent>
								</Select>
								<p className="mt-1 text-sm text-gray-500">
									{formData.matchingMode &&
										MatchingModeDescriptions[formData.matchingMode]}
								</p>
							</div>

							{/* 🆕 Competition Mode */}
							<div className="border-t pt-4 mt-4">
								<label className="flex items-center gap-3 cursor-pointer">
									<input
										type="checkbox"
										checked={formData.competitionMode || false}
										onChange={(e) =>
											setFormData({
												...formData,
												competitionMode: e.target.checked,
											})
										}
										className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
									/>
									<div>
										<div className="font-medium text-gray-900">
											🏆 启用竞价模式
										</div>
										<p className="text-sm text-gray-500">
											让多个 Agent 并行执行任务，您可以选择最佳结果支付
										</p>
									</div>
								</label>

								{formData.competitionMode && (
									<div className="mt-4 ml-7">
										<Label htmlFor="competitorCount">竞争 Agent 数量</Label>
										<Select
											value={formData.competitorCount?.toString() || "3"}
											onValueChange={(value) =>
												setFormData({
													...formData,
													competitorCount: Number(value),
												})
											}
										>
											<SelectTrigger className="w-48">
												<SelectValue placeholder="选择数量" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="2">2 个</SelectItem>
												<SelectItem value="3">3 个（推荐）</SelectItem>
												<SelectItem value="5">5 个</SelectItem>
											</SelectContent>
										</Select>
										<p className="mt-1 text-sm text-gray-500">
											💡 系统将匹配 Top {formData.competitorCount || 3}{" "}
											个最适合的 Agent
										</p>
									</div>
								)}
							</div>

							{/* Description */}
							<div>
								<Label htmlFor="description">任务描述 *</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									rows={6}
									className={errors.description ? "border-red-300" : ""}
									placeholder="详细描述您的任务需求..."
								/>
								{errors.description && (
									<p className="mt-1 text-sm text-red-600">
										{errors.description}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Requirements */}
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<h2 className="text-xl font-semibold mb-4">能力要求</h2>

						<div className="space-y-4">
							{/* Required Capabilities */}
							<div>
								<Label htmlFor="capability">所需能力 * （至少一个）</Label>
								<div className="flex gap-2">
									<Input
										id="capability"
										type="text"
										value={capabilityInput}
										onChange={(e) => setCapabilityInput(e.target.value)}
										onKeyPress={(e) => {
											if (e.key === "Enter") {
												e.preventDefault()
												handleAddCapability()
											}
										}}
										className="flex-1"
										placeholder="例如：code-review, javascript"
									/>
									<Button type="button" onClick={handleAddCapability}>
										添加
									</Button>
								</div>
								{errors.requiredCapabilities && (
									<p className="mt-1 text-sm text-red-600">
										{errors.requiredCapabilities}
									</p>
								)}
								{formData.requiredCapabilities &&
									formData.requiredCapabilities.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-3">
											{formData.requiredCapabilities.map((cap) => (
												<span
													key={cap}
													className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100"
												>
													{cap}
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => handleRemoveCapability(cap)}
														className="h-auto p-0 hover:text-blue-900 hover:bg-transparent"
													>
														×
													</Button>
												</span>
											))}
										</div>
									)}
							</div>

							{/* Tags */}
							<div>
								<Label htmlFor="tag">标签（可选）</Label>
								<div className="flex gap-2">
									<Input
										id="tag"
										type="text"
										value={tagInput}
										onChange={(e) => setTagInput(e.target.value)}
										onKeyPress={(e) => {
											if (e.key === "Enter") {
												e.preventDefault()
												handleAddTag()
											}
										}}
										className="flex-1"
										placeholder="例如：urgent, high-priority"
									/>
									<Button
										type="button"
										variant="secondary"
										onClick={handleAddTag}
									>
										添加
									</Button>
								</div>
								{formData.tags && formData.tags.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-3">
										{formData.tags.map((tag) => (
											<span
												key={tag}
												className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
											>
												#{tag}
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => handleRemoveTag(tag)}
													className="h-auto p-0 hover:text-gray-900 hover:bg-transparent"
												>
													×
												</Button>
											</span>
										))}
									</div>
								)}
							</div>

							{/* Input Data */}
							<div>
								<Label htmlFor="inputData">任务输入内容</Label>
								<Textarea
									id="inputData"
									value={inputDataText}
									onChange={(e) => setInputDataText(e.target.value)}
									rows={8}
									placeholder="请输入任务相关内容，例如需要审查的代码、需要分析的文本等..."
								/>
								<p className="mt-1 text-sm text-gray-500">
									根据您选择的任务类型，输入相应的内容即可
								</p>
							</div>

							{/* Expected Output */}
							<div>
								<Label htmlFor="expectedOutput">期望输出（可选）</Label>
								<Textarea
									id="expectedOutput"
									value={formData.expectedOutput}
									onChange={(e) =>
										setFormData({ ...formData, expectedOutput: e.target.value })
									}
									rows={3}
									placeholder="描述您期望得到的结果..."
								/>
							</div>
						</div>
					</div>

					{/* Budget & Timeline */}
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<h2 className="text-xl font-semibold mb-4">预算与时间</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Budget */}
							<div>
								<Label htmlFor="budget">预算 (ETH) *</Label>
								<Input
									id="budget"
									type="number"
									min="0"
									step="0.001"
									value={formData.budget}
									onChange={(e) =>
										setFormData({
											...formData,
											budget: Number(e.target.value),
										})
									}
									className={errors.budget ? "border-red-300" : ""}
									placeholder="0.01"
								/>
								{errors.budget && (
									<p className="mt-1 text-sm text-red-600">{errors.budget}</p>
								)}
								<p className="mt-1 text-sm text-gray-500">
									💰 资金将托管到智能合约，完成后自动支付给 Agent
								</p>
							</div>

							{/* Deadline */}
							<div>
								<Label htmlFor="deadline">截止日期 *</Label>
								<Input
									id="deadline"
									type="date"
									value={deadline}
									onChange={(e) => setDeadline(e.target.value)}
									min={new Date().toISOString().split("T")[0]}
									className={errors.deadline ? "border-red-300" : ""}
								/>
								{errors.deadline && (
									<p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
								)}
								<p className="mt-1 text-sm text-gray-500">
									⏰ 超时后将自动退款
								</p>
							</div>

							{/* Estimated Duration */}
							<div className="md:col-span-2">
								<Label htmlFor="estimatedDuration">
									预计耗时（分钟，可选）
								</Label>
								<Input
									id="estimatedDuration"
									type="number"
									min="0"
									value={formData.estimatedDuration || ""}
									onChange={(e) =>
										setFormData({
											...formData,
											estimatedDuration: e.target.value
												? Number(e.target.value)
												: undefined,
										})
									}
									placeholder="60"
									className="max-w-xs"
								/>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-4">
						<Button
							type="submit"
							disabled={loading}
							className="flex-1 font-medium"
						>
							{loading ? "创建中..." : "发布任务"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/jobs")}
						>
							取消
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
