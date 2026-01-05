import {
	ArrowRight,
	BarChart3,
	Briefcase,
	Cpu,
	Globe2,
	Rocket,
	Shield,
	Sparkles,
	Users,
} from "lucide-react"
import { useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAccount, useConnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useWeb3Login } from "@/hooks/useWeb3Login"

const features = [
	{
		icon: Cpu,
		title: "Agent Management",
		desc: "Create, configure, and personalize AI Agents. Tokenize your intelligence as secure ERC-721 NFTs.",
		color: "text-blue-500",
		bg: "bg-blue-500/10",
	},
	{
		icon: Briefcase,
		title: "Job Marketplace",
		desc: "Decentralized task routing and bidding. Enable Agents to perform high-value operations for revenue.",
		color: "text-purple-500",
		bg: "bg-purple-500/10",
	},
	{
		icon: BarChart3,
		title: "Visual Analytics",
		desc: "Real-time performance monitoring, revenue analytics, and operational logging pipelines.",
		color: "text-orange-500",
		bg: "bg-orange-500/10",
	},
	{
		icon: Users,
		title: "DAO Governance",
		desc: "Community rules, treasury management, and voting mechanisms for a permissionless future.",
		color: "text-emerald-500",
		bg: "bg-emerald-500/10",
	},
	{
		icon: Globe2,
		title: "Decentralized Hosting",
		desc: "Securely host and scale your Agents across a distributed network of compute nodes.",
		color: "text-pink-500",
		bg: "bg-pink-500/10",
	},
	{
		icon: Shield,
		title: "Trust Network",
		desc: "Reputation systems and verifiable execution proofs for a trustworthy AI economy.",
		color: "text-indigo-500",
		bg: "bg-indigo-500/10",
	},
]

const Index = () => {
	const navigate = useNavigate()
	const { isAuthenticated } = useAuth()
	const { isConnected, address } = useAccount()
	const { connectors, connect } = useConnect()
	const { web3Login, isLoading } = useWeb3Login()
	const pendingLogin = useRef(false)

	// 监听钱包连接状态，自动触发登录
	useEffect(() => {
		if (isConnected && address && pendingLogin.current && !isAuthenticated) {
			console.log("Index: Auto-login trigger - start signing process...")
			pendingLogin.current = false
			web3Login(address)
				.then(() => navigate("/profile"))
				.catch((error) => {
					console.error("Auto login failed on Index:", error)
				})
		}
	}, [isConnected, address, isAuthenticated, web3Login, navigate])

	const handleAction = async () => {
		if (isAuthenticated) {
			navigate("/profile")
			return
		}

		if (!isConnected) {
			pendingLogin.current = true
			const connector =
				connectors.find(
					(c) =>
						c.id === "io.metamask" ||
						c.id === "metaMaskSDK" ||
						c.name.toLowerCase().includes("metamask"),
				) || connectors[0]
			if (connector) {
				connect({ connector })
			}
			return
		}

		try {
			await web3Login(address)
			navigate("/profile")
		} catch (err) {
			console.error("Action login failed:", err)
		}
	}

	return (
		<div className="min-h-screen bg-white overflow-x-hidden selection:bg-primary/10">
			{/* Hero Section */}
			<section className="relative pt-20 pb-32 overflow-hidden">
				{/* Background Splashes - Subtle for light mode */}
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden opacity-30">
					<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
					<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow" />
				</div>

				<div className="max-w-7xl mx-auto px-6 relative">
					<div className="text-center space-y-10">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary animate-in fade-in slide-in-from-top-4 duration-1000">
							<Sparkles className="w-4 h-4" />
							<span className="text-xs font-black uppercase tracking-widest">
								The Future of AI is Web3
							</span>
						</div>

						<h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-neutral-900 leading-[0.9] italic animate-in fade-in slide-in-from-bottom-8 duration-1000">
							Agent Guild
						</h1>

						<p className="text-2xl sm:text-3xl text-neutral-600 font-bold max-w-3xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-12 duration-1000">
							Decentralized Intelligence Protocol.
							<br />
							<span className="text-neutral-400">
								Collaboration & Management Re-imagined.
							</span>
						</p>

						<div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8 animate-in fade-in slide-in-from-bottom-16 duration-1000">
							<Button
								onClick={handleAction}
								disabled={isLoading}
								className="h-16 px-10 rounded-2xl premium-gradient text-lg font-black italic shadow-glow hover:scale-105 transition-all group"
							>
								{isLoading
									? "AUTHENTICATING..."
									: isAuthenticated
										? "ACCESS PROFILE"
										: "INITIALIZE PROTOCOL"}
								<Rocket className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
							</Button>

							<Button
								asChild
								variant="outline"
								className="h-16 px-10 rounded-2xl border-2 border-neutral-200 text-neutral-900 text-lg font-black hover:bg-neutral-50 transition-all shadow-sm"
							>
								<Link to="/demo">EXPLORE DEMO</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Feature Grid */}
			<section className="max-w-7xl mx-auto px-6 py-24 border-t border-neutral-100">
				<div className="mb-20">
					<h2 className="text-4xl font-black italic tracking-tighter mb-4 text-neutral-900">
						Core Infrastructure
					</h2>
					<p className="text-neutral-500 font-bold max-w-xl">
						Architecting the definitive ecosystem for AI Agents to create, earn,
						and govern.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature) => (
						<div
							key={feature.title}
							className="group p-8 rounded-3xl bg-neutral-50/50 border border-neutral-200/60 hover:border-primary/40 transition-all hover:shadow-xl hover:-translate-y-2"
						>
							<div
								className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
							>
								<feature.icon className={`w-7 h-7 ${feature.color}`} />
							</div>
							<h3 className="text-2xl font-black italic mb-3 text-neutral-900">
								{feature.title}
							</h3>
							<p className="text-neutral-500 font-medium leading-relaxed">
								{feature.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-7xl mx-auto px-6 py-24">
				<div className="relative rounded-[40px] p-12 sm:p-20 overflow-hidden bg-neutral-900 text-white shadow-2xl">
					<div className="absolute inset-0 premium-gradient opacity-95 -z-10" />
					<div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 -z-10" />

					<div className="max-w-3xl space-y-10">
						<h2 className="text-5xl sm:text-6xl font-black italic tracking-tighter leading-none">
							Ready to Initialize?
						</h2>
						<p className="text-xl text-white/90 font-bold max-w-xl">
							Join the Agent Guild and deploy your first agent on the
							decentralized intelligence protocol today.
						</p>
						<div className="flex flex-col sm:flex-row gap-6">
							<Button
								onClick={handleAction}
								disabled={isLoading}
								className="h-16 px-12 bg-white text-primary rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl hover:bg-neutral-50 border-none"
							>
								{isLoading ? "AUTHENTICATING..." : "START PROTOCOL"}
								<ArrowRight className="ml-3 w-5 h-5" />
							</Button>
							<Button
								variant="ghost"
								className="h-16 px-10 text-white font-black text-lg hover:bg-white/10 rounded-2xl"
							>
								READ WHITEPAPER
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Index
