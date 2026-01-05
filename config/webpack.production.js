const TerserPlugin = require("terser-webpack-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const { join, resolve } = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const Critters = require("critters-webpack-plugin")
const CompressionPlugin = require("compression-webpack-plugin")
const BrotliPlugin = require("brotli-webpack-plugin")
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin")
const { InjectManifest } = require("workbox-webpack-plugin")

module.exports = {
	output: {
		path: join(__dirname, "../dist"),
		publicPath: "/",
		filename: "scripts/[name].[contenthash:5].bundle.js",
		assetModuleFilename: "images/[name].[contenthash:5][ext]",
	},
	performance: {
		maxAssetSize: 250000, // 最大资源大小250KB
		maxEntrypointSize: 250000, // 最大入口资源大小250KB
		hints: "warning", // 超出限制时只给出警告
	},
	optimization: {
		minimize: true,
		//css + js 多线程压缩 加快编译速度
		//电脑本身就比较慢 反而更慢
		minimizer: [
			new CssMinimizerPlugin({
				parallel: true,
			}),
			new TerserPlugin({
				parallel: true,
			}),
			new ImageMinimizerPlugin({
				test: /\.(jpe?g|png|gif|webp|avif)$/i,
				minimizer: {
					implementation: ImageMinimizerPlugin.sharpMinify,
					options: {
						encodeOptions: {
							jpeg: { quality: 75, progressive: true },
							png: { quality: 75, compressionLevel: 9 },
							gif: { interlaced: true },
							webp: { quality: 75 },
							avif: { quality: 50 },
						},
					},
				},
				generator: [
					{
						preset: "webp",
						implementation: ImageMinimizerPlugin.sharpGenerate,
						filename: "images/[name].[contenthash:5][ext]",
						options: {
							encodeOptions: {
								webp: { quality: 75 },
							},
						},
					},
					{
						preset: "avif",
						implementation: ImageMinimizerPlugin.sharpGenerate,
						filename: "images/[name].[contenthash:5][ext]",
						options: {
							encodeOptions: {
								avif: { quality: 50 },
							},
						},
					},
				],
			}),
		],
	},
	externals: {
		react: "React",
		"react-dom": "ReactDOM",
		"react-dom/client": "ReactDOM",
		"@remix-run/router": "RemixRouter",
		"react-router": "ReactRouter",
		"react-router-dom": "ReactRouterDOM",
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "Yideng",
			filename: "index.html",
			template: resolve(__dirname, "../src/index-prod.html"),
			favicon: "./public/favicon.ico",
			inject: "body",
		}),
		// Critters：智能提取并 inline 关键 CSS（Critical CSS）
		// 只 inline 首屏需要的样式，非关键样式通过 <link> 异步加载
		// 优点：
		// 1. HTML 保持小巧（通常只增加 3-8KB）
		// 2. 首屏渲染更快（无需等待 CSS 文件下载）
		// 3. 非关键样式仍可被缓存
		new Critters({
			// 只处理本地 CSS 文件
			external: false,
			// 内联首屏关键 CSS
			inlineThreshold: 0,
			// 最小化内联的 CSS
			minimumExternalSize: 0,
			// 为非关键 CSS 添加 preload
			preload: "swap",
			// 不裁剪字体
			pruneSource: false,
			// 压缩内联的 CSS
			compress: true,
		}),
		// GZIP 压缩
		new CompressionPlugin({
			algorithm: "gzip",
			test: /\.(js|css|html|svg)$/i,
			threshold: 10240,
			minRatio: 0.8,
		}),
		// Brotli 压缩（比GZIP压缩率更高 15-20%）
		new BrotliPlugin({
			asset: "[path].br[query]",
			test: /\.(js|css|html|svg)$/i,
			threshold: 10240,
			minRatio: 0.8,
		}),
		// Workbox Service Worker
		// 使用 InjectManifest 模式，允许自定义 Service Worker
		new InjectManifest({
			swSrc: resolve(__dirname, "../src/service-worker.ts"),
			swDest: "service-worker.js",
			// 预缓存的文件类型
			include: [/\.html$/, /\.js$/, /\.css$/],
			// 排除不需要预缓存的文件
			exclude: [
				/\.map$/,
				/manifest$/,
				/\.br$/,
				/\.gz$/,
				/^service-worker\.js$/,
			],
			// 最大文件大小 (2MB)
			maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
		}),
	],
}
