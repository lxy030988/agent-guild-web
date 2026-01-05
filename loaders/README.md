# Transform Matrix Loader

一个用于 Webpack 的自定义 loader，可以将 CSS 中的 `matrix3d()` 函数转换为更易读的 `translate3d()`、`rotate3d()` 和 `scale3d()` 组合。

## 功能特性

- ✅ 自动将 `matrix3d()` 分解为平移、旋转、缩放分量
- ✅ 生成可读性更强的 CSS transform 代码
- ✅ 支持自定义数字精度
- ✅ 可选的详细日志输出
- ✅ 支持 Webpack 缓存以提高性能

## 安装

loader 已经包含在项目中，位于 `loaders/transform-matrix-loader.js`。

## 使用方法

### 1. Webpack 配置

在 `webpack.config.js` 中已经配置好了：

```javascript
{
  test: /\.css$/i,
  use: [
    MiniCssExtractPlugin.loader,
    { loader: "css-loader", options: { importLoaders: 1 } },
    "postcss-loader",
    {
      loader: resolve("loaders/transform-matrix-loader.js"),
      options: {
        precision: 4,    // 数字精度（默认：6）
        verbose: true,   // 显示转换日志（默认：false）
      },
    },
  ],
}
```

### 2. CSS 使用示例

在你的 CSS 文件中使用 `matrix3d()`：

```css
.my-element {
  /* 输入：matrix3d */
  transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 50, 20, 1);
}
```

编译后会自动转换为：

```css
.my-element {
  /* 输出：可读的 transform 函数 */
  transform: translate3d(100px, 50px, 20px);
}
```

### 3. 查看示例

项目中包含了完整的示例：

- **CSS 示例**：`src/examples/transform-example.css`
- **React 组件**：`src/examples/TransformExample.tsx`

运行项目后访问示例页面即可看到效果。

## 工作原理

loader 使用极分解算法（Polar Decomposition）将 4x4 变换矩阵分解为：

1. **平移（Translation）**：从矩阵的最后一列提取
2. **缩放（Scale）**：计算每个基向量的长度
3. **旋转（Rotation）**：将旋转矩阵转换为轴角表示

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `precision` | number | 6 | 数字的小数位精度 |
| `verbose` | boolean | false | 是否在控制台输出转换日志 |

## 示例转换

### 平移
```css
/* 输入 */
transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 50, 20, 1);

/* 输出 */
transform: translate3d(100px, 50px, 20px);
```

### 缩放
```css
/* 输入 */
transform: matrix3d(2, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

/* 输出 */
transform: scale3d(2, 1.5, 1);
```

### 组合变换
```css
/* 输入 */
transform: matrix3d(1.5, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 1, 0, 50, 30, 10, 1);

/* 输出 */
transform: translate3d(50px, 30px, 10px) scale3d(1.5, 1.5, 1);
```

## 技术细节

- **矩阵顺序**：使用列主序（Column-major order），与 CSS `matrix3d()` 一致
- **分解算法**：基于极分解和轴角转换
- **性能优化**：支持 Webpack 缓存机制
- **兼容性**：适用于所有支持 CSS 3D transforms 的浏览器

## 注意事项

1. loader 应该放在 CSS 处理链的最后（在 `css-loader` 之后）
2. 某些复杂的透视变换可能无法完美分解
3. 建议在开发环境启用 `verbose` 选项以查看转换日志

## 开发

如果需要修改 loader 逻辑，编辑 `loaders/transform-matrix-loader.js` 文件即可。

## License

MIT
