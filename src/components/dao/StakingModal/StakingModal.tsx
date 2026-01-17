import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStaking } from "@/hooks/dao/useStaking"
import { StakeTab } from "./StakeTab"
import { UnstakeTab } from "./UnstakeTab"

interface StakingModalProps {
	open: boolean
	onClose: () => void
	maxBalance?: number
}

export function StakingModal({ open, onClose, maxBalance = 1000 }: StakingModalProps) {
	const { stakingInfo, stake, unstake, isStaking, isUnstaking } = useStaking()

	const handleStake = (amount: number, lockPeriod: number) => {
		stake(
			{ amount, lockPeriod },
			{
				onSuccess: () => {
					// Close modal on success
					setTimeout(() => onClose(), 1500)
				},
			},
		)
	}

	const handleUnstake = (amount: number) => {
		unstake(
			{ amount },
			{
				onSuccess: () => {
					// Close modal on success
					setTimeout(() => onClose(), 1500)
				},
			},
		)
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Stake Tokens</DialogTitle>
					<DialogDescription>
						Stake your tokens to earn voting power and participate in governance.
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="stake" className="mt-6">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="stake">Stake</TabsTrigger>
						<TabsTrigger value="unstake">Unstake</TabsTrigger>
					</TabsList>

					<TabsContent value="stake" className="mt-6">
						<StakeTab
							onStake={handleStake}
							isStaking={isStaking}
							maxBalance={maxBalance}
						/>
					</TabsContent>

					<TabsContent value="unstake" className="mt-6">
						<UnstakeTab
							onUnstake={handleUnstake}
							isUnstaking={isUnstaking}
							stakedAmount={stakingInfo?.stakedAmount || 0}
							lockEndTime={stakingInfo?.lockEndTime}
						/>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	)
}
