import { memo } from "react"

const About = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-16 px-4">
			<div className="max-w-5xl mx-auto">
				{/* Header */}
				<div className="text-center mb-16 animate-fade-in">
					<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
						关于
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
							{" "}
							我们
						</span>
					</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
						我们致力于打造卓越的数字体验，通过创新技术和精美设计，为用户提供最佳的产品和服务
					</p>
				</div>

				{/* Mission Section */}
				<div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12 animate-slide-up">
					<div className="flex items-center mb-6">
						<div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
							<svg
								className="w-6 h-6 text-purple-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>使命图标</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h2 className="text-3xl font-bold text-gray-900">我们的使命</h2>
					</div>
					<p className="text-lg text-gray-700 leading-relaxed mb-4">
						我们相信技术应该让生活更美好。通过不断创新和改进，我们致力于创造直观、高效且令人愉悦的数字产品。
					</p>
					<p className="text-lg text-gray-700 leading-relaxed">
						我们的目标是将复杂的技术转化为简单易用的解决方案，让每个人都能从中受益。
					</p>
				</div>

				{/* Values Grid */}
				<div className="grid md:grid-cols-2 gap-8 mb-12">
					<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
						<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>创新图标</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
								/>
							</svg>
						</div>
						<h3 className="text-2xl font-bold mb-3">创新驱动</h3>
						<p className="text-blue-50 leading-relaxed">
							我们不断探索新技术、新方法，勇于挑战传统，追求卓越的创新成果。
						</p>
					</div>

					<div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
						<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>用户图标</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</div>
						<h3 className="text-2xl font-bold mb-3">用户至上</h3>
						<p className="text-purple-50 leading-relaxed">
							用户体验是我们的核心关注点，我们倾听用户需求，持续优化产品和服务。
						</p>
					</div>

					<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
						<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>质量图标</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h3 className="text-2xl font-bold mb-3">品质保证</h3>
						<p className="text-green-50 leading-relaxed">
							我们对每个细节都精益求精，确保交付的产品达到最高质量标准。
						</p>
					</div>

					<div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
						<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>团队图标</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
								/>
							</svg>
						</div>
						<h3 className="text-2xl font-bold mb-3">团队协作</h3>
						<p className="text-orange-50 leading-relaxed">
							我们相信团队的力量，通过紧密协作和相互支持，创造更大价值。
						</p>
					</div>
				</div>

				{/* Team Stats */}
				<div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
					<h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
						团队数据
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						<div className="text-center">
							<div className="text-5xl font-bold text-primary-600 mb-2">
								10+
							</div>
							<div className="text-gray-600 font-medium">年经验</div>
						</div>
						<div className="text-center">
							<div className="text-5xl font-bold text-secondary-600 mb-2">
								500+
							</div>
							<div className="text-gray-600 font-medium">项目完成</div>
						</div>
						<div className="text-center">
							<div className="text-5xl font-bold text-green-600 mb-2">
								1000+
							</div>
							<div className="text-gray-600 font-medium">满意客户</div>
						</div>
						<div className="text-center">
							<div className="text-5xl font-bold text-orange-600 mb-2">50+</div>
							<div className="text-gray-600 font-medium">团队成员</div>
						</div>
					</div>
				</div>

				{/* Contact CTA */}
				<div className="mt-12 text-center">
					<div className="inline-block bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 shadow-xl">
						<h3 className="text-2xl font-bold text-white mb-3">
							想要了解更多？
						</h3>
						<p className="text-white/90 mb-6">欢迎与我们联系，探讨合作机会</p>
						<button
							type="button"
							className="px-8 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-50 active:scale-95 transition-all duration-200 shadow-lg"
						>
							联系我们
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default memo(About)
