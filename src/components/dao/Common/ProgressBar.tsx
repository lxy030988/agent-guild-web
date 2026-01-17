interface ProgressBarProps {
	value: number
	max: number
	color?: "purple" | "green" | "red" | "blue" | "gray"
	height?: "xs" | "sm" | "md" | "lg"
	showLabel?: boolean
	label?: string
	className?: string
}

const colorClasses = {
	purple: "bg-gradient-to-r from-purple-500 to-pink-500",
	green: "bg-gradient-to-r from-green-500 to-emerald-500",
	red: "bg-gradient-to-r from-red-500 to-orange-500",
	blue: "bg-gradient-to-r from-blue-500 to-cyan-500",
	gray: "bg-gray-400",
}

const heightClasses = {
	xs: "h-1",
	sm: "h-1.5",
	md: "h-2",
	lg: "h-3",
}

export function ProgressBar({
	value,
	max,
	color = "purple",
	height = "md",
	showLabel = false,
	label,
	className = "",
}: ProgressBarProps) {
	const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0

	return (
		<div className={className}>
			{showLabel && (
				<div className="flex items-center justify-between mb-1">
					{label && <span className="text-sm text-muted-foreground">{label}</span>}
					<span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
				</div>
			)}
			<div className={`w-full bg-muted rounded-full overflow-hidden ${heightClasses[height]}`}>
				<div
					className={`${heightClasses[height]} ${colorClasses[color]} transition-all duration-500 ease-out rounded-full`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	)
}
