import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { useDisputeContract } from "../../hooks/useDisputeContract"
import { disputeApi } from "../../utils/disputeApi"
import { type Job, JobStatus, jobApi } from "../../utils/job-api"
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
	const [jobs, setJobs] = useState<Job[]>([])
	const [selectedJobId, setSelectedJobId] = useState<string>("")
	const [title, setTitle] = useState("")
	const [reason, setReason] = useState("")
	const [evidence, setEvidence] = useState("")

	const { createDispute, isConfirming, isSuccess, hash } = useDisputeContract()

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

	const handleSubmit = async () => {
		if (!selectedJobId || !title || !reason) {
			toast.error("Please fill in all required fields")
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

			// 2. 调用合约锁定资金
			// 注意：这里必须传入链上 jobId (chainJobId)
			createDispute(
				BigInt(selectedJob.chainJobId),
				evidence || "ipfs://default_evidence",
			)

			// 逻辑说明：
			// 由于合约交易是异步的，通常我们需要等待交易上链后再通知后端。
			// useDisputeContract 里的 useEffect 会处理后续逻辑，或者我们在这里处理。
		} catch (error: any) {
			toast.error("Failed to initiate dispute", { description: error.message })
			setLoading(false)
		}
	}

	const resetForm = useCallback(() => {
		setSelectedJobId("")
		setTitle("")
		setReason("")
		setEvidence("")
	}, [])

	const syncToBackend = useCallback(async () => {
		try {
			await disputeApi.createDispute({
				jobId: Number.parseInt(selectedJobId),
				title,
				reason,
				evidence,
			})
			toast.success("Dispute created and synced successfully!")
			setOpen(false)
			onSuccess?.()
			resetForm()
		} catch (error: any) {
			toast.error("Blockchain success, but backend sync failed", {
				description: error.data?.message || error.message,
			})
		} finally {
			setLoading(false)
		}
	}, [selectedJobId, title, reason, evidence, onSuccess, resetForm])

	// 监听合约交易成功，然后同步到后端
	useEffect(() => {
		if (isSuccess && hash) {
			syncToBackend()
		}
	}, [isSuccess, hash, syncToBackend])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md hover:shadow-lg">
					+ Create Dispute
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] border-none shadow-2xl">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-gray-900">
						Initiate DAO Dispute
					</DialogTitle>
					<DialogDescription className="text-gray-500">
						Submit a case to the DAO. Token holders will vote to resolve this
						dispute.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-6 py-4">
					<div className="grid gap-2">
						<Label htmlFor="job" className="font-semibold text-gray-700">
							Select Job
						</Label>
						<Select value={selectedJobId} onValueChange={setSelectedJobId}>
							<SelectTrigger className="border-gray-200">
								<SelectValue placeholder="Which job has an issue?" />
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
										No submitted jobs found.
									</div>
								)}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="title" className="font-semibold text-gray-700">
							Title
						</Label>
						<Input
							id="title"
							placeholder="e.g. Agent work quality below standard"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="border-gray-200"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="reason" className="font-semibold text-gray-700">
							Dispute Reason
						</Label>
						<Textarea
							id="reason"
							placeholder="Describe what went wrong in detail..."
							className="min-h-[120px] border-gray-200 resize-none"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="evidence" className="font-semibold text-gray-700">
							Evidence Link (Optional)
						</Label>
						<Input
							id="evidence"
							placeholder="IPFS hash or cloud storage link"
							value={evidence}
							onChange={(e) => setEvidence(e.target.value)}
							className="border-gray-200"
						/>
					</div>
				</div>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={loading || isConfirming}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={loading || isConfirming || !selectedJobId}
						className="bg-indigo-600 hover:bg-indigo-700 text-white"
					>
						{loading || isConfirming ? (
							<>
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
								Processing...
							</>
						) : (
							"Submit to DAO"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
