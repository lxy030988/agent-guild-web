import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import type {
	Job,
	JobAgentMatch,
	JobCategory,
	JobStatus,
	QueryJobParams,
} from "../utils/job-api"

/**
 * Jobs 列表
 */
export const jobListAtom = atom<Job[]>([])

/**
 * Jobs 查询参数
 */
export const jobQueryAtom = atomWithStorage<QueryJobParams>("jobQuery", {
	page: 1,
	limit: 20,
	sortBy: "createdAt",
	order: "desc",
})

/**
 * Job 分类筛选
 */
export const jobCategoryFilterAtom = atom<JobCategory | "ALL">("ALL")

/**
 * Job 状态筛选
 */
export const jobStatusFilterAtom = atom<JobStatus[]>([])

/**
 * 搜索关键词
 */
export const jobSearchAtom = atom<string>("")

/**
 * 排序字段
 */
export const jobSortByAtom = atom<"createdAt" | "budget">("createdAt")

/**
 * 排序方向
 */
export const jobSortOrderAtom = atom<"asc" | "desc">("desc")

/**
 * 当前选中的 Job
 */
export const selectedJobAtom = atom<Job | null>(null)

/**
 * Job 推荐 Agents
 */
export const jobRecommendationsAtom = atom<JobAgentMatch[]>([])

/**
 * 我发布的 Jobs
 */
export const myPublishedJobsAtom = atom<Job[]>([])

/**
 * 分配给我的 Jobs
 */
export const myAssignedJobsAtom = atom<Job[]>([])

/**
 * Loading 状态
 */
export const jobLoadingAtom = atom<boolean>(false)

/**
 * 分页元数据
 */
export const jobPaginationAtom = atom({
	total: 0,
	page: 1,
	limit: 20,
	totalPages: 0,
})

/**
 * 我发布的 Jobs 分页
 */
export const myPublishedPaginationAtom = atom({
	total: 0,
	page: 1,
	limit: 20,
	totalPages: 0,
})

/**
 * 分配给我的 Jobs 分页
 */
export const myAssignedPaginationAtom = atom({
	total: 0,
	page: 1,
	limit: 20,
	totalPages: 0,
})
