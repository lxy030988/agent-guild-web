import { CheckCircle2, Clock, Wallet } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Service } from "@/types/agent"

const formatPrice = (price: number, currency: Service["currency"]) =>
	currency === "ETH" ? `Ξ${price}` : `$${price}`

interface ServiceListProps {
	services: Service[]
	selectedServiceId?: number
	onSelect?: (service: Service) => void
}

const ServiceList = ({
	services,
	selectedServiceId,
	onSelect,
}: ServiceListProps) => {
	return (
		<Card className="glass-card">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">可选服务</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{services.length ? (
					services.map((service) => {
						const isSelected = service.id === selectedServiceId
						return (
							<div
								key={service.id}
								className="rounded-2xl border border-border bg-background/80 p-4 shadow-sm"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<h4 className="text-base font-semibold text-foreground">
												{service.name}
											</h4>
											{isSelected ? (
												<Badge variant="success" className="gap-1">
													<CheckCircle2 className="h-3 w-3" />
													已选择
												</Badge>
											) : null}
										</div>
										<p className="text-sm text-muted-foreground">
											{service.description}
										</p>
										<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
											<span className="inline-flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{service.duration} 分钟
											</span>
											<span className="inline-flex items-center gap-1">
												<Wallet className="h-3 w-3" />
												{formatPrice(service.price, service.currency)}
											</span>
										</div>
									</div>
									<Button
										variant={isSelected ? "secondary" : "outline"}
										className="rounded-full"
										onClick={() => onSelect?.(service)}
									>
										{isSelected ? "已选" : "选择服务"}
									</Button>
								</div>
							</div>
						)
					})
				) : (
					<p className="text-sm text-muted-foreground">暂无服务信息</p>
				)}
			</CardContent>
		</Card>
	)
}

export default ServiceList
