import { Inbox, type LucideIcon } from "lucide-react"
import type * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
	icon?: LucideIcon
	title?: string
	description?: string
	action?: {
		label: string
		onClick: () => void
	}
	className?: string
	children?: React.ReactNode
}

const EmptyState: React.FC<EmptyStateProps> = ({
	icon: Icon = Inbox,
	title = "暂无数据",
	description,
	action,
	className,
	children,
}) => {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center py-12 text-center",
				className,
			)}
		>
			<div className="mb-4 rounded-full bg-muted p-4">
				<Icon className="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 className="mb-1 text-lg font-semibold">{title}</h3>
			{description && (
				<p className="mb-4 max-w-sm text-sm text-muted-foreground">
					{description}
				</p>
			)}
			{action && (
				<Button onClick={action.onClick} variant="outline">
					{action.label}
				</Button>
			)}
			{children}
		</div>
	)
}

export default EmptyState
