import { Star } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReviewListResponse } from "@/types/review"

interface ReviewSectionProps {
	data?: ReviewListResponse
	loading?: boolean
}

const formatDistribution = (distribution: Record<number, number>) => {
	const entries = Object.entries(distribution)
	return entries.length
		? entries
				.sort(([a], [b]) => Number(b) - Number(a))
				.map(([rating, count]) => ({ rating: Number(rating), count }))
		: []
}

const ReviewSection = ({ data, loading }: ReviewSectionProps) => {
	const summary = data?.summary
	const reviews = data?.data ?? []
	const distribution = summary ? formatDistribution(summary.distribution) : []

	return (
		<Card className="glass-card">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">用户评价</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{summary ? (
					<div className="grid gap-4 rounded-2xl border border-border bg-background/70 p-4 md:grid-cols-3">
						<div className="space-y-1">
							<p className="text-xs uppercase text-muted-foreground">
								Average Rating
							</p>
							<div className="flex items-center gap-2">
								<span className="text-2xl font-semibold text-foreground">
									{summary.average.toFixed(1)}
								</span>
								<Star className="h-4 w-4 text-yellow-500" />
							</div>
							<p className="text-xs text-muted-foreground">
								基于 {summary.total} 条评价
							</p>
						</div>
						<div className="md:col-span-2">
							<div className="space-y-2">
								{distribution.map((item) => (
									<div
										key={item.rating}
										className="flex items-center gap-3 text-xs text-muted-foreground"
									>
										<span className="w-10">{item.rating} 星</span>
										<div className="h-2 flex-1 rounded-full bg-muted">
											<div
												className="h-2 rounded-full bg-primary"
												style={{
													width: summary.total
														? `${(item.count / summary.total) * 100}%`
														: "0%",
												}}
											/>
										</div>
										<span className="w-10 text-right">{item.count}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						{loading ? "正在加载评分信息..." : "暂无评分汇总"}
					</p>
				)}

				<div className="space-y-4">
					{reviews.length ? (
						reviews.map((review) => (
							<div
								key={review.id}
								className="rounded-2xl border border-border bg-background/80 p-4"
							>
								<div className="flex items-center justify-between">
									<p className="text-sm font-semibold text-foreground">
										{review.reviewer?.name || "匿名用户"}
									</p>
									<div className="flex items-center gap-1 text-xs text-muted-foreground">
										<Star className="h-3 w-3 text-yellow-500" />
										<span>{review.rating.toFixed(1)}</span>
									</div>
								</div>
								<p className="mt-2 text-sm text-muted-foreground">
									{review.comment}
								</p>
								{review.response ? (
									<div className="mt-3 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
										<p className="font-semibold text-foreground">代理人回复</p>
										<p className="mt-1">{review.response}</p>
									</div>
								) : null}
							</div>
						))
					) : (
						<p className="text-sm text-muted-foreground">
							{loading ? "正在加载评价..." : "暂无评价内容"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default ReviewSection
