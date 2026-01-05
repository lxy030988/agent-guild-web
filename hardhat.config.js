import "@nomicfoundation/hardhat-toolbox"
import dotenv from "dotenv"

dotenv.config()
/** @type {import('hardhat/config').HardhatUserConfig} */
export default {
	solidity: {
		version: "0.8.24",
	},
	networks: {
		localhost: {
			url: "http://127.0.0.1:8545",
			chainId: 31337,
		},
		sepolia: {
			url: process.env.SEPOLIA_RPC_URL || "",
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
			chainId: 11155111,
		},
	},
	paths: {
		sources: "./contracts",
		tests: "./test",
		cache: "./cache",
		artifacts: "./artifacts",
	},
}
