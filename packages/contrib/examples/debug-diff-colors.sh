#!/bin/bash
# Debug diff colors - runs test and captures output

cd "$(dirname "$0")/.." || exit 1

# Force colors
export FORCE_COLOR=1
export DEBUG_DIFF_COLORS=1

# Run with timeout to prevent hanging
timeout 2 bun run examples/debug-diff-colors.ts 2>&1 | tee /tmp/diff-color-debug-console.txt

# Also show the file output
echo ""
echo "=== File Output ==="
cat /tmp/diff-color-debug.txt 2>/dev/null || echo "No file output found"
