import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { walletApi, WalletOverview, StakingStatus, Transaction } from '@/services/wallet';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [stakingStatus, setStakingStatus] = useState<StakingStatus | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOverview = useCallback(async () => {
    if (!address) return;
    try {
      const data = await walletApi.getOverview(address);
      setOverview(data);
    } catch (err) {
      console.error('Failed to fetch wallet overview:', err);
    }
  }, [address]);

  const fetchStakingStatus = useCallback(async () => {
    if (!address) return;
    try {
      const data = await walletApi.getStakingStatus(address);
      setStakingStatus(data);
    } catch (err) {
      console.error('Failed to fetch staking status:', err);
    }
  }, [address]);

  const fetchTransactions = useCallback(
    async (params?: { page?: number; limit?: number; type?: Transaction['type'] }) => {
      if (!address) return;
      try {
        const data = await walletApi.getTransactions(address, params);
        setTransactions(data.data);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      }
    },
    [address],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchOverview(), fetchStakingStatus(), fetchTransactions()]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchOverview, fetchStakingStatus, fetchTransactions]);

  useEffect(() => {
    if (isConnected && address) {
      refresh();
    }
  }, [isConnected, address, refresh]);

  return {
    address,
    isConnected,
    overview,
    stakingStatus,
    transactions,
    isLoading,
    error,
    refresh,
    fetchOverview,
    fetchStakingStatus,
    fetchTransactions,
  };
}
