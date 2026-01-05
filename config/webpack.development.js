const HtmlWebpackPlugin = require("html-webpack-plugin")
const { resolve, join } = require("path")
const FriendlyErrorsWebpackPlugin = require("@soda/friendly-errors-webpack-plugin")
const notifier = require("node-notifier")
const BundleAnalyzerPlugin =
	require("webpack-bundle-analyzer").BundleAnalyzerPlugin

const port = 3000
module.exports = {
	stats: "errors-only", // 只显示错误
	devServer: {
		historyApiFallback: true,
		static: {
			directory: join(__dirname, "../dist"),
		},
		hot: true,
		port,
		compress: true,
		client: {
			logging: "none", // 禁用客户端日志
			overlay: {
				errors: true,
				warnings: false,
			},
		},
	},
	output: {
		publicPath: "/",
		//如果是通过loader 编译的 放到scripts文件夹里 filename
		filename: "scripts/[name].bundle.js",
		//如果是通过'asset/resource' 编译的
		assetModuleFilename: "images/[name].[ext]",
	},
	plugins: [
		new BundleAnalyzerPlugin(),

		new HtmlWebpackPlugin({
			filename: "index.html",
			favicon: "./public/favicon.ico",
			template: resolve(__dirname, "../src/index-dev.html"),
		}),

		new FriendlyErrorsWebpackPlugin({
			compilationSuccessInfo: {
				messages: ["You application is running here http://localhost:" + port],
				notes: ["💊 构建信息请及时关注窗口右上角"],
			},
			// new WebpackBuildNotifierPlugin({
			//   title: '💿 Solv Dvelopment Notification',
			//   logo,
			//   suppressSuccess: true,
			// }),
			onErrors: (severity, errors) => {
				if (severity !== "error") {
					return
				}
				const error = errors[0]
				console.log(error)
				notifier.notify({
					title: "👒 Webpack Build Error",
					message: severity + ": " + error.name,
					subtitle: error.file || "",
					icon: join(__dirname, "icon.png"),
				})
			},
			clearConsole: true,
		}),
	],
}
