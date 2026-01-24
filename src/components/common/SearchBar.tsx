import { Search, X } from "lucide-react"
import type * as React from "react"
import { forwardRef, useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface SearchBarProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
	onSearch?: (value: string) => void
	onChange?: (value: string) => void
	debounceMs?: number
	showClear?: boolean
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
	(
		{
			className,
			onSearch,
			onChange,
			debounceMs = 300,
			showClear = true,
			defaultValue = "",
			...props
		},
		ref,
	) => {
		const [value, setValue] = useState(defaultValue.toString())
		const debounceRef = useRef<NodeJS.Timeout | null>(null)

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value
			setValue(newValue)
			onChange?.(newValue)

			if (debounceRef.current) {
				clearTimeout(debounceRef.current)
			}

			debounceRef.current = setTimeout(() => {
				onSearch?.(newValue)
			}, debounceMs)
		}

		const handleClear = () => {
			setValue("")
			onChange?.("")
			onSearch?.("")
		}

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				if (debounceRef.current) {
					clearTimeout(debounceRef.current)
				}
				onSearch?.(value)
			}
		}

		useEffect(() => {
			return () => {
				if (debounceRef.current) {
					clearTimeout(debounceRef.current)
				}
			}
		}, [])

		return (
			<div className={cn("relative", className)}>
				<Input
					ref={ref}
					type="search"
					value={value}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					prefix={<Search className="h-4 w-4" />}
					suffix={
						showClear && value ? (
							<button
								type="button"
								onClick={handleClear}
								className="hover:text-foreground"
							>
								<X className="h-4 w-4" />
							</button>
						) : undefined
					}
					{...props}
				/>
			</div>
		)
	},
)
SearchBar.displayName = "SearchBar"

export default SearchBar
