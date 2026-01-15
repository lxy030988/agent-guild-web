import { RotateCcw } from "lucide-react"
import { useId } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { AgentFilters as AgentFiltersValue } from "@/types/agent"

export interface AgentFiltersProps {
	filters: AgentFiltersValue
	categories: string[]
	loading?: boolean
	onChange: (filters: AgentFiltersValue) => void
	onReset?: () => void
	className?: string
}

const ratingOptions = [
	{ label: "全部评分", value: "all" },
	{ label: "4+", value: "4" },
	{ label: "4.5+", value: "4.5" },
	{ label: "5", value: "5" },
]

const sortOptions = [
	{ label: "默认排序", value: "default" },
	{ label: "评分最高", value: "rating:desc" },
	{ label: "价格最低", value: "price:asc" },
	{ label: "评价最多", value: "reviews:desc" },
	{ label: "最新加入", value: "created:desc" },
]

const AgentFilters = ({
	filters,
	categories,
	loading = false,
	onChange,
	onReset,
	className,
}: AgentFiltersProps) => {
	const categoryId = useId()
	const locationId = useId()
	const ratingId = useId()
	const minPriceId = useId()
	const maxPriceId = useId()
	const sortId = useId()

	const handleNumberChange = (
		key: "minPrice" | "maxPrice",
		value: string,
	) => {
		const parsed = value ? Number(value) : undefined
		onChange({
			...filters,
			[key]: Number.isNaN(parsed) ? undefined : parsed,
		})
	}

	const handleRatingChange = (value: string) => {
		const parsed = value === "all" ? undefined : Number(value)
		onChange({
			...filters,
			minRating: Number.isNaN(parsed) ? undefined : parsed,
		})
	}

	const handleSortChange = (value: string) => {
		if (value === "default") {
			onChange({
				...filters,
				sortBy: undefined,
				sortOrder: undefined,
			})
			return
		}
		const [sortBy, sortOrder] = value.split(":")
		onChange({
			...filters,
			sortBy: sortBy as AgentFiltersValue["sortBy"],
			sortOrder: sortOrder as AgentFiltersValue["sortOrder"],
		})
	}

	return (
		<div
			className={cn(
				"flex flex-wrap items-end gap-4 rounded-xl border bg-card p-4",
				className,
			)}
		>
			<div className="min-w-[160px] flex-1">
				<label
					htmlFor={categoryId}
					className="text-xs font-medium text-muted-foreground"
				>
					分类
				</label>
				<Select
					onValueChange={(value) =>
						onChange({
							...filters,
							category: value === "all" ? undefined : value,
						})
					}
					value={filters.category ?? "all"}
					disabled={loading}
				>
					<SelectTrigger id={categoryId} className="mt-2">
						<SelectValue placeholder="全部分类" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">全部分类</SelectItem>
						{categories.map((category) => (
							<SelectItem key={category} value={category}>
								{category}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="min-w-[160px] flex-1">
				<label
					htmlFor={locationId}
					className="text-xs font-medium text-muted-foreground"
				>
					位置
				</label>
				<Input
					id={locationId}
					className="mt-2"
					placeholder="输入城市/地区"
					value={filters.location ?? ""}
				onChange={(event) =>
					onChange({
						...filters,
						location: event.target.value || undefined,
					})
				}
				disabled={loading}
			/>
		</div>

			<div className="min-w-[140px]">
				<label
					htmlFor={ratingId}
					className="text-xs font-medium text-muted-foreground"
				>
					最低评分
				</label>
				<Select
					onValueChange={handleRatingChange}
					value={filters.minRating?.toString() ?? "all"}
					disabled={loading}
				>
					<SelectTrigger id={ratingId} className="mt-2">
						<SelectValue placeholder="全部" />
					</SelectTrigger>
				<SelectContent>
					{ratingOptions.map((option) => (
						<SelectItem key={option.label} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>

			<div className="min-w-[120px]">
				<label
					htmlFor={minPriceId}
					className="text-xs font-medium text-muted-foreground"
				>
					最低价格
				</label>
				<Input
					id={minPriceId}
					className="mt-2"
					type="number"
					min={0}
				placeholder="0"
				value={filters.minPrice ?? ""}
				onChange={(event) => handleNumberChange("minPrice", event.target.value)}
				disabled={loading}
			/>
		</div>

			<div className="min-w-[120px]">
				<label
					htmlFor={maxPriceId}
					className="text-xs font-medium text-muted-foreground"
				>
					最高价格
				</label>
				<Input
					id={maxPriceId}
					className="mt-2"
					type="number"
					min={0}
				placeholder="不限"
				value={filters.maxPrice ?? ""}
				onChange={(event) => handleNumberChange("maxPrice", event.target.value)}
				disabled={loading}
			/>
		</div>

			<div className="min-w-[160px]">
				<label
					htmlFor={sortId}
					className="text-xs font-medium text-muted-foreground"
				>
					排序
				</label>
				<Select
					onValueChange={handleSortChange}
					value={
					filters.sortBy && filters.sortOrder
						? `${filters.sortBy}:${filters.sortOrder}`
						: "default"
					}
					disabled={loading}
				>
					<SelectTrigger id={sortId} className="mt-2">
						<SelectValue placeholder="默认排序" />
					</SelectTrigger>
				<SelectContent>
					{sortOptions.map((option) => (
						<SelectItem key={option.label} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>

		<Button
			variant="ghost"
			className="gap-2"
			onClick={onReset}
			disabled={loading}
			aria-label="重置筛选条件"
		>
			<RotateCcw className="h-4 w-4" />
			重置
		</Button>
	</div>
	)
}

export default AgentFilters
