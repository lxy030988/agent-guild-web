import "./transform-example.css"

/**
 * Transform Matrix 示例组件
 * 展示 transform-matrix-loader 的效果
 */
export default function TransformExample() {
	return (
		<div
			style={{
				padding: "40px",
				backgroundColor: "#f5f5f5",
				minHeight: "100vh",
			}}
		>
			<h1 style={{ textAlign: "center", marginBottom: "40px", color: "#333" }}>
				Transform Matrix Loader 示例
			</h1>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
					gap: "30px",
				}}
			>
				<div>
					<h3 style={{ marginBottom: "10px", color: "#555" }}>1. 平移变换</h3>
					<div className="demo-container translate-example">Translate</div>
				</div>

				<div>
					<h3 style={{ marginBottom: "10px", color: "#555" }}>2. 缩放变换</h3>
					<div className="demo-container scale-example">Scale</div>
				</div>

				<div>
					<h3 style={{ marginBottom: "10px", color: "#555" }}>3. 旋转变换</h3>
					<div className="demo-container rotate-z-example">Rotate</div>
				</div>

				<div>
					<h3 style={{ marginBottom: "10px", color: "#555" }}>4. 组合变换</h3>
					<div className="demo-container combined-example">Combined</div>
				</div>

				<div>
					<h3 style={{ marginBottom: "10px", color: "#555" }}>5. 复杂 3D</h3>
					<div className="demo-container complex-3d-example">Complex 3D</div>
				</div>

				<div>
					<h3 style={{ marginBottom: "10px", color: "#555" }}>6. 透视效果</h3>
					<div className="demo-container perspective-example">Perspective</div>
				</div>
			</div>

			<div
				style={{
					marginTop: "60px",
					padding: "20px",
					backgroundColor: "white",
					borderRadius: "8px",
					boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
				}}
			>
				<h2 style={{ marginBottom: "15px", color: "#333" }}>说明</h2>
				<p style={{ lineHeight: "1.8", color: "#666" }}>
					这些元素使用了 <code>matrix3d()</code> 定义变换。 在构建过程中，
					<strong>transform-matrix-loader</strong>{" "}
					会自动将这些矩阵转换为更易读的
					<code>translate3d()</code>、<code>rotate3d()</code> 和{" "}
					<code>scale3d()</code> 函数组合。
				</p>
				<p style={{ lineHeight: "1.8", color: "#666", marginTop: "10px" }}>
					打开浏览器开发者工具，查看编译后的 CSS 文件，你会看到转换后的结果。
				</p>
			</div>
		</div>
	)
}
