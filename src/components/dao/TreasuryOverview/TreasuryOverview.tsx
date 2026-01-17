import { Card } from "@/components/ui/card"
import { useTreasury } from "@/hooks/dao/useTreasury"
import { TreasuryStats } from "./TreasuryStats"
import { AssetList } from "./AssetList"
import { AssetDistribution } from "./AssetDistribution"
import { TreasuryChart } from "./TreasuryChart"
import { Loader2 } from "lucide-react"

export function TreasuryOverview() {
	const { treasury, isLoading } = useTreasury()

	if (isLoading) {
		return (
			<Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
				<div className="flex items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			</Card>
		)
	}

	if (!treasury) {
		return null
	}

	return (
		<div className="space-y-6">
			{/* Main Stats Card */}
			<Card className="p-8 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-sm border-purple-500/20">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Left - Stats */}
					<div className="space-y-6">
						<TreasuryStats
							totalValueUsd={treasury.totalValueUsd}
							change24h={treasury.change24h}
						/>
						{/* Quick Stats */}
						<div className="grid grid-cols-3 gap-4">
							<div className="p-4 rounded-lg bg-background/30">
								<p className="text-xs text-muted-foreground mb-1">Assets</p>
								<p className="text-lg font-bold">{treasury.assets.length}</p>
							</div>
							<div className="p-4 rounded-lg bg-background/30">
								<p className="text-xs text-muted-foreground mb-1">Top Asset</p>
								<p className="text-lg font-bold">{treasury.assets[0]?.symbol || "N/A"}</p>
							</div>
							<div className="p-4 rounded-lg bg-background/30">
								<p className="text-xs text-muted-foreground mb-1">Last Updated</p>
								<p className="text-lg font-bold">Now</p>
							</div>
						</div>
					</div>
					{/* Right - Chart */}
					<div>
						<TreasuryChart />
					</div>
				</div>
			</Card>

			{/* Assets Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
					<h3 className="text-lg font-semibold mb-4">Treasury Assets</h3>
					<AssetList assets={treasury.assets} />
				</Card>

				<Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
					<AssetDistribution assets={treasury.assets} />
				</Card>
			</div>
		</div>
	)
}
