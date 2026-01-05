import { memo } from "react"
import { Link } from "react-router-dom"

const Header = () => {
	return (
		<header className="bg-white shadow-sm">
			<nav className="mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<Link to="/" className="text-2xl font-bold text-blue-600">
						ReactTemplate
					</Link>
					<ul className="flex items-center gap-6">
						<li>
							<Link
								to="/"
								className="text-gray-700 hover:text-blue-600 transition-colors"
							>
								Home
							</Link>
						</li>
						<li>
							<Link
								to="/about"
								className="text-gray-700 hover:text-blue-600 transition-colors"
							>
								About
							</Link>
						</li>

						<li>
							<Link
								to="/transform-example"
								className="text-gray-700 hover:text-blue-600 transition-colors"
							>
								Transform Example
							</Link>
						</li>

						<li>
							<Link
								to="/storage-demo"
								className="text-gray-700 hover:text-blue-600 transition-colors"
							>
								💾 Storage
							</Link>
						</li>
					</ul>
				</div>
			</nav>
		</header>
	)
}

export default memo(Header)
