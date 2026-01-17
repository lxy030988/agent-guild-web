import type * as React from "react"

import { cn } from "@/lib/utils"

export interface FooterLink {
	label: string
	href: string
}

export interface FooterProps {
	className?: string
	links?: FooterLink[]
	copyright?: string
}

const Footer: React.FC<FooterProps> = ({
	className,
	links = [],
	copyright = `© ${new Date().getFullYear()} Agent Guild. All rights reserved.`,
}) => {
	return (
		<footer className={cn("border-t bg-background py-6", className)}>
			<div className="container mx-auto px-4">
				<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
					<p className="text-sm text-muted-foreground">{copyright}</p>
					{links.length > 0 && (
						<nav className="flex gap-4">
							{links.map((link) => (
								<a
									key={link.href}
									href={link.href}
									className="text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									{link.label}
								</a>
							))}
						</nav>
					)}
				</div>
			</div>
		</footer>
	)
}

export default Footer
