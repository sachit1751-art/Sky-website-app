#!/usr/bin/env bash
set -e

# Detect Node.js version and automatically set ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION
# only when running on runners with a deprecated Node version (Node <= 20).

NODE_VER=$(node -v 2>/dev/null || echo "v0")
MAJOR_VER=$(echo "$NODE_VER" | sed -E 's/^v([0-9]+).*/\1/')

echo "============================================================"
echo " CI Node Deprecation Auto-Detector"
echo "============================================================"
echo "Detected Node.js version: $NODE_VER (Major: $MAJOR_VER)"

if [ "$MAJOR_VER" -le 20 ] && [ "$MAJOR_VER" -gt 0 ]; then
  echo "⚠️ Deprecated Node.js runtime (v$MAJOR_VER <= 20) detected."
  if [ -n "$GITHUB_ENV" ]; then
    echo "ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true" >> "$GITHUB_ENV"
    echo "✅ Exported ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true to \$GITHUB_ENV"
  else
    export ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true
    echo "✅ Exported ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true to current environment"
  fi
else
  echo "✅ Node.js v$MAJOR_VER is modern and active; unsecure version override not required."
fi
echo "============================================================"
