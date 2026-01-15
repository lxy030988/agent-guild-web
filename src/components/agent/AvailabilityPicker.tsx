import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import type { Availability, WeeklySchedule } from "@/types/agent"

const WEEKDAYS: Array<keyof WeeklySchedule> = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
]

const WEEKDAY_LABELS: Record<keyof WeeklySchedule, string> = {
	monday: "周一",
	tuesday: "周二",
	wednesday: "周三",
	thursday: "周四",
	friday: "周五",
	saturday: "周六",
	sunday: "周日",
}

const TIMEZONES = [
	"UTC",
	"Asia/Shanghai",
	"Asia/Singapore",
	"Europe/Berlin",
	"America/New_York",
]

interface AvailabilityPickerProps {
	availability: Availability
	onChange: (availability: Availability) => void
}

const AvailabilityPicker = ({ availability, onChange }: AvailabilityPickerProps) => {
	const updateDaySlots = (day: keyof WeeklySchedule, slots: Availability["schedule"][keyof WeeklySchedule]) => {
		onChange({
			...availability,
			schedule: {
				...availability.schedule,
				[day]: slots,
			},
		})
	}

	const handleAddSlot = (day: keyof WeeklySchedule) => {
		updateDaySlots(day, [
			...availability.schedule[day],
			{ start: "09:00", end: "18:00" },
		])
	}

	const handleRemoveSlot = (day: keyof WeeklySchedule, index: number) => {
		const next = availability.schedule[day].filter((_, idx) => idx !== index)
		updateDaySlots(day, next)
	}

	const handleSlotChange = (
		day: keyof WeeklySchedule,
		index: number,
		field: "start" | "end",
		value: string,
	) => {
		const next = availability.schedule[day].map((slot, idx) =>
			idx === index ? { ...slot, [field]: value } : slot,
		)
		updateDaySlots(day, next)
	}

	return (
		<div className="space-y-4">
			<div className="max-w-xs">
				<Select
					value={availability.timezone}
					onValueChange={(value) =>
						onChange({ ...availability, timezone: value })
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="选择时区" />
					</SelectTrigger>
					<SelectContent>
						{TIMEZONES.map((timezone) => (
							<SelectItem key={timezone} value={timezone}>
								{timezone}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-4">
				{WEEKDAYS.map((day) => (
					<div
						key={day}
						className="rounded-2xl border border-border bg-background/70 p-4"
					>
						<div className="flex items-center justify-between">
							<h4 className="text-sm font-semibold text-foreground">
								{WEEKDAY_LABELS[day]}
							</h4>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => handleAddSlot(day)}
							>
								<Plus className="mr-1 h-3 w-3" />
								添加时段
							</Button>
						</div>
						<div className="mt-3 space-y-3">
							{availability.schedule[day].length ? (
								availability.schedule[day].map((slot, index) => (
									<div
										key={`${day}-${slot.start}-${slot.end}`}
										className="flex flex-wrap items-center gap-3"
									>
										<Input
											type="time"
											value={slot.start}
											onChange={(event) =>
												handleSlotChange(day, index, "start", event.target.value)
											}
											className="w-32"
										/>
										<span className="text-sm text-muted-foreground">-</span>
										<Input
											type="time"
											value={slot.end}
											onChange={(event) =>
												handleSlotChange(day, index, "end", event.target.value)
											}
											className="w-32"
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => handleRemoveSlot(day, index)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								))
							) : (
								<p className="text-xs text-muted-foreground">
									暂无可用时段
								</p>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default AvailabilityPicker
