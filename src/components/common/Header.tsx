import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { useWeb3Login } from "@/hooks/useWeb3Login"
import { LogOut, Sparkles, User, Wallet } from "lucide-react"
import { memo, useCallback, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi"

const Header = () => {
	const navigate = useNavigate()
	const { isConnected, address } = useAccount()
	const { data: ensName } = useEnsName({
		address,
		chainId: 1, // 强制从以太坊主网查询 ENS
	})
	const { connectors, connect } = useConnect()
	const { disconnect } = useDisconnect()
	const { user, isAuthenticated, logout } = useAuth()
	const { web3Login, isLoading } = useWeb3Login()
	const pendingLogin = useRef(false)

	// 监听钱包连接状态，自动触发登录
	useEffect(() => {
		if (isConnected && address && pendingLogin.current && !isAuthenticated) {
			console.log("Header: Auto-login trigger - start signing process...")
			pendingLogin.current = false
			// 立即尝试登录，不再等待 setTimeout
			web3Login(address).catch((error) => {
				console.error("Auto login failed:", error)
			})
		}
	}, [isConnected, address, isAuthenticated, web3Login])

	// 统一登录处理：连接钱包 + 签名登录
	const handleSignLogin = useCallback(async () => {
		if (!isConnected) {
			pendingLogin.current = true
			const metamaskConnector = connectors.find(
				(c) =>
					c.id === "io.metamask" ||
					c.id === "metaMaskSDK" ||
					c.name.toLowerCase().includes("metamask"),
			)
			const targetConnector = metamaskConnector || connectors[0]
			if (targetConnector) {
				connect({ connector: targetConnector })
			}
			return
		}

		try {
			await web3Login()
		} catch (err) {
			console.error("Login failed:", err)
		}
	}, [isConnected, connectors, connect, web3Login])

	// 监听全局未授权事件，弹出登录提示
	useEffect(() => {
		const handleUnauthorized = (event: Event) => {
			const customEvent = event as CustomEvent
			const message = customEvent.detail?.message || "Session expired."
			if (window.confirm(`${message}\n\nWould you like to sign in again?`)) {
				// 调用登录逻辑
				handleSignLogin()
			} else {
				// 用户取消，可以重定向到主页或保持现状
				navigate("/")
			}
		}

		window.addEventListener("app:unauthorized", handleUnauthorized)
		return () => {
			window.removeEventListener("app:unauthorized", handleUnauthorized)
		}
	}, [handleSignLogin, navigate])

	// 退出登录
	const handleLogout = () => {
		logout()
		disconnect()
	}

	// 格式化钱包地址
	const formatAddress = (addr: string) => {
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`
	}

	return (
		<header className="header-glass backdrop-blur-md">
			<div className="container mx-auto flex h-16 items-center justify-between px-6">
				<div className="flex items-center gap-10">
					<Link to="/" className="flex items-center space-x-2 group">
						<div className="w-10 h-10 bg-gradient-to-tr from-primary to-indigo-400 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
							<Sparkles className="text-white w-6 h-6" />
						</div>
						<span className="text-2xl font-black bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
							Agent Guild
						</span>
					</Link>

					<nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
						<Link
							to="/"
							className="transition-all hover:text-primary text-foreground/70 hover:scale-105"
						>
							Dashboard
						</Link>
						<Link
							to="/demo"
							className="transition-all hover:text-primary text-foreground/70 hover:scale-105"
						>
							Agents
						</Link>
						<Link
							to="/dao"
							className="transition-all hover:text-primary text-foreground/70 hover:scale-105"
						>
							DAO
						</Link>
						<Link
							to="/contract-demo"
							className="transition-all hover:text-primary text-foreground/70 hover:scale-105"
						>
							Network
						</Link>
					</nav>
				</div>

				<div className="flex items-center space-x-5">
					{!isAuthenticated ? (
						<div className="flex items-center gap-3">
							<Button
								onClick={handleSignLogin}
								disabled={isLoading}
								className="rounded-full px-7 premium-gradient shadow-glow hover:scale-105 transition-transform border-none font-bold min-w-[160px]"
							>
								{isLoading ? (
									<span className="flex items-center">
										<svg
											className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<title>Loading</title>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										Processing...
									</span>
								) : (
									<>
										<Wallet className="mr-2 h-4 w-4" />
										Sign to Login
									</>
								)}
							</Button>
						</div>
					) : (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-12 w-auto flex items-center gap-3 px-3 rounded-2xl hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group"
								>
									<Avatar className="h-9 w-9 border-2 border-primary/30 group-hover:scale-110 transition-transform shadow-md">
										<AvatarImage
											src={`https://avatar.vercel.sh/${address}.png`}
											alt={user?.name || "User"}
										/>
										<AvatarFallback className="bg-gradient-to-br from-primary to-indigo-600 text-white font-bold">
											{(user?.name || ensName)?.[0]?.toUpperCase() || "U"}
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col items-start leading-none pr-1">
										{isAuthenticated && (user?.name || ensName) && (
											<span className="text-sm font-bold truncate max-w-[130px] text-foreground">
												{user?.name || ensName}
											</span>
										)}
										<span className="text-[11px] text-muted-foreground/80 font-mono tracking-tight font-medium">
											{address && formatAddress(address)}
										</span>
									</div>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-64 p-2 dropdown-glass"
								align="end"
								forceMount
							>
								<DropdownMenuLabel className="font-normal px-2 py-3">
									<div className="flex flex-col space-y-2">
										<div className="flex items-center gap-3">
											<Avatar className="h-10 w-10 border border-primary/20">
												<AvatarImage
													src={`https://avatar.vercel.sh/${address}.png`}
												/>
												<AvatarFallback className="premium-gradient text-xs">
													{(user?.name || ensName)?.[0]?.toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col space-y-0.5">
												<p className="text-sm font-bold leading-none">
													{user?.name || ensName || "Verified User"}
												</p>
												<p className="text-[11px] leading-none text-muted-foreground font-mono">
													{address && formatAddress(address)}
												</p>
											</div>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator className="opacity-50" />
								<div className="p-1 space-y-1">
									<DropdownMenuItem
										onClick={() => navigate("/profile")}
										className="rounded-lg cursor-pointer py-2.5"
									>
										<User className="mr-3 h-4 w-4 text-primary" />
										<span className="font-semibold text-sm">
											Profile Details
										</span>
									</DropdownMenuItem>
								</div>
								<DropdownMenuSeparator className="opacity-50" />
								<div className="p-1">
									<DropdownMenuItem
										onClick={handleLogout}
										className="text-red-500 focus:text-white focus:bg-red-500 rounded-lg cursor-pointer py-2.5"
									>
										<LogOut className="mr-3 h-4 w-4" />
										<span className="font-bold text-sm">Sign Out</span>
									</DropdownMenuItem>
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>
		</header>
	)
}

export default memo(Header)
