import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"
import { forwardRef } from "react"

const inputVariants = cva(
	"flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "border-input",
				error: "border-destructive focus-visible:ring-destructive",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
)

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix">,
		VariantProps<typeof inputVariants> {
	prefix?: React.ReactNode
	suffix?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, type, variant, prefix, suffix, ...props }, ref) => {
		if (prefix || suffix) {
			return (
				<div className="relative flex items-center">
					{prefix && (
						<div className="absolute left-3 flex items-center text-muted-foreground [&_svg]:size-4">
							{prefix}
						</div>
					)}
					<input
						type={type}
						className={cn(
							inputVariants({ variant }),
							prefix && "pl-10",
							suffix && "pr-10",
							className,
						)}
						ref={ref}
						{...props}
					/>
					{suffix && (
						<div className="absolute right-3 flex items-center text-muted-foreground [&_svg]:size-4">
							{suffix}
						</div>
					)}
				</div>
			)
		}

		return (
			<input
				type={type}
				className={cn(inputVariants({ variant, className }))}
				ref={ref}
				{...props}
			/>
		)
	},
)
Input.displayName = "Input"

export { Input, inputVariants }
