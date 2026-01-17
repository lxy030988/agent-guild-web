import type React from "react"
import type { DisputeStats as IDisputeStats } from "../../utils/disputeApi"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"

interface DisputeStatsProps {
	stats: IDisputeStats | null
	loading: boolean
}

export const DisputeStats: React.FC<DisputeStatsProps> = ({
	stats,
	loading,
}) => {
	if (loading || !stats) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />
				))}
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-200/50 backdrop-blur-sm">
				<CardHeader className="pb-2">
					<CardDescription className="text-indigo-600 font-medium">
						Total Disputes
					</CardDescription>
					<div className="flex items-center justify-between">
						<CardTitle className="text-3xl font-bold text-indigo-900">
							{stats.totalDisputes}
						</CardTitle>
						<span className="text-2xl">⚖️</span>
					</div>
				</CardHeader>
			</Card>

			<Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200/50 backdrop-blur-sm">
				<CardHeader className="pb-2">
					<CardDescription className="text-amber-600 font-medium">
						Active Voting
					</CardDescription>
					<div className="flex items-center justify-between">
						<CardTitle className="text-3xl font-bold text-amber-900">
							{stats.activeVoting}
						</CardTitle>
						<span className="text-2xl">🗳️</span>
					</div>
				</CardHeader>
			</Card>

			<Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200/50 backdrop-blur-sm">
				<CardHeader className="pb-2">
					<CardDescription className="text-emerald-600 font-medium">
						Resolved Case
					</CardDescription>
					<div className="flex items-center justify-between">
						<CardTitle className="text-3xl font-bold text-emerald-900">
							{stats.resolvedDisputes}
						</CardTitle>
						<span className="text-2xl">✅</span>
					</div>
				</CardHeader>
			</Card>
		</div>
	)
}
