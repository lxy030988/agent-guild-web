#!/bin/bash
# 本地 CI 检查脚本

set -e  # 遇到错误立即退出

echo "🔍 开始本地 CI 检查..."
echo ""

# 1. 代码质量检查
echo "1️⃣  运行代码质量检查..."
pnpm run lint
pnpm run check
echo "✅ 代码质量检查通过"
echo ""

# 2. 单元测试
echo "2️⃣  运行单元测试..."
pnpm run unit
echo "✅ 单元测试通过"
echo ""

# 3. E2E 测试
echo "3️⃣  运行 E2E 测试..."
pnpm run e2e:headless
echo "✅ E2E 测试通过"
echo ""

# 4. 构建检查
echo "4️⃣  运行构建检查..."
pnpm run prod
echo "✅ 构建检查通过"
echo ""

echo "🎉 所有检查通过！可以安全提交代码。"
