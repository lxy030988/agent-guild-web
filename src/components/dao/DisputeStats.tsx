import type React from "react"
import type { DisputeStats as IDisputeStats } from "../../utils/disputeApi"
import StatCard from "../StatCard"

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
			<StatCard
				title="总争议数"
				value={stats.totalDisputes}
				color="gray"
				icon={<span>⚖️</span>}
			/>
			<StatCard
				title="投票中"
				value={stats.activeVoting}
				color="yellow"
				icon={<span>🗳️</span>}
			/>
			<StatCard
				title="已解决"
				value={stats.resolvedDisputes}
				color="green"
				icon={<span>✅</span>}
			/>
		</div>
	)
}
