import AgentCard, { AgentCardSkeleton } from "@/components/agent/AgentCard"
import { cn } from "@/lib/utils"
import type { Agent } from "@/types/agent"

export interface AgentGridProps {
	agents: Agent[]
	loading?: boolean
	className?: string
	skeletonCount?: number
	onAgentClick?: (agent: Agent) => void
}

const AgentGrid = ({
	agents,
	loading = false,
	className,
	skeletonCount = 6,
	onAgentClick,
}: AgentGridProps) => {
	const skeletonKeys = Array.from(
		{ length: skeletonCount },
		(_, index) => `agent-skeleton-${index + 1}`,
	)

	return (
		<div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
			{loading
				? skeletonKeys.map((key) => <AgentCardSkeleton key={key} />)
				: agents.map((agent) => (
						<AgentCard key={agent.id} agent={agent} onClick={onAgentClick} />
					))}
		</div>
	)
}

export default AgentGrid
