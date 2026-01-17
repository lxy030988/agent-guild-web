import { GripVertical, Plus, Trash2 } from "lucide-react"
import type { DragEvent } from "react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { AgentFormErrors, ServiceInput } from "@/types/agentForm"

interface ServiceEditorProps {
	services: ServiceInput[]
	errors?: AgentFormErrors["services"]
	onChange: (services: ServiceInput[]) => void
}

const ServiceEditor = ({ services, errors, onChange }: ServiceEditorProps) => {
	const dragItem = useRef<number | null>(null)

	const handleDragStart = (index: number) => {
		dragItem.current = index
	}

	const handleDrop = (index: number) => {
		const from = dragItem.current
		if (from === null || from === index) {
			return
		}
		const next = [...services]
		const [moved] = next.splice(from, 1)
		next.splice(index, 0, moved)
		dragItem.current = null
		onChange(next)
	}

	const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
	}

	const updateService = (index: number, next: Partial<ServiceInput>) => {
		const nextServices = services.map((service, idx) =>
			idx === index ? { ...service, ...next } : service,
		)
		onChange(nextServices)
	}

	const handleAdd = () => {
		onChange([
			...services,
			{ name: "", description: "", duration: 30, price: 0, currency: "USD" },
		])
	}

	const handleRemove = (index: number) => {
		const next = services.filter((_, idx) => idx !== index)
		onChange(next.length ? next : services)
	}

	return (
		<div className="space-y-4">
			<ul className="space-y-4">
				{services.map((service, index) => (
					<li
						key={`${service.name}-${index}`}
						className="rounded-2xl border border-border bg-background/70 p-4"
						draggable
						aria-label={`拖拽排序服务 ${index + 1}`}
						onDragStart={() => handleDragStart(index)}
						onDragOver={handleDragOver}
						onDrop={() => handleDrop(index)}
					>
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<GripVertical className="h-4 w-4" />
								拖拽排序
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => handleRemove(index)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
						<div className="mt-3 grid gap-3 md:grid-cols-2">
							<div className="space-y-2">
								<Input
									placeholder="服务名称"
									value={service.name}
									onChange={(event) =>
										updateService(index, { name: event.target.value })
									}
									variant={errors?.[index]?.name ? "error" : "default"}
								/>
								{errors?.[index]?.name ? (
									<p className="text-xs text-destructive">
										{errors[index]?.name}
									</p>
								) : null}
							</div>
							<div className="grid grid-cols-3 gap-3">
								<div>
									<Input
										type="number"
										min={1}
										placeholder="时长"
										value={service.duration}
										onChange={(event) =>
											updateService(index, {
												duration: Number(event.target.value),
											})
										}
										variant={errors?.[index]?.duration ? "error" : "default"}
									/>
									{errors?.[index]?.duration ? (
										<p className="text-xs text-destructive">
											{errors[index]?.duration}
										</p>
									) : null}
								</div>
								<div>
									<Input
										type="number"
										min={0}
										placeholder="价格"
										value={service.price}
										onChange={(event) =>
											updateService(index, {
												price: Number(event.target.value),
											})
										}
										variant={errors?.[index]?.price ? "error" : "default"}
									/>
									{errors?.[index]?.price ? (
										<p className="text-xs text-destructive">
											{errors[index]?.price}
										</p>
									) : null}
								</div>
								<Select
									value={service.currency}
									onValueChange={(value) =>
										updateService(index, {
											currency: value as ServiceInput["currency"],
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
							</div>
						</div>
						<div className="mt-3">
							<Textarea
								placeholder="服务描述"
								value={service.description}
								onChange={(event) =>
									updateService(index, { description: event.target.value })
								}
								rows={3}
							/>
						</div>
					</li>
				))}
			</ul>
			<Button type="button" variant="outline" onClick={handleAdd}>
				<Plus className="mr-2 h-4 w-4" />
				新增服务
			</Button>
		</div>
	)
}

export default ServiceEditor
