import { formatDistanceToNow } from "date-fns"
import type React from "react"
import { Link } from "react-router-dom"
import { type Dispute, DisputeStatus } from "../../utils/disputeApi"
import { Badge } from "../ui/badge"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card"

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
			<Card className="hover:shadow-lg transition-all duration-300 border-gray-100 bg-white group cursor-pointer overflow-hidden relative">
				<div
					className={`absolute top-0 left-0 w-1 h-full ${
						dispute.status === DisputeStatus.VOTING
							? "bg-amber-400"
							: dispute.status === DisputeStatus.RESOLVED
								? "bg-emerald-400"
								: "bg-gray-400"
					}`}
				/>

				<CardHeader className="pb-3">
					<div className="flex justify-between items-start mb-2">
						<Badge variant="outline" className={getStatusColor(dispute.status)}>
							{dispute.status}
						</Badge>
						<span className="text-xs text-gray-400 font-medium">
							ID: #{dispute.id}
						</span>
					</div>
					<CardTitle className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
						{dispute.job?.title || "Untitled Dispute"}
					</CardTitle>
					<p className="text-sm text-gray-500 line-clamp-2 mt-2 leading-relaxed">
						{dispute.reason}
					</p>
				</CardHeader>

				<CardContent className="pb-4">
					<div className="space-y-3">
						<div className="flex justify-between text-xs font-semibold mb-1">
							<span className="text-emerald-600">
								Approve ({dispute.approveVotes})
							</span>
							<span className="text-rose-600">
								Reject ({dispute.rejectVotes})
							</span>
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
				</CardContent>

				<CardFooter className="pt-0 border-t border-gray-50 flex justify-between items-center mt-2 group-hover:bg-gray-50/50 transition-colors">
					<div className="flex items-center gap-2 mt-4">
						<div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">
							👤
						</div>
						<span className="text-xs text-gray-500">
							By {dispute.creator?.username || "Anonymous"}
						</span>
					</div>
					<span className="text-[10px] text-gray-400 font-medium mt-4">
						{formatDistanceToNow(new Date(dispute.createdAt))} ago
					</span>
				</CardFooter>
			</Card>
		</Link>
	)
}
