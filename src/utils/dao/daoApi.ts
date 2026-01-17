import apiClient from "../api-client"
import type {
	Proposal,
	Treasury,
	UserGovernanceStats,
	StakingInfo,
	Vote,
} from "@/stores/daoStore"

// Enable mock data when backend is not available
// Set VITE_USE_MOCK_DATA=true in .env to use mock data
const USE_MOCK_DATA = import.meta.env?.VITE_USE_MOCK_DATA === 'true' || true

export interface CreateProposalRequest {
	title: string
	description: string
	votingPeriod: number // in days
}

export interface CastVoteRequest {
	proposalId: number
	choice: "for" | "against" | "abstain"
	votingPower: number
	signature?: string
	txHash?: string
}

export interface StakeRequest {
	amount: number
	lockPeriod: number // 0, 30, 90, 180 days
}

export interface UnstakeRequest {
	amount: number
}

// Mock data
const mockProposals: Proposal[] = [
	{
		id: 42,
		title: "TIP-42: Allocate 50 ETH to Dev Guild for Q3 Operations",
		description: "Proposal to allocate 50 ETH from the treasury to fund the Development Guild's operations for Q3 2024, including developer bounties, tooling improvements, and infrastructure costs.",
		status: "active",
		votesFor: 8200,
		votesAgainst: 1000,
		votesAbstain: 300,
		totalVotes: 9500,
		startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
		createdBy: "0x1234567890123456789012345678901234567890",
		participants: [
			"0x1234567890123456789012345678901234567890",
			"0x2345678901234567890123456789012345678901",
			"0x3456789012345678901234567890123456789012",
			"0x4567890123456789012345678901234567890123",
			"0x5678901234567890123456789012345678901234",
		],
		quorum: 10000,
		createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: 43,
		title: "TIP-43: Strategic Partnership with Protocol X",
		description: "Proposal to establish a liquidity mining partnership with Protocol X to deepen cross-protocol integrations and expand our ecosystem reach.",
		status: "active",
		votesFor: 4500,
		votesAgainst: 500,
		votesAbstain: 200,
		totalVotes: 5200,
		startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
		endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
		createdBy: "0xabcdef1234567890123456789012345678901234",
		participants: [
			"0xabcdef1234567890123456789012345678901234",
			"0xbcdef12345678901234567890123456789012345",
			"0xcdef123456789012345678901234567890123456",
		],
		quorum: 10000,
		createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: 44,
		title: "Grant: Community Moderator Program Renewal",
		description: "Renewing the budget for community moderators for the next 6 months, including Discord and Telegram moderation teams.",
		status: "pending",
		votesFor: 0,
		votesAgainst: 0,
		votesAbstain: 0,
		totalVotes: 0,
		startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
		endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
		createdBy: "0xfedcba0987654321098765432109876543210987",
		participants: [],
		quorum: 10000,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: 41,
		title: "TIP-41: Increase Staking Rewards for Q3",
		description: "Proposal to increase staking rewards from 5% to 8% APY for Q3 to encourage long-term staking.",
		status: "passed",
		votesFor: 12000,
		votesAgainst: 2500,
		votesAbstain: 500,
		totalVotes: 15000,
		startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
		endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		createdBy: "0x9876543210987654321098765432109876543210",
		participants: [
			"0x9876543210987654321098765432109876543210",
			"0x8765432109876543210987654321098765432109",
			"0x7654321098765432109876543210987654321098",
			"0x6543210987654321098765432109876543210987",
		],
		quorum: 10000,
		createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
		updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: 40,
		title: "TIP-40: Rebrand Project Logo and Identity",
		description: "A proposal to commission a new logo and visual identity including a new logo, color palette, and branding guidelines.",
		status: "failed",
		votesFor: 3000,
		votesAgainst: 8500,
		votesAbstain: 1000,
		totalVotes: 12500,
		startTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
		endTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
		createdBy: "0x0123456789012345678901234567890123456789",
		participants: [
			"0x0123456789012345678901234567890123456789",
			"0x1234567890123456789012345678901234567890",
		],
		quorum: 10000,
		createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
		updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: 39,
		title: "Partnership with DeFi Alliance",
		description: "Establish a formal partnership with the DeFi Alliance to improve liquidity provision and cross-chain capabilities.",
		status: "executed",
		votesFor: 14000,
		votesAgainst: 1000,
		votesAbstain: 500,
		totalVotes: 15500,
		startTime: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
		endTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
		createdBy: "0xdeadbeef12345678901234567890123456789012",
		participants: [
			"0xdeadbeef12345678901234567890123456789012",
			"0xbeef123456789012345678901234567890123456",
			"0xcafe987654321098765432109876543210987654",
		],
		quorum: 10000,
		createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
		updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
	},
]

const mockTreasury: Treasury = {
	totalValueUsd: 14203991,
	change24h: 4.2,
	assets: [
		{
			symbol: "ETH",
			name: "Ethereum",
			balance: 2500,
			valueUsd: 6250000,
			logo: "/assets/eth.svg",
			change24h: 3.5,
		},
		{
			symbol: "USDC",
			name: "USD Coin",
			balance: 3500000,
			valueUsd: 3500000,
			logo: "/assets/usdc.svg",
			change24h: 0.01,
		},
		{
			symbol: "NEX",
			name: "Nexus Token",
			balance: 5000000,
			valueUsd: 2500000,
			logo: "/assets/nex.svg",
			change24h: 8.2,
		},
		{
			symbol: "WBTC",
			name: "Wrapped Bitcoin",
			balance: 25,
			valueUsd: 1453991,
			logo: "/assets/wbtc.svg",
			change24h: 2.1,
		},
		{
			symbol: "DAI",
			name: "Dai Stablecoin",
			balance: 500000,
			valueUsd: 500000,
			logo: "/assets/dai.svg",
			change24h: 0.02,
		},
	],
	lastUpdated: new Date().toISOString(),
}

const mockUserStats: UserGovernanceStats = {
	walletAddress: "0x1234567890123456789012345678901234567890",
	votingPower: 12500,
	stakedAmount: 10000,
	lockEndTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
	multiplier: 1.25,
	proposalsCreated: 3,
	proposalsVoted: 15,
	rank: 42,
	totalStakers: 1234,
}

const mockStakingInfo: StakingInfo = {
	stakedAmount: 10000,
	lockPeriod: 90,
	lockEndTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
	multiplier: 1.25,
	rewards: 125,
}

/**
 * DAO API Client
 */
export const daoApi = {
	// Proposals
	async getProposals(filter?: string): Promise<Proposal[]> {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
			if (filter && filter !== "all") {
				return mockProposals.filter((p) => p.status === filter)
			}
			return mockProposals
		}

		const params = filter && filter !== "all" ? { status: filter } : {}
		const response = await apiClient.get<Proposal[]>("/api/dao/proposals", {
			params,
		})
		return response.data
	},

	async getProposal(id: number): Promise<Proposal> {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 300))
			const proposal = mockProposals.find((p) => p.id === id)
			if (!proposal) throw new Error("Proposal not found")
			return proposal
		}

		const response = await apiClient.get<Proposal>(`/api/dao/proposals/${id}`)
		return response.data
	},

	async createProposal(data: CreateProposalRequest): Promise<Proposal> {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 1000))
			const newProposal: Proposal = {
				id: mockProposals.length + 45,
				title: data.title,
				description: data.description,
				status: "pending",
				votesFor: 0,
				votesAgainst: 0,
				votesAbstain: 0,
				totalVotes: 0,
				startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
				endTime: new Date(Date.now() + (data.votingPeriod + 1) * 24 * 60 * 60 * 1000).toISOString(),
				createdBy: "0x1234567890123456789012345678901234567890",
				participants: [],
				quorum: 10000,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			mockProposals.unshift(newProposal)
			return newProposal
		}

		const response = await apiClient.post<Proposal>(
			"/api/dao/proposals",
			data,
		)
		return response.data
	},

	// Voting
	async castVote(data: CastVoteRequest): Promise<Vote> {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 1500))
			return {
				id: Date.now(),
				proposalId: data.proposalId,
				voter: "0x1234567890123456789012345678901234567890",
				choice: data.choice,
				votingPower: data.votingPower,
				timestamp: new Date().toISOString(),
				txHash: `0x${Math.random().toString(16).slice(2)}`,
			}
		}

		const response = await apiClient.post<Vote>("/api/dao/votes", data)
		return response.data
	},

	async getProposalVotes(proposalId: number): Promise<Vote[]> {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 400))
			return [
				{
					id: 1,
					proposalId,
					voter: "0x1234567890123456789012345678901234567890",
					choice: "for",
					votingPower: 5000,
					timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 2,
					proposalId,
					voter: "0xabcdef1234567890123456789012345678901234",
					choice: "for",
					votingPower: 3200,
					timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 3,
					proposalId,
					voter: "0x9876543210987654321098765432109876543210",
					choice: "against",
					votingPower: 1000,
					timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
				},
			]
		}

		const response = await apiClient.get<Vote[]>(
			`/api/dao/proposals/${proposalId}/votes`,
		)
		return response.data
	},

	async getUserVote(proposalId: number): Promise<Vote | null> {
		try {
			if (USE_MOCK_DATA) {
				await new Promise((resolve) => setTimeout(resolve, 200))
				return null // User hasn't voted
			}

			const response = await apiClient.get<Vote>(
				`/api/dao/proposals/${proposalId}/my-vote`,
			)
			return response.data
		} catch (error) {
			// Return null if user hasn't voted
			return null
		}
	},

	// Treasury
	async getTreasury(): Promise<Treasury> {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 600))
			return mockTreasury
		}

		const response = await apiClient.get<Treasury>("/api/dao/treasury")
		return response.data
	},

	// Staking
	async getStakingInfo(): Promise<StakingInfo> {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 400))
			return mockStakingInfo
		}

		const response = await apiClient.get<StakingInfo>("/api/dao/staking")
		return response.data
	},

	async stake(data: StakeRequest): Promise<StakingInfo> {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 2000))
			return {
				...mockStakingInfo,
				stakedAmount: mockStakingInfo.stakedAmount + data.amount,
				lockPeriod: data.lockPeriod,
			}
		}

		const response = await apiClient.post<StakingInfo>(
			"/api/dao/staking/stake",
			data,
		)
		return response.data
	},

	async unstake(data: UnstakeRequest): Promise<StakingInfo> {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 2000))
			return {
				...mockStakingInfo,
				stakedAmount: Math.max(0, mockStakingInfo.stakedAmount - data.amount),
			}
		}

		const response = await apiClient.post<StakingInfo>(
			"/api/dao/staking/unstake",
			data,
		)
		return response.data
	},

	// User stats
	async getGovernanceStats(): Promise<UserGovernanceStats> {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 500))
			return mockUserStats
		}

		const response = await apiClient.get<UserGovernanceStats>(
			"/api/dao/stats",
		)
		return response.data
	},
}

export default daoApi
