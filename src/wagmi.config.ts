import { createConfig, http } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { injected, metaMask } from "wagmi/connectors"

// Hardhat 本地网络配置
export const hardhat = {
	id: 31337,
	name: "Hardhat Local",
	nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
	rpcUrls: {
		default: { http: ["http://127.0.0.1:8545"] },
	},
	testnet: true,
}

export const CONTRACT_ADDRESSES: Record<number, Record<string, string>> = {
	// 本地 Hardhat 网络合约地址
	31337: {
		SimpleStorage: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
		JobEscrow: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
		Wallet: "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9",
		DisputeResolution: "0xdC64a140Aa3E981100a9becA4E685f962f0cF6C9",
	},
	// Sepolia 测试网络
	[sepolia.id]: {
		SimpleStorage: "0xBeCBF37bAa30979622141595301bD0E859a6C2FA",
	},
}

export const config = createConfig({
	chains: [hardhat, sepolia, mainnet],
	connectors: [injected(), metaMask()],
	transports: {
		[hardhat.id]: http(),
		[mainnet.id]: http(),
		[sepolia.id]: http(),
	},
})

export function getContractAddress(name: string, chainId: number) {
	return (
		CONTRACT_ADDRESSES[chainId]?.[name] ||
		CONTRACT_ADDRESSES[31337]?.[name] ||
		null
	)
}
