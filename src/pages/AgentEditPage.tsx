import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import { AgentCategory, agentApi } from "../utils/agent-api"

const AgentEditPage = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(false)
	const [isFetching, setIsFetching] = useState(true)
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		shortDesc: "",
		category: AgentCategory.OTHERS,
		tags: [] as string[],
		endpointUrl: "",
		endpointAuthType: "public" as "public" | "bearer" | "api-key",
		secretKey: "",
		capabilities: [] as string[],
		timeoutMs: 30000,
	})
	const [tagInput, setTagInput] = useState("")
	const [capabilityInput, setCapabilityInput] = useState("")

	// 加载现有 Agent 数据
	useEffect(() => {
		const fetchAgent = async () => {
			if (!id) return

			try {
				setIsFetching(true)
				const agent = await agentApi.getAgent(Number.parseInt(id, 10))
				setFormData({
					name: agent.name,
					description: agent.description,
					shortDesc: agent.shortDesc || "",
					category: agent.category,
					tags: agent.tags || [],
					endpointUrl: agent.endpointUrl,
					endpointAuthType: (agent.endpointAuthType || "public") as
						| "public"
						| "bearer"
						| "api-key",
					secretKey: agent.secretKey || "",
					capabilities: agent.capabilities || [],
					timeoutMs: agent.timeoutMs || 30000,
				})
			} catch (error) {
				console.error("Failed to fetch agent:", error)
				toast.error("Failed to load agent data")
				navigate("/agents")
			} finally {
				setIsFetching(false)
			}
		}

		fetchAgent()
	}, [id, navigate])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!id) return

		setIsLoading(true)
		try {
			await agentApi.updateAgent(Number.parseInt(id, 10), formData)
			toast.success("Agent updated successfully!")
			navigate(`/agents/${id}`)
		} catch (error) {
			console.error("Failed to update agent:", error)
			toast.error("Failed to update agent")
		} finally {
			setIsLoading(false)
		}
	}

	if (isFetching) {
		return (
			<div className="container mx-auto py-10 max-w-2xl">
				<Card className="p-8">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
					</div>
				</Card>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-10 max-w-2xl">
			<Card className="p-8">
				<h1 className="text-3xl font-bold mb-6">Edit Agent</h1>
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
											{cat.replace(/_/g, " ")}
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
										timeoutMs: Number.parseInt(e.target.value, 10) || 0,
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

					<div className="grid grid-cols-2 gap-4">
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
									<SelectItem value="public">Public (No Auth)</SelectItem>
									<SelectItem value="bearer">Bearer Token (JWT)</SelectItem>
									<SelectItem value="api-key">API Key</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{formData.endpointAuthType !== "public" && (
							<div className="space-y-2">
								<Label htmlFor="secretKey">
									Secret Key
									{formData.endpointAuthType === "bearer" && (
										<span className="text-sm text-muted-foreground ml-2">
											(JWT Secret)
										</span>
									)}
								</Label>
								<Input
									id="secretKey"
									type="password"
									value={formData.secretKey}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setFormData({ ...formData, secretKey: e.target.value })
									}
									placeholder={
										formData.endpointAuthType === "bearer"
											? "Enter JWT secret"
											: "Enter API key"
									}
								/>
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="tags">Tags</Label>
						<div className="flex gap-2">
							<Input
								id="tags"
								value={tagInput}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setTagInput(e.target.value)
								}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault()
										if (
											tagInput.trim() &&
											!formData.tags.includes(tagInput.trim())
										) {
											setFormData({
												...formData,
												tags: [...formData.tags, tagInput.trim()],
											})
											setTagInput("")
										}
									}
								}}
								placeholder="Add a tag and press Enter"
							/>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									if (
										tagInput.trim() &&
										!formData.tags.includes(tagInput.trim())
									) {
										setFormData({
											...formData,
											tags: [...formData.tags, tagInput.trim()],
										})
										setTagInput("")
									}
								}}
							>
								Add
							</Button>
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{formData.tags.map((tag, index) => (
								<span
									key={tag}
									className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
								>
									{tag}
									<button
										type="button"
										onClick={() =>
											setFormData({
												...formData,
												tags: formData.tags.filter((_, i) => i !== index),
											})
										}
										className="hover:text-indigo-600"
									>
										×
									</button>
								</span>
							))}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="capabilities">Capabilities</Label>
						<div className="flex gap-2">
							<Input
								id="capabilities"
								value={capabilityInput}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setCapabilityInput(e.target.value)
								}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault()
										if (
											capabilityInput.trim() &&
											!formData.capabilities.includes(capabilityInput.trim())
										) {
											setFormData({
												...formData,
												capabilities: [
													...formData.capabilities,
													capabilityInput.trim(),
												],
											})
											setCapabilityInput("")
										}
									}
								}}
								placeholder="Add a capability and press Enter"
							/>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									if (
										capabilityInput.trim() &&
										!formData.capabilities.includes(capabilityInput.trim())
									) {
										setFormData({
											...formData,
											capabilities: [
												...formData.capabilities,
												capabilityInput.trim(),
											],
										})
										setCapabilityInput("")
									}
								}}
							>
								Add
							</Button>
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{formData.capabilities.map((capability, index) => (
								<span
									key={capability}
									className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
								>
									{capability}
									<button
										type="button"
										onClick={() =>
											setFormData({
												...formData,
												capabilities: formData.capabilities.filter(
													(_, i) => i !== index,
												),
											})
										}
										className="hover:text-green-600"
									>
										×
									</button>
								</span>
							))}
						</div>
					</div>

					<div className="flex justify-end gap-4 mt-8">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate(-1)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Updating..." : "Update Agent"}
						</Button>
					</div>
				</form>
			</Card>
		</div>
	)
}

export default AgentEditPage
