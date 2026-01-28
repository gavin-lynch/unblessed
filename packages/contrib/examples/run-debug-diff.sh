#!/bin/bash
# Run debug script and capture output

set -e

TIMESTAMP=$(date +%s)
OUTPUT_FILE="/tmp/diff-debug-${TIMESTAMP}.txt"

echo "=========================================="
echo "Diff Truecolor Debug"
echo "=========================================="
echo ""
echo "Output will be saved to: ${OUTPUT_FILE}"
echo ""

# Run with timeout to prevent hanging
# Change to contrib directory first (where package.json is)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTRIB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$CONTRIB_DIR" || exit 1

# Use bun directly to run the TypeScript file
timeout -s KILL 3 bun "$SCRIPT_DIR/debug-diff-truecolor.ts" 2>&1 | tee "${OUTPUT_FILE}"

echo ""
echo "=========================================="
echo "Debug output saved to: ${OUTPUT_FILE}"
echo "=========================================="
