import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface WalletOverview {
  agentEarnings: string;
  agentEarningsPending: string;
  jobEscrow: string;
  jobEscrowPending: string;
  stakingBalance: string;
  totalRewards: string;
  claimableRewards: string;
  apy: number;
  totalAssetsUsd: string;
  dailyChangePercent: number;
  dailyChangeAmount: string;
  updatedAt: string;
}

export interface StakingStatus {
  balance: string;
  claimableRewards: string;
  pendingWithdrawalAmount: string;
  cooldownEndTime: string;
  remainingTime: string;
  isInCooldown: boolean;
  canClaim: boolean;
  apy: number;
  minStakeAmount: string;
  cooldownPeriod: string;
  earlyWithdrawalPenalty: number;
}

export interface Transaction {
  id: string;
  type: 'stake' | 'unstake' | 'claim' | 'earn' | 'escrow';
  title: string;
  description: string;
  amount: string;
  currency: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

export interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTransactionDto {
  walletAddress: string;
  type: Transaction['type'];
  title: string;
  description: string;
  amount: string;
  currency: string;
  txHash?: string;
}

export const walletApi = {
  /**
   * 获取钱包概览数据
   */
  async getOverview(walletAddress: string): Promise<WalletOverview> {
    const response = await api.get<WalletOverview>(
      `/wallet/overview/${walletAddress}`,
    );
    return response.data;
  },

  /**
   * 获取质押状态
   */
  async getStakingStatus(walletAddress: string): Promise<StakingStatus> {
    const response = await api.get<StakingStatus>(
      `/wallet/staking/${walletAddress}`,
    );
    return response.data;
  },

  /**
   * 获取交易历史
   */
  async getTransactions(
    walletAddress: string,
    params?: {
      page?: number;
      limit?: number;
      timeFilter?: '24h' | '7d' | '30d' | 'all';
      type?: Transaction['type'];
    },
  ): Promise<TransactionsResponse> {
    const response = await api.get<TransactionsResponse>(
      `/wallet/transactions/${walletAddress}`,
      { params },
    );
    return response.data;
  },

  /**
   * 创建交易记录
   */
  async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
    const response = await api.post<Transaction>('/wallet/transactions', data);
    return response.data;
  },
};
