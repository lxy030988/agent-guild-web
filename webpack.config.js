const { resolve } = require("path")
const merge = require("webpack-merge")
const getArgv = () => {
	const args = process.argv.slice(2)
	const result = {}
	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--mode" && args[i + 1]) {
			result.mode = args[i + 1]
		} else if (args[i].startsWith("--mode=")) {
			result.mode = args[i].split("=")[1]
		}
	}
	return result
}
const argv = getArgv()
const _mode = argv.mode || "development"
const _mergeConfig = require(`./config/webpack.${_mode}.js`)
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const _modeflag = _mode === "production" ? true : false
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
// const ProgressBarPlugin = require('progress-bar-webpack-plugin');
// const WebpackBar = require('webpackbar');
const { ThemedProgressPlugin } = require("themed-progress-plugin")

const webpackBaseConfig = {
	entry: {
		main: resolve("src/index.tsx"),
	},
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				exclude: /(node_modules)/,
				use: {
					// `.swcrc` can be used to configure swc
					loader: "swc-loader",
				},
			},
			{
				test: /\.(png|jpg|jpeg|gif|svg)$/i,
				type: "asset",
				parser: {
					dataUrlCondition: {
						maxSize: 8 * 1024, // 8kb 以下内联
					},
				},
			},
			{
				test: /\.css$/i,
				use: [
					MiniCssExtractPlugin.loader,
					// 'style-loader',
					{ loader: "css-loader", options: { importLoaders: 2 } },
					// 自定义 loader：转换 matrix3d 为可读的 transform 函数
					// 注意：loader 从下到上执行，所以这个要在 postcss-loader 之前
					{
						loader: resolve("loaders/transform-matrix-loader.js"),
						options: {
							precision: 4, // 数字精度
							verbose: true, // 显示转换日志
						},
					},
					"postcss-loader",
				],
			},
		],
	},
	optimization: {
		// 分离运行时代码，提升业务包与三方包的长期缓存命中率。
		runtimeChunk: {
			name: "runtime",
		},
		splitChunks: {
			// 对所有类型的 chunk 进行拆分，减少重复并提升缓存复用。
			chunks: "all",
			// 控制首屏请求数量，避免单包过大。
			maxInitialRequests: 5,
			// name: true,
			// 放宽异步请求数量，避免被强制合并成大包。
			maxAsyncRequests: 8,
			// 避免过小的碎片化 chunk，保持一个实用的最小体积。
			minRemainingSize: 20000,
			cacheGroups: {
				commons: {
					// 多处复用的业务代码。
					chunks: "all",
					name: "chunk-common",
					minChunks: 2,
					maxInitialRequests: 5,
					priority: 1,
					reuseExistingChunk: true,
				},
				vendors: {
					// 所有第三方依赖。
					name: "chunk-vendors",
					test: /[\\/]node_modules[\\/]/,
					chunks: "all",
					priority: 2,
					reuseExistingChunk: true,
				},
				solvProtocol: {
					// 内部 monorepo-base 相关包。
					name: "chunk-monorepo-base",
					test: /[\\/]node_modules[\\/]@monorepo-base*\w/,
					chunks: "all",
					priority: 3,
					reuseExistingChunk: true,
				},
				muiComponent: {
					// UI 相关库，变更频率相对较低。
					name: "chunk-monorepo-base-components",
					test: /([\\/]node_modules[\\/]@mui[\\/].+\w)|([\\/]node_modules[\\/]@monorepo-base[\\/]components)/,
					chunks: "all",
					priority: 4,
					reuseExistingChunk: true,
				},
				wagmiSDK: {
					// 体积较大的 SDK 单独拆分，控制 vendor 体积。
					name: "chunk-wagmi-sdk",
					test: /[\\/]node_modules[\\/](wagmi*\w|viem*\w)/,
					// test: module =>
					//   module.resource &&
					//   /.js$/.test(module.resource) &&
					//   module.resource.includes(path.join(__dirname, `../node_modules/${package}/`)),
					chunks: "all",
					priority: 5,
					reuseExistingChunk: true,
					enforce: true,
				},
				reactLibs: {
					// React 运行时核心依赖，便于稳定缓存。
					name: "chunk-react-libs",
					test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)/,
					chunks: "all",
					priority: 6,
					reuseExistingChunk: true,
				},
			},
			minSize: {
				javascript: 20000,
				style: 20000,
			},
			maxSize: {
				javascript: 500000,
				style: 20000,
			},
		},
	},
	resolve: {
		alias: {
			"@": resolve("src/"),
			"@react-native-async-storage/async-storage": resolve(
				"src/empty-async-storage.ts",
			),
		},
		extensions: [".js", ".ts", ".tsx", ".jsx", ".css"],
		fallback: {
			// stream: require.resolve('stream-browserify'),
		},
	},
	plugins: [
		new CleanWebpackPlugin(),
		new MiniCssExtractPlugin({
			filename: _modeflag
				? "styles/[name].[contenthash:5].css"
				: "styles/[name].css",
			chunkFilename: _modeflag
				? "styles/[name].[contenthash:5].css"
				: "styles/[name].css",
			ignoreOrder: false,
		}),
		new ThemedProgressPlugin(),
	],
}

module.exports = merge.default(webpackBaseConfig, _mergeConfig)
