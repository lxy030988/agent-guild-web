import { ArrowLeft } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { EmptyState } from "@/components/common"

const AgentDetail = () => {
	const { id } = useParams()
	const navigate = useNavigate()

	return (
		<section className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-16">
			<EmptyState
				title="代理人详情开发中"
				description={`Agent #${id ?? "-"} 的详情页正在建设中。`}
				action={{
					label: "返回列表",
					onClick: () => navigate("/agents"),
				}}
			>
				<Link
					to="/agents"
					className="mt-4 inline-flex items-center gap-2 text-sm text-primary"
				>
					<ArrowLeft className="h-4 w-4" />
					返回列表
				</Link>
			</EmptyState>
		</section>
	)
}

export default AgentDetail
