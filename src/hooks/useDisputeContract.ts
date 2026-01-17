import type { TransactionReceipt } from "viem"
import { parseEventLogs } from "viem"
import { useAccount, useWriteContract } from "wagmi"
import { DISPUTE_RESOLUTION_ABI } from "../abis/DisputeResolution"
import { getContractAddress } from "../wagmi.config"

/**
 * Dispute 智能合约交互 Hook
 */
export const useDisputeContract = () => {
	const { chainId } = useAccount()
	const { writeContractAsync } = useWriteContract()

	const getContractConfig = () => {
		const address = getContractAddress("DisputeResolution", chainId || 31337)
		if (!address) {
			throw new Error("DisputeResolution contract not deployed on this network")
		}
		return {
			address: address as `0x${string}`,
			abi: DISPUTE_RESOLUTION_ABI,
		}
	}

	/**
	 * 发起争议
	 */
	const createDisputeOnChain = async (jobId: bigint, evidenceHash: string) => {
		const hash = await writeContractAsync({
			...getContractConfig(),
			functionName: "createDispute",
			args: [jobId, evidenceHash],
		})
		return { txHash: hash }
	}

	/**
	 * 提交投票
	 * choice: 0 = Approve, 1 = Reject, 2 = Abstain
	 */
	const voteOnChain = async (disputeId: bigint, choice: number) => {
		const hash = await writeContractAsync({
			...getContractConfig(),
			functionName: "vote",
			args: [disputeId, choice],
		})
		return { txHash: hash }
	}

	/**
	 * 解决争议
	 */
	const resolveDisputeOnChain = async (disputeId: bigint) => {
		const hash = await writeContractAsync({
			...getContractConfig(),
			functionName: "resolveDispute",
			args: [disputeId],
		})
		return { txHash: hash }
	}

	return {
		createDisputeOnChain,
		voteOnChain,
		resolveDisputeOnChain,
	}
}

/**
 * 解析 DisputeCreated 事件获取 chainDisputeId
 */
export function parseDisputeCreatedEvent(
	receipt: TransactionReceipt,
): bigint {
	const logs = parseEventLogs({
		abi: DISPUTE_RESOLUTION_ABI,
		logs: receipt.logs,
		eventName: "DisputeCreated",
	})

	if (logs.length === 0) {
		throw new Error("DisputeCreated event not found in transaction")
	}

	return logs[0].args.disputeId
}
