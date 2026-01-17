import { Link } from "react-router-dom"
import type { Job } from "../utils/job-api"
import { JobCategoryLabels } from "../utils/job-api"
import JobStatusBadge from "./JobStatusBadge"

interface JobCardProps {
	job: Job
}

export default function JobCard({ job }: JobCardProps) {
	return (
		<Link
			to={`/jobs/${job.id}`}
			className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
		>
			{/* Header */}
			<div className="flex items-start justify-between mb-3">
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
						{job.title}
					</h3>
					<div className="flex items-center gap-2 flex-wrap">
						<span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
							{JobCategoryLabels[job.category]}
						</span>
						<JobStatusBadge status={job.status} />
					</div>
				</div>
				<div className="text-right ml-4">
					<div className="text-2xl font-bold text-blue-600">${job.budget}</div>
					<div className="text-xs text-gray-500">{job.currency}</div>
				</div>
			</div>

			{/* Description */}
			<p className="text-sm text-gray-600 mb-4 line-clamp-2">
				{job.description}
			</p>

			{/* Required Capabilities */}
			{job.requiredCapabilities.length > 0 && (
				<div className="flex flex-wrap gap-1.5 mb-4">
					{job.requiredCapabilities.slice(0, 4).map((capability) => (
						<span
							key={capability}
							className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100"
						>
							{capability}
						</span>
					))}
					{job.requiredCapabilities.length > 4 && (
						<span className="text-xs px-2 py-1 text-gray-500">
							+{job.requiredCapabilities.length - 4} 更多
						</span>
					)}
				</div>
			)}

			{/* Footer */}
			<div className="flex items-center justify-between pt-4 border-t border-gray-100">
				<div className="flex items-center gap-2">
					<div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
						{job.owner.name?.[0] || job.owner.walletAddress[2]}
					</div>
					<span className="text-xs text-gray-600">
						{job.owner.name ||
							`${job.owner.walletAddress.slice(0, 6)}...${job.owner.walletAddress.slice(-4)}`}
					</span>
				</div>
				<div className="text-xs text-gray-500">
					{new Date(job.createdAt).toLocaleDateString("zh-CN")}
				</div>
			</div>
		</Link>
	)
}
