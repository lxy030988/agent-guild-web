import { useEffect } from "react"
import { toast } from "sonner"
import { useAccount, useWriteContract } from "wagmi"
import { DISPUTE_RESOLUTION_ABI } from "../abis/DisputeResolution"
import { getContractAddress } from "../wagmi.config"

export function getDisputeContractConfig(chainId: number) {
	return {
		address: getContractAddress("DisputeResolution", chainId) as `0x${string}`,
		abi: DISPUTE_RESOLUTION_ABI,
	}
}

export function useDisputeContract() {
	const { chainId } = useAccount()
	const { address: contractAddress } = getDisputeContractConfig(chainId || 1)

	const {
		writeContract: write,
		data: hash,
		isPending: isConfirming,
		isSuccess,
		error,
	} = useWriteContract()

	// 监听成功和错误
	useEffect(() => {
		if (isSuccess) {
			toast.success("Transaction submitted successfully!", {
				description: `Hash: ${hash?.slice(0, 10)}...`,
			})
		}
		if (error) {
			toast.error("Transaction failed", {
				description: error.message,
			})
		}
	}, [isSuccess, error, hash])

	/**
	 * 发起争议
	 */
	const createDispute = (jobId: bigint, evidenceHash: string) => {
		if (!contractAddress) return
		write({
			address: contractAddress,
			abi: DISPUTE_RESOLUTION_ABI,
			functionName: "createDispute",
			args: [jobId, evidenceHash],
		})
	}

	/**
	 * 提交投票
	 * choice: 0 = Approve, 1 = Reject, 2 = Abstain
	 */
	const vote = (disputeId: bigint, choice: number) => {
		if (!contractAddress) return
		write({
			address: contractAddress,
			abi: DISPUTE_RESOLUTION_ABI,
			functionName: "vote",
			args: [disputeId, choice],
		})
	}

	/**
	 * 解决争议
	 */
	const resolveDispute = (disputeId: bigint) => {
		if (!contractAddress) return
		write({
			address: contractAddress,
			abi: DISPUTE_RESOLUTION_ABI,
			functionName: "resolveDispute",
			args: [disputeId],
		})
	}

	return {
		createDispute,
		vote,
		resolveDispute,
		isConfirming,
		isSuccess,
		hash,
	}
}
