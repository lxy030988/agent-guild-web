import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TreasuryOverview } from "@/components/dao/TreasuryOverview/TreasuryOverview"
import { GovernanceStats } from "@/components/dao/GovernanceStats/GovernanceStats"
import { ProposalsGrid } from "@/components/dao/ProposalsGrid/ProposalsGrid"
import { ProposalDetail } from "@/components/dao/ProposalDetail/ProposalDetail"
import { VotingModal } from "@/components/dao/VotingModal/VotingModal"
import { StakingModal } from "@/components/dao/StakingModal/StakingModal"
import { CreateProposalModal } from "@/components/dao/CreateProposal/CreateProposalModal"
import { RecentActivity } from "@/components/dao/RecentActivity/RecentActivity"
import { Plus, BarChart3, Vote, Users } from "lucide-react"

export default function DaoPage() {
	const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null)
	const [votingProposalId, setVotingProposalId] = useState<number | null>(null)
	const [showStakingModal, setShowStakingModal] = useState(false)
	const [showCreateProposalModal, setShowCreateProposalModal] = useState(false)

	const handleVote = (proposalId: number) => {
		setVotingProposalId(proposalId)
	}

	const handleViewProposal = (proposalId: number) => {
		setSelectedProposalId(proposalId)
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-background via-background to-purple-500/5">
			<div className="container mx-auto px-4 py-8 space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
							DAO Governance
						</h1>
						<p className="text-muted-foreground">
							Participate in decentralized governance and shape the future of the protocol
						</p>
					</div>
					<Button
						onClick={() => setShowCreateProposalModal(true)}
						className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
					>
						<Plus className="h-4 w-4" />
						Create Proposal
					</Button>
				</div>

				{/* Stats Overview */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<StatCard
						icon={<BarChart3 className="h-5 w-5 text-purple-500" />}
						label="Total Treasury"
						value="$14.2M"
						change="+4.2%"
						changeType="positive"
					/>
					<StatCard
						icon={<Vote className="h-5 w-5 text-pink-500" />}
						label="Active Proposals"
						value="5"
						sublabel="3 pending"
					/>
					<StatCard
						icon={<Users className="h-5 w-5 text-blue-500" />}
						label="Total Stakers"
						value="1,234"
						change="+12"
						changeType="positive"
					/>
					<StatCard
						icon={<BarChart3 className="h-5 w-5 text-green-500" />}
						label="Participation Rate"
						value="67%"
						change="+5%"
						changeType="positive"
					/>
				</div>

				{/* Treasury Overview */}
				<section>
					<TreasuryOverview />
				</section>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					{/* Left Column - Governance Stats + Recent Activity */}
					<aside className="lg:col-span-1 space-y-6">
						<div className="lg:sticky lg:top-24 space-y-6">
							<GovernanceStats onStakeClick={() => setShowStakingModal(true)} />
							<RecentActivity />
						</div>
					</aside>

					{/* Right Column - Proposals Grid */}
					<main className="lg:col-span-3">
						<ProposalsGrid onVote={handleVote} onView={handleViewProposal} />
					</main>
				</div>
			</div>

			{/* Modals */}
			<ProposalDetail
				proposalId={selectedProposalId}
				open={selectedProposalId !== null}
				onClose={() => setSelectedProposalId(null)}
				onVote={handleVote}
			/>

			<VotingModal
				proposalId={votingProposalId}
				open={votingProposalId !== null}
				onClose={() => setVotingProposalId(null)}
			/>

			<StakingModal
				open={showStakingModal}
				onClose={() => setShowStakingModal(false)}
				maxBalance={1000}
			/>

			<CreateProposalModal
				open={showCreateProposalModal}
				onClose={() => setShowCreateProposalModal(false)}
			/>
		</div>
	)
}

// Stat Card Component
interface StatCardProps {
	icon: React.ReactNode
	label: string
	value: string
	change?: string
	changeType?: "positive" | "negative"
	sublabel?: string
}

function StatCard({ icon, label, value, change, changeType, sublabel }: StatCardProps) {
	return (
		<div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-purple-500/30 transition-all">
			<div className="flex items-center gap-3">
				<div className="p-2 rounded-lg bg-background/50">
					{icon}
				</div>
				<div className="flex-1">
					<p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
					<div className="flex items-baseline gap-2">
						<span className="text-xl font-bold">{value}</span>
						{change && (
							<span className={`text-xs font-medium ${
								changeType === "positive" ? "text-green-500" : "text-red-500"
							}`}>
								{change}
							</span>
						)}
						{sublabel && (
							<span className="text-xs text-muted-foreground">{sublabel}</span>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
