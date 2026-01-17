import type * as React from "react"
import { Toaster as HotToaster } from "react-hot-toast"

const Toaster: React.FC = () => {
	return (
		<HotToaster
			position="top-center"
			reverseOrder={false}
			gutter={8}
			toastOptions={{
				duration: 4000,
				style: {
					background: "hsl(var(--background))",
					color: "hsl(var(--foreground))",
					border: "1px solid hsl(var(--border))",
					borderRadius: "var(--radius)",
					fontSize: "14px",
				},
				success: {
					iconTheme: {
						primary: "hsl(var(--primary))",
						secondary: "hsl(var(--primary-foreground))",
					},
				},
				error: {
					iconTheme: {
						primary: "hsl(var(--destructive))",
						secondary: "hsl(var(--destructive-foreground))",
					},
				},
			}}
		/>
	)
}

export default Toaster
