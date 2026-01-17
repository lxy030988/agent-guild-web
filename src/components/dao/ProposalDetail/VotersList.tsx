import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react"
import type { Vote } from "@/stores/daoStore"

interface VotersListProps {
	votes: Vote[]
}

export function VotersList({ votes }: VotersListProps) {
	const sortedVotes = [...votes].sort((a, b) => b.votingPower - a.votingPower)

	const getChoiceIcon = (choice: Vote["choice"]) => {
		switch (choice) {
			case "for":
				return <CheckCircle2 className="h-4 w-4 text-green-600" />
			case "against":
				return <XCircle className="h-4 w-4 text-red-600" />
			case "abstain":
				return <MinusCircle className="h-4 w-4 text-gray-600" />
		}
	}

	const getChoiceLabel = (choice: Vote["choice"]) => {
		return choice.charAt(0).toUpperCase() + choice.slice(1)
	}

	const getInitials = (address: string) => {
		return `${address.slice(2, 4).toUpperCase()}`
	}

	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`
	}

	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp)
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Voters</h3>
				<span className="text-sm text-muted-foreground">
					{votes.length} total votes
				</span>
			</div>

			<div className="space-y-2 max-h-96 overflow-y-auto">
				{sortedVotes.map((vote) => (
					<div
						key={vote.id}
						className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card/70 transition-colors"
					>
						<div className="flex items-center gap-3">
							<Avatar className="h-10 w-10">
								<AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
									{getInitials(vote.voter)}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="flex items-center gap-2">
									<span className="font-medium font-mono text-sm">
										{formatAddress(vote.voter)}
									</span>
									{getChoiceIcon(vote.choice)}
								</div>
								<p className="text-xs text-muted-foreground">
									{formatTimestamp(vote.timestamp)}
								</p>
							</div>
						</div>

						<div className="text-right">
							<p className="font-semibold">
								{vote.votingPower.toLocaleString()}
							</p>
							<p className="text-xs text-muted-foreground">
								{getChoiceLabel(vote.choice)}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
