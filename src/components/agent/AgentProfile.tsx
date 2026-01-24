import { Activity, MessageCircle, Star } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Agent } from "@/types/agent"
import { AgentStatus } from "@/types/agent"

interface AgentProfileProps {
	agent: Agent
	isOwner?: boolean
	onMessage?: () => void
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

const AgentProfile = ({ agent, isOwner, onMessage }: AgentProfileProps) => {
	const isActive = agent.status === AgentStatus.ACTIVE
	const ratingLabel = agent.reviewCount
		? `${(agent.rating ?? 0).toFixed(1)} (${agent.reviewCount})`
		: "暂无评分"

	return (
		<Card className="glass-card overflow-hidden">
			<CardContent className="p-6">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex items-start gap-5">
						<Avatar className="h-16 w-16">
							<AvatarImage
								src={agent.avatar || `https://avatar.vercel.sh/${agent.id}.png`}
								alt={agent.name}
							/>
							<AvatarFallback>{agent.name.slice(0, 1)}</AvatarFallback>
						</Avatar>
						<div className="space-y-2">
							<div className="flex flex-wrap items-center gap-3">
								<h1 className="text-2xl font-bold text-foreground">
									{agent.name}
								</h1>
								<Badge variant={isActive ? "success" : "secondary"}>
									{isActive ? "Available" : "Offline"}
								</Badge>
								{agent.isVerified && <Badge variant="default">已验证</Badge>}
								{isOwner ? <Badge variant="outline">Owner</Badge> : null}
							</div>
							<p className="text-sm text-muted-foreground">
								{getCategoryLabel(agent.category)}
							</p>
							<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
								<span className="flex items-center gap-1">
									<Star className="h-4 w-4 text-yellow-500" />
									{ratingLabel}
								</span>
								<span className="flex items-center gap-1">
									<Activity className="h-4 w-4 text-primary" />
									{agent.healthStatus}
								</span>
							</div>
						</div>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button
							variant="outline"
							className="rounded-full"
							onClick={onMessage}
						>
							<MessageCircle className="mr-2 h-4 w-4" />
							发起咨询
						</Button>
					</div>
				</div>
				<div className="mt-6 grid gap-4 rounded-2xl border border-border bg-background/70 p-4 md:grid-cols-4">
					<div>
						<p className="text-xs uppercase text-muted-foreground">调用次数</p>
						<p className="text-lg font-semibold text-foreground">
							{agent.jobCount}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground">浏览次数</p>
						<p className="text-lg font-semibold text-foreground">
							{agent.viewCount}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground">评论数</p>
						<p className="text-lg font-semibold text-foreground">
							{agent.reviewCount}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground">Tags</p>
						<p className="text-sm text-foreground">
							{agent.tags.length ? agent.tags.join(", ") : "暂无标签"}
						</p>
					</div>
				</div>
				<p className="mt-5 text-sm text-muted-foreground">
					{agent.description}
				</p>
			</CardContent>
		</Card>
	)
}

export default AgentProfile
