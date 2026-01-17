import { TrendingUp, TrendingDown } from "lucide-react"
import type { TreasuryAsset } from "@/stores/daoStore"

interface AssetListProps {
	assets: TreasuryAsset[]
}

export function AssetList({ assets }: AssetListProps) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value)
	}

	const formatBalance = (balance: number, decimals: number = 2) => {
		return new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 0,
			maximumFractionDigits: decimals,
		}).format(balance)
	}

	return (
		<div className="space-y-3">
			{assets.map((asset) => {
				const isPositive = asset.change24h >= 0
				return (
					<div
						key={asset.symbol}
						className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50 hover:bg-card/70 transition-colors"
					>
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
								{asset.symbol.slice(0, 3)}
							</div>
							<div>
								<p className="font-semibold">{asset.symbol}</p>
								<p className="text-sm text-muted-foreground">{asset.name}</p>
							</div>
						</div>

						<div className="text-right">
							<p className="font-semibold">{formatCurrency(asset.valueUsd)}</p>
							<div className="flex items-center gap-2 justify-end">
								<p className="text-sm text-muted-foreground">
									{formatBalance(asset.balance)} {asset.symbol}
								</p>
								<span
									className={`text-xs font-medium flex items-center gap-0.5 ${
										isPositive ? "text-green-600" : "text-red-600"
									}`}
								>
									{isPositive ? (
										<TrendingUp className="h-3 w-3" />
									) : (
										<TrendingDown className="h-3 w-3" />
									)}
									{Math.abs(asset.change24h).toFixed(1)}%
								</span>
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
