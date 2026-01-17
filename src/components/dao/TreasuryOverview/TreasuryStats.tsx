import { TrendingUp, TrendingDown } from "lucide-react"

interface TreasuryStatsProps {
	totalValueUsd: number
	change24h: number
}

export function TreasuryStats({ totalValueUsd, change24h }: TreasuryStatsProps) {
	const isPositive = change24h >= 0
	const formattedValue = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(totalValueUsd)

	return (
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground uppercase tracking-wide">
				Total Treasury Value
			</p>
			<div className="flex items-baseline gap-3">
				<h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
					{formattedValue}
				</h2>
				<div
					className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${
						isPositive
							? "bg-green-500/10 text-green-600"
							: "bg-red-500/10 text-red-600"
					}`}
				>
					{isPositive ? (
						<TrendingUp className="h-4 w-4" />
					) : (
						<TrendingDown className="h-4 w-4" />
					)}
					<span>{Math.abs(change24h).toFixed(2)}%</span>
				</div>
			</div>
			<p className="text-xs text-muted-foreground">Last 24 hours</p>
		</div>
	)
}
