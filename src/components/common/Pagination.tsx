import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import type * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PaginationProps {
	total: number
	current: number
	pageSize?: number
	onChange?: (page: number) => void
	showTotal?: boolean
	className?: string
	siblingCount?: number
}

function generatePagination(
	current: number,
	totalPages: number,
	siblingCount: number = 1,
): (number | "ellipsis")[] {
	const totalNumbers = siblingCount * 2 + 5 // siblings + first + last + current + 2 ellipsis

	if (totalPages <= totalNumbers) {
		return Array.from({ length: totalPages }, (_, i) => i + 1)
	}

	const leftSiblingIndex = Math.max(current - siblingCount, 1)
	const rightSiblingIndex = Math.min(current + siblingCount, totalPages)

	const showLeftEllipsis = leftSiblingIndex > 2
	const showRightEllipsis = rightSiblingIndex < totalPages - 1

	if (!showLeftEllipsis && showRightEllipsis) {
		const leftItemCount = 3 + 2 * siblingCount
		const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
		return [...leftRange, "ellipsis", totalPages]
	}

	if (showLeftEllipsis && !showRightEllipsis) {
		const rightItemCount = 3 + 2 * siblingCount
		const rightRange = Array.from(
			{ length: rightItemCount },
			(_, i) => totalPages - rightItemCount + i + 1,
		)
		return [1, "ellipsis", ...rightRange]
	}

	const middleRange = Array.from(
		{ length: rightSiblingIndex - leftSiblingIndex + 1 },
		(_, i) => leftSiblingIndex + i,
	)
	return [1, "ellipsis", ...middleRange, "ellipsis", totalPages]
}

const Pagination: React.FC<PaginationProps> = ({
	total,
	current,
	pageSize = 10,
	onChange,
	showTotal = true,
	className,
	siblingCount = 1,
}) => {
	const totalPages = Math.ceil(total / pageSize)
	const pages = generatePagination(current, totalPages, siblingCount)

	if (totalPages <= 1) {
		return null
	}

	return (
		<nav
			className={cn("flex items-center justify-center gap-1", className)}
			aria-label="Pagination"
		>
			{showTotal && (
				<span className="mr-4 text-sm text-muted-foreground">
					共 {total} 条
				</span>
			)}

			<Button
				variant="outline"
				size="icon"
				onClick={() => onChange?.(current - 1)}
				disabled={current <= 1}
				aria-label="上一页"
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			{pages.map((page, index) => {
				if (page === "ellipsis") {
					return (
						<span
							key={`ellipsis-${index?.toString()}`}
							className="flex h-10 w-10 items-center justify-center"
						>
							<MoreHorizontal className="h-4 w-4" />
						</span>
					)
				}

				return (
					<Button
						key={page}
						variant={current === page ? "default" : "outline"}
						size="icon"
						onClick={() => onChange?.(page)}
						aria-label={`第 ${page} 页`}
						aria-current={current === page ? "page" : undefined}
					>
						{page}
					</Button>
				)
			})}

			<Button
				variant="outline"
				size="icon"
				onClick={() => onChange?.(current + 1)}
				disabled={current >= totalPages}
				aria-label="下一页"
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</nav>
	)
}

export default Pagination
