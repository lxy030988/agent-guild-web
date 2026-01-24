import { ArrowLeft, Pencil } from "lucide-react"
import { useMemo } from "react"
import toast from "react-hot-toast"
import { Link, useNavigate, useParams } from "react-router-dom"

import { AgentProfile, ReviewSection } from "@/components/agent"
import { EmptyState, Loading } from "@/components/common"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAgent } from "@/hooks/useAgent"
import { useAgentReviews } from "@/hooks/useAgentReviews"
import { useAuth } from "@/hooks/useAuth"

const AgentDetailPage = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const { user } = useAuth()
	const agentId = useMemo(() => Number(id), [id])

	const {
		data: agent,
		isLoading,
		error,
	} = useAgent(Number.isNaN(agentId) ? undefined : agentId)
	const { data: reviews, isLoading: reviewLoading } = useAgentReviews(
		Number.isNaN(agentId) ? undefined : agentId,
		{
			page: 1,
			limit: 6,
			sortBy: "recent",
		},
	)

	if (Number.isNaN(agentId)) {
		return (
			<section className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-16">
				<EmptyState
					title="参数错误"
					description="无效的代理人编号。"
					action={{ label: "返回列表", onClick: () => navigate("/agents") }}
				/>
			</section>
		)
	}

	if (isLoading) {
		return <Loading />
	}

	if (error || !agent) {
		return (
			<section className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-16">
				<EmptyState
					title="代理人不存在"
					description="请检查链接或返回列表浏览其他代理人。"
					action={{ label: "返回列表", onClick: () => navigate("/agents") }}
				/>
			</section>
		)
	}

	const isOwner = user?.id === agent.ownerId

	return (
		<section className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-10">
			<div className="flex items-center justify-between">
				<Link
					to="/agents"
					className="inline-flex items-center gap-2 text-sm text-primary"
				>
					<ArrowLeft className="h-4 w-4" />
					返回列表
				</Link>
				{isOwner ? (
					<Button asChild variant="outline" className="rounded-full">
						<Link to={`/agents/${agent.id}/edit`}>
							<Pencil className="mr-2 h-4 w-4" />
							编辑资料
						</Link>
					</Button>
				) : null}
			</div>

			<AgentProfile
				agent={agent}
				isOwner={isOwner}
				onMessage={() => {
					toast("预约/私信功能即将上线")
				}}
			/>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					<Card className="glass-card">
						<CardHeader>
							<CardTitle className="text-lg font-semibold">能力介绍</CardTitle>
						</CardHeader>
						<CardContent>
							{agent.capabilities?.length ? (
								<div className="flex flex-wrap gap-2">
									{agent.capabilities.map((cap) => (
										<span
											key={cap}
											className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
										>
											{cap}
										</span>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">暂无能力描述</p>
							)}
						</CardContent>
					</Card>
					<ReviewSection data={reviews} loading={reviewLoading} />
				</div>
				<div className="space-y-6">
					<Card className="glass-card">
						<CardHeader>
							<CardTitle className="text-lg font-semibold">
								Agent 配置
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="rounded-2xl border border-border bg-background/80 p-4">
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											端点 URL
										</span>
										<span className="text-sm font-mono text-foreground truncate max-w-[200px]">
											{agent.endpointUrl}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											认证类型
										</span>
										<span className="text-sm text-foreground">
											{agent.endpointAuthType}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											超时时间
										</span>
										<span className="text-sm text-foreground">
											{agent.timeoutMs}ms
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											健康状态
										</span>
										<span
											className={`text-sm font-medium ${
												agent.healthStatus === "HEALTHY"
													? "text-green-500"
													: agent.healthStatus === "UNHEALTHY"
														? "text-red-500"
														: "text-yellow-500"
											}`}
										>
											{agent.healthStatus}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="glass-card">
						<CardHeader>
							<CardTitle className="text-lg font-semibold">使用提示</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm text-muted-foreground">
							<p>选择服务后可发起调用请求。</p>
							<p>当前调用流程将在后续版本开放。</p>
							<Button
								className="w-full rounded-full"
								onClick={() => toast("调用功能建设中")}
							>
								调用 Agent
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	)
}

export default AgentDetailPage
