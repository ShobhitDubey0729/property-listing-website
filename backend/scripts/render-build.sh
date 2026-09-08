#!/usr/bin/env bash
# Render (Python web service, Root Directory = backend):
#   Build: bash scripts/render-build.sh
#   Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$BACKEND_DIR/.." && pwd)"
FRONTEND_DIR="$REPO_DIR/frontend"
NODE_VERSION="${NODE_VERSION:-v20.18.1}"

ensure_node() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    echo "Using $(node -v) / npm $(npm -v)"
    return
  fi
  local arch
  arch="$(uname -m)"
  case "$arch" in
    x86_64|amd64) arch="x64" ;;
    aarch64|arm64) arch="arm64" ;;
    *) echo "Unsupported architecture: $arch" >&2; exit 1 ;;
  esac
  local os
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  local name="node-${NODE_VERSION}-${os}-${arch}"
  local dest="${HOME}/.local/${name}"
  mkdir -p "$(dirname "$dest")"
  if [ ! -x "${dest}/bin/node" ]; then
    echo "Installing Node ${NODE_VERSION} (${os}-${arch})"
    curl -fsSL "https://nodejs.org/dist/${NODE_VERSION}/${name}.tar.xz" | tar -xJ -C "$(dirname "$dest")"
  fi
  export PATH="${dest}/bin:${PATH}"
  echo "Using $(node -v) / npm $(npm -v)"
}

if [ ! -d "$FRONTEND_DIR" ]; then
  echo "Frontend directory not found at $FRONTEND_DIR" >&2
  echo "On Render, leave the Git repo as the full PropLease project (not backend-only)." >&2
  exit 1
fi

ensure_node
cd "$FRONTEND_DIR"
npm ci
npm run build

cd "$BACKEND_DIR"
pip install -r requirements.txt
