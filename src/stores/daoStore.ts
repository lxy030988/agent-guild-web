import { atom } from "jotai"

export interface ProposalStatus {
	id: number
	name: string
	color: string
}

export interface Proposal {
	id: number
	title: string
	description: string
	status: "active" | "passed" | "failed" | "pending" | "executed"
	votesFor: number
	votesAgainst: number
	votesAbstain: number
	totalVotes: number
	startTime: string
	endTime: string
	createdBy: string
	participants: string[]
	quorum: number
	createdAt: string
	updatedAt: string
}

export interface Vote {
	id: number
	proposalId: number
	voter: string
	choice: "for" | "against" | "abstain"
	votingPower: number
	timestamp: string
	txHash?: string
}

export interface TreasuryAsset {
	symbol: string
	name: string
	balance: number
	valueUsd: number
	logo: string
	change24h: number
}

export interface Treasury {
	totalValueUsd: number
	change24h: number
	assets: TreasuryAsset[]
	lastUpdated: string
}

export interface UserGovernanceStats {
	walletAddress: string
	votingPower: number
	stakedAmount: number
	lockEndTime?: string
	multiplier: number
	proposalsCreated: number
	proposalsVoted: number
	rank: number
	totalStakers: number
}

export interface StakingInfo {
	stakedAmount: number
	lockPeriod: number // in days: 0, 30, 90, 180
	lockEndTime?: string
	multiplier: number // 1x, 1.2x, 1.5x, 2x
	rewards: number
}

// Atoms
export const proposalsAtom = atom<Proposal[]>([])
export const selectedProposalAtom = atom<Proposal | null>(null)
export const treasuryAtom = atom<Treasury | null>(null)
export const userGovernanceStatsAtom = atom<UserGovernanceStats | null>(null)
export const stakingInfoAtom = atom<StakingInfo | null>(null)

// Loading states
export const proposalsLoadingAtom = atom<boolean>(false)
export const treasuryLoadingAtom = atom<boolean>(false)
export const statsLoadingAtom = atom<boolean>(false)

// Filters
export const proposalFilterAtom = atom<string>("all") // all, active, passed, failed, pending
export const proposalSearchAtom = atom<string>("")
