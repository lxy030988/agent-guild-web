import { MapPin, MessageCircle, Star, Timer } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Agent } from "@/types/agent"

interface AgentProfileProps {
	agent: Agent
	isOwner?: boolean
	onMessage?: () => void
}

const AgentProfile = ({ agent, isOwner, onMessage }: AgentProfileProps) => {
	const ratingLabel = agent.reviewCount
		? `${agent.rating.toFixed(1)} (${agent.reviewCount})`
		: "暂无评分"

	const locationLabel = agent.location.isRemote
		? "Remote"
		: `${agent.location.city}, ${agent.location.country}`

	return (
		<Card className="glass-card overflow-hidden">
			<CardContent className="p-6">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex items-start gap-5">
						<Avatar className="h-16 w-16">
							<AvatarImage
								src={
									agent.user?.avatar ||
									`https://avatar.vercel.sh/${agent.id}.png`
								}
								alt={agent.user?.name || agent.title}
							/>
							<AvatarFallback>{agent.title.slice(0, 1)}</AvatarFallback>
						</Avatar>
						<div className="space-y-2">
							<div className="flex flex-wrap items-center gap-3">
								<h1 className="text-2xl font-bold text-foreground">
									{agent.title}
								</h1>
								<Badge variant={agent.isActive ? "success" : "secondary"}>
									{agent.isActive ? "Available" : "Offline"}
								</Badge>
								{isOwner ? <Badge variant="outline">Owner</Badge> : null}
							</div>
							<p className="text-sm text-muted-foreground">
								{agent.category}
								{agent.subcategory ? ` · ${agent.subcategory}` : ""}
							</p>
							<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
								<span className="flex items-center gap-1">
									<Star className="h-4 w-4 text-yellow-500" />
									{ratingLabel}
								</span>
								<span className="flex items-center gap-1">
									<MapPin className="h-4 w-4 text-primary" />
									{locationLabel}
								</span>
								<span className="flex items-center gap-1">
									<Timer className="h-4 w-4 text-primary" />
									{agent.responseTime || "响应时间待更新"}
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
				<div className="mt-6 grid gap-4 rounded-2xl border border-border bg-background/70 p-4 md:grid-cols-3">
					<div>
						<p className="text-xs uppercase text-muted-foreground">
							Completed Jobs
						</p>
						<p className="text-lg font-semibold text-foreground">
							{agent.completedJobs}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground">Languages</p>
						<p className="text-sm text-foreground">
							{agent.languages.length ? agent.languages.join(", ") : "待补充"}
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
