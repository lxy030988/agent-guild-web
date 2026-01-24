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

const getCategoryLabel = (category: string) => {
	const labels: Record<string, string> = {
		PRODUCTIVITY_TOOLS: "生产力工具",
		CREATIVE_ASSISTANTS: "创意助手",
		DEVELOPER_TOOLS: "开发者工具",
		OTHERS: "其他",
	}
	return labels[category] || category
}

const sortOptions = [
	{ label: "默认排序", value: "default" },
	{ label: "最新创建", value: "createdAt:desc" },
	{ label: "浏览最多", value: "viewCount:desc" },
	{ label: "评分最高", value: "rating:desc" },
	{ label: "调用最多", value: "jobCount:desc" },
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
	const tagsId = useId()
	const sortId = useId()
	const verifiedId = useId()

	const handleSortChange = (value: string) => {
		if (value === "default") {
			onChange({
				...filters,
				sortBy: undefined,
				order: undefined,
			})
			return
		}
		const [sortBy, order] = value.split(":")
		onChange({
			...filters,
			sortBy: sortBy as AgentFiltersValue["sortBy"],
			order: order as AgentFiltersValue["order"],
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
							category:
								value === "all"
									? undefined
									: (value as AgentFiltersValue["category"]),
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
								{getCategoryLabel(category)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="min-w-[160px] flex-1">
				<label
					htmlFor={tagsId}
					className="text-xs font-medium text-muted-foreground"
				>
					标签
				</label>
				<Input
					id={tagsId}
					className="mt-2"
					placeholder="输入标签（逗号分隔）"
					value={filters.tags ?? ""}
					onChange={(event) =>
						onChange({
							...filters,
							tags: event.target.value || undefined,
						})
					}
					disabled={loading}
				/>
			</div>

			<div className="min-w-[140px]">
				<label
					htmlFor={verifiedId}
					className="text-xs font-medium text-muted-foreground"
				>
					验证状态
				</label>
				<Select
					onValueChange={(value) =>
						onChange({
							...filters,
							verifiedOnly: value === "verified" ? true : undefined,
						})
					}
					value={filters.verifiedOnly ? "verified" : "all"}
					disabled={loading}
				>
					<SelectTrigger id={verifiedId} className="mt-2">
						<SelectValue placeholder="全部" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">全部</SelectItem>
						<SelectItem value="verified">仅已验证</SelectItem>
					</SelectContent>
				</Select>
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
						filters.sortBy && filters.order
							? `${filters.sortBy}:${filters.order}`
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
