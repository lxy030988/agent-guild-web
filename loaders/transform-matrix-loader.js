/**
 * Webpack Loader 用于转换 CSS 3D 矩阵值
 * 将 matrix3d() 转换为可读的 translate3d(), rotate3d(), scale3d() 格式
 */

/**
 * 将 4x4 矩阵分解为平移、旋转和缩放分量
 * 基于极分解算法
 * @param {number[]} m - 16 个元素的数组，表示列主序的 4x4 矩阵
 * @returns {Object} - 包含 translate、rotate 和 scale 分量的对象
 */
function decomposeMatrix(m) {
  // 矩阵采用列主序，与 CSS matrix3d 使用的顺序相同
  // m[0-3] = 第一列, m[4-7] = 第二列, 依此类推
  
  // 提取平移分量（最后一列）
  const translate = {
    x: m[12],
    y: m[13],
    z: m[14]
  };

  // 创建矩阵的副本用于分解
  const matrix = [...m];
  
  // 移除平移分量
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  
  // 通过计算每个基向量的长度来提取缩放分量
  const scaleX = Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1] + matrix[2] * matrix[2]);
  const scaleY = Math.sqrt(matrix[4] * matrix[4] + matrix[5] * matrix[5] + matrix[6] * matrix[6]);
  const scaleZ = Math.sqrt(matrix[8] * matrix[8] + matrix[9] * matrix[9] + matrix[10] * matrix[10]);
  
  const scale = { x: scaleX, y: scaleY, z: scaleZ };
  
  // 从矩阵中移除缩放以获得旋转
  if (scaleX !== 0) {
    matrix[0] /= scaleX;
    matrix[1] /= scaleX;
    matrix[2] /= scaleX;
  }
  if (scaleY !== 0) {
    matrix[4] /= scaleY;
    matrix[5] /= scaleY;
    matrix[6] /= scaleY;
  }
  if (scaleZ !== 0) {
    matrix[8] /= scaleZ;
    matrix[9] /= scaleZ;
    matrix[10] /= scaleZ;
  }
  
  // 将旋转矩阵转换为轴角表示
  // 使用旋转矩阵到轴角转换的公式
  const trace = matrix[0] + matrix[5] + matrix[10];
  let angle, x, y, z;
  
  if (trace > 0) {
    const s = Math.sqrt(trace + 1.0) * 2;
    angle = Math.acos((trace - 1) / 2);
    x = (matrix[6] - matrix[9]) / s;
    y = (matrix[8] - matrix[2]) / s;
    z = (matrix[1] - matrix[4]) / s;
  } else if (matrix[0] > matrix[5] && matrix[0] > matrix[10]) {
    const s = Math.sqrt(1.0 + matrix[0] - matrix[5] - matrix[10]) * 2;
    angle = Math.acos((trace - 1) / 2);
    x = 0.25 * s;
    y = (matrix[1] + matrix[4]) / s;
    z = (matrix[8] + matrix[2]) / s;
  } else if (matrix[5] > matrix[10]) {
    const s = Math.sqrt(1.0 + matrix[5] - matrix[0] - matrix[10]) * 2;
    angle = Math.acos((trace - 1) / 2);
    x = (matrix[1] + matrix[4]) / s;
    y = 0.25 * s;
    z = (matrix[6] + matrix[9]) / s;
  } else {
    const s = Math.sqrt(1.0 + matrix[10] - matrix[0] - matrix[5]) * 2;
    angle = Math.acos((trace - 1) / 2);
    x = (matrix[8] + matrix[2]) / s;
    y = (matrix[6] + matrix[9]) / s;
    z = 0.25 * s;
  }
  
  // 归一化轴
  const length = Math.sqrt(x * x + y * y + z * z);
  if (length > 0) {
    x /= length;
    y /= length;
    z /= length;
  }
  
  const rotate = {
    x: x || 0,
    y: y || 0,
    z: z || 0,
    angle: angle || 0
  };
  
  return { translate, rotate, scale };
}

/**
 * 将数字格式化为指定精度，移除尾随零
 */
function formatNumber(num, precision = 6) {
  if (Math.abs(num) < 1e-10) return '0';
  return parseFloat(num.toFixed(precision)).toString();
}

/**
 * 将 matrix3d 转换为可读的 transform 函数
 */
function matrix3dToTransform(matrixString, options = {}) {
  const precision = options.precision || 6;
  
  // 提取矩阵值
  const match = matrixString.match(/matrix3d\s*\(\s*([^)]+)\s*\)/);
  if (!match) return matrixString;
  
  const values = match[1].split(',').map(v => parseFloat(v.trim()));
  if (values.length !== 16) return matrixString;
  
  // 分解矩阵
  const { translate, rotate, scale } = decomposeMatrix(values);
  
  // 构建 transform 字符串
  const transforms = [];
  
  // 如果有平移则添加 translate3d
  if (translate.x !== 0 || translate.y !== 0 || translate.z !== 0) {
    transforms.push(
      `translate3d(${formatNumber(translate.x, precision)}px, ${formatNumber(translate.y, precision)}px, ${formatNumber(translate.z, precision)}px)`
    );
  }
  
  // 如果有旋转则添加 rotate3d
  if (rotate.angle !== 0) {
    const angleDeg = rotate.angle * (180 / Math.PI);
    transforms.push(
      `rotate3d(${formatNumber(rotate.x, precision)}, ${formatNumber(rotate.y, precision)}, ${formatNumber(rotate.z, precision)}, ${formatNumber(angleDeg, precision)}deg)`
    );
  }
  
  // 如果有非均匀缩放或缩放 != 1 则添加 scale3d
  if (scale.x !== 1 || scale.y !== 1 || scale.z !== 1) {
    transforms.push(
      `scale3d(${formatNumber(scale.x, precision)}, ${formatNumber(scale.y, precision)}, ${formatNumber(scale.z, precision)})`
    );
  }
  
  return transforms.length > 0 ? transforms.join(' ') : 'none';
}

/**
 * Webpack loader 函数
 */
module.exports = function(source) {
  // 使用 webpack 5 的原生 API 获取选项
  const options = this.getOptions() || {};
  
  // 启用缓存以提高性能
  this.cacheable && this.cacheable();
  
  // 转换 CSS 中所有的 matrix3d
  const result = source.replace(
    /transform\s*:\s*matrix3d\s*\([^)]+\)/gi,
    (match) => {
      const matrixPart = match.match(/matrix3d\s*\([^)]+\)/i)[0];
      const transformed = matrix3dToTransform(matrixPart, options);
      return `transform: ${transformed}`;
    }
  );
  
  // 如果启用了详细模式则记录转换
  if (options.verbose && result !== source) {
    console.log('[transform-matrix-loader] 已转换 matrix3d 值');
  }
  
  return result;
};
