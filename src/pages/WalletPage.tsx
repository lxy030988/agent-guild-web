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
import { useAccount } from "wagmi"
import {
	readContract,
	waitForTransactionReceipt,
	writeContract,
} from "wagmi/actions"
import {
	ArrowDownLeft,
	ArrowUpRight,
	Briefcase,
	Coins,
	CreditCard,
	History,
	Lock,
	PiggyBank,
	Star,
	TrendingUp,
	Wallet,
} from "lucide-react"
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
import { CONTRACT_ADDRESSES, config } from "../wagmi.config"

export default function WalletPage() {
	const { address } = useAccount()
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
			const walletAddress = CONTRACT_ADDRESSES[31337].Wallet as `0x${string}`

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
	}, [address])

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
		const data = [
			{
				name: "Agent 收益",
				value: parseFloat(agentEarnings),
				color: "#3b82f6",
			},
			{ name: "Job 托管", value: parseFloat(jobEscrow), color: "#8b5cf6" },
			{ name: "质押奖励", value: parseFloat(stakingRewards), color: "#10b981" },
		]
		// 只要有值就显示，哪怕很小
		return data.filter((item) => item.value > 0)
	}

	// 格式化显示金额
	const formatDisplayBalance = (amount: string) => {
		const val = parseFloat(amount)
		if (val === 0) return "0"
		if (val < 0.000001) return "< 0.000001"
		return val.toLocaleString("en-US", { maximumFractionDigits: 6 })
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
			const walletAddress = CONTRACT_ADDRESSES[31337].Wallet as `0x${string}`

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
			const walletAddress = CONTRACT_ADDRESSES[31337].Wallet as `0x${string}`
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
			const walletAddress = CONTRACT_ADDRESSES[31337].Wallet as `0x${string}`
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

	// 交易类型配置
	const getTransactionConfig = (type: string) => {
		const config: Record<string, { color: string, icon: any }> = {
			JOB_PAYMENT: { color: "text-green-600 bg-green-100", icon: Briefcase },
			PLATFORM_FEE: { color: "text-orange-600 bg-orange-100", icon: CreditCard },
			REFUND: { color: "text-blue-600 bg-blue-100", icon: ArrowDownLeft },
			STAKING_REWARD: { color: "text-purple-600 bg-purple-100", icon: Coins },
			WITHDRAWAL: { color: "text-gray-600 bg-gray-100", icon: ArrowUpRight },
		}
		return config[type] || { color: "text-gray-600 bg-gray-100", icon: History }
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
				<div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
							<Wallet className="w-8 h-8 text-blue-600" />
							我的钱包
						</h1>
						<p className="mt-2 text-gray-600">
							管理您的资产、收益和交易记录
						</p>
					</div>
					<div className="flex gap-3">
						<Button onClick={() => loadAllData()} variant="outline" size="sm">
							<History className="w-4 h-4 mr-2" />
							刷新数据
						</Button>
					</div>
				</div>

				{/* 资产概览卡片 */}
				{overview && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg border-0">
							<CardHeader className="pb-2">
								<CardDescription className="text-blue-100 flex items-center gap-2">
									<Coins className="w-4 h-4" />
									总收益
								</CardDescription>
								<CardTitle className="text-3xl font-bold tracking-tight">
									{overview.totalEarnings} <span className="text-lg font-normal opacity-80">ETH</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-sm text-blue-100 opacity-80">
									累计获得的所有收益
								</div>
							</CardContent>
						</Card>

						<Card className="shadow-md hover:shadow-lg transition-shadow border-blue-100">
							<CardHeader className="pb-2">
								<CardDescription className="flex items-center gap-2 text-gray-500">
									<History className="w-4 h-4" />
									待结算
								</CardDescription>
								<CardTitle className="text-2xl font-bold text-gray-900">
									{overview.pendingEarnings} <span className="text-sm font-normal text-gray-500">ETH</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-sm text-gray-500">
									预计即将到账的收益
								</div>
							</CardContent>
						</Card>

						<Card className="shadow-md hover:shadow-lg transition-shadow border-purple-100">
							<CardHeader className="pb-2">
								<CardDescription className="flex items-center gap-2 text-gray-500">
									<Briefcase className="w-4 h-4" />
									完成任务
								</CardDescription>
								<CardTitle className="text-2xl font-bold text-gray-900">
									{overview.totalJobs} <span className="text-sm font-normal text-gray-500">个</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-sm text-gray-500">
									累计完成的任务数量
								</div>
							</CardContent>
						</Card>

						<Card className="shadow-md hover:shadow-lg transition-shadow border-yellow-100">
							<CardHeader className="pb-2">
								<CardDescription className="flex items-center gap-2 text-gray-500">
									<Star className="w-4 h-4" />
									平均评分
								</CardDescription>
								<CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
									{overview.averageRating}
									<div className="flex text-yellow-400 text-lg">
										{"★".repeat(Math.round(parseFloat(overview.averageRating)))}
										<span className="text-gray-200">
											{"★".repeat(5 - Math.round(parseFloat(overview.averageRating)))}
										</span>
									</div>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-sm text-gray-500">
									基于历史任务的平均评分
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* 三个钱包卡片 */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
					{/* Agent 收益钱包 - 从链上读取 */}
					<Card className="border border-blue-100 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
						<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
							<CreditCard className="w-24 h-24 text-blue-600 transform rotate-12" />
						</div>
						<CardHeader>
							<div className="flex items-center justify-between relative z-10">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
										<CreditCard className="w-6 h-6 text-blue-600" />
									</div>
									<div>
										<CardTitle className="text-lg font-semibold">Agent 收益</CardTitle>
										<CardDescription>链上余额</CardDescription>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent className="relative z-10">
							<div className="space-y-6">
								<div>
									<div title={`${agentEarnings} ETH`}>
										<p className="text-4xl font-bold text-gray-900 tracking-tight">
											{formatDisplayBalance(agentEarnings)}{" "}
											<span className="text-xl font-medium text-gray-500">ETH</span>
										</p>
									</div>
									<p className="text-sm text-gray-500 mt-1">
										任务完成后的直接收益
									</p>
								</div>
								<Button
									className="w-full bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg"
									onClick={() => handleWithdraw("earnings")}
									disabled={parseFloat(agentEarnings) === 0}
								>
									<ArrowUpRight className="w-4 h-4 mr-2" />
									提现到钱包
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Job 托管资金（只读） - 从数据库读取 */}
					<Card className="border border-purple-100 shadow-md bg-purple-50/50 hover:bg-purple-50 transition-colors relative overflow-hidden">
						<div className="absolute top-0 right-0 p-4 opacity-5">
							<Lock className="w-24 h-24 text-purple-600 transform -rotate-12" />
						</div>
						<CardHeader>
							<div className="flex items-center justify-between relative z-10">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center border border-purple-200">
										<Lock className="w-6 h-6 text-purple-600" />
									</div>
									<div>
										<CardTitle className="text-lg font-semibold">Job 托管</CardTitle>
										<CardDescription>数据库统计</CardDescription>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent className="relative z-10">
							<div className="space-y-6">
								<div>
									<div title={`${jobEscrow} ETH`}>
										<p className="text-4xl font-bold text-gray-900 tracking-tight">
											{formatDisplayBalance(jobEscrow)}{" "}
											<span className="text-xl font-medium text-gray-500">ETH</span>
										</p>
									</div>
									<p className="text-sm text-gray-500 mt-1">
										作为 Job Owner 托管中的资金
									</p>
								</div>
								<Button
									className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200"
									disabled
								>
									<Lock className="w-4 h-4 mr-2" />
									由智能合约管理
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* 质押奖励钱包 - 从链上读取 */}
					<Card className="border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
						<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
							<PiggyBank className="w-24 h-24 text-green-600 transform rotate-6" />
						</div>
						<CardHeader>
							<div className="flex items-center justify-between relative z-10">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
										<PiggyBank className="w-6 h-6 text-green-600" />
									</div>
									<div>
										<CardTitle className="text-lg font-semibold">质押奖励</CardTitle>
										<CardDescription>链上余额</CardDescription>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent className="relative z-10">
							<div className="space-y-4">
								<div className="flex justify-between items-end">
									<div>
										<p className="text-sm text-gray-500 mb-1">待领取奖励</p>
										<div title={`${stakingRewards} ETH`}>
											<p className="text-3xl font-bold text-gray-900">
												{formatDisplayBalance(stakingRewards)}{" "}
												<span className="text-base font-medium text-gray-500">ETH</span>
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-sm text-gray-500 mb-1">已质押本金</p>
										<p className="text-xl font-bold text-blue-600">
											{stakedAmount} ETH
										</p>
									</div>
								</div>
								
								<Button
									className="w-full bg-green-600 hover:bg-green-700 shadow-green-200 shadow-lg"
									onClick={() => handleWithdraw("rewards")}
									disabled={parseFloat(stakingRewards) === 0}
								>
									<Coins className="w-4 h-4 mr-2" />
									提取奖励
								</Button>
								<div className="grid grid-cols-2 gap-3">
									<Button
										variant="outline"
										className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
										onClick={() => setShowStakeDialog(true)}
									>
										<ArrowDownLeft className="w-4 h-4 mr-2" />
										质押
									</Button>
									<Button
										variant="outline"
										className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
										onClick={() => setShowUnstakeDialog(true)}
										disabled={parseFloat(stakedAmount) === 0}
									>
										<ArrowUpRight className="w-4 h-4 mr-2" />
										取回
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* 资产分布饼图 */}
					<Card className="shadow-md border-gray-100">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Coins className="w-5 h-5 text-blue-500" />
								资产分布
							</CardTitle>
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
											innerRadius={60}
											outerRadius={80}
											paddingAngle={5}
											minAngle={3}
											dataKey="value"
										>
											{getPieChartData().map((entry, index) => (
												<Cell
													key={`cell-${entry.name}-${index}`}
													fill={entry.color}
												/>
											))}
										</Pie>
										<Tooltip 
											formatter={(value: number) => `${value.toFixed(6)} ETH`}
											contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
										/>
										<Legend verticalAlign="bottom" height={36}/>
									</PieChart>
								</ResponsiveContainer>
							) : (
								<div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
									<Coins className="w-12 h-12 mb-2 opacity-20" />
									<p>暂无资产数据</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* 资产趋势图 */}
					<Card className="shadow-md border-gray-100">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendingUp className="w-5 h-5 text-green-500" />
								资产趋势
							</CardTitle>
							<CardDescription>最近 30 天收益累计</CardDescription>
						</CardHeader>
						<CardContent>
							{getTrendChartData().length > 0 ? (
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={getTrendChartData()}>
										<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
										<XAxis 
											dataKey="date" 
											axisLine={false}
											tickLine={false}
											tick={{ fill: '#9ca3af', fontSize: 12 }}
											dy={10}
										/>
										<YAxis 
											axisLine={false}
											tickLine={false}
											tick={{ fill: '#9ca3af', fontSize: 12 }}
										/>
										<Tooltip 
											formatter={(value) => `${value} ETH`}
											contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
										/>
										<Line
											type="monotone"
											dataKey="amount"
											stroke="#3b82f6"
											strokeWidth={3}
											name="累计收益"
											dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4, stroke: "#fff" }}
											activeDot={{ r: 6, strokeWidth: 0 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							) : (
								<div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
									<TrendingUp className="w-12 h-12 mb-2 opacity-20" />
									<p>暂无趋势数据</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* 交易历史 */}
				<Card className="shadow-md border-gray-100 overflow-hidden">
					<CardHeader className="border-b border-gray-50 bg-gray-50/50">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<History className="w-5 h-5 text-purple-500" />
									交易历史
								</CardTitle>
								<CardDescription>最近的交易记录</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						{transactions.length > 0 ? (
							<div className="divide-y divide-gray-100">
								{/* 表头 */}
								<div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50/30 text-xs font-semibold text-gray-500 uppercase tracking-wider">
									<div className="col-span-2">类型</div>
									<div className="col-span-2">金额</div>
									<div className="col-span-4">描述</div>
									<div className="col-span-2">交易哈希</div>
									<div className="col-span-2 text-right">时间</div>
								</div>

								{/* 交易列表 */}
								{transactions.map((tx) => (
									<div
										key={tx.id}
										className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-blue-50/30 transition-colors items-center group"
									>
										<div className="md:col-span-2 flex items-center gap-3">
											{(() => {
												const { color, icon: Icon } = getTransactionConfig(tx.type)
												return (
													<div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
														<Icon className="w-4 h-4" />
													</div>
												)
											})()}
											<span className="font-medium text-gray-900 md:hidden">
												{getTransactionTypeName(tx.type)}
											</span>
											<span className="hidden md:inline-block text-sm font-medium text-gray-700">
												{getTransactionTypeName(tx.type)}
											</span>
										</div>
										<div className="md:col-span-2 font-bold text-gray-900">
											{tx.amount} <span className="text-xs font-normal text-gray-500">{tx.currency}</span>
										</div>
										<div className="md:col-span-4 text-sm text-gray-600 line-clamp-1">
											{tx.description}
										</div>
										<div className="md:col-span-2">
											{tx.txHash ? (
												<a
													href={`https://etherscan.io/tx/${tx.txHash}`}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:text-blue-800 text-xs font-mono bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors inline-block"
												>
													{tx.txHash.substring(0, 6)}...{tx.txHash.substring(tx.txHash.length - 4)}
												</a>
											) : (
												<span className="text-gray-300 text-xs">-</span>
											)}
										</div>
										<div className="md:col-span-2 text-sm text-gray-500 md:text-right">
											{new Date(tx.createdAt).toLocaleDateString("zh-CN", {
												year: 'numeric',
												month: '2-digit',
												day: '2-digit',
												hour: '2-digit',
												minute: '2-digit'
											})}
										</div>
									</div>
								))}

								{/* 分页 */}
								{transactionTotal > 10 && (
									<div className="flex items-center justify-center gap-4 p-4 border-t border-gray-100 bg-gray-50/30">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												setTransactionPage((p) => Math.max(1, p - 1))
											}
											disabled={transactionPage === 1}
										>
											上一页
										</Button>
										<span className="text-sm text-gray-600 font-medium">
											第 {transactionPage} 页
										</span>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setTransactionPage((p) => p + 1)}
											disabled={transactions.length < 10}
										>
											下一页
										</Button>
									</div>
								)}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-16 text-gray-400">
								<History className="w-12 h-12 mb-3 opacity-20" />
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
