import { useAtom, useAtomValue } from "jotai"
import type React from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { useConfirm } from "../hooks/useConfirm"
import { agentDetailLoadingAtom, selectedAgentAtom } from "../store/agentAtoms"
import { userAtom } from "../stores/authStore"
import { AgentCategory, agentApi } from "../utils/agent-api"

/**
 * 分类标签颜色映射
 */
const categoryColors: Record<AgentCategory, string> = {
	[AgentCategory.PRODUCTIVITY_TOOLS]: "bg-blue-100 text-blue-800",
	[AgentCategory.CREATIVE_ASSISTANTS]: "bg-purple-100 text-purple-800",
	[AgentCategory.DEVELOPER_TOOLS]: "bg-green-100 text-green-800",
	[AgentCategory.OTHERS]: "bg-gray-100 text-gray-800",
}

/**
 * Agent 详情页面
 */
export const AgentDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const [agent, setAgent] = useAtom(selectedAgentAtom)
	const [loading, setLoading] = useAtom(agentDetailLoadingAtom)
	const user = useAtomValue(userAtom)
	const [deleting, setDeleting] = useState(false)
	const { confirm, ConfirmDialog } = useConfirm()

	const isOwner = user && agent && user.id === agent.ownerId

	// 调试日志
	console.log("🔍 Agent Owner Check:", {
		user,
		userId: user?.id,
		agent: agent
			? { id: agent.id, name: agent.name, ownerId: agent.ownerId }
			: null,
		isOwner,
	})

	/**
	 * 删除 Agent
	 */
	const handleDelete = async () => {
		if (!agent) return

		const confirmed = await confirm(
			"Delete Agent",
			`Are you sure you want to delete "${agent.name}"? This action cannot be undone.`,
		)
		if (!confirmed) return

		setDeleting(true)
		try {
			await agentApi.deleteAgent(agent.id)
			// TODO: Show success toast
			navigate("/agents")
		} catch (error) {
			console.error("Failed to delete agent:", error)
			toast.error("Failed to delete agent. Please try again.")
		} finally {
			setDeleting(false)
		}
	}

	/**
	 * 加载 Agent 详情
	 */
	useEffect(() => {
		const loadAgent = async () => {
			if (!id) return

			setLoading(true)
			try {
				const agentData = await agentApi.getAgent(parseInt(id, 10))
				setAgent(agentData)
			} catch (error) {
				console.error("Failed to load agent:", error)
				// TODO: Show error toast
			} finally {
				setLoading(false)
			}
		}

		loadAgent()
	}, [id, setAgent, setLoading])

	if (loading) {
		return (
			<div className="min-h-screen flex justify-center items-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
			</div>
		)
	}

	if (!agent) {
		return (
			<div className="min-h-screen flex flex-col justify-center items-center">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Agent Not Found
				</h2>
				<p className="text-gray-600 mb-4">
					The agent you're looking for doesn't exist.
				</p>
				<Link
					to="/agents"
					className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
				>
					Back to Agents
				</Link>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* 顶部返回栏 */}
			<div className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<Button
						type="button"
						variant="ghost"
						onClick={() => navigate(-1)}
						className="gap-2"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<title>Back Icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Back
					</Button>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* 主内容区 */}
					<div className="lg:col-span-2">
						<Card className="p-8">
							{/* Agent 头部 */}
							<div className="flex items-start justify-between mb-6">
								<div className="flex items-start gap-4">
									{/* 头像 */}
									<div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
										{agent.avatar ? (
											<img
												src={agent.avatar}
												alt={agent.name}
												className="w-full h-full object-cover rounded-lg"
											/>
										) : (
											agent.name.charAt(0).toUpperCase()
										)}
									</div>

									<div>
										<div className="flex items-center gap-2 mb-2">
											<h1 className="text-3xl font-bold text-gray-900">
												{agent.name}
											</h1>
											{agent.isVerified && (
												<svg
													className="w-6 h-6 text-blue-600"
													fill="currentColor"
													viewBox="0 0 20 20"
													aria-hidden="true"
												>
													<title>Verified Agent</title>
													<path
														fillRule="evenodd"
														d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clipRule="evenodd"
													/>
												</svg>
											)}
										</div>
										<div className="flex items-center gap-3">
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													categoryColors[agent.category]
												}`}
											>
												{agent.category.replace(/_/g, " ")}
											</span>
											<span className="text-sm text-gray-600">
												by{" "}
												{agent.owner?.name ||
													agent.owner?.walletAddress.slice(0, 8)}
											</span>
										</div>
									</div>
								</div>

								{/* 操作按钮 */}
								{isOwner && (
									<div className="flex gap-2">
										<Link
											to={`/agents/${agent.id}/edit`}
											className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
										>
											Edit
										</Link>
										<Button
											variant="outline"
											onClick={handleDelete}
											disabled={deleting}
											className="border-red-300 text-red-600 hover:bg-red-50"
										>
											{deleting ? "Deleting..." : "Delete"}
										</Button>
									</div>
								)}
							</div>

							{/* 描述 */}
							<div className="mb-6">
								<p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
									{agent.description}
								</p>
							</div>

							{/* 标签 */}
							<div className="flex flex-wrap gap-2 mb-8">
								{agent.tags.map((tag) => (
									<span
										key={tag}
										className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
									>
										#{tag}
									</span>
								))}
							</div>

							{/* 能力列表 */}
							{agent.capabilities && agent.capabilities.length > 0 && (
								<div className="mb-8">
									<h2 className="text-xl font-semibold text-gray-900 mb-4">
										Capabilities
									</h2>
									<ul className="grid grid-cols-2 gap-3">
										{agent.capabilities.map((capability) => (
											<li
												key={capability}
												className="flex items-center text-gray-700"
											>
												<svg
													className="w-5 h-5 text-green-500 mr-2"
													fill="currentColor"
													viewBox="0 0 20 20"
													aria-hidden="true"
												>
													<title>Checkmark Icon</title>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clipRule="evenodd"
													/>
												</svg>
												{capability}
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Endpoint 信息 */}
							<div className="border-t pt-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">
									Endpoint Information
								</h2>
								<div className="space-y-3">
									<div>
										<span className="text-sm font-medium text-gray-600 block">
											Endpoint URL
										</span>
										<p className="text-gray-900 font-mono text-sm mt-1 break-all">
											{agent.endpointUrl}
										</p>
									</div>
									<div>
										<span className="text-sm font-medium text-gray-600 block">
											Authentication Type
										</span>
										<p className="text-gray-900 mt-1">
											{agent.endpointAuthType}
										</p>
									</div>
									<div>
										<span className="text-sm font-medium text-gray-600 block">
											Timeout
										</span>
										<p className="text-gray-900 mt-1">{agent.timeoutMs}ms</p>
									</div>
								</div>
							</div>
						</Card>
					</div>

					{/* 侧边栏 */}
					<div className="lg:col-span-1">
						<Card className="p-6 sticky top-8">
							{/* 统计信息 */}
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Statistics
							</h3>
							<div className="space-y-4">
								<div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Views</span>
										<span className="text-lg font-semibold text-gray-900">
											{agent.viewCount.toLocaleString()}
										</span>
									</div>
								</div>
								{agent.rating && (
									<div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-600">Rating</span>
											<div className="flex items-center gap-1">
												<svg
													className="w-5 h-5 text-yellow-400"
													fill="currentColor"
													viewBox="0 0 20 20"
													aria-hidden="true"
												>
													<title>Star Rating</title>
													<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
												</svg>
												<span className="text-lg font-semibold text-gray-900">
													{agent.rating.toFixed(1)}
												</span>
											</div>
										</div>
									</div>
								)}
								<div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">
											Jobs Completed
										</span>
										<span className="text-lg font-semibold text-gray-900">
											{agent.jobCount.toLocaleString()}
										</span>
									</div>
								</div>
							</div>

							{/* 健康状态 */}
							<div className="mt-6 pt-6 border-t">
								<h3 className="text-lg font-semibold text-gray-900 mb-3">
									Health Status
								</h3>
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Status</span>
									<div className="flex items-center gap-2">
										<div
											className={`w-3 h-3 rounded-full ${
												agent.healthStatus === "HEALTHY"
													? "bg-green-500"
													: agent.healthStatus === "UNHEALTHY"
														? "bg-red-500"
														: "bg-gray-400"
											}`}
										/>
										<span className="text-sm font-medium capitalize">
											{agent.healthStatus.toLowerCase()}
										</span>
									</div>
								</div>
							</div>

							{/* CTA 按钮 */}
							<div className="mt-6 pt-6 border-t">
								<Button type="button" className="w-full">
									Use This Agent
								</Button>
							</div>
						</Card>
					</div>
				</div>
			</div>

			<ConfirmDialog />
		</div>
	)
}

export default AgentDetailPage
