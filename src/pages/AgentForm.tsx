import { ShieldCheck, Wallet } from "lucide-react"
import type React from "react"
import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAccount, useConnect } from "wagmi"

import { EmptyState, Loading } from "@/components/common"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAgent } from "@/hooks/useAgent"
import { useCreateAgent, useUpdateAgent } from "@/hooks/useAgentMutations"
import { useAuth } from "@/hooks/useAuth"
import { AgentCategory, type CreateAgentDTO } from "@/types/agent"

const getCategoryLabel = (category: string) => {
	const labels: Record<string, string> = {
		PRODUCTIVITY_TOOLS: "生产力工具",
		CREATIVE_ASSISTANTS: "创意助手",
		DEVELOPER_TOOLS: "开发者工具",
		OTHERS: "其他",
	}
	return labels[category] || category
}

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

	const [formData, setFormData] = useState<CreateAgentDTO>(() => {
		if (agent) {
			return {
				name: agent.name,
				description: agent.description,
				shortDesc: agent.shortDesc || "",
				category: agent.category,
				tags: agent.tags,
				endpointUrl: agent.endpointUrl,
				endpointAuthType: agent.endpointAuthType,
				capabilities: agent.capabilities,
				timeoutMs: agent.timeoutMs,
			}
		}
		return {
			name: "",
			description: "",
			shortDesc: "",
			category: AgentCategory.OTHERS,
			tags: ["AI"],
			endpointUrl: "",
			endpointAuthType: "public",
			capabilities: [],
			timeoutMs: 30000,
		}
	})

	// 当 agent 数据加载后更新表单
	useMemo(() => {
		if (agent && isEditMode) {
			setFormData({
				name: agent.name,
				description: agent.description,
				shortDesc: agent.shortDesc || "",
				category: agent.category,
				tags: agent.tags,
				endpointUrl: agent.endpointUrl,
				endpointAuthType: agent.endpointAuthType,
				capabilities: agent.capabilities,
				timeoutMs: agent.timeoutMs,
			})
		}
	}, [agent, isEditMode])

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

	if (isEditMode && agent && user?.id !== agent.ownerId) {
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			if (isEditMode && agent) {
				const updated = await updateAgent(formData)
				navigate(`/agents/${updated.id}`)
				return
			}
			const created = await createAgent(formData)
			navigate(`/agents/${created.id}`)
		} catch (err) {
			console.error("Failed to save agent:", err)
		}
	}

	const submitting = creating || updating

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

			<Card className="p-8">
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							required
							value={formData.name}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, name: e.target.value })
							}
							placeholder="My Awesome Agent"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="shortDesc">Short Description</Label>
						<Input
							id="shortDesc"
							value={formData.shortDesc}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, shortDesc: e.target.value })
							}
							placeholder="A brief summary of your agent"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							required
							className="min-h-[100px]"
							value={formData.description}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
								setFormData({ ...formData, description: e.target.value })
							}
							placeholder="Tell us more about what your agent does..."
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Category</Label>
							<Select
								value={formData.category}
								onValueChange={(value: AgentCategory) =>
									setFormData({ ...formData, category: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{Object.values(AgentCategory).map((cat) => (
										<SelectItem key={cat} value={cat}>
											{getCategoryLabel(cat)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="timeout">Timeout (ms)</Label>
							<Input
								id="timeout"
								type="number"
								value={formData.timeoutMs}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setFormData({
										...formData,
										timeoutMs: parseInt(e.target.value, 10) || 0,
									})
								}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="endpointUrl">Endpoint URL</Label>
						<Input
							id="endpointUrl"
							required
							type="url"
							value={formData.endpointUrl}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, endpointUrl: e.target.value })
							}
							placeholder="https://api.myagent.com/execute"
						/>
					</div>

					<div className="space-y-2">
						<Label>Authentication Type</Label>
						<Select
							value={formData.endpointAuthType}
							onValueChange={(value: "public" | "bearer" | "api-key") =>
								setFormData({ ...formData, endpointAuthType: value })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select auth type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="public">Public</SelectItem>
								<SelectItem value="bearer">Bearer Token</SelectItem>
								<SelectItem value="api-key">API Key</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="tags">Tags (comma separated)</Label>
						<Input
							id="tags"
							value={formData.tags.join(", ")}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({
									...formData,
									tags: e.target.value
										.split(",")
										.map((t) => t.trim())
										.filter(Boolean),
								})
							}
							placeholder="AI, automation, code-review"
						/>
					</div>

					<div className="flex justify-end gap-4 mt-8">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate(isEditMode ? `/agents/${id}` : "/agents")}
							disabled={submitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting
								? isEditMode
									? "Saving..."
									: "Creating..."
								: isEditMode
									? "Save Changes"
									: "Create Agent"}
						</Button>
					</div>
				</form>
			</Card>
		</section>
	)
}

export default AgentFormPage
