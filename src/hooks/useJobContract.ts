import type { TransactionReceipt } from "viem"
import { parseEther, parseEventLogs } from "viem"
import { useAccount, useWriteContract } from "wagmi"
import { JOB_ESCROW_ABI } from "../abis/JobEscrow"
import { getContractAddress } from "../wagmi.config"

/**
 * Job 智能合约交互 Hook
 * 提供创建任务、分配 Agent、完成任务、取消任务等功能
 */
export const useJobContract = () => {
	const { chainId } = useAccount()
	const { writeContractAsync } = useWriteContract()

	// 获取合约配置
	const getContractConfig = () => {
		const address = getContractAddress("JobEscrow", chainId || 31337)
		if (!address) {
			throw new Error("JobEscrow contract not deployed on this network")
		}
		return {
			address: address as `0x${string}`,
			abi: JOB_ESCROW_ABI,
		}
	}

	/**
	 * 创建任务并托管资金
	 * @param budget 预算金额（ETH 字符串，如 "0.1"）
	 * @param deadline 截止时间（Unix 时间戳，秒）
	 * @returns { txHash } 交易哈希
	 */
	const createJobOnChain = async (budget: string, deadline: number) => {
		const hash = await writeContractAsync({
			...getContractConfig(),
			functionName: "createJob",
			args: [BigInt(deadline)],
			value: parseEther(budget),
		})

		return { txHash: hash }
	}

	/**
	 * 分配 Agent 到任务
	 * @param chainJobId 链上任务 ID
	 * @param agentAddress Agent 的钱包地址
	 * @returns txHash
	 */
	const assignAgentOnChain = async (
		chainJobId: bigint,
		agentAddress: string,
	) => {
		const hash = await writeContractAsync({
			...getContractConfig(),
			functionName: "assignAgent",
			args: [chainJobId, agentAddress as `0x${string}`],
		})

		return { txHash: hash }
	}

	/**
	 * 完成任务并释放资金给 Agent
	 * @param chainJobId 链上任务 ID
	 * @returns txHash
	 */
	const completeJobOnChain = async (chainJobId: bigint) => {
		const hash = await writeContractAsync({
			...getContractConfig(),
			functionName: "completeJob",
			args: [chainJobId],
		})

		return { txHash: hash }
	}

	/**
	 * 取消任务并退款
	 * @param chainJobId 链上任务 ID
	 * @returns txHash
	 */
	const cancelJobOnChain = async (chainJobId: bigint) => {
		const hash = await writeContractAsync({
			...getContractConfig(),
			functionName: "cancelJob",
			args: [chainJobId],
		})

		return { txHash: hash }
	}

	/**
	 * 触发超时任务退款
	 * @param chainJobId 链上任务 ID
	 * @returns txHash
	 */
	const refundExpiredJobOnChain = async (chainJobId: bigint) => {
		const hash = await writeContractAsync({
			...getContractConfig(),
			functionName: "refundExpiredJob",
			args: [chainJobId],
		})

		return { txHash: hash }
	}

	return {
		createJobOnChain,
		assignAgentOnChain,
		completeJobOnChain,
		cancelJobOnChain,
		refundExpiredJobOnChain,
	}
}

/**
 * 解析 JobCreated 事件获取 chainJobId
 * @param receipt 交易回执
 * @returns chainJobId
 */
export function parseJobCreatedEvent(receipt: TransactionReceipt): bigint {
	const logs = parseEventLogs({
		abi: JOB_ESCROW_ABI,
		logs: receipt.logs,
		eventName: "JobCreated",
	})

	if (logs.length === 0) {
		throw new Error("JobCreated event not found in transaction")
	}

	return logs[0].args.jobId
}
