import { Star } from "lucide-react"
import { Link } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Agent } from "@/types/agent"
import { AgentStatus } from "@/types/agent"

export interface AgentCardProps {
	agent: Agent
	onClick?: (agent: Agent) => void
	showActions?: boolean
	className?: string
}

const getCategoryLabel = (category: string) => {
	const labels: Record<string, string> = {
		PRODUCTIVITY_TOOLS: "生产力工具",
		CREATIVE_ASSISTANTS: "创意助手",
		DEVELOPER_TOOLS: "开发者工具",
		OTHERS: "其他",
	}
	return labels[category] || category
}

const AgentCard = ({
	agent,
	onClick,
	showActions = true,
	className,
}: AgentCardProps) => {
	const isActive = agent.status === AgentStatus.ACTIVE
	const ratingLabel = agent.reviewCount
		? `${(agent.rating ?? 0).toFixed(1)} (${agent.reviewCount})`
		: "暂无评分"

	return (
		<Card
			className={cn(
				"flex h-full flex-col justify-between transition-shadow hover:shadow-md",
				className,
			)}
		>
			<CardHeader className="flex flex-row items-start gap-4 pb-3">
				<Avatar className="h-12 w-12">
					<AvatarImage
						src={agent.avatar || `https://avatar.vercel.sh/${agent.id}.png`}
						alt={agent.name}
					/>
					<AvatarFallback>{agent.name.slice(0, 1)}</AvatarFallback>
				</Avatar>
				<div className="flex-1">
					<h3 className="text-base font-semibold text-foreground">
						{agent.name}
					</h3>
					<p className="text-sm text-muted-foreground">
						{getCategoryLabel(agent.category)}
					</p>
				</div>
				<Badge variant={isActive ? "success" : "secondary"}>
					{isActive ? "Available" : "Offline"}
				</Badge>
			</CardHeader>
			<CardContent className="space-y-3">
				<p className="line-clamp-2 text-sm text-muted-foreground">
					{agent.shortDesc || agent.description}
				</p>
				<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
					<span className="flex items-center gap-1">
						<Star className="h-3 w-3 text-yellow-500" />
						{ratingLabel}
					</span>
					<span>{agent.jobCount} 次调用</span>
					<span>{agent.viewCount} 次浏览</span>
				</div>
				{agent.tags?.length ? (
					<div className="flex flex-wrap gap-2">
						{agent.tags.slice(0, 3).map((tag) => (
							<Badge key={tag} variant="outline">
								{tag}
							</Badge>
						))}
					</div>
				) : null}
			</CardContent>
			{showActions ? (
				<CardFooter>
					<Button className="w-full" variant="outline" asChild>
						<Link to={`/agents/${agent.id}`} onClick={() => onClick?.(agent)}>
							查看详情
						</Link>
					</Button>
				</CardFooter>
			) : null}
		</Card>
	)
}

export const AgentCardSkeleton = ({ className }: { className?: string }) => {
	return (
		<Card className={cn("flex h-full flex-col", className)}>
			<CardHeader className="flex flex-row items-start gap-4 pb-3">
				<div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
				<div className="flex-1 space-y-2">
					<div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
					<div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
				</div>
				<div className="h-5 w-16 animate-pulse rounded bg-muted" />
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="space-y-2">
					<div className="h-3 w-full animate-pulse rounded bg-muted" />
					<div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
				</div>
				<div className="flex gap-2">
					<div className="h-3 w-14 animate-pulse rounded bg-muted" />
					<div className="h-3 w-16 animate-pulse rounded bg-muted" />
					<div className="h-3 w-12 animate-pulse rounded bg-muted" />
				</div>
			</CardContent>
			<CardFooter>
				<div className="h-9 w-full animate-pulse rounded bg-muted" />
			</CardFooter>
		</Card>
	)
}

export default AgentCard
