import { useAtom } from "jotai"
import { proposalFilterAtom } from "@/stores/daoStore"
import { Button } from "@/components/ui/button"

const filters = [
	{ value: "all", label: "All" },
	{ value: "active", label: "Active" },
	{ value: "passed", label: "Passed" },
	{ value: "failed", label: "Failed" },
	{ value: "pending", label: "Pending" },
]

export function ProposalFilters() {
	const [filter, setFilter] = useAtom(proposalFilterAtom)

	return (
		<div className="flex items-center gap-2 flex-wrap">
			{filters.map((f) => (
				<Button
					key={f.value}
					variant={filter === f.value ? "default" : "outline"}
					size="sm"
					onClick={() => setFilter(f.value)}
					className={
						filter === f.value
							? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
							: ""
					}
				>
					{f.label}
				</Button>
			))}
		</div>
	)
}
