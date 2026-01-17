import { FileText, Vote } from "lucide-react"
import type { UserGovernanceStats } from "@/stores/daoStore"

interface UserActivityProps {
	stats: UserGovernanceStats
}

export function UserActivity({ stats }: UserActivityProps) {
	const activityStats = [
		{
			icon: FileText,
			label: "Proposals Created",
			value: stats.proposalsCreated,
			color: "text-blue-600",
			bgColor: "bg-blue-500/10",
		},
		{
			icon: Vote,
			label: "Proposals Voted",
			value: stats.proposalsVoted,
			color: "text-purple-600",
			bgColor: "bg-purple-500/10",
		},
	]

	return (
		<div className="space-y-3">
			<h3 className="font-semibold">Your Activity</h3>
			<div className="grid grid-cols-2 gap-3">
				{activityStats.map((stat) => {
					const Icon = stat.icon
					return (
						<div
							key={stat.label}
							className="p-4 rounded-xl bg-card/50 border border-border/50 hover:bg-card/70 transition-colors"
						>
							<div className="flex items-center gap-3">
								<div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
									<Icon className={`h-5 w-5 ${stat.color}`} />
								</div>
								<div>
									<p className="text-2xl font-bold">{stat.value}</p>
									<p className="text-xs text-muted-foreground">{stat.label}</p>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
