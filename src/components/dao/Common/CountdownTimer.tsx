import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
	endTime: string
	className?: string
	showIcon?: boolean
}

export function CountdownTimer({
	endTime,
	className = "",
	showIcon = true,
}: CountdownTimerProps) {
	const [timeLeft, setTimeLeft] = useState<string>("")

	useEffect(() => {
		const calculateTimeLeft = () => {
			const end = new Date(endTime).getTime()
			const now = Date.now()
			const diff = end - now

			if (diff <= 0) {
				setTimeLeft("Ended")
				return
			}

			const days = Math.floor(diff / (1000 * 60 * 60 * 24))
			const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

			if (days > 0) {
				setTimeLeft(`${days}d ${hours}h`)
			} else if (hours > 0) {
				setTimeLeft(`${hours}h ${minutes}m`)
			} else {
				setTimeLeft(`${minutes}m`)
			}
		}

		calculateTimeLeft()
		const interval = setInterval(calculateTimeLeft, 60000) // Update every minute

		return () => clearInterval(interval)
	}, [endTime])

	return (
		<div className={`flex items-center gap-1 text-muted-foreground whitespace-nowrap ${className}`}>
			{showIcon && <Clock className="h-4 w-4" />}
			<span className="text-sm">{timeLeft}</span>
		</div>
	)
}
