import { CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoteConfirmationProps {
	success: boolean
	txHash?: string
	error?: string
	onClose: () => void
}

export function VoteConfirmation({
	success,
	txHash,
	error,
	onClose,
}: VoteConfirmationProps) {
	return (
		<div className="text-center space-y-4 py-6">
			{success ? (
				<>
					<div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
						<CheckCircle2 className="h-10 w-10 text-green-600" />
					</div>
					<div className="space-y-2">
						<h3 className="text-xl font-bold">Vote Submitted Successfully!</h3>
						<p className="text-sm text-muted-foreground">
							Your vote has been recorded on the blockchain
						</p>
						{txHash && (
							<p className="text-xs font-mono text-muted-foreground break-all">
								{txHash}
							</p>
						)}
					</div>
					<Button
						onClick={onClose}
						className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
					>
						Done
					</Button>
				</>
			) : (
				<>
					<div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
						<AlertCircle className="h-10 w-10 text-red-600" />
					</div>
					<div className="space-y-2">
						<h3 className="text-xl font-bold">Vote Failed</h3>
						<p className="text-sm text-muted-foreground">
							{error || "An error occurred while submitting your vote"}
						</p>
					</div>
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</>
			)}
		</div>
	)
}
