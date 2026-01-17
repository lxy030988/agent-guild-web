import type React from "react"
import { Link } from "react-router-dom"
import { type Agent, AgentCategory } from "../utils/agent-api"

interface AgentCardProps {
	agent: Agent
}

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
 * 分类显示名称
 */
const categoryNames: Record<AgentCategory, string> = {
	[AgentCategory.PRODUCTIVITY_TOOLS]: "Productivity",
	[AgentCategory.CREATIVE_ASSISTANTS]: "Creative",
	[AgentCategory.DEVELOPER_TOOLS]: "Developer",
	[AgentCategory.OTHERS]: "Others",
}

/**
 * Agent 卡片组件
 */
export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
	return (
		<Link
			to={`/agents/${agent.id}`}
			className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200"
		>
			{/* Agent 头像 */}
			<div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
				{agent.avatar ? (
					<img
						src={agent.avatar}
						alt={agent.name}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="text-white text-4xl font-bold">
						{agent.name.charAt(0).toUpperCase()}
					</div>
				)}
			</div>

			{/* Agent 信息 */}
			<div className="p-4">
				{/* 分类标签 */}
				<div className="mb-2">
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
							categoryColors[agent.category]
						}`}
					>
						{categoryNames[agent.category]}
					</span>
					{agent.isVerified && (
						<span className="ml-2 inline-flex items-center text-blue-600">
							<svg
								className="w-4 h-4"
								fill="currentColor"
								viewBox="0 0 20 20"
								aria-hidden="true"
							>
								<title>Verified Icon</title>
								<path
									fillRule="evenodd"
									d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						</span>
					)}
				</div>

				{/* Agent 名称 */}
				<h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
					{agent.name}
				</h3>

				{/* Agent 描述 */}
				<p className="text-sm text-gray-600 mb-3 line-clamp-2">
					{agent.shortDesc || agent.description}
				</p>

				{/* 标签 */}
				<div className="flex flex-wrap gap-1 mb-3">
					{agent.tags.slice(0, 3).map((tag) => (
						<span
							key={tag}
							className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
						>
							#{tag}
						</span>
					))}
					{agent.tags.length > 3 && (
						<span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
							+{agent.tags.length - 3}
						</span>
					)}
				</div>

				{/* 统计信息 */}
				<div className="flex items-center justify-between text-sm text-gray-500">
					<div className="flex items-center gap-3">
						{/* 浏览量 */}
						<div className="flex items-center gap-1">
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<title>Views Icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
							<span>{agent.viewCount.toLocaleString()}</span>
						</div>

						{/* 评分 */}
						{agent.rating && (
							<div className="flex items-center gap-1">
								<svg
									className="w-4 h-4 text-yellow-400"
									fill="currentColor"
									viewBox="0 0 20 20"
									aria-hidden="true"
								>
									<title>Star Rating</title>
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
								<span>{agent.rating.toFixed(1)}</span>
							</div>
						)}

						{/* 任务数 */}
						{agent.jobCount > 0 && (
							<div className="flex items-center gap-1">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>Job Icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
									/>
								</svg>
								<span>{agent.jobCount}</span>
							</div>
						)}
					</div>

					{/* 健康状态 */}
					{agent.isVerified && (
						<div className="flex items-center gap-1">
							<div
								className={`w-2 h-2 rounded-full ${
									agent.healthStatus === "HEALTHY"
										? "bg-green-500"
										: agent.healthStatus === "UNHEALTHY"
											? "bg-red-500"
											: "bg-gray-400"
								}`}
							/>
							<span className="text-xs capitalize">
								{agent.healthStatus.toLowerCase()}
							</span>
						</div>
					)}
				</div>
			</div>
		</Link>
	)
}
