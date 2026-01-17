import { Loading, PageNotFoundView } from "@/components/common"
import MainLayout from "@/layouts/Layout"
import { lazy, Suspense } from "react"
import type { RouteObject } from "react-router-dom"

const Demo = lazy(() => import("@/pages/Demo"))
const Home = lazy(() => import("@/pages/Home"))
const StorageDemo = lazy(() => import("@/pages/StorageDemo"))
const ContractDemo = lazy(() => import("@/pages/ContractDemo"))
const ComponentDemo = lazy(() => import("@/pages/ComponentDemo"))
const AgentList = lazy(() => import("@/pages/AgentList"))
const AgentDetail = lazy(() => import("@/pages/AgentDetail"))

// Auth pages
const ProfilePage = lazy(() => import("@/pages/ProfilePage"))

// Agent pages
const AgentsPage = lazy(() => import("@/pages/AgentsPage"))
const AgentDetailPage = lazy(() => import("@/pages/AgentDetailPage"))
const AgentCreatePage = lazy(() => import("@/pages/AgentCreatePage"))

// Jobs pages
const JobsPage = lazy(() => import("@/pages/JobsPage"))
const JobDetailPage = lazy(() => import("@/pages/JobDetailPage"))
const JobCreatePage = lazy(() => import("@/pages/JobCreatePage"))
const MyJobsPage = lazy(() => import("@/pages/MyJobsPage"))

// Wallet & Bills pages
const WalletPage = lazy(() => import("@/pages/WalletPage"))
const BillsPage = lazy(() => import("@/pages/BillsPage"))

// Dashboard page
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const Dashboard = lazy(() => import("@/pages/Dashboard"))

// DAO pages
const DAOPage = lazy(() => import("@/pages/DAOPage"))
const DisputeDetailPage = lazy(() => import("@/pages/DisputeDetailPage"))

const routes: RouteObject[] = [
	{
		path: "/",
		element: <MainLayout />,
		children: [
			{
				index: true,
				element: (
					<Suspense fallback={<Loading />}>
						<DashboardPage />
					</Suspense>
				),
			},

			{
				path: "/demo",
				element: (
					<Suspense fallback={<Loading />}>
						<Demo />
					</Suspense>
				),
			},

			{
				path: "storage-demo",
				element: (
					<Suspense fallback={<Loading />}>
						<StorageDemo />
					</Suspense>
				),
			},
			{
				path: "contract-demo",
				element: (
					<Suspense fallback={<Loading />}>
						<ContractDemo />
					</Suspense>
				),
			},
			{
				path: "components",
				element: (
					<Suspense fallback={<Loading />}>
						<ComponentDemo />
					</Suspense>
				),
			},
			{
				path: "profile",
				element: (
					<Suspense fallback={<Loading />}>
						<ProfilePage />
					</Suspense>
				),
			},
			{
				path: "agents",
				element: (
					<Suspense fallback={<Loading />}>
						<AgentsPage />
					</Suspense>
				),
			},
			{
				path: "agents/create",
				element: (
					<Suspense fallback={<Loading />}>
						<AgentCreatePage />
					</Suspense>
				),
			},
			{
				path: "agents/:id",
				element: (
					<Suspense fallback={<Loading />}>
						<AgentDetailPage />
					</Suspense>
				),
			},
			{
				path: "jobs",
				element: (
					<Suspense fallback={<Loading />}>
						<JobsPage />
					</Suspense>
				),
			},
			{
				path: "jobs/create",
				element: (
					<Suspense fallback={<Loading />}>
						<JobCreatePage />
					</Suspense>
				),
			},
			{
				path: "jobs/my",
				element: (
					<Suspense fallback={<Loading />}>
						<MyJobsPage />
					</Suspense>
				),
			},
			{
				path: "jobs/:id",
				element: (
					<Suspense fallback={<Loading />}>
						<JobDetailPage />
					</Suspense>
				),
			},
			{
				path: "wallet",
				element: (
					<Suspense fallback={<Loading />}>
						<WalletPage />
					</Suspense>
				),
			},
			{
				path: "bills",
				element: (
					<Suspense fallback={<Loading />}>
						<BillsPage />
					</Suspense>
				),
			},
			{
				path: "dao",
				element: (
					<Suspense fallback={<Loading />}>
						<DAOPage />
					</Suspense>
				),
			},
			{
				path: "dao/:id",
				element: (
					<Suspense fallback={<Loading />}>
						<DisputeDetailPage />
					</Suspense>
				),
			},
			{
				path: "dashboard",
				element: (
					<Suspense fallback={<Loading />}>
						<Dashboard />
					</Suspense>
				),
			},
		],
	},

	{
		path: "*",
		element: <PageNotFoundView />,
	},
]

export default routes
