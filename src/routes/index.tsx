import { Loading, PageNotFoundView } from "@/components/common"
import MainLayout from "@/layouts/Layout"
import { lazy, Suspense } from "react"
import type { RouteObject } from "react-router-dom"

const Demo = lazy(() => import("@/pages/Demo"))
const Home = lazy(() => import("@/pages/Home"))
const StorageDemo = lazy(() => import("@/pages/StorageDemo"))
const ContractDemo = lazy(() => import("@/pages/ContractDemo"))

// Auth pages
const ProfilePage = lazy(() => import("@/pages/ProfilePage"))

// Jobs pages
const JobsPage = lazy(() => import("@/pages/JobsPage"))
const JobDetailPage = lazy(() => import("@/pages/JobDetailPage"))
const JobCreatePage = lazy(() => import("@/pages/JobCreatePage"))
const MyJobsPage = lazy(() => import("@/pages/MyJobsPage"))

const routes: RouteObject[] = [
	{
		path: "/",
		element: <MainLayout />,
		children: [
			{
				index: true,
				element: (
					<Suspense fallback={<Loading />}>
						<Home />
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
				path: "profile",
				element: (
					<Suspense fallback={<Loading />}>
						<ProfilePage />
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
		],
	},

	{
		path: "*",
		element: <PageNotFoundView />,
	},
]

export default routes
