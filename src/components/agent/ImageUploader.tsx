import { ImagePlus, Trash2 } from "lucide-react"
import type { ChangeEvent } from "react"
import { useEffect, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
	images: File[]
	onChange: (files: File[]) => void
	maxImages?: number
	className?: string
}

const ImageUploader = ({
	images,
	onChange,
	maxImages = 4,
	className,
}: ImageUploaderProps) => {
	const previews = useMemo(
		() =>
			images.map((file) => ({
				name: file.name,
				url: URL.createObjectURL(file),
			})),
		[images],
	)

	useEffect(() => {
		return () => {
			previews.forEach((preview) => {
				URL.revokeObjectURL(preview.url)
			})
		}
	}, [previews])

	const handleAdd = (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || [])
		if (!files.length) return
		const next = [...images, ...files].slice(0, maxImages)
		onChange(next)
		event.target.value = ""
	}

	const handleRemove = (index: number) => {
		const next = images.filter((_, idx) => idx !== index)
		onChange(next)
	}

	return (
		<Card className={cn("glass-card", className)}>
			<CardHeader>
				<CardTitle className="text-lg font-semibold">图片上传</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-wrap gap-4">
					{previews.map((preview, index) => (
						<div
							key={preview.url}
							className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-border bg-muted"
						>
							<img
								src={preview.url}
								alt={preview.name}
								className="h-full w-full object-cover"
							/>
							<Button
								variant="secondary"
								size="icon"
								className="absolute right-1 top-1 h-7 w-7 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
								onClick={() => handleRemove(index)}
								type="button"
							>
								<Trash2 className="h-3 w-3" />
							</Button>
						</div>
					))}
					{images.length < maxImages ? (
						<label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary">
							<ImagePlus className="h-5 w-5" />
							<span>上传图片</span>
							<input
								type="file"
								accept="image/*"
								multiple
								className="hidden"
								onChange={handleAdd}
							/>
						</label>
					) : null}
				</div>
				<p className="text-xs text-muted-foreground">
					支持上传 {maxImages} 张以内的封面/案例图，用于展示代理人作品。
				</p>
			</CardContent>
		</Card>
	)
}

export default ImageUploader
