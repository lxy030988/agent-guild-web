import { AlertTriangle } from "lucide-react"
import type * as React from "react"
import { Component } from "react"

import { Button } from "@/components/ui/button"

export interface ErrorBoundaryProps {
	children: React.ReactNode
	fallback?: React.ReactNode
	onReset?: () => void
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
	hasError: boolean
	error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		console.error("ErrorBoundary caught an error:", error, errorInfo)
		this.props.onError?.(error, errorInfo)
	}

	handleReset = (): void => {
		this.setState({ hasError: false, error: null })
		this.props.onReset?.()
	}

	render(): React.ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
					<div className="mb-4 rounded-full bg-destructive/10 p-4">
						<AlertTriangle className="h-8 w-8 text-destructive" />
					</div>
					<h2 className="mb-2 text-xl font-semibold">出错了</h2>
					<p className="mb-4 max-w-md text-sm text-muted-foreground">
						{this.state.error?.message || "发生了一个意外错误，请稍后重试"}
					</p>
					<Button onClick={this.handleReset} variant="outline">
						重试
					</Button>
				</div>
			)
		}

		return this.props.children
	}
}

export default ErrorBoundary
