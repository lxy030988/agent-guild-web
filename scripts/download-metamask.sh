#!/bin/bash

# 下载 MetaMask Chrome 扩展用于 E2E 测试
# 使用方法: ./scripts/download-metamask.sh [版本号]

set -e

VERSION=${1:-"12.9.1"}
EXTENSION_DIR="tests/e2e/extensions/metamask"
DOWNLOAD_URL="https://github.com/MetaMask/metamask-extension/releases/download/v${VERSION}/metamask-chrome-${VERSION}.zip"

echo "🔍 下载 MetaMask v${VERSION}..."

# 创建目录
mkdir -p "${EXTENSION_DIR}"

# 下载扩展
echo "📥 从 ${DOWNLOAD_URL} 下载..."
curl -L -o "${EXTENSION_DIR}/metamask.zip" "${DOWNLOAD_URL}"

# 解压
echo "📦 解压扩展..."
cd "${EXTENSION_DIR}"
unzip -q -o metamask.zip
rm metamask.zip

echo "✅ MetaMask v${VERSION} 下载完成！"
echo "📂 扩展位置: ${EXTENSION_DIR}"
