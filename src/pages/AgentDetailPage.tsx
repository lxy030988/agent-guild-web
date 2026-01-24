import { ArrowLeft, Pencil } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Link, useNavigate, useParams } from "react-router-dom"

import { AgentProfile, ReviewSection, ServiceList } from "@/components/agent"
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
	const [selectedServiceId, setSelectedServiceId] = useState<
		number | undefined
	>()

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

	useEffect(() => {
		if (agent?.services?.length) {
			setSelectedServiceId(agent.services[0].id)
		}
	}, [agent])

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

	const isOwner = user?.id === agent.userId

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
					<ServiceList
						services={agent.services}
						selectedServiceId={selectedServiceId}
						onSelect={(service) => setSelectedServiceId(service.id)}
					/>
					<ReviewSection data={reviews} loading={reviewLoading} />
				</div>
				<div className="space-y-6">
					<Card className="glass-card">
						<CardHeader>
							<CardTitle className="text-lg font-semibold">价格方案</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{agent.pricing.length ? (
								agent.pricing.map((plan) => (
									<div
										key={plan.id}
										className="rounded-2xl border border-border bg-background/80 p-4"
									>
										<div className="flex items-center justify-between">
											<h4 className="text-sm font-semibold text-foreground">
												{plan.name}
											</h4>
											<span className="text-sm font-semibold text-foreground">
												{plan.currency === "ETH" ? "Ξ" : "$"}
												{plan.price}/{plan.unit}
											</span>
										</div>
										{plan.description ? (
											<p className="mt-2 text-xs text-muted-foreground">
												{plan.description}
											</p>
										) : null}
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground">暂无价格方案</p>
							)}
						</CardContent>
					</Card>
					<Card className="glass-card">
						<CardHeader>
							<CardTitle className="text-lg font-semibold">预约提示</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm text-muted-foreground">
							<p>选择服务后可发起预约请求。</p>
							<p>当前预约流程将在后续版本开放。</p>
							<Button
								className="w-full rounded-full"
								disabled={!selectedServiceId}
								onClick={() => toast("预约功能建设中")}
							>
								发起预约
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	)
}

export default AgentDetailPage
