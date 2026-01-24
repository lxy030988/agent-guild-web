import { ShieldCheck, Wallet } from "lucide-react"
import { useMemo } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAccount, useConnect } from "wagmi"

import { AgentForm } from "@/components/agent"
import { EmptyState, Loading } from "@/components/common"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAgent } from "@/hooks/useAgent"
import { useCreateAgent, useUpdateAgent } from "@/hooks/useAgentMutations"
import { useAuth } from "@/hooks/useAuth"

const AgentFormPage = () => {
	const navigate = useNavigate()
	const { id } = useParams()
	const agentId = useMemo(() => Number(id), [id])
	const isEditMode = Boolean(id)
	const { user, isAuthenticated } = useAuth()
	const { isConnected } = useAccount()
	const { connectors, connect } = useConnect()

	const {
		data: agent,
		isLoading,
		error,
	} = useAgent(isEditMode && !Number.isNaN(agentId) ? agentId : undefined)

	const { mutateAsync: createAgent, isPending: creating } = useCreateAgent()
	const { mutateAsync: updateAgent, isPending: updating } = useUpdateAgent(
		agentId || 0,
	)

	const handleConnectWallet = () => {
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
	}

	if (!isAuthenticated) {
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
						<p className="text-neutral-500 mt-2 text-sm">
							请先登录钱包后再创建或编辑代理人资料。
						</p>
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

	if (isEditMode && isLoading) {
		return <Loading />
	}

	if (isEditMode && (error || !agent)) {
		return (
			<section className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-16">
				<EmptyState
					title="代理人不存在"
					description="无法加载代理人资料，请返回列表重新选择。"
					action={{ label: "返回列表", onClick: () => navigate("/agents") }}
				/>
			</section>
		)
	}

	if (isEditMode && agent && user?.id !== agent.userId) {
		return (
			<section className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-16">
				<EmptyState
					title="无编辑权限"
					description="只有代理人所有者可以编辑该资料。"
					action={{
						label: "返回详情",
						onClick: () => navigate(`/agents/${id}`),
					}}
				/>
			</section>
		)
	}

	const handleSubmit = async (payload: Parameters<typeof createAgent>[0]) => {
		if (isEditMode && agent) {
			const updated = await updateAgent(payload)
			navigate(`/agents/${updated.id}`)
			return
		}
		const created = await createAgent(payload)
		navigate(`/agents/${created.id}`)
	}

	return (
		<section className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-10">
			<div className="space-y-2">
				<p className="text-sm font-semibold text-muted-foreground">
					Agent Marketplace
				</p>
				<h1 className="text-3xl font-bold text-foreground">
					{isEditMode ? "Edit Agent" : "Upload New Agent"}
				</h1>
				<p className="text-sm text-muted-foreground">
					Deploy your AI agent into the decentralized marketplace. Ensure your
					wallet is connected for on-chain verification.
				</p>
			</div>

			<Card className="glass-card border border-amber-200 bg-amber-50/60">
				<CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm text-amber-700">
					<div>
						<p className="font-semibold">请先连接钱包再提交代理人资料</p>
						<p className="text-xs text-amber-600">
							Agent 元数据将存储在 IPFS，并同步至链上 registry。
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						className="rounded-full"
						onClick={handleConnectWallet}
						disabled={isConnected}
					>
						<Wallet className="mr-2 h-4 w-4" />
						{isConnected ? "Wallet Connected" : "Connect Wallet"}
					</Button>
				</CardContent>
			</Card>

			<AgentForm
				mode={isEditMode ? "edit" : "create"}
				initialData={agent}
				submitting={creating || updating}
				onSubmit={handleSubmit}
				onCancel={() => navigate(isEditMode ? `/agents/${id}` : "/agents")}
			/>
		</section>
	)
}

export default AgentFormPage
