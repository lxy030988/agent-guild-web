import { memo } from "react"
import { Link } from "react-router-dom"

const PageNotFoundView = () => {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<h1 className="text-9xl font-bold text-gray-200">404</h1>
				<h2 className="text-4xl font-semibold text-gray-700 mt-4">
					Page Not Found
				</h2>
				<p className="text-gray-500 mt-4 mb-8">
					The page you are looking for does not exist.
				</p>
				<Link
					to="/"
					className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
				>
					Go Back Home
				</Link>
			</div>
		</div>
	)
}

export default memo(PageNotFoundView)
