declare module "quicklink" {
	interface QuicklinkOptions {
		el?: HTMLElement
		urls?: string[]
		timeout?: number
		throttle?: number
		limit?: number
		threshold?: number
		priority?: boolean
		origins?: string[]
		ignores?: Array<RegExp | ((uri: string, elem: Element) => boolean)>
	}

	export function listen(options?: QuicklinkOptions): void
	export function prefetch(
		urls: string | string[],
		isPriority?: boolean,
	): Promise<void>
}
