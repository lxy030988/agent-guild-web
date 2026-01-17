import { useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, FileText, Clock, AlertCircle } from "lucide-react"

interface CreateProposalModalProps {
	open: boolean
	onClose: () => void
}

export function CreateProposalModal({ open, onClose }: CreateProposalModalProps) {
	const [title, setTitle] = useState("")
	const [description, setDescription] = useState("")
	const [votingPeriod, setVotingPeriod] = useState("7")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (!title.trim()) {
			setError("Please enter a title for your proposal")
			return
		}

		if (!description.trim()) {
			setError("Please enter a description for your proposal")
			return
		}

		setIsSubmitting(true)

		try {
			// TODO: Call API to create proposal
			console.log("Creating proposal:", { title, description, votingPeriod })

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500))

			// Reset form and close
			setTitle("")
			setDescription("")
			setVotingPeriod("7")
			onClose()
		} catch (_err) {
			setError("Failed to create proposal. Please try again.")
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleClose = () => {
		if (!isSubmitting) {
			setTitle("")
			setDescription("")
			setVotingPeriod("7")
			setError(null)
			onClose()
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-md border-border/50">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold flex items-center gap-2">
						<FileText className="h-5 w-5 text-purple-500" />
						Create New Proposal
					</DialogTitle>
					<DialogDescription>
						Submit a new proposal for the DAO to vote on. Make sure to provide clear details.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6 pt-4">
					{error && (
						<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-sm">
							<AlertCircle className="h-4 w-4" />
							{error}
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="title">Proposal Title</Label>
						<Input
							id="title"
							placeholder="e.g., Allocate 50 ETH to Dev Guild"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							disabled={isSubmitting}
							className="bg-background/50"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<textarea
							id="description"
							placeholder="Describe the proposal in detail..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={isSubmitting}
							rows={5}
							className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 resize-none"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="votingPeriod" className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							Voting Period
						</Label>
						<select
							id="votingPeriod"
							value={votingPeriod}
							onChange={(e) => setVotingPeriod(e.target.value)}
							disabled={isSubmitting}
							className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
						>
							<option value="3">3 days</option>
							<option value="5">5 days</option>
							<option value="7">7 days (Recommended)</option>
							<option value="14">14 days</option>
						</select>
					</div>

					<div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
						<h4 className="text-sm font-semibold text-purple-400 mb-2">Requirements</h4>
						<ul className="text-xs text-muted-foreground space-y-1">
							<li>• Minimum 1,000 voting power required to create proposals</li>
							<li>• Proposals require quorum to pass (10% of total voting power)</li>
							<li>• A proposal passes with more than 50% approval votes</li>
						</ul>
					</div>

					<div className="flex gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isSubmitting}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								"Create Proposal"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
