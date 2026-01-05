import { memo, useState } from "react"

const Demo = () => {
	const [count, setCount] = useState(0)

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
			{/* Hero Section */}
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-16 animate-fade-in">
					<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
						Tailwind CSS
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
							{" "}
							Demo
						</span>
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						探索 Tailwind CSS 的强大功能与精美设计
					</p>
				</div>

				{/* Feature Cards */}
				<div className="grid md:grid-cols-3 gap-8 mb-16 animate-slide-up">
					<div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
						<div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-primary-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Code</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">极速开发</h3>
						<p className="text-gray-600">
							使用实用优先的类名快速构建现代化界面
						</p>
					</div>

					<div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
						<div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-secondary-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Code</title>

								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
								/>
							</svg>
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">高度定制</h3>
						<p className="text-gray-600">
							轻松自定义颜色、间距、字体等设计系统
						</p>
					</div>

					<div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
						<div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Code</title>

								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">响应式设计</h3>
						<p className="text-gray-600">内置响应式修饰符，适配所有屏幕尺寸</p>
					</div>
				</div>

				{/* Interactive Component */}
				<div className="bg-white rounded-3xl shadow-2xl p-8 mb-16">
					<h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
						交互式计数器
					</h2>
					<div className="flex flex-col items-center space-y-6">
						<div className="text-6xl font-bold text-primary-600">{count}</div>
						<div className="flex gap-4">
							<button
								type="button"
								onClick={() => setCount(count - 1)}
								className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
							>
								减少
							</button>
							<button
								type="button"
								onClick={() => setCount(0)}
								className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
							>
								重置
							</button>
							<button
								type="button"
								onClick={() => setCount(count + 1)}
								className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
							>
								增加
							</button>
						</div>
					</div>
				</div>

				{/* Color Palette */}
				<div className="bg-white rounded-3xl shadow-2xl p-8">
					<h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
						自定义调色板
					</h2>
					<div className="space-y-6">
						<div>
							<h3 className="text-lg font-semibold text-gray-700 mb-3">
								Primary Colors
							</h3>
							<div className="grid grid-cols-5 md:grid-cols-9 gap-2">
								{[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
									(shade) => (
										<div key={shade} className="text-center">
											<div
												className={`w-full h-16 rounded-lg bg-primary-${shade} shadow-md mb-1`}
											/>
											<span className="text-xs text-gray-600">{shade}</span>
										</div>
									),
								)}
							</div>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-700 mb-3">
								Secondary Colors
							</h3>
							<div className="grid grid-cols-5 md:grid-cols-9 gap-2">
								{[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
									(shade) => (
										<div key={shade} className="text-center">
											<div
												className={`w-full h-16 rounded-lg bg-secondary-${shade} shadow-md mb-1`}
											/>
											<span className="text-xs text-gray-600">{shade}</span>
										</div>
									),
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-16 text-gray-600">
					<p className="text-sm">
						使用 Tailwind CSS 4.x 构建 • 配置文件：tailwind.config.js
					</p>
				</div>
			</div>
		</div>
	)
}

export default memo(Demo)
