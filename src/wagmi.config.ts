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
		SimpleStorage: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
		JobEscrow: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
		Wallet: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
		DisputeResolution: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
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
