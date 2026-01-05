import { useEffect, useState } from "react"
import {
	useAccount,
	useChainId,
	useConnect,
	useDisconnect,
	useReadContract,
	useWaitForTransactionReceipt,
	useWriteContract,
} from "wagmi"
import { SIMPLE_STORAGE_ABI } from "@/abis/SimpleStorage"
import { getContractAddress } from "@/wagmi.config"

const ContractDemo = () => {
	const [inputValue, setInputValue] = useState("")
	const { address, isConnected } = useAccount()
	const { connect, connectors } = useConnect()
	const { disconnect } = useDisconnect()
	const chainId = useChainId()

	// 动态获取合约地址
	const CONTRACT_ADDRESS = getContractAddress(
		"SimpleStorage",
		chainId,
	) as `0x${string}`

	// 调试信息
	console.log("🔍 Debug Info:", {
		chainId,
		contractAddress: CONTRACT_ADDRESS,
		isConnected,
		address,
	})

	// 读取合约当前值
	const {
		data: currentValue,
		isLoading: isReading,
		refetch,
		error: readError,
	} = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: SIMPLE_STORAGE_ABI,
		functionName: "get",
	})

	// 写入合约
	const {
		data: hash,
		isPending,
		writeContract,
		error: writeError,
	} = useWriteContract()

	// 等待交易确认
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
		hash,
	})

	const handleSetValue = async () => {
		if (!inputValue || Number.isNaN(Number(inputValue))) {
			alert("请输入有效的数字")
			return
		}

		try {
			writeContract({
				address: CONTRACT_ADDRESS,
				abi: SIMPLE_STORAGE_ABI,
				functionName: "set",
				args: [BigInt(inputValue)],
			})
		} catch (error) {
			console.error("Error setting value:", error)
		}
	}

	// 交易成功后刷新数据并清空输入
	useEffect(() => {
		if (isSuccess && !isConfirming) {
			refetch()
			setInputValue("")
		}
	}, [isSuccess, isConfirming, refetch])

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						📝 SimpleStorage{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
							合约演示
						</span>
					</h1>
					<p className="text-lg text-gray-600">使用 Wagmi 与智能合约交互</p>
				</div>

				{/* Wallet Connection */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						🔌 钱包连接
					</h2>

					{!isConnected ? (
						<div className="space-y-3">
							<p className="text-gray-600 mb-4">请先连接钱包以使用合约功能</p>
							{connectors.map((connector) => (
								<button
									key={connector.uid}
									type="button"
									onClick={() => connect({ connector })}
									className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
								>
									🦊 连接 {connector.name}
								</button>
							))}
						</div>
					) : (
						<div className="space-y-4">
							<div className="bg-green-50 border border-green-200 rounded-xl p-4">
								<p className="text-green-800 font-medium mb-2">✅ 钱包已连接</p>
								<p className="text-sm text-gray-700 font-mono break-all">
									{address}
								</p>
							</div>
							<button
								type="button"
								onClick={() => disconnect()}
								className="w-full px-6 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-all duration-200"
							>
								🔌 断开连接
							</button>
						</div>
					)}

					<div className="mt-4 pt-4 border-t border-gray-200">
						<p className="text-sm text-gray-600">
							<span className="font-medium">合约地址：</span>
						</p>
						<p className="text-xs font-mono text-gray-500 break-all mt-1">
							{CONTRACT_ADDRESS}
						</p>
					</div>
				</div>

				{/* Read Value */}
				<div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
					<h2 className="text-2xl font-semibold text-gray-900 mb-6">
						📖 读取存储值
					</h2>
					<div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-8 text-center">
						{isReading ? (
							<p className="text-gray-600">加载中...</p>
						) : (
							<>
								<p className="text-sm text-gray-600 mb-2">当前存储的值</p>
								<p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
									{currentValue !== undefined
										? currentValue.toString()
										: "未读取"}
								</p>
							</>
						)}
					</div>
					<button
						type="button"
						onClick={() => refetch()}
						disabled={isReading}
						className="mt-4 w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						🔄 刷新数据
					</button>

					{/* Read Error Display */}
					{readError && (
						<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
							<p className="text-red-800 font-medium mb-2">❌ 读取错误</p>
							<p className="text-sm text-red-600">{readError.message}</p>
						</div>
					)}

					{/* Debug Info */}
					{!CONTRACT_ADDRESS && (
						<div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
							<p className="text-yellow-800 font-medium mb-2">
								⚠️ 未找到合约地址
							</p>
							<p className="text-sm text-yellow-700">当前链 ID: {chainId}</p>
							<p className="text-sm text-yellow-700 mt-1">请确保：</p>
							<ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
								<li>已连接到 Localhost 8545 (Chain ID: 31337)</li>
								<li>在 wagmi.config.ts 中配置了该链的合约地址</li>
							</ul>
						</div>
					)}
				</div>

				{/* Write Value */}
				<div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
					<h2 className="text-2xl font-semibold text-gray-900 mb-6">
						✍️ 写入新值
					</h2>

					{!isConnected ? (
						<div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
							<p className="text-yellow-800 font-medium">
								⚠️ 请先连接钱包才能写入数据
							</p>
						</div>
					) : (
						<div className="space-y-4">
							<div>
								<label
									htmlFor="value-input"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									输入新值（数字）
								</label>
								<input
									id="value-input"
									type="number"
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									placeholder="例如: 42"
									disabled={isPending || isConfirming}
									className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
								/>
							</div>

							<button
								type="button"
								onClick={handleSetValue}
								disabled={isPending || isConfirming || !inputValue}
								className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
							>
								{isPending
									? "⏳ 等待钱包确认..."
									: isConfirming
										? "⏳ 等待交易确认..."
										: "🚀 设置新值"}
							</button>

							{/* Transaction Status */}
							{hash && (
								<div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
									<p className="text-sm text-blue-800 font-medium mb-2">
										📝 交易哈希:
									</p>
									<p className="text-xs font-mono text-blue-600 break-all">
										{hash}
									</p>
								</div>
							)}

							{isConfirming && (
								<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
									<p className="text-yellow-800 font-medium text-center">
										⏳ 交易确认中，请稍候...
									</p>
								</div>
							)}

							{isSuccess && (
								<div className="p-4 bg-green-50 border border-green-200 rounded-xl">
									<p className="text-green-800 font-medium text-center">
										✅ 交易成功！数值已更新
									</p>
								</div>
							)}

							{writeError && (
								<div className="p-4 bg-red-50 border border-red-200 rounded-xl">
									<p className="text-red-800 font-medium">
										❌ 错误: {writeError.message}
									</p>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Info Section */}
				<div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
					<h3 className="text-xl font-semibold mb-4">💡 使用说明</h3>
					<ul className="space-y-2 text-gray-300">
						<li>• 合约地址需要先部署 SimpleStorage 合约</li>
						<li>
							• 使用{" "}
							<code className="text-blue-400">pnpm run deploy:local</code>{" "}
							部署到本地网络
						</li>
						<li>
							• 或使用{" "}
							<code className="text-blue-400">pnpm run deploy:sepolia</code>{" "}
							部署到测试网
						</li>
						<li>• 部署后将合约地址替换到代码中的 CONTRACT_ADDRESS</li>
						<li>• 写入操作需要消耗 Gas，请确保钱包有足够余额</li>
					</ul>
				</div>
			</div>
		</div>
	)
}

export default ContractDemo
