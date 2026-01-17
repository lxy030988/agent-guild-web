import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LockPeriodSelector } from "./LockPeriodSelector"
import { MultiplierDisplay } from "./MultiplierDisplay"
import { Loader2 } from "lucide-react"

interface StakeTabProps {
	onStake: (amount: number, lockPeriod: number) => void
	isStaking: boolean
	maxBalance?: number
}

export function StakeTab({ onStake, isStaking, maxBalance = 0 }: StakeTabProps) {
	const [amount, setAmount] = useState<string>("")
	const [lockPeriod, setLockPeriod] = useState<number>(0)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const numAmount = Number.parseFloat(amount)
		if (numAmount > 0 && numAmount <= maxBalance) {
			onStake(numAmount, lockPeriod)
		}
	}

	const numAmount = Number.parseFloat(amount) || 0
	const isValid = numAmount > 0 && numAmount <= maxBalance

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Amount Input */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="stake-amount">Amount to Stake</Label>
					<button
						type="button"
						onClick={() => setAmount(maxBalance.toString())}
						className="text-xs text-purple-600 hover:text-purple-700 font-medium"
					>
						Max: {maxBalance.toLocaleString()}
					</button>
				</div>
				<div className="relative">
					<Input
						id="stake-amount"
						type="number"
						placeholder="0.00"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						min="0"
						max={maxBalance}
						step="0.01"
						className="pr-20 text-lg"
					/>
					<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
						tokens
					</span>
				</div>
			</div>

			{/* Lock Period Selector */}
			<LockPeriodSelector value={lockPeriod} onChange={setLockPeriod} />

			{/* Multiplier Display */}
			{numAmount > 0 && <MultiplierDisplay lockPeriod={lockPeriod} amount={numAmount} />}

			{/* Info */}
			<div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
				<p className="text-sm text-blue-600">
					<span className="font-semibold">Note:</span> Staking tokens will lock them
					for the selected period. You'll earn voting power based on the multiplier.
				</p>
			</div>

			{/* Submit */}
			<Button
				type="submit"
				className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
				disabled={!isValid || isStaking}
			>
				{isStaking ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Staking...
					</>
				) : (
					"Stake Tokens"
				)}
			</Button>
		</form>
	)
}
