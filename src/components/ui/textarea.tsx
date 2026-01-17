import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"
import { forwardRef, useCallback, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
	"flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
		VariantProps<typeof textareaVariants> {
	showCount?: boolean
	autoResize?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{
			className,
			variant,
			showCount = false,
			maxLength,
			autoResize = false,
			onChange,
			...props
		},
		ref,
	) => {
		const [charCount, setCharCount] = useState(
			props.value?.toString().length ||
				props.defaultValue?.toString().length ||
				0,
		)
		const textareaRef = useRef<HTMLTextAreaElement | null>(null)

		const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setCharCount(e.target.value.length)

			if (autoResize && textareaRef.current) {
				textareaRef.current.style.height = "auto"
				textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
			}

			onChange?.(e)
		}

		const setRefs = useCallback(
			(node: HTMLTextAreaElement | null) => {
				textareaRef.current = node
				if (typeof ref === "function") {
					ref(node)
				} else if (ref) {
					ref.current = node
				}
			},
			[ref],
		)

		return (
			<div className="relative">
				<textarea
					className={cn(
						textareaVariants({ variant }),
						showCount && maxLength && "pb-6",
						autoResize && "resize-none overflow-hidden",
						className,
					)}
					ref={setRefs}
					maxLength={maxLength}
					onChange={handleChange}
					{...props}
				/>
				{showCount && maxLength && (
					<div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
						{charCount}/{maxLength}
					</div>
				)}
			</div>
		)
	},
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
