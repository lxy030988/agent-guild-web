import {
	Calendar,
	CheckCircle2,
	Copy,
	Cpu,
	ExternalLink,
	Globe,
	Hash,
	LayoutDashboard,
	LogOut,
	Mail,
	ShieldCheck,
	TrendingUp,
	User as UserIcon,
	Wallet,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useAccount, useDisconnect, useEnsName } from "wagmi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "../hooks/useAuth"

export default function ProfilePage() {
	const { user, isAuthenticated, logout } = useAuth()
	const { disconnect } = useDisconnect()
	const { address } = useAccount()
	const { data: ensName } = useEnsName({
		address,
		chainId: 1,
	})

	const handleLogout = () => {
		logout()
		disconnect()
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
	}

	// 如果未登录，显示提示信息
	if (!isAuthenticated || !user) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
				<Card className="max-w-md w-full bg-white border-neutral-200 shadow-2xl animate-in fade-in zoom-in duration-500 rounded-[32px]">
					<CardHeader className="text-center pb-2">
						<div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 ring-4 ring-primary/5">
							<ShieldCheck className="h-10 w-10 text-primary animate-pulse-slow" />
						</div>
						<CardTitle className="text-3xl font-black text-neutral-900 tracking-tight">
							Access Denied
						</CardTitle>
						<CardDescription className="text-neutral-500 mt-2">
							This profile is secured. Please sign in with your Web3 wallet to
							continue.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4 pt-6 pb-8 px-8">
						<Button
							asChild
							className="premium-gradient w-full py-6 text-lg font-bold rounded-2xl shadow-glow"
						>
							<Link to="/">Go to Dashboard</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-white text-neutral-900 selection:bg-primary/10">
			<div className="container mx-auto py-12 px-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
				{/* Top Bar */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
					<div className="space-y-1">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3">
							<TrendingUp className="w-3 h-3" /> User Account
						</div>
						<h1 className="text-5xl font-black tracking-tighter text-neutral-900 italic">
							User Profile
						</h1>
						<p className="text-neutral-500 font-medium">
							Your decentralized identity and workspace settings
						</p>
					</div>
					<Button
						variant="destructive"
						onClick={handleLogout}
						className="w-fit px-8 py-6 rounded-2xl font-black text-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all shadow-xl shadow-red-500/5"
					>
						<LogOut className="mr-3 h-5 w-5" />
						Log Out
					</Button>
				</div>

				<div className="grid gap-8 lg:grid-cols-12">
					{/* Left Sidebar - Profile Overview */}
					<div className="lg:col-span-4 space-y-6">
						<Card className="bg-white border-neutral-200 shadow-xl overflow-hidden rounded-[32px] group">
							<div className="h-24 bg-gradient-to-r from-primary/10 via-indigo-600/10 to-purple-600/10 group-hover:bg-primary/20 transition-all" />
							<CardHeader className="items-center -mt-12 pb-6">
								<div className="relative">
									<Avatar className="h-32 w-32 border-4 border-white shadow-2xl ring-1 ring-neutral-200 group-hover:scale-105 transition-transform duration-500">
										<AvatarImage
											src={`https://avatar.vercel.sh/${address}.png`}
											alt={user.name || "User"}
										/>
										<AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-indigo-600 text-white font-black">
											{(user.name || ensName)?.[0]?.toUpperCase() || "U"}
										</AvatarFallback>
									</Avatar>
									<div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-full border-4 border-white shadow-lg">
										<CheckCircle2 className="w-4 h-4 text-white" />
									</div>
								</div>
								<div className="mt-6 text-center space-y-2">
									<CardTitle className="text-3xl font-black tracking-tight text-neutral-900 italic">
										{user.name || ensName || "Operator"}
									</CardTitle>
									<div className="flex items-center justify-center gap-2">
										<span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
											System Verified
										</span>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6 pb-8">
								<Separator className="bg-neutral-100" />
								<div className="space-y-3">
									<div className="flex items-center justify-between text-xs font-black text-neutral-400 uppercase tracking-widest">
										<span>Wallet Address</span>
										<Wallet className="w-3 h-3" />
									</div>
									<div className="flex items-center gap-2 group/addr relative">
										<code className="text-xs font-mono bg-neutral-50 p-4 rounded-xl block truncate flex-1 border border-neutral-200 text-neutral-600 group-hover/addr:bg-neutral-100 transition-colors">
											{user.walletAddress}
										</code>
										<Button
											variant="ghost"
											size="icon"
											className="h-12 w-12 shrink-0 bg-neutral-50 hover:bg-primary hover:text-white rounded-xl border border-neutral-200 transition-all shadow-sm"
											onClick={() => copyToClipboard(user.walletAddress)}
										>
											<Copy className="h-5 w-5" />
										</Button>
									</div>
								</div>

								{/* Mini Stats */}
								<div className="grid grid-cols-2 gap-4">
									<div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center">
										<div className="text-xs font-bold text-neutral-400 uppercase mb-1">
											Agents
										</div>
										<div className="text-2xl font-black text-neutral-900">
											0
										</div>
									</div>
									<div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center">
										<div className="text-xs font-bold text-neutral-400 uppercase mb-1">
											Rank
										</div>
										<div className="text-2xl font-black text-neutral-900">
											#1
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Quick Access */}
						<div className="space-y-4">
							<Button
								asChild
								variant="outline"
								className="w-full justify-start py-7 rounded-2xl border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 transition-all group shadow-sm"
							>
								<Link to="/">
									<LayoutDashboard className="mr-4 h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
									<span className="font-bold">System Dashboard</span>
								</Link>
							</Button>
							<Button
								disabled
								variant="outline"
								className="w-full justify-start py-7 rounded-2xl border-neutral-200 bg-white opacity-40 cursor-not-allowed"
							>
								<Cpu className="mr-4 h-5 w-5 text-neutral-400" />
								<span className="font-bold">Hardware Nodes</span>
							</Button>
						</div>
					</div>

					{/* Main Content - Account Details */}
					<div className="lg:col-span-8 space-y-8">
						<Card className="bg-white border-neutral-200 shadow-2xl rounded-[32px]">
							<CardHeader className="p-8 pb-0">
								<CardTitle className="text-2xl font-black text-neutral-900 italic">
									Identity Metadata
								</CardTitle>
								<CardDescription className="text-neutral-500">
									Cryptographic information associated with your Web3 profile
								</CardDescription>
							</CardHeader>
							<CardContent className="p-8 space-y-8">
								<div className="grid gap-8 md:grid-cols-2">
									<div className="space-y-3 group/item">
										<Label className="text-neutral-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover/item:text-primary transition-colors">
											<Hash className="h-4 w-4" /> System ID
										</Label>
										<div className="text-2xl font-black text-neutral-900 font-mono">
											#{user.id}
										</div>
									</div>

									<div className="space-y-3 group/item">
										<Label className="text-neutral-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover/item:text-indigo-600 transition-colors">
											<Calendar className="h-4 w-4" /> Induction Date
										</Label>
										<div className="text-2xl font-black text-neutral-900">
											{new Date(user.createdAt).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</div>
									</div>

									<div className="space-y-3 group/item">
										<Label className="text-neutral-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover/item:text-emerald-600 transition-colors">
											<UserIcon className="h-4 w-4" /> Alias / ENS
										</Label>
										<div className="text-2xl font-black text-neutral-900 tracking-tight">
											{user.name || ensName || (
												<span className="text-neutral-300 italic font-medium">
													Undefined
												</span>
											)}
										</div>
									</div>

									<div className="space-y-3 group/item">
										<Label className="text-neutral-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover/item:text-pink-600 transition-colors">
											<Mail className="h-4 w-4" /> Secure Communication
										</Label>
										<div className="text-2xl font-black text-neutral-900 tracking-tight">
											{user.email || (
												<span className="text-neutral-300 italic font-medium">
													Unlinked
												</span>
											)}
										</div>
									</div>
								</div>

								<Separator className="bg-neutral-100" />

								<div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-5 group">
									<div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
										<Globe className="h-7 w-7 text-primary animate-pulse-slow" />
									</div>
									<div className="space-y-1">
										<h4 className="text-lg font-black text-neutral-900 italic">
											Global Verification
										</h4>
										<p className="text-sm text-neutral-500 leading-relaxed max-w-lg">
											Your profile is authenticated through a decentralized
											cryptographic signature. Your identity is verified across
											the entire Agent Guild network.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Feature Cards */}
						<div className="grid gap-6 md:grid-cols-2">
							<Card className="bg-white border-neutral-200 hover:border-primary/40 transition-all cursor-pointer group overflow-hidden relative shadow-lg rounded-[24px]">
								<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all" />
								<CardHeader>
									<CardTitle className="flex items-center gap-4 text-neutral-900">
										<div className="p-3 bg-primary/10 rounded-xl">
											<TrendingUp className="w-6 h-6 text-primary" />
										</div>
										<span className="text-xl font-black italic">
											Network Activity
										</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-neutral-500 text-sm font-medium">
										View your contributions, agent executions, and rewards
										across the hub.
									</p>
									<Button
										variant="link"
										className="px-0 text-primary font-black mt-4 group-hover:translate-x-2 transition-transform"
									>
										VIEW EXPLORER <ExternalLink className="ml-2 w-3 h-3" />
									</Button>
								</CardContent>
							</Card>

							<Card className="bg-white border-neutral-200 hover:border-indigo-400/40 transition-all cursor-pointer group overflow-hidden relative shadow-lg rounded-[24px]">
								<div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-all" />
								<CardHeader>
									<CardTitle className="flex items-center gap-4 text-neutral-900">
										<div className="p-3 bg-indigo-500/10 rounded-xl">
											<Cpu className="w-6 h-6 text-indigo-600" />
										</div>
										<span className="text-xl font-black italic">
											Settings & API
										</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-neutral-500 text-sm font-medium">
										Configure your developer API keys and agent collaboration
										tokens.
									</p>
									<Button
										variant="link"
										className="px-0 text-indigo-600 font-black mt-4 group-hover:translate-x-2 transition-transform"
									>
										CONFIGURE ACCESS <ExternalLink className="ml-2 w-3 h-3" />
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
