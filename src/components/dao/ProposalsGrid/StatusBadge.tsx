import type { Proposal } from "@/stores/daoStore"

interface StatusBadgeProps {
	status: Proposal["status"]
	className?: string
}

const statusConfig = {
	active: {
		label: "Active",
		className: "bg-green-500/10 text-green-600 border-green-500/20",
	},
	passed: {
		label: "Passed",
		className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
	},
	failed: {
		label: "Failed",
		className: "bg-red-500/10 text-red-600 border-red-500/20",
	},
	pending: {
		label: "Pending",
		className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
	},
	executed: {
		label: "Executed",
		className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
	},
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
	const config = statusConfig[status]

	return (
		<span
			className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className} ${className}`}
		>
			{config.label}
		</span>
	)
}
