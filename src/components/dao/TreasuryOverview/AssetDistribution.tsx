import type { TreasuryAsset } from "@/stores/daoStore"

interface AssetDistributionProps {
	assets: TreasuryAsset[]
}

export function AssetDistribution({ assets }: AssetDistributionProps) {
	const totalValue = assets.reduce((sum, asset) => sum + asset.valueUsd, 0)

	const colors = [
		"from-purple-500 to-purple-600",
		"from-pink-500 to-pink-600",
		"from-blue-500 to-blue-600",
		"from-green-500 to-green-600",
		"from-orange-500 to-orange-600",
		"from-cyan-500 to-cyan-600",
	]

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Asset Distribution</h3>

			{/* Progress bar visualization */}
			<div className="flex h-3 rounded-full overflow-hidden bg-muted">
				{assets.map((asset, index) => {
					const percentage = (asset.valueUsd / totalValue) * 100
					return (
						<div
							key={asset.symbol}
							className={`bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-500`}
							style={{ width: `${percentage}%` }}
							title={`${asset.symbol}: ${percentage.toFixed(1)}%`}
						/>
					)
				})}
			</div>

			{/* Legend */}
			<div className="grid grid-cols-2 gap-3">
				{assets.map((asset, index) => {
					const percentage = ((asset.valueUsd / totalValue) * 100).toFixed(1)
					return (
						<div key={asset.symbol} className="flex items-center gap-2">
							<div
								className={`h-3 w-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`}
							/>
							<span className="text-sm text-muted-foreground">
								{asset.symbol} <span className="font-semibold text-foreground">{percentage}%</span>
							</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}
