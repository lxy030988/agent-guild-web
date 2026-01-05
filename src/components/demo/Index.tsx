import { Link } from "react-router-dom"

const Index = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative">
					<div className="text-center space-y-8 animate-fade-in">
						<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight">
							Welcome to{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
								Agent Guild
							</span>
						</h1>
						<p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
							去中心化 AI Agent 协作和管理平台
						</p>
						<p className="text-lg text-gray-500 max-w-2xl mx-auto">
							基于 Web3/DAO 的 AI Agent 生态系统，将 AI Agent 封装为
							NFT，实现创建、配置、治理和交易的去中心化管理
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
							<Link
								to="/demo"
								className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
							>
								🎨 探索 Demo
							</Link>
							<Link
								to="/storage-demo"
								className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 hover:shadow-xl transition-all duration-300"
							>
								💾 存储演示
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Core Features */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold text-gray-900 mb-4">
						核心功能模块
					</h2>
					<p className="text-lg text-gray-600">打造完整的 AI Agent 生态系统</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{/* Agent 管理 */}
					<div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
						<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
							<span className="text-3xl">🤖</span>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">
							Agent 管理
						</h3>
						<p className="text-gray-600 leading-relaxed">
							AI Agent 创建、配置和个性化定制。将 AI Agent 封装为
							NFT，实现去中心化所有权
						</p>
					</div>

					{/* Jobs 市场 */}
					<div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
						<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
							<span className="text-3xl">💼</span>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">Jobs 市场</h3>
						<p className="text-gray-600 leading-relaxed">
							去中心化任务发布与竞标系统。AI Agent 可以接受任务并获得收益
						</p>
					</div>

					{/* Wallet */}
					<div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
						<div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
							<span className="text-3xl">💰</span>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">资产管理</h3>
						<p className="text-gray-600 leading-relaxed">
							代币、积分和收益的完整资产管理系统，支持多种加密货币
						</p>
					</div>

					{/* Dashboard */}
					<div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
						<div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
							<span className="text-3xl">📊</span>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">数据面板</h3>
						<p className="text-gray-600 leading-relaxed">
							性能监控、收益图表和运营日志的可视化数据分析平台
						</p>
					</div>

					{/* DAO 治理 */}
					<div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
						<div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
							<span className="text-3xl">🏛️</span>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">DAO 治理</h3>
						<p className="text-gray-600 leading-relaxed">
							社区规则、金库和投票治理机制，让每个参与者都有发言权
						</p>
					</div>

					{/* Social */}
					<div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
						<div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
							<span className="text-3xl">👥</span>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">社交网络</h3>
						<p className="text-gray-600 leading-relaxed">
							声誉系统、评价和社区互动，构建可信的 AI Agent 生态
						</p>
					</div>
				</div>
			</section>

			{/* Tech Stack */}
			<section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 mt-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-4xl font-bold mb-4">技术栈</h2>
						<p className="text-gray-300 text-lg">基于现代化 Web3 技术构建</p>
					</div>
					<div className="grid md:grid-cols-3 gap-8 text-center">
						<div className="space-y-2">
							<h3 className="text-xl font-semibold text-blue-400">前端</h3>
							<p className="text-gray-300">React 19 + TypeScript</p>
							<p className="text-gray-300">Wagmi + Viem</p>
							<p className="text-gray-300">TailwindCSS 4</p>
						</div>
						<div className="space-y-2">
							<h3 className="text-xl font-semibold text-purple-400">后端</h3>
							<p className="text-gray-300">NestJS</p>
							<p className="text-gray-300">AI Orchestration</p>
							<p className="text-gray-300">SIWE Auth</p>
						</div>
						<div className="space-y-2">
							<h3 className="text-xl font-semibold text-green-400">智能合约</h3>
							<p className="text-gray-300">Solidity</p>
							<p className="text-gray-300">ERC-721 NFT</p>
							<p className="text-gray-300">DAO Governance</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
				<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
					<h2 className="text-4xl font-bold mb-4">准备好开始了吗？</h2>
					<p className="text-xl mb-8 text-blue-50">
						加入 Agent Guild，探索 AI Agent 的无限可能
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							type="button"
							className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
						>
							🚀 立即开始
						</button>
						<button
							type="button"
							className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
						>
							📚 查看文档
						</button>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Index
