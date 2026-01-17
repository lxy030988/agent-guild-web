import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ParticipantAvatarsProps {
	participants: string[]
	maxDisplay?: number
	size?: "sm" | "md" | "lg"
}

const sizeClasses = {
	sm: "h-6 w-6 text-xs",
	md: "h-8 w-8 text-sm",
	lg: "h-10 w-10 text-base",
}

export function ParticipantAvatars({
	participants,
	maxDisplay = 5,
	size = "sm",
}: ParticipantAvatarsProps) {
	const displayParticipants = participants.slice(0, maxDisplay)
	const remainingCount = participants.length - maxDisplay

	const getInitials = (address: string) => {
		return `${address.slice(2, 4).toUpperCase()}`
	}

	const getGradient = (address: string) => {
		const hash = address
			.split("")
			.reduce((acc, char) => acc + char.charCodeAt(0), 0)
		const colors = [
			"from-purple-500 to-pink-500",
			"from-blue-500 to-cyan-500",
			"from-green-500 to-emerald-500",
			"from-orange-500 to-red-500",
			"from-indigo-500 to-purple-500",
			"from-pink-500 to-rose-500",
		]
		return colors[hash % colors.length]
	}

	return (
		<div className="flex items-center -space-x-2">
			{displayParticipants.map((participant) => (
				<Avatar
					key={participant}
					className={`${sizeClasses[size]} border-2 border-background ring-2 ring-purple-500/20`}
				>
					<AvatarFallback
						className={`bg-gradient-to-br ${getGradient(participant)} text-white font-semibold`}
					>
						{getInitials(participant)}
					</AvatarFallback>
				</Avatar>
			))}
			{remainingCount > 0 && (
				<div
					className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold border-2 border-background ring-2 ring-purple-500/20`}
				>
					+{remainingCount}
				</div>
			)}
		</div>
	)
}
