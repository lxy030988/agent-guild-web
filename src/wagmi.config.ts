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
		SimpleStorage: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
		JobEscrow: "0x9A676e781A523b5d0C0e43731313A708CB607508",
		Wallet: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
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
