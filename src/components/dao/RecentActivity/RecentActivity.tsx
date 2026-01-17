import { Card } from "@/components/ui/card"
import { Vote, FileText, Coins, Clock, CheckCircle, XCircle } from "lucide-react"

interface Activity {
	id: string
	type: "vote" | "proposal" | "stake" | "executed" | "canceled"
	description: string
	timestamp: string
	walletAddress: string
}

// Mock data - will be replaced with real API data
const mockActivities: Activity[] = [
	{
		id: "1",
		type: "vote",
		description: "Voted FOR proposal #042",
		timestamp: "2 min ago",
		walletAddress: "0x1234...5678",
	},
	{
		id: "2",
		type: "proposal",
		description: "Created proposal #043",
		timestamp: "15 min ago",
		walletAddress: "0xabcd...efgh",
	},
	{
		id: "3",
		type: "stake",
		description: "Staked 1,000 NEX",
		timestamp: "1 hour ago",
		walletAddress: "0x9876...5432",
	},
	{
		id: "4",
		type: "executed",
		description: "Proposal #039 executed",
		timestamp: "3 hours ago",
		walletAddress: "0xdead...beef",
	},
	{
		id: "5",
		type: "vote",
		description: "Voted AGAINST proposal #041",
		timestamp: "5 hours ago",
		walletAddress: "0xface...cafe",
	},
]

const getActivityIcon = (type: Activity["type"]) => {
	switch (type) {
		case "vote":
			return <Vote className="h-4 w-4 text-purple-500" />
		case "proposal":
			return <FileText className="h-4 w-4 text-blue-500" />
		case "stake":
			return <Coins className="h-4 w-4 text-yellow-500" />
		case "executed":
			return <CheckCircle className="h-4 w-4 text-green-500" />
		case "canceled":
			return <XCircle className="h-4 w-4 text-red-500" />
		default:
			return <Clock className="h-4 w-4 text-muted-foreground" />
	}
}

const getActivityColor = (type: Activity["type"]) => {
	switch (type) {
		case "vote":
			return "bg-purple-500/10 border-purple-500/20"
		case "proposal":
			return "bg-blue-500/10 border-blue-500/20"
		case "stake":
			return "bg-yellow-500/10 border-yellow-500/20"
		case "executed":
			return "bg-green-500/10 border-green-500/20"
		case "canceled":
			return "bg-red-500/10 border-red-500/20"
		default:
			return "bg-muted/10 border-muted/20"
	}
}

export function RecentActivity() {
	const activities = mockActivities

	return (
		<Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold">Recent Activity</h3>
				<button type="button" className="text-xs text-purple-500 hover:text-purple-400 transition-colors">
					View All
				</button>
			</div>

			<div className="space-y-3">
				{activities.map((activity) => (
					<div
						key={activity.id}
						className={`p-3 rounded-lg border ${getActivityColor(activity.type)} transition-all hover:scale-[1.02]`}
					>
						<div className="flex items-start gap-3">
							<div className="mt-0.5">
								{getActivityIcon(activity.type)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">
									{activity.description}
								</p>
								<div className="flex items-center gap-2 mt-1">
									<span className="text-xs text-muted-foreground font-mono">
										{activity.walletAddress}
									</span>
									<span className="text-xs text-muted-foreground">•</span>
									<span className="text-xs text-muted-foreground">
										{activity.timestamp}
									</span>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{activities.length === 0 && (
				<div className="text-center py-8">
					<Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
					<p className="text-sm text-muted-foreground">No recent activity</p>
				</div>
			)}
		</Card>
	)
}
