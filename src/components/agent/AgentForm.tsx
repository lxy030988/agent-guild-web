import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

import AvailabilityPicker from "@/components/agent/AvailabilityPicker"
import ImageUploader from "@/components/agent/ImageUploader"
import ServiceEditor from "@/components/agent/ServiceEditor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Agent } from "@/types/agent"
import type {
	AgentFormErrors,
	AgentFormValues,
	PricingInput,
} from "@/types/agentForm"
import {
	buildAgentPayload,
	createEmptyAgentForm,
	mapAgentToFormValues,
	validateAgentForm,
} from "@/utils/agentForm"

const CATEGORY_OPTIONS = [
	"Strategy",
	"Design",
	"Engineering",
	"Growth",
	"Operations",
	"Research",
]

interface AgentFormProps {
	mode: "create" | "edit"
	initialData?: Agent
	submitting?: boolean
	onSubmit: (
		payload: ReturnType<typeof buildAgentPayload>,
	) => Promise<void> | void
	onCancel?: () => void
}

const parseCommaList = (value: string) =>
	value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean)

const AgentForm = ({
	mode,
	initialData,
	submitting,
	onSubmit,
	onCancel,
}: AgentFormProps) => {
	const [values, setValues] = useState<AgentFormValues>(() =>
		initialData ? mapAgentToFormValues(initialData) : createEmptyAgentForm(),
	)
	const [errors, setErrors] = useState<AgentFormErrors>({})

	useEffect(() => {
		if (initialData) {
			setValues(mapAgentToFormValues(initialData))
		}
	}, [initialData])

	const tagInput = useMemo(() => values.tags.join(", "), [values.tags])
	const languageInput = useMemo(
		() => values.languages.join(", "),
		[values.languages],
	)

	const updatePricing = (index: number, next: Partial<PricingInput>) => {
		setValues((prev) => ({
			...prev,
			pricing: prev.pricing.map((plan, idx) =>
				idx === index ? { ...plan, ...next } : plan,
			),
		}))
	}

	const handleAddPricing = () => {
		setValues((prev) => ({
			...prev,
			pricing: [
				...prev.pricing,
				{
					name: "",
					price: 0,
					currency: "USD",
					unit: "hour",
					description: "",
				},
			],
		}))
	}

	const handleRemovePricing = (index: number) => {
		setValues((prev) => ({
			...prev,
			pricing: prev.pricing.filter((_, idx) => idx !== index),
		}))
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const nextErrors = validateAgentForm(values)
		setErrors(nextErrors)
		if (Object.keys(nextErrors).length) {
			toast.error("请完善必填字段后再提交")
			return
		}

		try {
			await onSubmit(buildAgentPayload(values))
		} catch (error) {
			console.error(error)
			toast.error("提交失败，请稍后重试")
		}
	}

	return (
		<form className="space-y-8" onSubmit={handleSubmit}>
			<Card className="glass-card">
				<CardHeader>
					<CardTitle className="text-lg font-semibold">Agent Profile</CardTitle>
				</CardHeader>
				<CardContent className="space-y-5">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label
								htmlFor="agent-title"
								className="text-sm font-semibold text-foreground"
							>
								Agent Name
							</label>
							<Input
								id="agent-title"
								placeholder="e.g. DataAnalyzer Bot"
								value={values.title}
								onChange={(event) =>
									setValues((prev) => ({ ...prev, title: event.target.value }))
								}
								variant={errors.title ? "error" : "default"}
							/>
							{errors.title ? (
								<p className="text-xs text-destructive">{errors.title}</p>
							) : null}
						</div>
						<div className="space-y-2">
							<label
								htmlFor="agent-response-time"
								className="text-sm font-semibold text-foreground"
							>
								响应时间
							</label>
							<Input
								id="agent-response-time"
								placeholder="例如 < 1 hour"
								value={values.responseTime}
								onChange={(event) =>
									setValues((prev) => ({
										...prev,
										responseTime: event.target.value,
									}))
								}
								variant={errors.responseTime ? "error" : "default"}
							/>
							{errors.responseTime ? (
								<p className="text-xs text-destructive">
									{errors.responseTime}
								</p>
							) : null}
						</div>
					</div>
					<div className="space-y-2">
						<label
							htmlFor="agent-description"
							className="text-sm font-semibold text-foreground"
						>
							Description
						</label>
						<Textarea
							id="agent-description"
							placeholder="Describe the agent capabilities, workflow, and expected outputs."
							rows={5}
							maxLength={500}
							value={values.description}
							onChange={(event) =>
								setValues((prev) => ({
									...prev,
									description: event.target.value,
								}))
							}
						/>
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span
								className={errors.description ? "text-destructive" : undefined}
							>
								{errors.description || "最少 20 字符"}
							</span>
							<span>{values.description.length}/500</span>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label
								htmlFor="agent-category"
								className="text-sm font-semibold text-foreground"
							>
								Category
							</label>
							<Select
								value={values.category}
								onValueChange={(value) =>
									setValues((prev) => ({ ...prev, category: value }))
								}
							>
								<SelectTrigger id="agent-category">
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{CATEGORY_OPTIONS.map((option) => (
										<SelectItem key={option} value={option}>
											{option}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.category ? (
								<p className="text-xs text-destructive">{errors.category}</p>
							) : null}
						</div>
						<div className="space-y-2">
							<label
								htmlFor="agent-subcategory"
								className="text-sm font-semibold text-foreground"
							>
								Subcategory
							</label>
							<Input
								id="agent-subcategory"
								placeholder="Optional"
								value={values.subcategory ?? ""}
								onChange={(event) =>
									setValues((prev) => ({
										...prev,
										subcategory: event.target.value,
									}))
								}
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<label
								htmlFor="agent-city"
								className="text-sm font-semibold text-foreground"
							>
								城市
							</label>
							<Input
								id="agent-city"
								placeholder="Shanghai"
								value={values.location.city}
								onChange={(event) =>
									setValues((prev) => ({
										...prev,
										location: {
											...prev.location,
											city: event.target.value,
										},
									}))
								}
								disabled={values.location.isRemote}
							/>
						</div>
						<div className="space-y-2">
							<label
								htmlFor="agent-country"
								className="text-sm font-semibold text-foreground"
							>
								国家
							</label>
							<Input
								id="agent-country"
								placeholder="China"
								value={values.location.country}
								onChange={(event) =>
									setValues((prev) => ({
										...prev,
										location: {
											...prev.location,
											country: event.target.value,
										},
									}))
								}
								disabled={values.location.isRemote}
							/>
						</div>
						<div className="flex items-end gap-2">
							<div className="flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2">
								<Checkbox
									checked={values.location.isRemote}
									onCheckedChange={(checked) =>
										setValues((prev) => ({
											...prev,
											location: {
												...prev.location,
												isRemote: Boolean(checked),
											},
										}))
									}
								/>
								<span className="text-sm text-foreground">Remote 服务</span>
							</div>
							{errors.location ? (
								<p className="text-xs text-destructive">{errors.location}</p>
							) : null}
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label
								htmlFor="agent-tags"
								className="text-sm font-semibold text-foreground"
							>
								Tags
							</label>
							<Input
								id="agent-tags"
								placeholder="用英文逗号分隔"
								value={tagInput}
								onChange={(event) =>
									setValues((prev) => ({
										...prev,
										tags: parseCommaList(event.target.value),
									}))
								}
							/>
						</div>
						<div className="space-y-2">
							<label
								htmlFor="agent-languages"
								className="text-sm font-semibold text-foreground"
							>
								Languages
							</label>
							<Input
								id="agent-languages"
								placeholder="例如: 中文, English"
								value={languageInput}
								onChange={(event) =>
									setValues((prev) => ({
										...prev,
										languages: parseCommaList(event.target.value),
									}))
								}
							/>
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<Badge variant={values.isActive ? "success" : "secondary"}>
							{values.isActive ? "Active" : "Inactive"}
						</Badge>
						<div className="flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2">
							<Checkbox
								checked={values.isActive}
								onCheckedChange={(checked) =>
									setValues((prev) => ({ ...prev, isActive: Boolean(checked) }))
								}
							/>
							<span className="text-sm text-foreground">公开展示</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<ImageUploader
				images={values.images}
				onChange={(files) => setValues((prev) => ({ ...prev, images: files }))}
			/>

			<Card className="glass-card">
				<CardHeader>
					<CardTitle className="text-lg font-semibold">
						Services & Pricing
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<h3 className="text-sm font-semibold text-foreground">服务清单</h3>
						<p className="text-xs text-muted-foreground">可拖拽调整服务顺序</p>
					</div>
					<ServiceEditor
						services={values.services}
						errors={errors.services}
						onChange={(next) =>
							setValues((prev) => ({ ...prev, services: next }))
						}
					/>
					<div className="border-t border-border pt-5">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold text-foreground">
								套餐定价
							</h3>
							<Button
								type="button"
								variant="outline"
								onClick={handleAddPricing}
							>
								新增套餐
							</Button>
						</div>
						<div className="mt-4 space-y-4">
							{values.pricing.map((plan, index) => (
								<div
									key={`${plan.name}-${index}`}
									className="rounded-2xl border border-border bg-background/70 p-4"
								>
									<div className="flex items-center justify-between">
										<h4 className="text-sm font-semibold text-foreground">
											套餐 {index + 1}
										</h4>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={() => handleRemovePricing(index)}
										>
											<span className="sr-only">删除</span>×
										</Button>
									</div>
									<div className="mt-3 grid gap-3 md:grid-cols-2">
										<div>
											<Input
												placeholder="套餐名称"
												value={plan.name}
												onChange={(event) =>
													updatePricing(index, { name: event.target.value })
												}
												variant={
													errors.pricing?.[index]?.name ? "error" : "default"
												}
											/>
											{errors.pricing?.[index]?.name ? (
												<p className="text-xs text-destructive">
													{errors.pricing[index]?.name}
												</p>
											) : null}
										</div>
										<div className="grid grid-cols-3 gap-3">
											<Input
												type="number"
												min={0}
												placeholder="价格"
												value={plan.price}
												onChange={(event) =>
													updatePricing(index, {
														price: Number(event.target.value),
													})
												}
												variant={
													errors.pricing?.[index]?.price ? "error" : "default"
												}
											/>
											<Select
												value={plan.currency}
												onValueChange={(value) =>
													updatePricing(index, {
														currency: value as PricingInput["currency"],
													})
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="货币" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="USD">USD</SelectItem>
													<SelectItem value="ETH">ETH</SelectItem>
												</SelectContent>
											</Select>
											<Select
												value={plan.unit}
												onValueChange={(value) =>
													updatePricing(index, {
														unit: value as PricingInput["unit"],
													})
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="单位" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="hour">hour</SelectItem>
													<SelectItem value="job">job</SelectItem>
													<SelectItem value="day">day</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<Textarea
										className="mt-3"
										placeholder="套餐说明"
										rows={3}
										value={plan.description ?? ""}
										onChange={(event) =>
											updatePricing(index, { description: event.target.value })
										}
									/>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="glass-card">
				<CardHeader>
					<CardTitle className="text-lg font-semibold">
						Availability Schedule
					</CardTitle>
				</CardHeader>
				<CardContent>
					<AvailabilityPicker
						availability={values.availability}
						onChange={(availability) =>
							setValues((prev) => ({ ...prev, availability }))
						}
					/>
				</CardContent>
			</Card>

			<div className="flex flex-wrap items-center justify-between gap-4">
				<Button type="button" variant="ghost" onClick={() => onCancel?.()}>
					取消
				</Button>
				<Button
					type="submit"
					className="rounded-full px-10 premium-gradient shadow-glow"
					disabled={submitting}
				>
					{mode === "create" ? "Deploy Agent" : "Save Changes"}
				</Button>
			</div>
		</form>
	)
}

export default AgentForm
