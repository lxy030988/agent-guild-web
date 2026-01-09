import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
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

const AgentCreatePage = () => {
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(false)
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		shortDesc: "",
		category: AgentCategory.OTHERS,
		tags: ["AI"], // 后端验证：至少一个标签
		endpointUrl: "",
		endpointAuthType: "public" as "public" | "bearer" | "api-key",
		capabilities: [] as string[],
		timeoutMs: 30000,
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		try {
			const result = await agentApi.createAgent(formData)
			navigate(`/agents/${result.id}`)
		} catch (error) {
			console.error("Failed to create agent:", error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="container mx-auto py-10 max-w-2xl">
			<Card className="p-8">
				<h1 className="text-3xl font-bold mb-6">Create New Agent</h1>
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
							{isLoading ? "Creating..." : "Create Agent"}
						</Button>
					</div>
				</form>
			</Card>
		</div>
	)
}

export default AgentCreatePage
