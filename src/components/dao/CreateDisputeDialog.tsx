import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import { readContract, waitForTransactionReceipt } from "wagmi/actions"
import { DISPUTE_RESOLUTION_ABI } from "../../abis/DisputeResolution"
import {
	parseDisputeCreatedEvent,
	useDisputeContract,
} from "../../hooks/useDisputeContract"
import { disputeApi } from "../../utils/disputeApi"
import { type Job, JobStatus, jobApi } from "../../utils/job-api"
import { config, getContractAddress } from "../../wagmi.config"
import { Button } from "../ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select"
import { Textarea } from "../ui/textarea"

interface CreateDisputeDialogProps {
	onSuccess?: () => void
}

export const CreateDisputeDialog: React.FC<CreateDisputeDialogProps> = ({
	onSuccess,
}) => {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [jobs, setJobs] = useState<Job[]>([])
	const [selectedJobId, setSelectedJobId] = useState<string>("")
	const [title, setTitle] = useState("")
	const [reason, setReason] = useState("")
	const [evidence, setEvidence] = useState("")

	const { isConnected, chainId } = useAccount()
	const { createDisputeOnChain } = useDisputeContract()

	const loadJobs = useCallback(async () => {
		try {
			// 实际上后端允许 COMPLETED 和 SUBMITTED 状态发起争议
			const response = await jobApi.getMyPublishedJobs({
				status: JobStatus.SUBMITTED,
				limit: 50,
			})
			setJobs(response.data)
		} catch (error) {
			console.error("Failed to load jobs:", error)
		}
	}, [])

	// 加载可发起争议的任务（SUBMITTED 状态的任务）
	useEffect(() => {
		if (open) {
			loadJobs()
		}
	}, [open, loadJobs])

	const validateForm = () => {
		const newErrors: Record<string, string> = {}
		if (!selectedJobId) newErrors.job = "请选择任务"
		if (!title.trim()) newErrors.title = "请输入标题"
		if (!reason.trim()) newErrors.reason = "请输入争议原因"
		if (reason.trim().length > 0 && reason.trim().length < 20) {
			newErrors.reason = "争议原因至少 20 个字，便于 DAO 成员投票"
		}
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async () => {
		if (!isConnected) {
			toast.error("请先连接钱包")
			return
		}

		if (!validateForm()) {
			toast.error("请检查表单填写")
			return
		}

		try {
			setLoading(true)

			// 1. 获取选中的 Job 详情
			const selectedJob = jobs.find((j) => j.id.toString() === selectedJobId)
			if (!selectedJob || !selectedJob.chainJobId) {
				toast.error("此任务尚未上链或链上 ID 无效")
				setLoading(false)
				return
			}

			// 2. 调用合约发起争议
			// 注意：这里必须传入链上 jobId (chainJobId)
			toast.info("正在发起链上交易...")
			const { txHash } = await createDisputeOnChain(
				BigInt(selectedJob.chainJobId),
				evidence || "ipfs://default_evidence",
			)

			toast.success("交易已提交，等待确认...")

			// 3. 等待交易确认
			const receipt = await waitForTransactionReceipt(config, {
				hash: txHash,
				timeout: 60_000,
			})

			// 4. 解析链上 disputeId
			const chainDisputeId = parseDisputeCreatedEvent(receipt)

			// 5. 读取链上投票截止时间
			const contractAddress = getContractAddress(
				"DisputeResolution",
				chainId || 31337,
			)
			let votingEndsAt: string | undefined
			if (contractAddress) {
				try {
					const disputeData = (await readContract(config, {
						address: contractAddress as `0x${string}`,
						abi: DISPUTE_RESOLUTION_ABI,
						functionName: "disputes",
						args: [chainDisputeId],
					})) as any
					const endsAtUnix = disputeData[5]
					if (endsAtUnix) {
						votingEndsAt = new Date(Number(endsAtUnix) * 1000).toISOString()
					}
				} catch (readError) {
					console.warn("Failed to read votingEndsAt:", readError)
				}
			}

			// 6. 同步到后端数据库
			await disputeApi.createDispute({
				jobId: Number.parseInt(selectedJobId),
				title: title.trim(),
				reason: reason.trim(),
				evidence: evidence.trim() || undefined,
				chainDisputeId: chainDisputeId.toString(),
				votingEndsAt,
			})

			toast.success("争议创建成功")
			setOpen(false)
			onSuccess?.()
			resetForm()
		} catch (error: any) {
			console.error("Dispute creation error:", error)
			toast.error(error?.message || "创建失败，请重试")
		} finally {
			setLoading(false)
		}
	}

	const resetForm = useCallback(() => {
		setSelectedJobId("")
		setTitle("")
		setReason("")
		setEvidence("")
		setErrors({})
	}, [])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
					发起争议
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold text-gray-900">
						发起 DAO 争议
					</DialogTitle>
					<DialogDescription className="text-gray-500">
						提交争议后，将由 DAO 成员投票裁决结果。
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="job" className="font-medium text-gray-700">
							选择任务 *
						</Label>
						<Select value={selectedJobId} onValueChange={setSelectedJobId}>
							<SelectTrigger className="border-gray-200">
								<SelectValue placeholder="请选择需要发起争议的任务" />
							</SelectTrigger>
							<SelectContent>
								{jobs.length > 0 ? (
									jobs.map((job) => (
										<SelectItem key={job.id} value={job.id.toString()}>
											{job.title} (ID: {job.id})
										</SelectItem>
									))
								) : (
									<div className="p-4 text-center text-sm text-gray-400">
										暂无可发起争议的任务
									</div>
								)}
							</SelectContent>
						</Select>
						{errors.job && (
							<p className="text-sm text-red-600">{errors.job}</p>
						)}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="title" className="font-medium text-gray-700">
							标题 *
						</Label>
						<Input
							id="title"
							placeholder="例如：交付质量不符合要求"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className={errors.title ? "border-red-300" : ""}
						/>
						{errors.title && (
							<p className="text-sm text-red-600">{errors.title}</p>
						)}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="reason" className="font-medium text-gray-700">
							争议原因 *
						</Label>
						<Textarea
							id="reason"
							placeholder="请详细描述争议原因（至少 20 个字）..."
							className={errors.reason ? "border-red-300" : ""}
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
						{errors.reason && (
							<p className="text-sm text-red-600">{errors.reason}</p>
						)}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="evidence" className="font-medium text-gray-700">
							证据链接（可选）
						</Label>
						<Input
							id="evidence"
							placeholder="IPFS 或云盘链接"
							value={evidence}
							onChange={(e) => setEvidence(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={loading}
					>
						取消
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={loading || !selectedJobId}
						className="bg-blue-600 hover:bg-blue-700 text-white"
					>
						{loading ? (
							<>
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
								处理中...
							</>
						) : (
							"提交争议"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
