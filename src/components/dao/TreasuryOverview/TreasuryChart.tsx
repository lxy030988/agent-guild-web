import { useMemo } from "react"

interface DataPoint {
	date: string
	value: number
}

interface TreasuryChartProps {
	data?: DataPoint[]
}

// Generate mock data for the last 7 days
const generateMockData = (): DataPoint[] => {
	const data: DataPoint[] = []
	const now = new Date()
	const baseValue = 14000000 // $14M

	for (let i = 6; i >= 0; i--) {
		const date = new Date(now)
		date.setDate(date.getDate() - i)
		// Add some variation
		const variation = (Math.random() - 0.5) * 0.1 * baseValue
		data.push({
			date: date.toLocaleDateString("en-US", { weekday: "short" }),
			value: baseValue + variation + (6 - i) * 50000, // Slight upward trend
		})
	}
	return data
}

export function TreasuryChart({ data }: TreasuryChartProps) {
	const chartData = data || generateMockData()

	const { minValue, maxValue, points, pathD, areaD } = useMemo(() => {
		const values = chartData.map((d) => d.value)
		const min = Math.min(...values) * 0.95
		const max = Math.max(...values) * 1.05
		const range = max - min

		const width = 100
		const height = 100
		const padding = 5

		const pts = chartData.map((d, i) => {
			const x = padding + (i / (chartData.length - 1)) * (width - padding * 2)
			const y = height - padding - ((d.value - min) / range) * (height - padding * 2)
			return { x, y, ...d }
		})

		// Create smooth curve using bezier
		let path = `M ${pts[0].x} ${pts[0].y}`
		for (let i = 1; i < pts.length; i++) {
			const prev = pts[i - 1]
			const curr = pts[i]
			const cpx = (prev.x + curr.x) / 2
			path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
		}

		// Area path
		const area = `${path} L ${pts[pts.length - 1].x} ${height - padding} L ${pts[0].x} ${height - padding} Z`

		return { minValue: min, maxValue: max, points: pts, pathD: path, areaD: area }
	}, [chartData])

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Treasury Overview</h3>
				<div className="flex gap-2">
					{["7D", "30D", "90D", "1Y"].map((period) => (
						<button
							type="button"
							key={period}
							className={`px-3 py-1 text-xs rounded-full transition-colors ${
								period === "7D"
									? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
									: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
							}`}
						>
							{period}
						</button>
					))}
				</div>
			</div>

			{/* Chart */}
			<div className="relative h-48 w-full">
				<svg
					viewBox="0 0 100 100"
					className="w-full h-full"
					preserveAspectRatio="none"
					aria-labelledby="treasury-chart-title"
					role="img"
				>
					<title id="treasury-chart-title">Treasury value chart over time</title>
					<defs>
						<linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
							<stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0" />
						</linearGradient>
						<linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0%" stopColor="rgb(168, 85, 247)" />
							<stop offset="50%" stopColor="rgb(236, 72, 153)" />
							<stop offset="100%" stopColor="rgb(168, 85, 247)" />
						</linearGradient>
					</defs>

					{/* Grid lines */}
					{[25, 50, 75].map((y) => (
						<line
							key={y}
							x1="5"
							y1={y}
							x2="95"
							y2={y}
							stroke="currentColor"
							strokeOpacity="0.1"
							strokeWidth="0.5"
						/>
					))}

					{/* Area */}
					<path d={areaD} fill="url(#chartGradient)" />

					{/* Line */}
					<path
						d={pathD}
						fill="none"
						stroke="url(#lineGradient)"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						vectorEffect="non-scaling-stroke"
					/>

					{/* Data points */}
					{points.map((point) => (
						<circle
							key={`${point.date}-${point.value}`}
							cx={point.x}
							cy={point.y}
							r="1.5"
							fill="rgb(168, 85, 247)"
							className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
						/>
					))}
				</svg>

				{/* X-axis labels */}
				<div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-muted-foreground">
					{chartData.map((d) => (
						<span key={d.date}>{d.date}</span>
					))}
				</div>
			</div>

			{/* Value range */}
			<div className="flex justify-between text-xs text-muted-foreground">
				<span>
					Min: ${(minValue / 1000000).toFixed(2)}M
				</span>
				<span>
					Max: ${(maxValue / 1000000).toFixed(2)}M
				</span>
			</div>
		</div>
	)
}
