import { STAKE_ABI } from "@/abis/Stake"
import { MOCKUSDC_ABI } from "@/abis/MockUSDC"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { getContractAddress } from "@/wagmi.config"
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { motion } from "framer-motion"
import {
	ArrowDownLeft,
	ChevronRight,
	Clock,
	Eye,
	Lock,
	Minus,
	Plus,
	Shield,
	Target,
	TrendingUp,
	Unlock,
	Zap,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"
import { walletApi, WalletOverview, Transaction } from "@/services/wallet"

type ModalType = "stake" | "unstake" | "claim" | null

const trendData = [
	{ name: "Mon", val: 30000 },
	{ name: "Tue", val: 32500 },
	{ name: "Wed", val: 31200 },
	{ name: "Thu", val: 34800 },
	{ name: "Fri", val: 33500 },
	{ name: "Sat", val: 36200 },
	{ name: "Sun", val: 37121 },
]

const containerVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
}

const walletCardsBase = [
	{
		id: "wallet-1",
		title: "Agent Earnings",
		currency: "USDC",
		gradient: "from-blue-400 to-blue-600",
		icon: Zap,
	},
	{
		id: "wallet-2",
		title: "Job Escrow",
		currency: "USDC",
		gradient: "from-violet-400 to-purple-600",
		icon: Shield,
	},
	{
		id: "wallet-3",
		title: "Staking Rewards",
		currency: "stUSDC",
		gradient: "from-emerald-400 to-teal-600",
		icon: Target,
	},
]

// Mock transactions for demo (replace with API data in production)
const mockTransactions = [
	{
		id: "tx-1",
		title: "Agent Task Earnings",
		desc: "AI Data Analysis Report Generation",
		amount: "+500 USDC",
		time: "2025/1/7 08:00:00",
		status: "Completed",
		icon: ArrowDownLeft,
		col: "text-emerald-600",
		bg: "bg-emerald-50",
	},
	{
		id: "tx-2",
		title: "Fund Staking",
		desc: "Stake for stable coin rewards",
		amount: "-2,000 USDC",
		time: "2025/1/6 08:00:00",
		status: "Completed",
		icon: Lock,
		col: "text-rose-500",
		bg: "bg-slate-50",
	},
	{
		id: "tx-3",
		title: "Staking Rewards",
		desc: "Daily reward distribution",
		amount: "+15.75 stUSDC",
		time: "2025/1/5 08:00:00",
		status: "Completed",
		icon: Zap,
		col: "text-emerald-600",
		bg: "bg-emerald-50",
	},
]

const assetItems = [
	{
		id: "asset-1",
		name: "Agent Earnings",
		desc: "Active agent task income",
		val: "15,420.50 USDC",
		change: "+12.5%",
		icon: Zap,
		color: "text-blue-600",
		bg: "bg-blue-50",
	},
	{
		id: "asset-2",
		name: "Escrow Funds",
		desc: "In job contract escrow",
		val: "8,950.00 USDC",
		change: "Pending allocation",
		changeColor: "text-amber-600",
		icon: Shield,
		color: "text-purple-600",
		bg: "bg-purple-50",
	},
	{
		id: "asset-3",
		name: "Staking Rewards",
		desc: "8.5% APY",
		val: "12,750.75 stUSDC",
		change: "+8.5% APY",
		icon: Target,
		color: "text-emerald-600",
		bg: "bg-emerald-50",
	},
]

const Wallet = () => {
	const [timeFilter, setTimeFilter] = useState("7d")
	const [isBalanceVisible, setIsBalanceVisible] = useState(true)
	const [amount, setAmount] = useState("")
	const [modalType, setModalType] = useState<ModalType>(null)
	const [walletOverview, setWalletOverview] = useState<WalletOverview | null>(null)
	const [pendingStakeAmount, setPendingStakeAmount] = useState<bigint | null>(null)
	const { address, chainId } = useAccount()
	const currentChainId = chainId || 31337 // Default to Hardhat

	const CONTRACT_ADDRESS = getContractAddress("Stake", currentChainId) as `0x${string}`
	const USDC_ADDRESS = getContractAddress("MockUSDC", currentChainId) as `0x${string}`

	// Query USDC balance in wallet
	const { data: walletUsdcBalance } = useReadContract({
		address: USDC_ADDRESS,
		abi: MOCKUSDC_ABI,
		functionName: "balanceOf",
		args: address ? [address] : undefined,
	})

	// Query USDC allowance
	const { data: allowance } = useReadContract({
		address: USDC_ADDRESS,
		abi: MOCKUSDC_ABI,
		functionName: "allowance",
		args: address && CONTRACT_ADDRESS ? [address, CONTRACT_ADDRESS] : undefined,
	})

	// Query user info (replaces balances, earned, and getCooldownInfo)
	const {
		data: userInfo,
		refetch: refetchUserInfo,
		error: userInfoError,
	} = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: STAKE_ABI,
		functionName: "getUserInfo",
		args: address ? [address] : undefined,
		query: {
			enabled: !!address && !!CONTRACT_ADDRESS,
		},
	})

	// Query APY
	const { data: currentAPY } = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: STAKE_ABI,
		functionName: "getCurrentAPYPercent",
	})

	// Query exchange rate (stUSDC per USDC)
	const { data: exchangeRate } = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: STAKE_ABI,
		functionName: "getExchangeRate",
	})

	// Query withdrawal queue for cooldown info
	const { data: withdrawalQueueData, refetch: refetchWithdrawalQueue } = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: STAKE_ABI,
		functionName: "withdrawalQueue",
		args: [BigInt(0)], // First withdrawal request
	})

	const { data: hash, isPending, writeContract } = useWriteContract({
		mutation: {
			onSuccess: (txHash, variables) => {
				console.log("[Wallet] Transaction sent:", txHash)
				// If this was an approve, stake next
				if (modalType === "stake" && pendingStakeAmount && variables?.abi === MOCKUSDC_ABI) {
					console.log("[Wallet] Approve success, sending stake transaction...")
					writeContract({
						address: CONTRACT_ADDRESS,
						abi: STAKE_ABI,
						functionName: "stake",
						args: [pendingStakeAmount],
					})
					setPendingStakeAmount(null)
				}
			},
			onError: (error) => {
				console.error("[Wallet] Write contract error:", error.message)
			},
		},
	})
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
		hash,
	})

	const toggleBalanceVisibility = () => setIsBalanceVisible(!isBalanceVisible)
	const formatBalance = (balance: string, currency: string) =>
		isBalanceVisible ? `${balance} ${currency}` : "**** ****"

	const openStake = () => setModalType("stake")
	const openUnstake = () => setModalType("unstake")
	const openClaim = () => setModalType("claim")
	const closeModal = useCallback(() => {
		setModalType(null)
		setAmount("")
	}, [])

	const formatUsdc = (value: bigint | undefined | null) => {
		if (!value) return "0.00"
		return (Number(value) / 1e6).toFixed(2)
	}

	const formatStUsdc = (value: bigint | undefined | null) => {
		if (!value) return "0.00"
		return (Number(value) / 1e6).toFixed(2)
	}

	// Extract user info data
	const usdcBalance = userInfo ? userInfo[0] : undefined
	const stUsdcBalance = userInfo ? userInfo[1] : undefined
	const claimableRewards = userInfo ? userInfo[2] : undefined
	const apy = userInfo ? userInfo[4] : undefined

	// Debug logging
	useEffect(() => {
		console.log("[Wallet] Debug Info:")
		console.log("  address:", address)
		console.log("  CONTRACT_ADDRESS:", CONTRACT_ADDRESS)
		console.log("  userInfo:", userInfo)
		console.log("  usdcBalance:", usdcBalance)
		console.log("  stUsdcBalance:", stUsdcBalance)
		console.log("  claimableRewards:", claimableRewards)
		console.log("  currentAPY:", currentAPY)
		console.log("  exchangeRate:", exchangeRate)
		console.log("  userInfoError:", userInfoError)
	}, [address, CONTRACT_ADDRESS, userInfo, usdcBalance, stUsdcBalance, claimableRewards, currentAPY, exchangeRate, userInfoError])

	const getCardBalance = (cardId: string, walletOverview: WalletOverview | null) => {
		if (!walletOverview) return "0.00"
		switch (cardId) {
			case "wallet-1":
				return walletOverview.agentEarnings
			case "wallet-2":
				return walletOverview.jobEscrow
			case "wallet-3":
				return walletOverview.stakingBalance
			default:
				return "0.00"
		}
	}

	// Fetch wallet walletOverview data
	useEffect(() => {
		const fetchOverview = async () => {
			if (address) {
				try {
					const data = await walletApi.getOverview(address)
					setWalletOverview(data)
				} catch (error) {
					console.error("Failed to fetch wallet walletOverview:", error)
				}
			}
		}
		fetchOverview()
	}, [address])

	// Periodic refresh of contract data (every 10 seconds)
	useEffect(() => {
		if (!address) return

		const interval = setInterval(() => {
			refetchUserInfo()
			refetchWithdrawalQueue()
		}, 10000)

		return () => clearInterval(interval)
	}, [address, refetchUserInfo, refetchWithdrawalQueue])

	const formatTime = (seconds: number) => {
		const days = Math.floor(seconds / (24 * 60 * 60))
		const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
		if (days > 0) return `${days}d ${hours}h`
		if (hours > 0) return `${hours}h`
		return `${Math.floor(seconds / 60)}m`
	}

	// Parse withdrawal queue data for cooldown info
	const pendingShares = withdrawalQueueData ? withdrawalQueueData[1] : BigInt(0)
	const requestTimestamp = withdrawalQueueData ? withdrawalQueueData[2] : BigInt(0)
	const COOLDOWN_PERIOD = BigInt(7 * 24 * 60 * 60) // 7 days in seconds
	const now = BigInt(Math.floor(Date.now() / 1000))
	const remainingTime = requestTimestamp > 0 && pendingShares > 0 
		? COOLDOWN_PERIOD - (now - requestTimestamp)
		: BigInt(0)
	const canClaim = Number(remainingTime) === 0 && Number(pendingShares) > 0
	const isInCooldown = Number(remainingTime) > 0 && Number(pendingShares) > 0

	// Calculate pending USDC amount from shares
	const pendingAmount = pendingShares > 0 && exchangeRate && exchangeRate > 0
		? (pendingShares * BigInt(1e6)) / exchangeRate
		: BigInt(0)

	const handleStake = () => {
		if (!amount || Number.isNaN(Number(amount))) {
			console.log("[Wallet] Invalid amount:", amount)
			return
		}

		const stakeAmount = BigInt(Number(amount) * 1e6)
		console.log("[Wallet] handleStake called, amount:", amount, "stakeAmount:", stakeAmount.toString())
		console.log("[Wallet] Current allowance:", allowance?.toString(), "needs:", stakeAmount.toString())
		console.log("[Wallet] Need approval:", !allowance || allowance < stakeAmount)

		// Check if approval is needed
		if (!allowance || allowance < stakeAmount) {
			// First approve, then stake
			setPendingStakeAmount(stakeAmount)
			console.log("[Wallet] Sending approve transaction...")
			writeContract({
				address: USDC_ADDRESS,
				abi: MOCKUSDC_ABI,
				functionName: "approve",
				args: [CONTRACT_ADDRESS, stakeAmount],
			})
		} else {
			// Already approved, stake directly
			console.log("[Wallet] Sending stake transaction...")
			writeContract({
				address: CONTRACT_ADDRESS,
				abi: STAKE_ABI,
				functionName: "stake",
				args: [stakeAmount],
			})
		}
	}

	const handleRequestWithdraw = () => {
		if (!amount || Number.isNaN(Number(amount)) || !exchangeRate || exchangeRate === BigInt(0)) return
		// Convert USDC amount to stUSDC shares
		const stUsdcShares = (BigInt(Number(amount) * 1e6) * BigInt(1e18)) / exchangeRate
		writeContract({
			address: CONTRACT_ADDRESS,
			abi: STAKE_ABI,
			functionName: "requestWithdraw",
			args: [stUsdcShares],
		})
	}

	const handleClaimWithdraw = () => {
		writeContract({
			address: CONTRACT_ADDRESS,
			abi: STAKE_ABI,
			functionName: "claimWithdraw",
			args: [BigInt(0)], // First request in queue
		})
	}

	const handleClaimReward = () => {
		writeContract({
			address: CONTRACT_ADDRESS,
			abi: STAKE_ABI,
			functionName: "claimRewards",
		})
	}

	useEffect(() => {
		if (isSuccess && !isConfirming) {
			console.log("[Wallet] Transaction success, refetching data...")
			refetchUserInfo()
			refetchWithdrawalQueue()
			closeModal()
		}
	}, [
		isSuccess,
		isConfirming,
		refetchUserInfo,
		refetchWithdrawalQueue,
		closeModal,
	])

	const calculateMonthlyReturn = (amountValue: string) => {
		const numAmount = Number(amountValue) || 0
		const apyPercent = Number(currentAPY || BigInt(0)) / 1e16
		const monthlyReturn = (numAmount * apyPercent) / 12
		return monthlyReturn.toFixed(2)
	}

	return (
		<div className="min-h-screen bg-slate-50 pb-20">
			<section className="relative bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 pt-8 pb-12 px-6 text-white overflow-hidden">
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_40%)]" />
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_40%)]" />
					<motion.div
						animate={{ y: [0, -20, 0] }}
						transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
						className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
					/>
					<motion.div
						animate={{ y: [0, -25, 0] }}
						transition={{
							duration: 5,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 0.5,
						}}
						className="absolute top-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-2xl"
					/>
					<motion.div
						animate={{ y: [0, -15, 0] }}
						transition={{
							duration: 7,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 1,
						}}
						className="absolute bottom-10 left-1/3 w-40 h-40 bg-white/10 rounded-full blur-2xl"
					/>
				</div>

				<div className="relative max-w-4xl mx-auto space-y-4">
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
					>
						<div className="text-center sm:text-left">
							<h1 className="text-2xl sm:text-3xl font-black tracking-tight">
								My Wallet
							</h1>
							<p className="text-white/80 text-xs mt-1">
								Agent Earnings · Job Escrow · Staking Finance
							</p>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl overflow-hidden"
					>
						<motion.div
							animate={{ x: ["-100%", "100%"] }}
							transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
							className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
						/>
						<div className="relative flex flex-col items-center text-center">
							<p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
								Total Assets
							</p>
							<div className="flex items-center justify-center gap-3 mt-2">
								<motion.h2
									initial={{ scale: 0.9 }}
									animate={{ scale: 1 }}
									transition={{ duration: 0.3 }}
									className="text-3xl sm:text-4xl font-black tracking-tight font-mono"
								>
									{isBalanceVisible ? "$37,121.25" : "**** ****"}
								</motion.h2>
								<motion.button
									type="button"
									onClick={toggleBalanceVisibility}
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all shrink-0"
								>
									<Eye
										size={16}
										className={!isBalanceVisible ? "opacity-50" : ""}
									/>
								</motion.button>
							</div>
							<div
								className={`flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mt-2 ${isBalanceVisible ? "opacity-100" : "opacity-0"}`}
							>
								<TrendingUp size={12} className="text-emerald-300" />
								<span className="text-white text-xs font-bold">
									+5.2% (+$1,850.75) Today
								</span>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			<main className="relative mt-4 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
				<section className="space-y-5">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h3 className="text-xl font-bold text-slate-900">My Wallets</h3>
						</div>
					</div>

					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="grid grid-cols-1 md:grid-cols-3 gap-5"
					>
						{walletCardsBase.map((card) => (
							<motion.div
								key={card.id}
								variants={itemVariants}
								whileHover={{ y: -5, scale: 1.02 }}
								className={`group relative bg-gradient-to-br ${card.gradient} rounded-3xl p-6 text-white overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 min-h-[240px] flex flex-col`}
							>
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl" />
									<div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
								</div>
								<div className="relative">
									<div className="flex justify-between items-start mb-6">
										<div className="flex items-center gap-3">
											<motion.div
												whileHover={{ scale: 1.1 }}
												className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md"
											>
												<card.icon
													size={22}
													className={card.id === "wallet-1" ? "fill-white" : ""}
												/>
											</motion.div>
											<div>
												<p className="text-sm font-bold">{card.title}</p>
												<p className="text-[10px] opacity-60 tracking-widest font-mono">
													**** **** {card.id.slice(-4)}
												</p>
											</div>
										</div>
										<motion.button
											type="button"
											onClick={toggleBalanceVisibility}
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
											className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
										>
											<Eye
												size={16}
												className={!isBalanceVisible ? "opacity-50" : ""}
											/>
										</motion.button>
									</div>
									<div className="space-y-2 min-w-[140px] mt-auto">
										<p className="text-2xl font-black font-mono">
											{isBalanceVisible 
												? card.id === "wallet-3" 
													? `${formatStUsdc(stUsdcBalance)} stUSDC`
													: `${getCardBalance(card.id, null)} ${card.currency}`
												: "**** ****"}
										</p>
										{card.id === "wallet-2" && walletOverview?.jobEscrowPending && (
											<div className="flex items-center gap-2">
												<span className="px-2 py-0.5 bg-amber-400/30 rounded-full text-[10px] font-bold text-amber-100">
													Pending
												</span>
												<span className="text-[10px] opacity-70">
													{walletOverview.jobEscrowPending} USDC
												</span>
											</div>
										)}
										{card.id === "wallet-3" && (
											<>
												<div className="flex items-center gap-1.5 text-emerald-200 text-xs font-bold">
													<TrendingUp size={14} /> APY: {(Number(currentAPY || BigInt(0)) / 1e16).toFixed(2)}%
												</div>
												{/* {isBalanceVisible && stUsdcBalance && Number(stUsdcBalance) > 0 && (
													<p className="text-xs text-white/70">
														{formatStUsdc(stUsdcBalance)} stUSDC
													</p>
												)} */}
											</>
										)}
										{card.id === "wallet-1" && (
											<div className="flex items-center gap-2 text-emerald-200 text-xs font-bold">
												<TrendingUp size={14} /> +12.5%
											</div>
										)}
									</div>
									{card.id === "wallet-3" && (
										<div className="mt-3 space-y-3">
											<div className="flex gap-2 items-center justify-between">
												<p className="text-[10px] opacity-60 font-mono whitespace-nowrap">
													Updated {walletOverview?.updatedAt || "2026/1/11 21:42:09"}
												</p>
												<div className="flex gap-2">
													<motion.button
														type="button"
														onClick={openStake}
														whileTap={{ scale: 0.95 }}
														className="py-2 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
													>
														<Plus size={14} /> Stake
													</motion.button>
													<motion.button
														type="button"
														onClick={openUnstake}
														whileTap={{ scale: 0.95 }}
														className="py-2 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
													>
														<Minus size={14} /> Unstake
													</motion.button>
												</div>
											</div>
											{Number(claimableRewards || BigInt(0)) > 0 && (
												<motion.button
													type="button"
													onClick={openClaim}
													whileTap={{ scale: 0.95 }}
													className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
												>
													<Zap size={14} /> Claim {formatUsdc(claimableRewards)} USDC
												</motion.button>
											)}
											{Number(claimableRewards || BigInt(0)) === 0 && (
												<p className="w-full py-2.5 text-center text-xs text-white/50">
													Claim 0.00 USDC
												</p>
											)}
											{isInCooldown && (
												<div className="bg-amber-400/20 rounded-xl p-3">
													<div className="flex items-center gap-2 text-amber-200">
														<Clock size={14} />
														<span className="text-xs font-bold">
															Unlocking in {formatTime(Number(remainingTime))}
														</span>
													</div>
													<p className="text-xs text-white/70 mt-1">
														{formatUsdc(pendingAmount)} USDC pending
													</p>
												</div>
											)}
											{canClaim && (
												<motion.button
													type="button"
													onClick={handleClaimWithdraw}
													whileTap={{ scale: 0.95 }}
													className="w-full py-2.5 bg-white text-emerald-600 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
												>
													<Unlock size={14} /> Claim {formatUsdc(pendingAmount)}{" "}
													USDC
												</motion.button>
											)}
										</div>
									)}
									{card.id !== "wallet-3" && (
										<div className="mt-auto pt-4">
											<p className="text-[10px] opacity-60 font-mono">
												Updated {walletOverview?.updatedAt || "2026/1/11 21:42:09"}
											</p>
										</div>
									)}
								</div>
							</motion.div>
						))}
					</motion.div>
				</section>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
						className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6"
					>
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-bold text-slate-900">
								Asset Overview
							</h3>
							<span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
								+5.2% this month
							</span>
						</div>
						<motion.div
							variants={containerVariants}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true }}
							className="space-y-3"
						>
							{assetItems.map((asset) => (
								<motion.div
									key={asset.id}
									variants={itemVariants}
									whileHover={{ scale: 1.02 }}
									className={`flex items-center justify-between p-4 rounded-2xl ${asset.bg} border border-slate-100 cursor-pointer transition-shadow hover:shadow-md`}
								>
									<div className="flex items-center gap-4">
										<motion.div
											whileHover={{ scale: 1.1 }}
											className={`w-11 h-11 rounded-xl bg-white flex items-center justify-center ${asset.color} shadow-sm`}
										>
											<asset.icon size={20} />
										</motion.div>
										<div>
											<p className="font-bold text-slate-900 text-sm">
												{asset.name}
											</p>
											<p className="text-[11px] text-slate-500 font-medium">
												{asset.desc}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-bold text-slate-900 text-sm">
											{asset.val}
										</p>
										<p
											className={`text-xs font-bold ${asset.changeColor || "text-emerald-600"}`}
										>
											{asset.change}
										</p>
									</div>
								</motion.div>
							))}
						</motion.div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 30 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
						className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col"
					>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-bold text-slate-900">Asset Trends</h3>
							<div className="flex bg-slate-100 p-1 rounded-xl">
								{["24h", "7d", "30d"].map((t) => (
									<motion.button
										type="button"
										key={t}
										onClick={() => setTimeFilter(t)}
										whileTap={{ scale: 0.95 }}
										className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${timeFilter === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
									>
										{t}
									</motion.button>
								))}
							</div>
						</div>
						<div className="mb-4">
							<p className="text-2xl font-black text-slate-900 tracking-tight">
								$37,121.25
							</p>
							<div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mt-1">
								<TrendingUp size={14} /> +5.2% (+$1,850.75) this week
							</div>
						</div>
						<div className="flex-1 min-h-[160px]">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={trendData}>
									<defs>
										<linearGradient id="curveColor" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
											<stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
										</linearGradient>
									</defs>
									<Area
										type="monotone"
										dataKey="val"
										stroke="#8b5cf6"
										strokeWidth={2.5}
										fillOpacity={1}
										fill="url(#curveColor)"
										animationDuration={2000}
									/>
									<Tooltip
										contentStyle={{
											border: "none",
											borderRadius: "12px",
											boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
											fontSize: "12px",
											padding: "8px 12px",
										}}
										labelStyle={{ display: "none" }}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</motion.div>
				</div>

				<motion.section
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					viewport={{ once: true }}
					className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6"
				>
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-bold text-slate-900">
							Recent Transactions
						</h3>
						<motion.button
							type="button"
							whileHover={{ x: 5 }}
							className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-bold transition-colors"
						>
							View All <ChevronRight size={16} />
						</motion.button>
					</div>
					<motion.div
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="space-y-3"
					>
						{mockTransactions.map((tx) => (
							<motion.div
								key={tx.id}
								variants={itemVariants}
								whileHover={{ scale: 1.01 }}
								className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer transition-shadow hover:shadow-sm"
							>
								<div className="flex items-center gap-4">
									<motion.div
										whileHover={{ scale: 1.1 }}
										className={`w-11 h-11 rounded-xl flex items-center justify-center ${tx.bg}`}
									>
										<tx.icon size={20} className={tx.col} />
									</motion.div>
									<div>
										<p className="text-sm font-bold text-slate-900">
											{tx.title}
										</p>
										<p className="text-[11px] text-slate-500 font-medium">
											{tx.desc}
										</p>
										<p className="text-[10px] text-slate-400 font-medium mt-0.5">
											{tx.time}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className={`text-base font-bold tracking-tight ${tx.col}`}>
										{tx.amount}
									</p>
									<span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full">
										{tx.status}
									</span>
								</div>
							</motion.div>
						))}
					</motion.div>
				</motion.section>
			</main>

			<Modal
				isOpen={!!modalType}
				onClose={closeModal}
				title={
					modalType === "stake"
						? "Stake Funds"
						: modalType === "unstake"
							? "Unstake Funds"
							: "Claim Rewards"
				}
				subtitle={
					modalType === "stake" ? `Stake to earn ${(Number(currentAPY || BigInt(0)) / 1e16).toFixed(2)}% APY` : undefined
				}
			>
				{modalType === "stake" && (
					<div className="space-y-4">
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<Label
									htmlFor="amount"
									className="text-sm font-medium text-slate-700"
								>
									Stake Amount
								</Label>
							</div>
							<div className="relative">
								<Input
									id="amount"
									type="number"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="0.00"
									className="text-xl font-semibold pr-12"
								/>
								<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
									USDC
								</span>
							</div>
						</div>
						<div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 space-y-2.5 border border-emerald-100">
							<div className="flex justify-between items-center">
								<span className="text-sm text-slate-600">Expected APY</span>
								<span className="text-sm font-semibold text-emerald-700">
									{(Number(currentAPY || BigInt(0)) / 1e16).toFixed(2)}%
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-slate-600">
									Expected monthly return
								</span>
								<span className="text-sm font-semibold text-emerald-700">
									~{calculateMonthlyReturn(amount)} USDC
								</span>
							</div>
						</div>
						<Button
							onClick={handleStake}
							disabled={
								!amount || Number(amount) < 1 || isPending || isConfirming
							}
							className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
						>
							{isPending
								? "Confirming..."
								: isConfirming
									? "Processing..."
									: !allowance || allowance < BigInt(Number(amount) * 1e6)
										? "Approve USDC"
										: "Confirm Stake"}
						</Button>
						<p className="text-xs text-slate-500 text-center">
							Minimum stake: 1 USDC
						</p>
					</div>
				)}
				{modalType === "unstake" && (
					<div className="space-y-4">
						<div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
							<div className="flex items-start gap-3">
								<Clock size={20} className="text-amber-600 mt-0.5" />
								<div>
									<p className="text-sm font-semibold text-amber-800">
										7-Day Unstaking Period
									</p>
									<p className="text-xs text-amber-700 mt-1">
										After requesting unstaking, you must wait 7 days before
										claiming your tokens.
									</p>
								</div>
							</div>
						</div>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<Label
									htmlFor="amount"
									className="text-sm font-medium text-slate-700"
								>
									Unstake Amount
								</Label>
							</div>
							<div className="relative">
								<Input
									id="amount"
									type="number"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="0.00"
									className="text-xl font-semibold pr-12"
								/>
								<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
									USDC
								</span>
							</div>
						</div>
						<Button
							onClick={handleRequestWithdraw}
							disabled={!amount || isPending || isConfirming}
							className="w-full h-12 text-base font-semibold bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600"
						>
							{isPending
								? "Confirming..."
								: isConfirming
									? "Processing..."
									: "Request Unstake"}
						</Button>
					</div>
				)}
				{modalType === "claim" && (
					<div className="space-y-4">
						<div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 text-center">
							<p className="text-sm text-slate-600 mb-2">Available to claim</p>
							<p className="text-4xl font-black text-emerald-700">
								{formatUsdc(claimableRewards)} USDC
							</p>
						</div>
						<Button
							onClick={handleClaimReward}
							disabled={isPending || isConfirming}
							className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
						>
							{isPending
								? "Confirming..."
								: isConfirming
									? "Processing..."
									: "Claim Rewards"}
						</Button>
					</div>
				)}
			</Modal>
		</div>
	)
}

export default Wallet
