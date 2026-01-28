import { useCallback, useEffect, useState } from "react"
import {
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
import { toast } from "sonner"
import { formatEther, parseEther } from "viem"
import { useAccount, useChainId } from "wagmi"
import {
	readContract,
	waitForTransactionReceipt,
	writeContract,
} from "wagmi/actions"
import { WALLET_ABI } from "../abis/Wallet"
import { Button } from "../components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
	type AssetTrend,
	type Transaction,
	type WalletOverview,
	walletApi,
} from "../utils/wallet-api"
import { config, getContractAddress } from "../wagmi.config"

export default function WalletPage() {
	const { address } = useAccount()
	const chainId = useChainId()
	const [overview, setOverview] = useState<WalletOverview | null>(null)

	// 从合约读取的余额（链上数据）
	const [agentEarnings, setAgentEarnings] = useState("0")
	const [stakingRewards, setStakingRewards] = useState("0")
	const [stakedAmount, setStakedAmount] = useState("0")

	// 从数据库读取的 Job Escrow
	const [jobEscrow, setJobEscrow] = useState("0")

	const [transactions, setTransactions] = useState<Transaction[]>([])
	const [trends, setTrends] = useState<AssetTrend[]>([])
	const [loading, setLoading] = useState(true)
	const [transactionPage, setTransactionPage] = useState(1)
	const [transactionTotal, setTransactionTotal] = useState(0)

	// 提现相关状态
	const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
	const [withdrawSource, setWithdrawSource] = useState<"earnings" | "rewards">(
		"earnings",
	)
	const [withdrawAmount, setWithdrawAmount] = useState("")
	const [withdrawing, setWithdrawing] = useState(false)

	// 质押相关状态
	const [showStakeDialog, setShowStakeDialog] = useState(false)
	const [showUnstakeDialog, setShowUnstakeDialog] = useState(false)
	const [stakeAmount, setStakeAmount] = useState("")
	const [unstakeAmount, setUnstakeAmount] = useState("")
	const [staking, setStaking] = useState(false)

	// 从合约读取余额
	const loadContractBalances = useCallback(async () => {
		if (!address) return

		try {
			const walletAddress = getContractAddress("Wallet", chainId) as `0x${string}`
			if (!walletAddress) {
				console.error("Wallet contract address not found for chainId:", chainId)
				return
			}

			// 读取合约余额
			const balance = (await readContract(config, {
				address: walletAddress,
				abi: WALLET_ABI,
				functionName: "getBalance",
				args: [address],
			})) as {
				agentEarnings: bigint
				stakingRewards: bigint
				stakedAmount: bigint
			}

			setAgentEarnings(formatEther(balance.agentEarnings))
			setStakingRewards(formatEther(balance.stakingRewards))
			setStakedAmount(formatEther(balance.stakedAmount))
		} catch (error) {
			console.error("Failed to load contract balances:", error)
			toast.error("加载链上余额失败")
		}
	}, [address, chainId])

	const loadAllData = useCallback(async () => {
		try {
			setLoading(true)
			const [overviewData, earningsData, transactionsData, trendsData] =
				await Promise.all([
					walletApi.getOverview(),
					walletApi.getEarnings(),
					walletApi.getTransactions(1, 10),
					walletApi.getTrends(30),
				])

			setOverview(overviewData)
			setJobEscrow(earningsData.jobEscrow) // Job Escrow 仍从数据库读取
			setTransactions(transactionsData.items)
			setTransactionTotal(transactionsData.total)
			setTrends(trendsData)

			// 读取合约余额
			await loadContractBalances()
		} catch (error) {
			console.error("Failed to load wallet data:", error)
			toast.error("加载钱包数据失败")
		} finally {
			setLoading(false)
		}
	}, [loadContractBalances])

	// 加载数据
	useEffect(() => {
		if (address) {
			loadAllData()
		}
	}, [address, loadAllData])

	// 准备饼图数据
	const getPieChartData = () => {
		return [
			{
				name: "Agent 收益",
				value: parseFloat(agentEarnings),
				color: "#3b82f6",
			},
			{ name: "Job 托管", value: parseFloat(jobEscrow), color: "#8b5cf6" },
			{ name: "质押奖励", value: parseFloat(stakingRewards), color: "#10b981" },
		].filter((item) => item.value > 0)
	}

	// 准备趋势图数据
	const getTrendChartData = () => {
		return trends.map((trend) => ({
			date: new Date(trend.date).toLocaleDateString("zh-CN", {
				month: "2-digit",
				day: "2-digit",
			}),
			amount: parseFloat(trend.amount),
		}))
	}

	// 打开提现对话框
	const handleWithdraw = (walletType: "earnings" | "rewards") => {
		setWithdrawSource(walletType)
		setWithdrawAmount("")
		setShowWithdrawDialog(true)
	}

	// 执行提现
	const executeWithdraw = async () => {
		if (!address || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
			toast.error("请输入有效的提现金额")
			return
		}

		// 验证金额不超过可用余额
		const availableBalance =
			withdrawSource === "earnings"
				? parseFloat(agentEarnings)
				: parseFloat(stakingRewards)
		if (parseFloat(withdrawAmount) > availableBalance) {
			toast.error(`提现金额不能超过可用余额 ${availableBalance.toFixed(4)} ETH`)
			return
		}

		try {
			setWithdrawing(true)
			const walletAddress = getContractAddress("Wallet", chainId) as `0x${string}`

			// 转换为 Wei
			const amountInWei = parseEther(withdrawAmount)

			// 调用合约 withdraw 方法
			toast.info("正在发起提现交易...")

			const hash = await writeContract(config, {
				address: walletAddress,
				abi: WALLET_ABI,
				functionName: "withdraw",
				args: [amountInWei, withdrawSource],
			})

			toast.info("等待交易确认...")

			await waitForTransactionReceipt(config, {
				hash,
				timeout: 60_000,
			})

			toast.success(`成功提现 ${withdrawAmount} ETH！`)
			setShowWithdrawDialog(false)
			setWithdrawAmount("")

			// 刷新余额
			await loadContractBalances()
		} catch (error: unknown) {
			console.error("Withdraw error:", error)
			toast.error((error as Error).message || "提现失败")
		} finally {
			setWithdrawing(false)
		}
	}

	// 质押 ETH
	const executeStake = async () => {
		if (!address || !stakeAmount || parseFloat(stakeAmount) <= 0) {
			toast.error("请输入有效的质押金额")
			return
		}

		try {
			setStaking(true)
			const walletAddress = getContractAddress("Wallet", chainId) as `0x${string}`
			const amountInWei = parseEther(stakeAmount)

			toast.info("正在发起质押交易...")

			const hash = await writeContract(config, {
				address: walletAddress,
				abi: WALLET_ABI,
				functionName: "stake",
				value: amountInWei,
			})

			toast.info("等待交易确认...")

			await waitForTransactionReceipt(config, {
				hash,
				timeout: 60_000,
			})

			toast.success(`成功质押 ${stakeAmount} ETH！`)
			setShowStakeDialog(false)
			setStakeAmount("")
			await loadContractBalances()
		} catch (error: unknown) {
			console.error("Stake error:", error)
			toast.error((error as Error).message || "质押失败")
		} finally {
			setStaking(false)
		}
	}

	// 取消质押
	const executeUnstake = async () => {
		if (!address || !unstakeAmount || parseFloat(unstakeAmount) <= 0) {
			toast.error("请输入有效的取消质押金额")
			return
		}

		const staked = parseFloat(stakedAmount)
		if (parseFloat(unstakeAmount) > staked) {
			toast.error(`取消质押金额不能超过已质押金额 ${staked.toFixed(4)} ETH`)
			return
		}

		try {
			setStaking(true)
			const walletAddress = getContractAddress("Wallet", chainId) as `0x${string}`
			const amountInWei = parseEther(unstakeAmount)

			toast.info("正在发起取消质押交易...")

			const hash = await writeContract(config, {
				address: walletAddress,
				abi: WALLET_ABI,
				functionName: "unstake",
				args: [amountInWei],
			})

			toast.info("等待交易确认...")

			await waitForTransactionReceipt(config, {
				hash,
				timeout: 60_000,
			})

			toast.success(`成功取消质押 ${unstakeAmount} ETH！`)
			setShowUnstakeDialog(false)
			setUnstakeAmount("")
			await loadContractBalances()
		} catch (error: unknown) {
			console.error("Unstake error:", error)
			toast.error((error as Error).message || "取消质押失败")
		} finally {
			setStaking(false)
		}
	}

	// 交易类型标签颜色
	const getTransactionTypeColor = (type: string) => {
		const colors: Record<string, string> = {
			JOB_PAYMENT: "bg-green-100 text-green-800",
			PLATFORM_FEE: "bg-yellow-100 text-yellow-800",
			REFUND: "bg-blue-100 text-blue-800",
			STAKING_REWARD: "bg-purple-100 text-purple-800",
			WITHDRAWAL: "bg-gray-100 text-gray-800",
		}
		return colors[type] || "bg-gray-100 text-gray-800"
	}

	// 交易类型中文名
	const getTransactionTypeName = (type: string) => {
		const names: Record<string, string> = {
			JOB_PAYMENT: "任务收益",
			PLATFORM_FEE: "平台费用",
			REFUND: "退款",
			STAKING_REWARD: "质押奖励",
			WITHDRAWAL: "提现",
		}
		return names[type] || type
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 pt-20 pb-12 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 pt-20 pb-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">我的钱包</h1>
					<p className="mt-2 text-gray-600">管理您的资产和交易记录</p>
				</div>

				{/* 资产概览卡片 */}
				{overview && (
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
							<CardHeader>
								<CardDescription className="text-blue-100">
									总收益
								</CardDescription>
								<CardTitle className="text-3xl">
									{overview.totalEarnings} ETH
								</CardTitle>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<CardDescription>待结算</CardDescription>
								<CardTitle className="text-2xl">
									{overview.pendingEarnings} ETH
								</CardTitle>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<CardDescription>完成任务</CardDescription>
								<CardTitle className="text-2xl">{overview.totalJobs}</CardTitle>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<CardDescription>平均评分</CardDescription>
								<CardTitle className="text-2xl flex items-center gap-2">
									{overview.averageRating}
									<span className="text-yellow-500">⭐</span>
								</CardTitle>
							</CardHeader>
						</Card>
					</div>
				)}

				{/* 三个钱包卡片 */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					{/* Agent 收益钱包 - 从链上读取 */}
					<Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
										<span className="text-2xl">💰</span>
									</div>
									<div>
										<CardTitle className="text-lg">Agent 收益</CardTitle>
										<CardDescription>链上余额</CardDescription>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<p className="text-3xl font-bold text-gray-900">
										{agentEarnings}{" "}
										<span className="text-xl text-gray-500">ETH</span>
									</p>
								</div>
								<Button
									className="w-full bg-blue-600 hover:bg-blue-700"
									onClick={() => handleWithdraw("earnings")}
									disabled={parseFloat(agentEarnings) === 0}
								>
									提现到钱包
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Job 托管资金（只读） - 从数据库读取 */}
					<Card className="border-2 border-purple-200 bg-purple-50">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
										<span className="text-2xl">🔒</span>
									</div>
									<div>
										<CardTitle className="text-lg">Job 托管</CardTitle>
										<CardDescription>数据库统计</CardDescription>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<p className="text-3xl font-bold text-gray-900">
										{jobEscrow}{" "}
										<span className="text-xl text-gray-500">ETH</span>
									</p>
								</div>
								<Button
									className="w-full bg-purple-600 hover:bg-purple-700"
									disabled
								>
									由智能合约管理
								</Button>
								<p className="text-xs text-gray-500 text-center">
									显示您作为 Job Owner 托管的资金
								</p>
							</div>
						</CardContent>
					</Card>

					{/* 质押奖励钱包 - 从链上读取 */}
					<Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
										<span className="text-2xl">🎁</span>
									</div>
									<div>
										<CardTitle className="text-lg">质押奖励</CardTitle>
										<CardDescription>链上余额</CardDescription>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<p className="text-sm text-gray-600 mb-1">奖励余额</p>
									<p className="text-3xl font-bold text-gray-900">
										{stakingRewards}{" "}
										<span className="text-xl text-gray-500">ETH</span>
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600 mb-1">已质押金额</p>
									<p className="text-2xl font-bold text-blue-600">
										{stakedAmount}{" "}
										<span className="text-lg text-gray-500">ETH</span>
									</p>
								</div>
								<Button
									className="w-full bg-green-600 hover:bg-green-700"
									onClick={() => handleWithdraw("rewards")}
									disabled={parseFloat(stakingRewards) === 0}
								>
									提现奖励
								</Button>
								<div className="grid grid-cols-2 gap-2">
									<Button
										variant="outline"
										className="border-blue-500 text-blue-600 hover:bg-blue-50"
										onClick={() => setShowStakeDialog(true)}
									>
										质押 ETH
									</Button>
									<Button
										variant="outline"
										className="border-orange-500 text-orange-600 hover:bg-orange-50"
										onClick={() => setShowUnstakeDialog(true)}
										disabled={parseFloat(stakedAmount) === 0}
									>
										取消质押
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* 资产分布饼图 */}
					<Card>
						<CardHeader>
							<CardTitle>资产分布</CardTitle>
							<CardDescription>各钱包资产占比</CardDescription>
						</CardHeader>
						<CardContent>
							{getPieChartData().length > 0 ? (
								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={getPieChartData()}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ name, percent }) =>
												`${name} ${((percent || 0) * 100).toFixed(0)}%`
											}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
										>
											{getPieChartData().map((entry, index) => (
												<Cell
													key={`cell-${entry.name}-${index}`}
													fill={entry.color}
												/>
											))}
										</Pie>
										<Tooltip formatter={(value) => `${value} ETH`} />
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							) : (
								<div className="h-64 flex items-center justify-center text-gray-400">
									<p>暂无资产数据</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* 资产趋势图 */}
					<Card>
						<CardHeader>
							<CardTitle>资产趋势</CardTitle>
							<CardDescription>最近 30 天收益累计</CardDescription>
						</CardHeader>
						<CardContent>
							{getTrendChartData().length > 0 ? (
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={getTrendChartData()}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="date" />
										<YAxis />
										<Tooltip formatter={(value) => `${value} ETH`} />
										<Legend />
										<Line
											type="monotone"
											dataKey="amount"
											stroke="#3b82f6"
											strokeWidth={2}
											name="累计收益"
											dot={{ fill: "#3b82f6" }}
										/>
									</LineChart>
								</ResponsiveContainer>
							) : (
								<div className="h-64 flex items-center justify-center text-gray-400">
									<p>暂无趋势数据</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* 交易历史 */}
				<Card>
					<CardHeader>
						<CardTitle>交易历史</CardTitle>
						<CardDescription>最近的交易记录</CardDescription>
					</CardHeader>
					<CardContent>
						{transactions.length > 0 ? (
							<div className="space-y-4">
								{/* 表头 */}
								<div className="hidden md:grid grid-cols-12 gap-4 pb-2 border-b font-medium text-gray-500">
									<div className="col-span-2">类型</div>
									<div className="col-span-2">金额</div>
									<div className="col-span-4">描述</div>
									<div className="col-span-2">交易哈希</div>
									<div className="col-span-2">时间</div>
								</div>

								{/* 交易列表 */}
								{transactions.map((tx) => (
									<div
										key={tx.id}
										className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 border-b last:border-b-0 hover:bg-gray-50 rounded-lg transition-colors"
									>
										<div className="md:col-span-2">
											<span
												className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(tx.type)}`}
											>
												{getTransactionTypeName(tx.type)}
											</span>
										</div>
										<div className="md:col-span-2 font-semibold">
											{tx.amount} {tx.currency}
										</div>
										<div className="md:col-span-4 text-gray-600">
											{tx.description}
										</div>
										<div className="md:col-span-2">
											{tx.txHash ? (
												<a
													href={`https://etherscan.io/tx/${tx.txHash}`}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:text-blue-800 text-sm truncate block"
												>
													{tx.txHash.substring(0, 10)}...
												</a>
											) : (
												<span className="text-gray-400 text-sm">-</span>
											)}
										</div>
										<div className="md:col-span-2 text-sm text-gray-500">
											{new Date(tx.createdAt).toLocaleDateString("zh-CN")}
										</div>
									</div>
								))}

								{/* 分页 */}
								{transactionTotal > 10 && (
									<div className="flex items-center justify-center gap-4 pt-4">
										<Button
											variant="outline"
											onClick={() =>
												setTransactionPage((p) => Math.max(1, p - 1))
											}
											disabled={transactionPage === 1}
										>
											上一页
										</Button>
										<span className="text-gray-600">
											第 {transactionPage} 页
										</span>
										<Button
											variant="outline"
											onClick={() => setTransactionPage((p) => p + 1)}
											disabled={transactions.length < 10}
										>
											下一页
										</Button>
									</div>
								)}
							</div>
						) : (
							<div className="text-center py-12 text-gray-400">
								<p>暂无交易记录</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* 提现对话框 */}
				<Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>提现到钱包</DialogTitle>
							<DialogDescription>
								从 {withdrawSource === "earnings" ? "Agent 收益" : "质押奖励"}{" "}
								提现到您的个人钱包
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							<div>
								<Label htmlFor="amount">提现金额 (ETH)</Label>
								<Input
									id="amount"
									type="number"
									placeholder="0.0"
									step="0.01"
									min="0"
									value={withdrawAmount}
									onChange={(e) => setWithdrawAmount(e.target.value)}
									className="mt-2"
								/>
								<p className="text-sm text-gray-500 mt-2">
									可用余额:{" "}
									{withdrawSource === "earnings"
										? agentEarnings
										: stakingRewards}{" "}
									ETH
								</p>
							</div>
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowWithdrawDialog(false)}
								disabled={withdrawing}
							>
								取消
							</Button>
							<Button onClick={executeWithdraw} disabled={withdrawing}>
								{withdrawing ? "处理中..." : "确认提现"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				{/* 质押对话框 */}
				<Dialog open={showStakeDialog} onOpenChange={setShowStakeDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>质押 ETH</DialogTitle>
							<DialogDescription>质押 ETH 以赚取质押奖励</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div>
								<Label htmlFor="stakeAmount">质押金额 (ETH)</Label>
								<Input
									id="stakeAmount"
									type="number"
									placeholder="0.0"
									step="0.01"
									min="0"
									value={stakeAmount}
									onChange={(e) => setStakeAmount(e.target.value)}
									className="mt-2"
								/>
								<p className="text-sm text-gray-500 mt-2">
									最小质押金额: 0.01 ETH
								</p>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowStakeDialog(false)}
								disabled={staking}
							>
								取消
							</Button>
							<Button onClick={executeStake} disabled={staking}>
								{staking ? "处理中..." : "确认质押"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				{/* 取消质押对话框 */}
				<Dialog open={showUnstakeDialog} onOpenChange={setShowUnstakeDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>取消质押</DialogTitle>
							<DialogDescription>从质押池中取回您的 ETH</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div>
								<Label htmlFor="unstakeAmount">取消质押金额 (ETH)</Label>
								<Input
									id="unstakeAmount"
									type="number"
									placeholder="0.0"
									step="0.01"
									min="0"
									value={unstakeAmount}
									onChange={(e) => setUnstakeAmount(e.target.value)}
									className="mt-2"
								/>
								<p className="text-sm text-gray-500 mt-2">
									已质押金额: {stakedAmount} ETH
								</p>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowUnstakeDialog(false)}
								disabled={staking}
							>
								取消
							</Button>
							<Button onClick={executeUnstake} disabled={staking}>
								{staking ? "处理中..." : "确认取消质押"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}
