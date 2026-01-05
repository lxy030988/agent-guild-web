#! /usr/bin/env bash
# 面试题？市面上的 webpack 优化手段都用了 但是还是慢怎么办？
# 开启 webpack “集群”(多进程)并行编译：根据 CPU 核心数设置 parallelism

# set -euo pipefail

# # 获取 CPU 核心数（可通过 WEBPACK_PARALLELISM 覆盖）
# DEFAULT_CORES=$(command -v getconf >/dev/null 2>&1 && getconf _NPROCESSORS_ONLN || sysctl -n hw.ncpu)
# WEBPACK_PARALLELISM="${WEBPACK_PARALLELISM:-$DEFAULT_CORES}"

# echo "⏰ Starting client in development mode with parallelism=${WEBPACK_PARALLELISM}..."
# NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=4096" \
# WEBPACK_PARALLELISM="${WEBPACK_PARALLELISM}" \
# webpack --mode development --parallelism "${WEBPACK_PARALLELISM}" --progress

echo "⏰ Starting client in development mode..."
webpack --mode development
