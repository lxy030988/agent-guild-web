import { useState } from "react"
import { useProposals } from "@/hooks/dao/useProposals"
import { ProposalCard } from "./ProposalCard"
import { ProposalFilters } from "./ProposalFilters"
import { Loader2, Filter } from "lucide-react"

interface ProposalsGridProps {
	onVote: (proposalId: number) => void
	onView: (proposalId: number) => void
}

export function ProposalsGrid({ onVote, onView }: ProposalsGridProps) {
	const { proposals, isLoading } = useProposals()
	const [showFilters, setShowFilters] = useState(true)

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Active Proposals</h2>
					<p className="text-sm text-muted-foreground mt-1">
						{proposals.length} proposal{proposals.length !== 1 ? "s" : ""} found
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowFilters(!showFilters)}
					className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/50 hover:bg-card transition-colors"
				>
					<Filter className="h-4 w-4" />
					<span className="text-sm font-medium">Filters</span>
				</button>
			</div>

			{/* Filters */}
			{showFilters && (
				<div className="p-4 rounded-lg bg-card/50 border border-border/50">
					<ProposalFilters />
				</div>
			)}

			{/* Grid */}
			{proposals.length === 0 ? (
				<div className="text-center py-20">
					<p className="text-muted-foreground">No proposals found</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
					{proposals.map((proposal) => (
						<ProposalCard
							key={proposal.id}
							proposal={proposal}
							onVote={onVote}
							onView={onView}
						/>
					))}
				</div>
			)}
		</div>
	)
}
