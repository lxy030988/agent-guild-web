import {
	AlertCircle,
	Bell,
	Check,
	Info,
	Mail,
	Search,
	Settings,
	User,
} from "lucide-react"
import { memo, useState } from "react"
import toast from "react-hot-toast"

import {
	ConfirmDialog,
	EmptyState,
	Footer,
	Pagination,
	SearchBar,
} from "@/components/common"
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Checkbox,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	Skeleton,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Textarea,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui"

const ComponentDemo = () => {
	const [checkboxChecked, setCheckboxChecked] = useState(false)
	const [selectValue, setSelectValue] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [loading, setLoading] = useState(false)

	const handleSearch = (value: string) => {
		toast.success(`搜索: ${value || "(空)"}`)
	}

	const handleConfirm = async () => {
		setLoading(true)
		await new Promise((resolve) => setTimeout(resolve, 1000))
		setLoading(false)
		toast.success("操作已确认!")
	}

	return (
		<TooltipProvider>
			<div className="min-h-screen bg-background">
				<div className="container mx-auto max-w-6xl px-4 py-12">
					<div className="mb-12 text-center">
						<h1 className="mb-4 text-4xl font-bold">组件库演示</h1>
						<p className="text-muted-foreground">
							Epic 1: 基础架构完善 - UI 组件库 + 公共组件
						</p>
					</div>

					<Tabs defaultValue="ui" className="space-y-8">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="ui">UI 组件</TabsTrigger>
							<TabsTrigger value="common">公共组件</TabsTrigger>
						</TabsList>

						<TabsContent value="ui" className="space-y-8">
							{/* Button */}
							<Card>
								<CardHeader>
									<CardTitle>Button 按钮</CardTitle>
									<CardDescription>支持多种变体和 loading 状态</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex flex-wrap gap-2">
										<Button>Default</Button>
										<Button variant="secondary">Secondary</Button>
										<Button variant="destructive">Destructive</Button>
										<Button variant="outline">Outline</Button>
										<Button variant="ghost">Ghost</Button>
										<Button variant="link">Link</Button>
									</div>
									<div className="flex flex-wrap gap-2">
										<Button size="sm">Small</Button>
										<Button size="default">Default</Button>
										<Button size="lg">Large</Button>
										<Button size="icon">
											<Settings className="h-4 w-4" />
										</Button>
									</div>
									<div className="flex flex-wrap gap-2">
										<Button loading>Loading</Button>
										<Button disabled>Disabled</Button>
									</div>
								</CardContent>
							</Card>

							{/* Input */}
							<Card>
								<CardHeader>
									<CardTitle>Input 输入框</CardTitle>
									<CardDescription>支持前后缀图标和错误状态</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-4 sm:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="default">默认输入框</Label>
											<Input id="default" placeholder="请输入..." />
										</div>
										<div className="space-y-2">
											<Label htmlFor="with-icon">带图标输入框</Label>
											<Input
												id="with-icon"
												placeholder="搜索..."
												prefix={<Search />}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email">邮箱输入框</Label>
											<Input
												id="email"
												type="email"
												placeholder="email@example.com"
												prefix={<Mail />}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="error">错误状态</Label>
											<Input
												id="error"
												variant="error"
												placeholder="错误输入"
												suffix={<AlertCircle className="text-destructive" />}
											/>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Textarea */}
							<Card>
								<CardHeader>
									<CardTitle>Textarea 文本域</CardTitle>
									<CardDescription>支持自动高度和字符计数</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-4 sm:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="textarea-default">默认文本域</Label>
											<Textarea
												id="textarea-default"
												placeholder="请输入内容..."
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="textarea-count">带字符计数</Label>
											<Textarea
												id="textarea-count"
												placeholder="最多输入 100 字..."
												maxLength={100}
												showCount
											/>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Select */}
							<Card>
								<CardHeader>
									<CardTitle>Select 选择器</CardTitle>
									<CardDescription>基于 Radix UI 的下拉选择</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="max-w-xs space-y-2">
										<Label htmlFor="select">选择类别</Label>
										<Select value={selectValue} onValueChange={setSelectValue}>
											<SelectTrigger>
												<SelectValue placeholder="请选择..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="design">设计</SelectItem>
												<SelectItem value="development">开发</SelectItem>
												<SelectItem value="marketing">营销</SelectItem>
												<SelectItem value="consulting">咨询</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</CardContent>
							</Card>

							{/* Checkbox */}
							<Card>
								<CardHeader>
									<CardTitle>Checkbox 复选框</CardTitle>
									<CardDescription>支持选中、未选中和半选状态</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center space-x-4">
										<div className="flex items-center space-x-2">
											<Checkbox
												id="terms"
												checked={checkboxChecked}
												onCheckedChange={(checked) =>
													setCheckboxChecked(checked as boolean)
												}
											/>
											<Label htmlFor="terms">同意服务条款</Label>
										</div>
										<div className="flex items-center space-x-2">
											<Checkbox id="indeterminate" checked="indeterminate" />
											<Label htmlFor="indeterminate">半选状态</Label>
										</div>
										<div className="flex items-center space-x-2">
											<Checkbox id="disabled" disabled />
											<Label htmlFor="disabled">禁用状态</Label>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Badge */}
							<Card>
								<CardHeader>
									<CardTitle>Badge 徽章</CardTitle>
									<CardDescription>多种颜色变体的状态标签</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-2">
										<Badge>Default</Badge>
										<Badge variant="secondary">Secondary</Badge>
										<Badge variant="destructive">Destructive</Badge>
										<Badge variant="outline">Outline</Badge>
										<Badge variant="success">Success</Badge>
										<Badge variant="warning">Warning</Badge>
										<Badge variant="info">Info</Badge>
									</div>
								</CardContent>
							</Card>

							{/* Tooltip */}
							<Card>
								<CardHeader>
									<CardTitle>Tooltip 提示</CardTitle>
									<CardDescription>支持多个方向的提示气泡</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-4">
										<Tooltip>
											<TooltipTrigger asChild>
												<Button variant="outline">上方提示</Button>
											</TooltipTrigger>
											<TooltipContent side="top">
												<p>这是上方提示</p>
											</TooltipContent>
										</Tooltip>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button variant="outline">下方提示</Button>
											</TooltipTrigger>
											<TooltipContent side="bottom">
												<p>这是下方提示</p>
											</TooltipContent>
										</Tooltip>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button variant="outline">左侧提示</Button>
											</TooltipTrigger>
											<TooltipContent side="left">
												<p>这是左侧提示</p>
											</TooltipContent>
										</Tooltip>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button variant="outline">右侧提示</Button>
											</TooltipTrigger>
											<TooltipContent side="right">
												<p>这是右侧提示</p>
											</TooltipContent>
										</Tooltip>
									</div>
								</CardContent>
							</Card>

							{/* Dialog */}
							<Card>
								<CardHeader>
									<CardTitle>Dialog 对话框</CardTitle>
									<CardDescription>支持多种尺寸，ESC 可关闭</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-2">
										<Dialog>
											<DialogTrigger asChild>
												<Button variant="outline">小型对话框</Button>
											</DialogTrigger>
											<DialogContent size="sm">
												<DialogHeader>
													<DialogTitle>小型对话框</DialogTitle>
													<DialogDescription>
														这是一个小型对话框示例
													</DialogDescription>
												</DialogHeader>
												<p>对话框内容...</p>
											</DialogContent>
										</Dialog>

										<Dialog>
											<DialogTrigger asChild>
												<Button variant="outline">默认对话框</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>默认对话框</DialogTitle>
													<DialogDescription>
														这是一个默认对话框示例
													</DialogDescription>
												</DialogHeader>
												<p>对话框内容...</p>
												<DialogFooter>
													<Button variant="outline">取消</Button>
													<Button>确认</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>

										<Dialog>
											<DialogTrigger asChild>
												<Button variant="outline">大型对话框</Button>
											</DialogTrigger>
											<DialogContent size="lg">
												<DialogHeader>
													<DialogTitle>大型对话框</DialogTitle>
													<DialogDescription>
														这是一个大型对话框示例
													</DialogDescription>
												</DialogHeader>
												<p>大型对话框适合展示更多内容...</p>
											</DialogContent>
										</Dialog>
									</div>
								</CardContent>
							</Card>

							{/* Sheet */}
							<Card>
								<CardHeader>
									<CardTitle>Sheet 侧边栏</CardTitle>
									<CardDescription>支持左右方向的抽屉组件</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-2">
										<Sheet>
											<SheetTrigger asChild>
												<Button variant="outline">左侧抽屉</Button>
											</SheetTrigger>
											<SheetContent side="left">
												<SheetHeader>
													<SheetTitle>左侧抽屉</SheetTitle>
													<SheetDescription>
														这是从左侧滑出的抽屉
													</SheetDescription>
												</SheetHeader>
												<div className="py-4">抽屉内容...</div>
											</SheetContent>
										</Sheet>

										<Sheet>
											<SheetTrigger asChild>
												<Button variant="outline">右侧抽屉</Button>
											</SheetTrigger>
											<SheetContent side="right">
												<SheetHeader>
													<SheetTitle>右侧抽屉</SheetTitle>
													<SheetDescription>
														这是从右侧滑出的抽屉
													</SheetDescription>
												</SheetHeader>
												<div className="py-4">抽屉内容...</div>
											</SheetContent>
										</Sheet>
									</div>
								</CardContent>
							</Card>

							{/* Skeleton */}
							<Card>
								<CardHeader>
									<CardTitle>Skeleton 骨架屏</CardTitle>
									<CardDescription>加载状态的占位组件</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-center space-x-4">
											<Skeleton className="h-12 w-12 rounded-full" />
											<div className="space-y-2">
												<Skeleton className="h-4 w-[250px]" />
												<Skeleton className="h-4 w-[200px]" />
											</div>
										</div>
										<Skeleton className="h-[125px] w-full rounded-xl" />
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="common" className="space-y-8">
							{/* SearchBar */}
							<Card>
								<CardHeader>
									<CardTitle>SearchBar 搜索框</CardTitle>
									<CardDescription>支持 debounce 和清除按钮</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="max-w-md">
										<SearchBar
											placeholder="搜索代理人..."
											onSearch={handleSearch}
											debounceMs={300}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Pagination */}
							<Card>
								<CardHeader>
									<CardTitle>Pagination 分页</CardTitle>
									<CardDescription>支持页码切换和总数显示</CardDescription>
								</CardHeader>
								<CardContent>
									<Pagination
										total={100}
										current={currentPage}
										pageSize={10}
										onChange={setCurrentPage}
										showTotal
									/>
								</CardContent>
							</Card>

							{/* EmptyState */}
							<Card>
								<CardHeader>
									<CardTitle>EmptyState 空状态</CardTitle>
									<CardDescription>自定义图标、文案和操作按钮</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-8 sm:grid-cols-2">
										<EmptyState
											title="暂无数据"
											description="还没有任何内容，试试创建一个吧"
											action={{
												label: "创建新项目",
												onClick: () => toast.success("点击了创建按钮"),
											}}
										/>
										<EmptyState
											icon={Bell}
											title="暂无通知"
											description="您目前没有任何新通知"
										/>
									</div>
								</CardContent>
							</Card>

							{/* ConfirmDialog */}
							<Card>
								<CardHeader>
									<CardTitle>ConfirmDialog 确认对话框</CardTitle>
									<CardDescription>
										确认/取消回调正常，支持危险操作样式
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex gap-2">
										<Button
											variant="outline"
											onClick={() => setConfirmOpen(true)}
										>
											打开确认对话框
										</Button>
										<ConfirmDialog
											open={confirmOpen}
											onOpenChange={setConfirmOpen}
											title="确认删除"
											description="删除后将无法恢复，确定要继续吗？"
											confirmText="确认删除"
											variant="destructive"
											onConfirm={handleConfirm}
											loading={loading}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Toast Demo */}
							<Card>
								<CardHeader>
									<CardTitle>Toast 消息提示</CardTitle>
									<CardDescription>
										基于 react-hot-toast 的通知系统
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-2">
										<Button
											variant="outline"
											onClick={() => toast.success("操作成功!")}
										>
											<Check className="mr-2 h-4 w-4" />
											成功提示
										</Button>
										<Button
											variant="outline"
											onClick={() => toast.error("操作失败!")}
										>
											<AlertCircle className="mr-2 h-4 w-4" />
											错误提示
										</Button>
										<Button variant="outline" onClick={() => toast("普通消息")}>
											<Info className="mr-2 h-4 w-4" />
											普通提示
										</Button>
										<Button
											variant="outline"
											onClick={() =>
												toast.promise(
													new Promise((resolve) => setTimeout(resolve, 2000)),
													{
														loading: "加载中...",
														success: "加载完成!",
														error: "加载失败!",
													},
												)
											}
										>
											<User className="mr-2 h-4 w-4" />
											Promise 提示
										</Button>
									</div>
								</CardContent>
							</Card>

							{/* Footer Preview */}
							<Card>
								<CardHeader>
									<CardTitle>Footer 页脚</CardTitle>
									<CardDescription>响应式布局的页脚组件</CardDescription>
								</CardHeader>
								<CardContent className="p-0">
									<Footer
										links={[
											{ label: "关于我们", href: "#" },
											{ label: "服务条款", href: "#" },
											{ label: "隐私政策", href: "#" },
											{ label: "联系我们", href: "#" },
										]}
									/>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</TooltipProvider>
	)
}

export default memo(ComponentDemo)
