import { formatDistanceToNow } from "date-fns"
import type React from "react"
import { Link } from "react-router-dom"
import { type Dispute, DisputeStatus } from "../../utils/disputeApi"
import { Badge } from "../ui/badge"

interface DisputeCardProps {
	dispute: Dispute
}

export const DisputeCard: React.FC<DisputeCardProps> = ({ dispute }) => {
	const getStatusColor = (status: DisputeStatus) => {
		switch (status) {
			case DisputeStatus.VOTING:
				return "bg-amber-100 text-amber-700 border-amber-200"
			case DisputeStatus.RESOLVED:
				return "bg-emerald-100 text-emerald-700 border-emerald-200"
			case DisputeStatus.EXPIRED:
				return "bg-gray-100 text-gray-700 border-gray-200"
			default:
				return "bg-blue-100 text-blue-700 border-blue-200"
		}
	}

	const totalVotes =
		dispute.approveVotes + dispute.rejectVotes + dispute.abstainVotes
	const approvePercent =
		totalVotes > 0 ? (dispute.approveVotes / totalVotes) * 100 : 0
	const rejectPercent =
		totalVotes > 0 ? (dispute.rejectVotes / totalVotes) * 100 : 0

	return (
		<Link to={`/dao/${dispute.id}`}>
			<div className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
				<div className="flex items-start justify-between mb-3">
					<div className="flex-1">
						<h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
							{dispute.job?.title || "未命名争议"}
						</h3>
						<div className="flex items-center gap-2 flex-wrap">
							<Badge variant="outline" className={getStatusColor(dispute.status)}>
								{dispute.status}
							</Badge>
							<span className="text-xs text-gray-500">ID: #{dispute.id}</span>
						</div>
					</div>
					<div className="text-right ml-4">
						<div className="text-sm text-gray-500">投票总数</div>
						<div className="text-xl font-bold text-blue-600">
							{totalVotes}
						</div>
					</div>
				</div>

				<p className="text-sm text-gray-600 mb-4 line-clamp-2">
					{dispute.reason}
				</p>

				<div className="space-y-2">
					<div className="flex justify-between text-xs font-medium">
						<span className="text-emerald-600">
							赞成 {dispute.approveVotes}
						</span>
						<span className="text-rose-600">反对 {dispute.rejectVotes}</span>
					</div>
					<div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
						<div
							className="h-full bg-emerald-500"
							style={{ width: `${approvePercent}%` }}
						/>
						<div
							className="h-full bg-rose-500"
							style={{ width: `${rejectPercent}%` }}
						/>
					</div>
				</div>

				<div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">
							👤
						</div>
						<span className="text-xs text-gray-600">
							{dispute.creator?.username || "匿名用户"}
						</span>
					</div>
					<div className="text-xs text-gray-500">
						{formatDistanceToNow(new Date(dispute.createdAt))} 前
					</div>
				</div>
			</div>
		</Link>
	)
}
