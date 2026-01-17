interface StatCardProps {
	title: string
	value: number
	color?: "blue" | "green" | "yellow" | "purple" | "gray"
	icon?: React.ReactNode
}

const colorVariants = {
	blue: "bg-blue-50 text-blue-600 border-blue-100",
	green: "bg-green-50 text-green-600 border-green-100",
	yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
	purple: "bg-purple-50 text-purple-600 border-purple-100",
	gray: "bg-gray-50 text-gray-600 border-gray-100",
}

export default function StatCard({
	title,
	value,
	color = "blue",
	icon,
}: StatCardProps) {
	const colorClass = colorVariants[color]

	return (
		<div
			className={`rounded-xl border p-6 ${colorClass} transition-all hover:shadow-md`}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium opacity-70">{title}</p>
					<p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
				</div>
				{icon && <div className="text-4xl opacity-50">{icon}</div>}
			</div>
		</div>
	)
}
