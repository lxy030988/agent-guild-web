import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"

interface UnstakeTabProps {
	onUnstake: (amount: number) => void
	isUnstaking: boolean
	stakedAmount: number
	lockEndTime?: string
}

export function UnstakeTab({
	onUnstake,
	isUnstaking,
	stakedAmount,
	lockEndTime,
}: UnstakeTabProps) {
	const [amount, setAmount] = useState<string>("")

	const isLocked = lockEndTime && new Date(lockEndTime) > new Date()
	const lockEndDate = lockEndTime ? new Date(lockEndTime) : null

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const numAmount = Number.parseFloat(amount)
		if (numAmount > 0 && numAmount <= stakedAmount && !isLocked) {
			onUnstake(numAmount)
		}
	}

	const numAmount = Number.parseFloat(amount) || 0
	const isValid = numAmount > 0 && numAmount <= stakedAmount

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Locked Warning */}
			{isLocked && lockEndDate && (
				<div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
					<div className="flex items-start gap-3">
						<AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-semibold text-red-600">
								Tokens are locked
							</p>
							<p className="text-xs text-red-600 mt-1">
								Your tokens are locked until{" "}
								{lockEndDate.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
								. You cannot unstake until the lock period expires.
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Staked Amount Display */}
			<div className="p-4 rounded-xl bg-card/50 border border-border/50">
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">Currently Staked</span>
					<span className="text-2xl font-bold">{stakedAmount.toLocaleString()}</span>
				</div>
			</div>

			{/* Amount Input */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="unstake-amount">Amount to Unstake</Label>
					<button
						type="button"
						onClick={() => setAmount(stakedAmount.toString())}
						className="text-xs text-purple-600 hover:text-purple-700 font-medium"
						disabled={isLocked}
					>
						Max: {stakedAmount.toLocaleString()}
					</button>
				</div>
				<div className="relative">
					<Input
						id="unstake-amount"
						type="number"
						placeholder="0.00"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						min="0"
						max={stakedAmount}
						step="0.01"
						className="pr-20 text-lg"
						disabled={isLocked}
					/>
					<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
						tokens
					</span>
				</div>
			</div>

			{/* Info */}
			<div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
				<p className="text-sm text-yellow-600">
					<span className="font-semibold">Note:</span> Unstaking will reduce your
					voting power. Your tokens will be immediately available in your wallet.
				</p>
			</div>

			{/* Submit */}
			<Button
				type="submit"
				variant="outline"
				className="w-full"
				disabled={!isValid || isUnstaking || isLocked}
			>
				{isUnstaking ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Unstaking...
					</>
				) : (
					"Unstake Tokens"
				)}
			</Button>
		</form>
	)
}
